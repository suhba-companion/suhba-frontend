package com.suhba.services;

import com.suhba.exception.BLException;
import com.suhba.persistence.entities.PrayerTimeEntity;
import com.suhba.persistence.repositories.PrayerTimeRepository;
import com.suhba.services.dto.PrayerTimeDto;
import com.suhba.services.impl.PrayerTimeServiceImpl;
import com.suhba.services.mapper.PrayerTimeMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PrayerTimeServiceImplTest {

    @Mock private PrayerTimeRepository repository;
    @Mock private PrayerTimeMapper mapper;
    @InjectMocks private PrayerTimeServiceImpl service;

    @Test
    void getByDate_returnsDto_whenFound() {
        LocalDate date = LocalDate.of(2026, 6, 5);
        PrayerTimeEntity entity = buildEntity(date);
        PrayerTimeDto dto = buildDto(date);

        when(repository.findByDate(date)).thenReturn(Optional.of(entity));
        when(mapper.entityToDto(entity)).thenReturn(dto);

        PrayerTimeDto result = service.getByDate(date);

        assertThat(result).isNotNull();
        assertThat(result.getDate()).isEqualTo(date);
    }

    @Test
    void getByDate_throwsBLException_whenNotFound() {
        LocalDate date = LocalDate.of(2025, 1, 1);
        when(repository.findByDate(date)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getByDate(date))
            .isInstanceOf(BLException.class)
            .hasMessageContaining("Keine Gebetszeiten");
    }

    @Test
    void getByDate_throwsBLException_withDateInMessage() {
        LocalDate date = LocalDate.of(2024, 3, 15);
        when(repository.findByDate(date)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getByDate(date))
            .isInstanceOf(BLException.class)
            .hasMessageContaining("2024-03-15");
    }

    @Test
    void getToday_queriesCurrentViennaDate() {
        LocalDate today = LocalDate.now(ZoneId.of("Europe/Vienna"));
        PrayerTimeEntity entity = buildEntity(today);
        PrayerTimeDto dto = buildDto(today);

        when(repository.findByDate(today)).thenReturn(Optional.of(entity));
        when(mapper.entityToDto(entity)).thenReturn(dto);

        PrayerTimeDto result = service.getToday();

        assertThat(result).isNotNull();
        verify(repository).findByDate(today);
    }

    @Test
    void getToday_throwsBLException_whenTodayNotSeeded() {
        LocalDate today = LocalDate.now(ZoneId.of("Europe/Vienna"));
        when(repository.findByDate(today)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getToday())
            .isInstanceOf(BLException.class);
    }

    @Test
    void getByDate_returnsDtoWithCorrectFajrTime() {
        LocalDate date = LocalDate.of(2026, 1, 15);
        PrayerTimeEntity entity = buildEntity(date);
        PrayerTimeDto dto = buildDto(date);

        when(repository.findByDate(date)).thenReturn(Optional.of(entity));
        when(mapper.entityToDto(entity)).thenReturn(dto);

        PrayerTimeDto result = service.getByDate(date);

        assertThat(result.getFajr()).isEqualTo(LocalTime.of(4, 30));
    }

    private PrayerTimeEntity buildEntity(LocalDate date) {
        return PrayerTimeEntity.builder()
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
