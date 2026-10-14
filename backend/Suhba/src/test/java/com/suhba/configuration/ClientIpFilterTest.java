package com.suhba.configuration;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class ClientIpFilterTest {

    private final ClientIpFilter filter = new ClientIpFilter();

    @Test
    void usesTheHopAppendedByOurProxyNotTheOneSuppliedByTheCaller() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("10.0.0.1");
        request.addHeader("X-Forwarded-For", "1.1.1.1, 2.2.2.2, 203.0.113.9");

        assertThat(resolveThrough(request)).isEqualTo("203.0.113.9");
    }

    @Test
    void fallsBackToTheSocketAddressWhenThereIsNoProxy() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");

        assertThat(resolveThrough(request)).isEqualTo("127.0.0.1");
    }

    @Test
    void spoofedEntriesDoNotChangeTheResolvedAddress() throws Exception {
        MockHttpServletRequest first = new MockHttpServletRequest();
        first.setRemoteAddr("10.0.0.1");
        first.addHeader("X-Forwarded-For", "9.9.9.9, 203.0.113.9");

        MockHttpServletRequest second = new MockHttpServletRequest();
        second.setRemoteAddr("10.0.0.1");
        second.addHeader("X-Forwarded-For", "8.8.8.8, 203.0.113.9");

        assertThat(resolveThrough(first)).isEqualTo(resolveThrough(second));
    }

    private String resolveThrough(HttpServletRequest request) throws Exception {
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());
        return ClientIpFilter.resolve(request);
    }
}
