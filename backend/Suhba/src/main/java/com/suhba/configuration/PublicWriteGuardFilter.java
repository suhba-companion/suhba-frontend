package com.suhba.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.regex.Pattern;

// Guards the anonymous write endpoints: submissions and upvotes under /api/v1/**.
// Registered in SecurityConfig, ordered behind Spring Security's chain so rejections still
// carry the CORS headers the browser needs to surface the status code instead of an opaque
// network error.
@RequiredArgsConstructor
public class PublicWriteGuardFilter extends OncePerRequestFilter {

    // Generous next to the field limits on the DTOs, but it stops a multi-megabyte body
    // from being parsed into memory before bean validation ever sees it.
    private static final int MAX_BODY_BYTES = 64 * 1024;

    private static final Set<String> READ_METHODS = Set.of("GET", "HEAD", "OPTIONS");
    private static final Pattern UPVOTE_PATH = Pattern.compile("^/api/v1/[a-z-]+/\\d+/upvote$");

    private final PublicWriteRateLimitService rateLimiter;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return READ_METHODS.contains(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        if (request.getContentLengthLong() > MAX_BODY_BYTES) {
            reject(response, HttpStatus.PAYLOAD_TOO_LARGE, "Request body too large");
            return;
        }

        String ip = ClientIpFilter.resolve(request);
        String path = request.getRequestURI();

        if (!rateLimiter.tryWrite(ip)) {
            reject(response, HttpStatus.TOO_MANY_REQUESTS, "Too many submissions. Please try again later.");
            return;
        }

        if (UPVOTE_PATH.matcher(path).matches() && !rateLimiter.tryUpvote(ip, path)) {
            reject(response, HttpStatus.TOO_MANY_REQUESTS, "Already upvoted");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private static void reject(HttpServletResponse response, HttpStatus status, String message)
            throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
