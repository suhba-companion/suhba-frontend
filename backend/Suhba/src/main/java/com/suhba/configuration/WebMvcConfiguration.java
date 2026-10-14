package com.suhba.configuration;

import jakarta.servlet.DispatcherType;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.ForwardedHeaderFilter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// CORS is handled by SecurityConfig.corsConfigurationSource() for all /api/** paths.
@Configuration
public class WebMvcConfiguration implements WebMvcConfigurer {

    // Spring Boot auto-registers this same filter at HIGHEST_PRECEDENCE, which would tie
    // with ClientIpFilter and leave their order undefined. Registering it here makes Boot
    // back off (@ConditionalOnMissingFilterBean) so ClientIpFilter is guaranteed to read
    // X-Forwarded-For before this filter removes it. The property condition mirrors Boot's
    // own, so local dev (no proxy, no strategy set) is unaffected.
    @Bean
    @ConditionalOnProperty(value = "server.forward-headers-strategy", havingValue = "framework")
    public FilterRegistrationBean<ForwardedHeaderFilter> forwardedHeaderFilter() {
        FilterRegistrationBean<ForwardedHeaderFilter> registration =
            new FilterRegistrationBean<>(new ForwardedHeaderFilter());
        registration.setDispatcherTypes(DispatcherType.REQUEST, DispatcherType.ASYNC, DispatcherType.ERROR);
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 10);
        return registration;
    }
}
