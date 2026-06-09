package com.suhba.services;

import com.suhba.services.dto.PrayerTimeDto;

import java.time.LocalDate;

public interface PrayerTimeService {

    PrayerTimeDto getByDate(LocalDate date);

    PrayerTimeDto getToday();
}
