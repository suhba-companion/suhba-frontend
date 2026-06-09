package com.suhba.services;

import com.suhba.services.dto.NearbyQueryDto;
import com.suhba.services.dto.PrayerSpotDto;

import java.util.List;

public interface PrayerSpotService {
    List<PrayerSpotDto> getAll();
    List<PrayerSpotDto> findNearby(NearbyQueryDto query);
    PrayerSpotDto submit(PrayerSpotDto dto, String submittedBy);
    PrayerSpotDto getById(Long id);
    PrayerSpotDto approve(Long id);
    PrayerSpotDto reject(Long id);
    PrayerSpotDto upvote(Long id);
    List<PrayerSpotDto> getPending();
    List<PrayerSpotDto> getAllAdmin();
    PrayerSpotDto update(Long id, PrayerSpotDto dto);
    void delete(Long id);
}
