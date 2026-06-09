package com.suhba.services.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrayerTimeDto {

    private Long id;
    private LocalDate date;
    private LocalTime fajr;
    private LocalTime shuruq;
    private LocalTime dhuhr;
    private LocalTime asr;
    private LocalTime maghrib;
    private LocalTime isha;
}
