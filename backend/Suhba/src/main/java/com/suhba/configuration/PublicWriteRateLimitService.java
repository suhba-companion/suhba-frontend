package com.suhba.configuration;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

// Throttles anonymous writes to /api/v1/**. Submissions and upvotes carry no identity, so
// without this one script can fill the database or exhaust the 3-connection pool, and can
// push a spot's upvote count (which drives directory ordering) to any value it likes.
//
// State is per-instance and resets on deploy. That is fine for a single container; if this
// ever scales out, the counters need to move to a shared store.
@Service
public class PublicWriteRateLimitService {

    private static final int MAX_WRITES_PER_WINDOW = 30;
    private static final Duration WRITE_WINDOW = Duration.ofMinutes(5);
    private static final Duration UPVOTE_COOLDOWN = Duration.ofHours(24);
    private static final int PURGE_THRESHOLD = 10_000;

    private final ConcurrentHashMap<String, WriteWindow> writeWindows = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Instant> upvotes = new ConcurrentHashMap<>();

    public boolean tryWrite(String ip) {
        if (writeWindows.size() >= PURGE_THRESHOLD) {
            purgeWriteWindows();
        }
        WriteWindow window = writeWindows.computeIfAbsent(ip, k -> new WriteWindow());
        synchronized (window) {
            Instant now = Instant.now();
            if (window.startedAt == null || now.isAfter(window.startedAt.plus(WRITE_WINDOW))) {
                window.startedAt = now;
                window.count = 0;
            }
            window.count++;
            return window.count <= MAX_WRITES_PER_WINDOW;
        }
    }

    public boolean tryUpvote(String ip, String target) {
        if (upvotes.size() >= PURGE_THRESHOLD) {
            purgeUpvotes();
        }
        Instant now = Instant.now();
        Instant stored = upvotes.merge(ip + " " + target, now,
            (previous, fresh) -> previous.isBefore(fresh.minus(UPVOTE_COOLDOWN)) ? fresh : previous);
        return stored.equals(now);
    }

    private void purgeWriteWindows() {
        Instant cutoff = Instant.now().minus(WRITE_WINDOW);
        writeWindows.values().removeIf(window -> {
            synchronized (window) {
                return window.startedAt != null && window.startedAt.isBefore(cutoff);
            }
        });
    }

    private void purgeUpvotes() {
        Instant cutoff = Instant.now().minus(UPVOTE_COOLDOWN);
        upvotes.values().removeIf(recorded -> recorded.isBefore(cutoff));
    }

    private static final class WriteWindow {
        Instant startedAt = null;
        int count = 0;
    }
}
