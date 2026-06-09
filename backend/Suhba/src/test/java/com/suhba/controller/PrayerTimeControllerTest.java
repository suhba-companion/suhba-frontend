package com.suhba.controller;

import com.suhba.controller.rest.PrayerTimeController;
import com.suhba.exception.BLException;
import com.suhba.exception.GlobalExceptionHandler;
import com.suhba.services.PrayerTimeService;
import com.suhba.services.dto.PrayerTimeDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PrayerTimeController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
class PrayerTimeControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean PrayerTimeService service;
    @MockBean UserDetailsService userDetailsService;

    @Test
    void getToday_returns200WithPrayerTimes() throws Exception {
        when(service.getToday()).thenReturn(buildDto(LocalDate.now()));

        mockMvc.perform(get("/api/v1/prayer-times/today"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.fajr").value("04:30:00"))
            .andExpect(jsonPath("$.isha").value("21:30:00"));
    }

    @Test
    void getByDate_returns200() throws Exception {
        LocalDate date = LocalDate.of(2026, 6, 5);
        when(service.getByDate(date)).thenReturn(buildDto(date));

        mockMvc.perform(get("/api/v1/prayer-times/2026-06-05"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.date").value("2026-06-05"));
    }

    @Test
    void getByDate_notFound_returns400() throws Exception {
        LocalDate date = LocalDate.of(2025, 1, 1);
        when(service.getByDate(date))
            .thenThrow(new BLException("Keine Gebetszeiten für " + date));

        mockMvc.perform(get("/api/v1/prayer-times/2025-01-01"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void getByDate_invalidFormat_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/prayer-times/not-a-date"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void getToday_includesAllPrayerTimes() throws Exception {
        when(service.getToday()).thenReturn(buildDto(LocalDate.now()));

        mockMvc.perform(get("/api/v1/prayer-times/today"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.fajr").exists())
            .andExpect(jsonPath("$.dhuhr").exists())
            .andExpect(jsonPath("$.asr").exists())
            .andExpect(jsonPath("$.maghrib").exists())
            .andExpect(jsonPath("$.isha").exists());
    }

    private PrayerTimeDto buildDto(LocalDate date) {
        return PrayerTimeDto.builder()
            .id(1L)
            .date(date)
            .fajr(LocalTime.of(4, 30))
            .shuruq(LocalTime.of(6, 15))
            .dhuhr(LocalTime.of(12, 0))
            .asr(LocalTime.of(15, 30))
            .maghrib(LocalTime.of(19, 45))
            .isha(LocalTime.of(21, 30))
            .build();
    }
}
