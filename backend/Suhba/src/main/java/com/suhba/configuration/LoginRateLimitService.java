package com.suhba.configuration;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginRateLimitService {

    private static final int MAX_FAILURES = 5;
    private static final Duration LOCKOUT = Duration.ofMinutes(15);

    private final ConcurrentHashMap<String, AttemptRecord> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String ip) {
        AttemptRecord record = attempts.get(ip);
        if (record == null || record.lockedUntil == null) return false;
        if (Instant.now().isAfter(record.lockedUntil)) {
            attempts.remove(ip);
            return false;
        }
        return true;
    }

    public void recordFailure(String ip) {
        AttemptRecord record = attempts.computeIfAbsent(ip, k -> new AttemptRecord());
        synchronized (record) {
            record.failures++;
            if (record.failures >= MAX_FAILURES) {
                record.lockedUntil = Instant.now().plus(LOCKOUT);
            }
        }
    }

    public void recordSuccess(String ip) {
        attempts.remove(ip);
    }

    private static final class AttemptRecord {
        int failures = 0;
        Instant lockedUntil = null;
    }
}
