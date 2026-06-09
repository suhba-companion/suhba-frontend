package com.suhba.persistence.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "prayer_times")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrayerTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime fajr;

    @Column(nullable = false)
    private LocalTime shuruq;

    @Column(nullable = false)
    private LocalTime dhuhr;

    @Column(nullable = false)
    private LocalTime asr;

    @Column(nullable = false)
    private LocalTime maghrib;

    @Column(nullable = false)
    private LocalTime isha;
}
