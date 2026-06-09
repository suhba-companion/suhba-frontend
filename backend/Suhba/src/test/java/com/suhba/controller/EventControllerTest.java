package com.suhba.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suhba.controller.rest.EventController;
import com.suhba.exception.BLException;
import com.suhba.exception.GlobalExceptionHandler;
import com.suhba.persistence.entities.EventEntity;
import com.suhba.services.EventService;
import com.suhba.services.dto.EventDto;
import com.suhba.services.dto.NearbyQueryDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
class EventControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean EventService service;
    @MockBean UserDetailsService userDetailsService;

    @Test
    void getAll_returns200WithList() throws Exception {
        when(service.getAll()).thenReturn(List.of(buildDto()));

        mockMvc.perform(get("/api/v1/events"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Freitagsgebet"));
    }

    @Test
    void getUpcoming_returns200() throws Exception {
        when(service.getUpcoming()).thenReturn(List.of(buildDto()));

        mockMvc.perform(get("/api/v1/events/upcoming"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Freitagsgebet"));
    }

    @Test
    void getUpcoming_returnsEmptyList_when_noEvents() throws Exception {
        when(service.getUpcoming()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/events/upcoming"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void findNearby_returns200() throws Exception {
        EventDto dto = buildDto();
        dto.setDistanceKm(0.8);
        when(service.findNearby(any(NearbyQueryDto.class))).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/events/nearby")
                .param("latitude", "48.2")
                .param("longitude", "16.37"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].distanceKm").value(0.8));
    }

    @Test
    void getById_returns200() throws Exception {
        when(service.getById(1L)).thenReturn(buildDto());

        mockMvc.perform(get("/api/v1/events/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Freitagsgebet"));
    }

    @Test
    void getById_notFound_returns400WithError() throws Exception {
        when(service.getById(999L)).thenThrow(new BLException("Event not found: 999"));

        mockMvc.perform(get("/api/v1/events/999"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Event not found: 999"));
    }

    @Test
    void submit_validBody_returns201() throws Exception {
        EventDto dto = buildDto();
        when(service.submit(any(), anyString())).thenReturn(dto);

        mockMvc.perform(post("/api/v1/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isCreated());
    }

    @Test
    void submit_missingRequiredFields_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void upvote_returns200() throws Exception {
        when(service.upvote(1L)).thenReturn(buildDto());

        mockMvc.perform(post("/api/v1/events/1/upvote"))
            .andExpect(status().isOk());
    }

    private EventDto buildDto() {
        return EventDto.builder()
            .id(1L)
            .title("Freitagsgebet")
            .address("Am Bruckhaufen 4")
            .district("1210")
            .latitude(48.26)
            .longitude(16.39)
            .startTime(Instant.parse("2026-06-05T12:00:00Z"))
            .category(EventEntity.EventCategory.PRAYER)
            .isFree(true)
            .upvotes(0)
            .status(EventEntity.ApprovalStatus.APPROVED)
            .build();
    }
}
