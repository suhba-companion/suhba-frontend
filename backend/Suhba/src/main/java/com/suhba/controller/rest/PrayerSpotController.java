package com.suhba.controller.rest;

import com.suhba.services.PrayerSpotService;
import com.suhba.services.dto.NearbyQueryDto;
import com.suhba.services.dto.PrayerSpotDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/prayer-spots")
@RequiredArgsConstructor
@Tag(name = "Prayer Spots", description = "Crowd-sourced prayer location finder")
public class PrayerSpotController {

    private final PrayerSpotService service;

    @GetMapping
    @Operation(summary = "Get all approved prayer spots")
    public ResponseEntity<List<PrayerSpotDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find approved prayer spots near a location, sorted by distance ascending")
    public ResponseEntity<List<PrayerSpotDto>> findNearby(
            @Valid @ModelAttribute NearbyQueryDto query) {
        return ResponseEntity.ok(service.findNearby(query));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all spots awaiting admin review")
    public ResponseEntity<List<PrayerSpotDto>> getPending() {
        return ResponseEntity.ok(service.getPending());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrayerSpotDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Operation(summary = "Submit a new prayer spot — starts as PENDING")
    public ResponseEntity<PrayerSpotDto> submit(
        @Valid @RequestBody PrayerSpotDto dto,
        @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.submit(dto, userId));
    }

    @PostMapping("/{id}/upvote")
    @Operation(summary = "Upvote a prayer spot — community verification signal")
    public ResponseEntity<PrayerSpotDto> upvote(@PathVariable Long id) {
        return ResponseEntity.ok(service.upvote(id));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: approve a submitted prayer spot")
    public ResponseEntity<PrayerSpotDto> approve(@PathVariable Long id) {
        return ResponseEntity.ok(service.approve(id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: reject a submitted prayer spot")
    public ResponseEntity<PrayerSpotDto> reject(@PathVariable Long id) {
        return ResponseEntity.ok(service.reject(id));
    }
}
