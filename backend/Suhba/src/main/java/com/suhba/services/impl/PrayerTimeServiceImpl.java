package com.suhba.services.impl;

import com.suhba.exception.BLException;
import com.suhba.persistence.repositories.PrayerTimeRepository;
import com.suhba.services.PrayerTimeService;
import com.suhba.services.dto.PrayerTimeDto;
import com.suhba.services.mapper.PrayerTimeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class PrayerTimeServiceImpl implements PrayerTimeService {

    private static final ZoneId VIENNA = ZoneId.of("Europe/Vienna");

    private final PrayerTimeRepository repository;
    private final PrayerTimeMapper mapper;

    @Override
    public PrayerTimeDto getByDate(LocalDate date) {
        return repository.findByDate(date)
                .map(mapper::entityToDto)
                .orElseThrow(() -> new BLException("Keine Gebetszeiten für " + date));
    }

    @Override
    public PrayerTimeDto getToday() {
        return getByDate(LocalDate.now(VIENNA));
    }
}
