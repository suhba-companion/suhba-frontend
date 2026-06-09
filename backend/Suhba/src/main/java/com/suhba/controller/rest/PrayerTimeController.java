package com.suhba.controller.rest;

import com.suhba.services.PrayerTimeService;
import com.suhba.services.dto.PrayerTimeDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/prayer-times")
@RequiredArgsConstructor
@Tag(name = "Prayer Times", description = "IZW Vienna prayer times 2026")
public class PrayerTimeController {

    private final PrayerTimeService service;

    @GetMapping("/today")
    public PrayerTimeDto getToday() {
        return service.getToday();
    }

    @GetMapping("/{date}")
    public PrayerTimeDto getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.getByDate(date);
    }
}
