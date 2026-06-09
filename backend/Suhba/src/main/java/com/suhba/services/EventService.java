package com.suhba.services;

import com.suhba.services.dto.EventDto;
import com.suhba.services.dto.NearbyQueryDto;

import java.util.List;

public interface EventService {
    List<EventDto> getAll();
    List<EventDto> getUpcoming();
    List<EventDto> findNearby(NearbyQueryDto query);
    EventDto getById(Long id);
    EventDto submit(EventDto dto, String submittedBy);
    EventDto approve(Long id);
    EventDto reject(Long id);
    EventDto upvote(Long id);
    List<EventDto> getPending();
    List<EventDto> getAllAdmin();
    EventDto update(Long id, EventDto dto);
    void delete(Long id);
}
