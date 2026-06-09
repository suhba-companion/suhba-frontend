package com.suhba.services;

import com.suhba.persistence.entities.HalalSpotEntity;
import com.suhba.services.dto.HalalSpotDto;
import com.suhba.services.dto.NearbyQueryDto;

import java.util.List;

public interface HalalSpotService {
    List<HalalSpotDto> getAll();
    List<HalalSpotDto> findNearby(NearbyQueryDto query, HalalSpotEntity.BusinessCategory category);
    List<HalalSpotDto> getFeatured();
    HalalSpotDto submit(HalalSpotDto dto, String submittedBy);
    HalalSpotDto getById(Long id);
    HalalSpotDto approve(Long id);
    HalalSpotDto reject(Long id);
    HalalSpotDto upvote(Long id);
    List<HalalSpotDto> getPending();
    List<HalalSpotDto> getAllAdmin();
    HalalSpotDto update(Long id, HalalSpotDto dto);
    void delete(Long id);
}
