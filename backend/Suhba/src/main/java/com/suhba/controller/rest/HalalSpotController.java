package com.suhba.controller.rest;

import com.suhba.persistence.entities.HalalSpotEntity;
import com.suhba.services.HalalSpotService;
import com.suhba.services.dto.HalalSpotDto;
import com.suhba.services.dto.NearbyQueryDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/halal-spots")
@RequiredArgsConstructor
@Tag(name = "Halal Spots", description = "Halal food and business directory")
public class HalalSpotController {

    private final HalalSpotService service;

    @GetMapping
    @Operation(summary = "Get all approved halal spots")
    public ResponseEntity<List<HalalSpotDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find approved halal spots near a location, sorted by distance. Featured spots bubble up within same distance band.")
    public ResponseEntity<List<HalalSpotDto>> findNearby(
            @Valid @ModelAttribute NearbyQueryDto query,
            @RequestParam(required = false) HalalSpotEntity.BusinessCategory category) {
        return ResponseEntity.ok(service.findNearby(query, category));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured/promoted listings — for homepage hero section")
    public ResponseEntity<List<HalalSpotDto>> getFeatured() {
        return ResponseEntity.ok(service.getFeatured());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all halal spots awaiting admin review")
    public ResponseEntity<List<HalalSpotDto>> getPending() {
        return ResponseEntity.ok(service.getPending());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HalalSpotDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Operation(summary = "Submit a new halal spot — starts as PENDING")
    public ResponseEntity<HalalSpotDto> submit(
            @Valid @RequestBody HalalSpotDto dto,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.submit(dto, userId));
    }

    @PostMapping("/{id}/upvote")
    @Operation(summary = "Upvote a halal spot — community verification signal")
    public ResponseEntity<HalalSpotDto> upvote(@PathVariable Long id) {
        return ResponseEntity.ok(service.upvote(id));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: approve a submitted halal spot")
    public ResponseEntity<HalalSpotDto> approve(@PathVariable Long id) {
        return ResponseEntity.ok(service.approve(id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: reject a submitted halal spot")
    public ResponseEntity<HalalSpotDto> reject(@PathVariable Long id) {
        return ResponseEntity.ok(service.reject(id));
    }
}
