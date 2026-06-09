package com.suhba.controller.rest;

import com.suhba.configuration.LoginRateLimitService;
import com.suhba.services.EventService;
import com.suhba.services.HalalSpotService;
import com.suhba.services.PrayerSpotService;
import com.suhba.services.dto.EventDto;
import com.suhba.services.dto.HalalSpotDto;
import com.suhba.services.dto.PrayerSpotDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin", description = "Admin-only endpoints — require an active admin session")
public class AdminController {

    private final PrayerSpotService prayerSpotService;
    private final HalalSpotService halalSpotService;
    private final EventService eventService;
    private final AuthenticationManager authManager;
    private final LoginRateLimitService rateLimitService;

    private static final HttpSessionSecurityContextRepository SESSION_CONTEXT_REPO =
        new HttpSessionSecurityContextRepository();

    // ── Auth ─────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletRequest httpReq,
            HttpServletResponse httpRes) {

        String ip = clientIp(httpReq);

        if (rateLimitService.isBlocked(ip)) {
            return ResponseEntity.status(429)
                .body(Map.of("error", "Too many failed attempts. Try again in 15 minutes."));
        }

        try {
            Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password())
            );
            rateLimitService.recordSuccess(ip);

            // Invalidate any existing session before creating a new one (session fixation).
            HttpSession existing = httpReq.getSession(false);
            if (existing != null) {
                existing.invalidate();
            }

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            SESSION_CONTEXT_REPO.saveContext(context, httpReq, httpRes);

            return ResponseEntity.ok(Map.of("username", auth.getName()));

        } catch (AuthenticationException ex) {
            rateLimitService.recordFailure(ip);
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> me(Authentication auth) {
        return ResponseEntity.ok(Map.of("username", auth.getName()));
    }

    // ── Prayer spots ─────────────────────────────────────────────────────────

    @GetMapping("/prayer-spots")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PrayerSpotDto> allPrayerSpots() {
        return prayerSpotService.getAllAdmin();
    }

    @GetMapping("/prayer-spots/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PrayerSpotDto> pendingPrayerSpots() {
        return prayerSpotService.getPending();
    }

    @PatchMapping("/prayer-spots/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public PrayerSpotDto approvePrayerSpot(@PathVariable Long id) {
        return prayerSpotService.approve(id);
    }

    @PatchMapping("/prayer-spots/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public PrayerSpotDto rejectPrayerSpot(@PathVariable Long id) {
        return prayerSpotService.reject(id);
    }

    @PutMapping("/prayer-spots/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public PrayerSpotDto updatePrayerSpot(@PathVariable Long id, @Valid @RequestBody PrayerSpotDto dto) {
        return prayerSpotService.update(id, dto);
    }

    @DeleteMapping("/prayer-spots/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePrayerSpot(@PathVariable Long id) {
        prayerSpotService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Halal spots ──────────────────────────────────────────────────────────

    @GetMapping("/halal-spots")
    @PreAuthorize("hasRole('ADMIN')")
    public List<HalalSpotDto> allHalalSpots() {
        return halalSpotService.getAllAdmin();
    }

    @GetMapping("/halal-spots/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<HalalSpotDto> pendingHalalSpots() {
        return halalSpotService.getPending();
    }

    @PatchMapping("/halal-spots/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public HalalSpotDto approveHalalSpot(@PathVariable Long id) {
        return halalSpotService.approve(id);
    }

    @PatchMapping("/halal-spots/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public HalalSpotDto rejectHalalSpot(@PathVariable Long id) {
        return halalSpotService.reject(id);
    }

    @PutMapping("/halal-spots/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public HalalSpotDto updateHalalSpot(@PathVariable Long id, @Valid @RequestBody HalalSpotDto dto) {
        return halalSpotService.update(id, dto);
    }

    @DeleteMapping("/halal-spots/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteHalalSpot(@PathVariable Long id) {
        halalSpotService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Events ───────────────────────────────────────────────────────────────

    @GetMapping("/events")
    @PreAuthorize("hasRole('ADMIN')")
    public List<EventDto> allEvents() {
        return eventService.getAllAdmin();
    }

    @GetMapping("/events/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<EventDto> pendingEvents() {
        return eventService.getPending();
    }

    @PatchMapping("/events/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public EventDto approveEvent(@PathVariable Long id) {
        return eventService.approve(id);
    }

    @PatchMapping("/events/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public EventDto rejectEvent(@PathVariable Long id) {
        return eventService.reject(id);
    }

    @PutMapping("/events/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public EventDto updateEvent(@PathVariable Long id, @Valid @RequestBody EventDto dto) {
        return eventService.update(id, dto);
    }

    @DeleteMapping("/events/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    public record LoginRequest(
        @NotBlank @Size(max = 50) String username,
        @NotBlank @Size(max = 100) String password
    ) {}
}
