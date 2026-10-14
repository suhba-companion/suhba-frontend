package com.suhba.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Resolves the client IP once per request and stashes it for the rate limiters.
//
// Only the RIGHTMOST X-Forwarded-For entry can be trusted: our edge proxy appends the
// address it actually accepted the connection from, while everything to its left was
// supplied by the caller. Reading the leftmost entry (which is also what
// ForwardedHeaderFilter puts into getRemoteAddr()) lets anyone send a different fake
// address on every request and walk straight through the login lockout.
//
// This has to run before ForwardedHeaderFilter, which strips X-Forwarded-For from the
// request it passes down. WebMvcConfiguration re-registers that filter behind this one
// so the relative order is deterministic rather than a tie at HIGHEST_PRECEDENCE.
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ClientIpFilter extends OncePerRequestFilter {

    private static final String ATTRIBUTE = ClientIpFilter.class.getName();

    public static String resolve(HttpServletRequest request) {
        return request.getAttribute(ATTRIBUTE) instanceof String ip ? ip : request.getRemoteAddr();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        request.setAttribute(ATTRIBUTE, lastForwardedHop(request));
        filterChain.doFilter(request, response);
    }

    private static String lastForwardedHop(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded == null || forwarded.isBlank()) {
            return request.getRemoteAddr();
        }
        String[] hops = forwarded.split(",");
        return hops[hops.length - 1].trim();
    }
}
