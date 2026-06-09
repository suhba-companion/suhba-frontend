package com.suhba.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suhba.configuration.LoginRateLimitService;
import com.suhba.controller.rest.AdminController;
import com.suhba.exception.GlobalExceptionHandler;
import com.suhba.services.EventService;
import com.suhba.services.HalalSpotService;
import com.suhba.services.PrayerSpotService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean AuthenticationManager authenticationManager;
    @MockBean LoginRateLimitService rateLimitService;
    @MockBean PrayerSpotService prayerSpotService;
    @MockBean HalalSpotService halalSpotService;
    @MockBean EventService eventService;
    @MockBean UserDetailsService userDetailsService;

    @Test
    void login_withValidCredentials_returns200WithUsername() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken(
            "suhba", null,
            List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        when(rateLimitService.isBlocked(any())).thenReturn(false);
        when(authenticationManager.authenticate(any())).thenReturn(auth);

        mockMvc.perform(post("/api/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", "suhba",
                    "password", "suhba"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("suhba"));
    }

    @Test
    void login_withInvalidCredentials_returns401() throws Exception {
        when(rateLimitService.isBlocked(any())).thenReturn(false);
        when(authenticationManager.authenticate(any()))
            .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", "bad",
                    "password", "wrong"
                ))))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    @Test
    void login_whenRateLimited_returns429() throws Exception {
        when(rateLimitService.isBlocked(any())).thenReturn(true);

        mockMvc.perform(post("/api/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", "admin",
                    "password", "pass"
                ))))
            .andExpect(status().is(429))
            .andExpect(jsonPath("$.error").value("Too many failed attempts. Try again in 15 minutes."));
    }

    @Test
    void login_withMissingUsername_returns400() throws Exception {
        mockMvc.perform(post("/api/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("password", "pass"))))
            .andExpect(status().isBadRequest());
    }

    @Test
    void login_withMissingPassword_returns400() throws Exception {
        mockMvc.perform(post("/api/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("username", "admin"))))
            .andExpect(status().isBadRequest());
    }

    @Test
    void login_recordsFailureOnBadCredentials() throws Exception {
        when(rateLimitService.isBlocked(any())).thenReturn(false);
        when(authenticationManager.authenticate(any()))
            .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", "bad", "password", "wrong"
                ))))
            .andExpect(status().isUnauthorized());

        verify(rateLimitService).recordFailure(any());
    }

    @Test
    void login_recordsSuccessOnValidCredentials() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken(
            "suhba", null,
            List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        when(rateLimitService.isBlocked(any())).thenReturn(false);
        when(authenticationManager.authenticate(any())).thenReturn(auth);

        mockMvc.perform(post("/api/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", "suhba", "password", "suhba"
                ))))
            .andExpect(status().isOk());

        verify(rateLimitService).recordSuccess(any());
    }
}
