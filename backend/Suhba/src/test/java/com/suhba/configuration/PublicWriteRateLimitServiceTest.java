package com.suhba.configuration;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PublicWriteRateLimitServiceTest {

    private final PublicWriteRateLimitService service = new PublicWriteRateLimitService();

    @Test
    void allowsAReasonableBurstThenBlocks() {
        for (int i = 0; i < 30; i++) {
            assertThat(service.tryWrite("203.0.113.9")).isTrue();
        }
        assertThat(service.tryWrite("203.0.113.9")).isFalse();
    }

    @Test
    void limitsAreScopedToOneAddress() {
        for (int i = 0; i < 31; i++) {
            service.tryWrite("203.0.113.9");
        }
        assertThat(service.tryWrite("198.51.100.4")).isTrue();
    }

    @Test
    void countsOneUpvotePerTarget() {
        assertThat(service.tryUpvote("203.0.113.9", "/api/v1/halal-spots/1/upvote")).isTrue();
        assertThat(service.tryUpvote("203.0.113.9", "/api/v1/halal-spots/1/upvote")).isFalse();
        assertThat(service.tryUpvote("203.0.113.9", "/api/v1/halal-spots/2/upvote")).isTrue();
        assertThat(service.tryUpvote("198.51.100.4", "/api/v1/halal-spots/1/upvote")).isTrue();
    }
}
