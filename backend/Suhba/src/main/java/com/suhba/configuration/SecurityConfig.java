package com.suhba.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${admin.allowed-origin:http://localhost:5173}")
    private String adminAllowedOrigin;

    // Cross-site admin (Cloudflare Pages frontend ↔ Render backend) needs the CSRF
    // cookie to be SameSite=None; Secure, otherwise the browser drops it on cross-site
    // requests and every admin mutation (approve/reject/edit/delete) fails with 403.
    // Defaults keep local dev (same-site, http) working.
    @Value("${admin.cookie.same-site:Lax}")
    private String adminCookieSameSite;

    @Value("${admin.cookie.secure:false}")
    private boolean adminCookieSecure;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService,
                                                        PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        CorsConfiguration publicConfig = new CorsConfiguration();
        publicConfig.setAllowedOriginPatterns(List.of("*"));
        publicConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        publicConfig.setAllowedHeaders(List.of("*"));
        publicConfig.setAllowCredentials(false);
        publicConfig.setMaxAge(3600L);
        source.registerCorsConfiguration("/api/v1/**", publicConfig);

        CorsConfiguration adminConfig = new CorsConfiguration();
        adminConfig.setAllowedOrigins(List.of(adminAllowedOrigin));
        adminConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        adminConfig.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN"));
        adminConfig.setExposedHeaders(List.of("X-XSRF-TOKEN"));
        adminConfig.setAllowCredentials(true);
        adminConfig.setMaxAge(3600L);
        source.registerCorsConfiguration("/api/admin/**", adminConfig);

        return source;
    }

    // CSRF cookie repository whose SameSite/Secure attributes are driven by config so the
    // XSRF-TOKEN cookie survives the cross-site admin panel in production (None; Secure)
    // while staying Lax/insecure for local http dev.
    private CookieCsrfTokenRepository csrfTokenRepository() {
        CookieCsrfTokenRepository repo = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repo.setCookieCustomizer(cookie -> cookie
            .sameSite(adminCookieSameSite)
            .secure(adminCookieSecure));
        return repo;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf
                .csrfTokenRepository(csrfTokenRepository())
                // Spring Security 6 defaults to XorCsrfTokenRequestAttributeHandler which masks
                // the cookie value — the SPA reads the raw UUID and sends it back unchanged,
                // so the XOR comparison always fails. Use the plain handler instead.
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                // Public API uses no session cookies — CSRF doesn't apply there.
                // Login endpoint excluded: no session exists yet to protect.
                .ignoringRequestMatchers("/api/v1/**", "/api/admin/login")
            )
            .addFilterAfter(new CsrfCookieFilter(), CsrfFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/login").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                .anyRequest().permitAll()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .sessionFixation(fixation -> fixation.newSession())
            )
            .logout(logout -> logout
                .logoutUrl("/api/admin/logout")
                .logoutSuccessHandler((req, res, auth) -> {
                    res.setStatus(200);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"success\":true}");
                })
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .clearAuthentication(true)
                .permitAll()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> {
                    res.setStatus(401);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"error\":\"Unauthorized\"}");
                })
                .accessDeniedHandler((req, res, e) -> {
                    res.setStatus(403);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"error\":\"Forbidden\"}");
                })
            )
            .headers(headers -> headers
                .frameOptions(frame -> frame.deny())
                .referrerPolicy(referrer -> referrer
                    .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            );

        return http.build();
    }

    // Forces the CSRF cookie to be written on every response (required for Spring Security 6 lazy CSRF).
    static final class CsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                FilterChain filterChain) throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                csrfToken.getToken();
            }
            filterChain.doFilter(request, response);
        }
    }
}
