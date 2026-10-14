package com.suhba.configuration;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class PublicWriteGuardFilterTest {

    private final PublicWriteGuardFilter filter =
        new PublicWriteGuardFilter(new PublicWriteRateLimitService());

    @Test
    void readsAreNeverThrottled() throws Exception {
        for (int i = 0; i < 100; i++) {
            assertThat(status(request("GET", "/api/v1/events", null))).isEqualTo(200);
        }
    }

    @Test
    void oversizedBodiesAreRejectedBeforeParsing() throws Exception {
        MockHttpServletRequest request = request("POST", "/api/v1/events", null);
        request.setContent(new byte[65 * 1024]);

        assertThat(status(request)).isEqualTo(413);
    }

    @Test
    void submissionBurstIsThrottled() throws Exception {
        for (int i = 0; i < 30; i++) {
            assertThat(status(request("POST", "/api/v1/events", "203.0.113.9"))).isEqualTo(200);
        }
        assertThat(status(request("POST", "/api/v1/events", "203.0.113.9"))).isEqualTo(429);
    }

    @Test
    void theSameSpotCannotBeUpvotedTwice() throws Exception {
        String path = "/api/v1/halal-spots/7/upvote";

        assertThat(status(request("POST", path, "203.0.113.9"))).isEqualTo(200);
        assertThat(status(request("POST", path, "203.0.113.9"))).isEqualTo(429);
        assertThat(status(request("POST", "/api/v1/halal-spots/8/upvote", "203.0.113.9"))).isEqualTo(200);
    }

    private static MockHttpServletRequest request(String method, String uri, String clientIp) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, uri);
        if (clientIp != null) {
            request.setRemoteAddr(clientIp);
        }
        return request;
    }

    private int status(MockHttpServletRequest request) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response.getStatus();
    }
}
