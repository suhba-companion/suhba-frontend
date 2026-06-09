package com.suhba.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suhba.controller.rest.HalalSpotController;
import com.suhba.exception.BLException;
import com.suhba.exception.GlobalExceptionHandler;
import com.suhba.persistence.entities.HalalSpotEntity;
import com.suhba.services.HalalSpotService;
import com.suhba.services.dto.HalalSpotDto;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HalalSpotController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
class HalalSpotControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean HalalSpotService service;
    @MockBean UserDetailsService userDetailsService;

    @Test
    void getAll_returns200WithList() throws Exception {
        when(service.getAll()).thenReturn(List.of(buildDto()));

        mockMvc.perform(get("/api/v1/halal-spots"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Al-Sham"));
    }

    @Test
    void getAll_returnsEmptyList_when_noSpots() throws Exception {
        when(service.getAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/halal-spots"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void findNearby_returns200WithDistanceSet() throws Exception {
        HalalSpotDto dto = buildDto();
        dto.setDistanceKm(1.2);
        when(service.findNearby(any(NearbyQueryDto.class), any())).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/halal-spots/nearby")
                .param("latitude", "48.2")
                .param("longitude", "16.37"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].distanceKm").value(1.2));
    }

    @Test
    void findNearby_withCategoryParam_passedToService() throws Exception {
        when(service.findNearby(any(NearbyQueryDto.class), eq(HalalSpotEntity.BusinessCategory.RESTAURANT)))
            .thenReturn(List.of(buildDto()));

        mockMvc.perform(get("/api/v1/halal-spots/nearby")
                .param("latitude", "48.2")
                .param("longitude", "16.37")
                .param("category", "RESTAURANT"))
            .andExpect(status().isOk());
    }

    @Test
    void getFeatured_returns200WithArray() throws Exception {
        when(service.getFeatured()).thenReturn(List.of(buildDto()));

        mockMvc.perform(get("/api/v1/halal-spots/featured"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getById_returns200() throws Exception {
        when(service.getById(1L)).thenReturn(buildDto());

        mockMvc.perform(get("/api/v1/halal-spots/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Al-Sham"));
    }

    @Test
    void getById_notFound_returns400WithError() throws Exception {
        when(service.getById(999L)).thenThrow(new BLException("Halal spot not found: 999"));

        mockMvc.perform(get("/api/v1/halal-spots/999"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Halal spot not found: 999"));
    }

    @Test
    void submit_validBody_returns201() throws Exception {
        HalalSpotDto dto = buildDto();
        when(service.submit(any(), anyString())).thenReturn(dto);

        mockMvc.perform(post("/api/v1/halal-spots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isCreated());
    }

    @Test
    void submit_missingRequiredFields_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/halal-spots")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void upvote_returns200() throws Exception {
        when(service.upvote(1L)).thenReturn(buildDto());

        mockMvc.perform(post("/api/v1/halal-spots/1/upvote"))
            .andExpect(status().isOk());
    }

    private HalalSpotDto buildDto() {
        return HalalSpotDto.builder()
            .id(1L)
            .name("Al-Sham")
            .address("Favoritenstraße 62")
            .district("1100")
            .latitude(48.185)
            .longitude(16.370)
            .category(HalalSpotEntity.BusinessCategory.RESTAURANT)
            .featured(false)
            .upvotes(0)
            .build();
    }
}
