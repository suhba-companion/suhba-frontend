package com.suhba.controller.rest;

import com.suhba.services.EventService;
import com.suhba.services.dto.EventDto;
import com.suhba.services.dto.NearbyQueryDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Community events – lectures, prayers, gatherings")
public class EventController {

    private final EventService service;

    @GetMapping
    public List<EventDto> getAll() {
        return service.getAll();
    }

    @GetMapping("/upcoming")
    public List<EventDto> getUpcoming() {
        return service.getUpcoming();
    }

    @GetMapping("/nearby")
    public List<EventDto> findNearby(@ModelAttribute @Valid NearbyQueryDto query) {
        return service.findNearby(query);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<EventDto> getPending() {
        return service.getPending();
    }

    @GetMapping("/{id}")
    public EventDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventDto submit(
            @RequestBody @Valid EventDto dto,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String userId) {
        return service.submit(dto, userId);
    }

    @PostMapping("/{id}/upvote")
    public EventDto upvote(@PathVariable Long id) {
        return service.upvote(id);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public EventDto approve(@PathVariable Long id) {
        return service.approve(id);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public EventDto reject(@PathVariable Long id) {
        return service.reject(id);
    }
}
