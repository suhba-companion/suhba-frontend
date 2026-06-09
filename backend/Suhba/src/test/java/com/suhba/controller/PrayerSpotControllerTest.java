package com.suhba.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suhba.controller.rest.PrayerSpotController;
import com.suhba.exception.BLException;
import com.suhba.exception.GlobalExceptionHandler;
import com.suhba.persistence.entities.PrayerSpotEntity;
import com.suhba.services.PrayerSpotService;
import com.suhba.services.dto.NearbyQueryDto;
import com.suhba.services.dto.PrayerSpotDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PrayerSpotController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
class PrayerSpotControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean PrayerSpotService service;
    @MockBean UserDetailsService userDetailsService;

    @Test
    void findNearby_returns200WithList() throws Exception {
        PrayerSpotDto spot = PrayerSpotDto.builder()
            .id(1L).name("Mosque").address("Addr").district("01")
            .latitude(48.2).longitude(16.37)
            .type(PrayerSpotEntity.SpotType.MOSQUE)
            .distanceKm(0.5).build();

        when(service.findNearby(any(NearbyQueryDto.class))).thenReturn(List.of(spot));

        mockMvc.perform(get("/api/v1/prayer-spots/nearby")
                .param("latitude", "48.2")
                .param("longitude", "16.37"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Mosque"));
    }

    @Test
    void submit_validBody_returns201() throws Exception {
        PrayerSpotDto dto = PrayerSpotDto.builder()
            .name("Mosque").address("Addr").district("01")
            .latitude(48.2).longitude(16.37)
            .type(PrayerSpotEntity.SpotType.MOSQUE).build();

        when(service.submit(any(), anyString())).thenReturn(dto);

        mockMvc.perform(post("/api/v1/prayer-spots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isCreated());
    }

    @Test
    void submit_missingRequiredFields_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/prayer-spots")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void getById_notFound_returns400() throws Exception {
        when(service.getById(999L)).thenThrow(new BLException("Prayer spot not found: 999"));

        mockMvc.perform(get("/api/v1/prayer-spots/999"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Prayer spot not found: 999"));
    }
}
