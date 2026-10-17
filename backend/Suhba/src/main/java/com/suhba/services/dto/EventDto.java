package com.suhba.services.dto;

import com.suhba.persistence.entities.EventEntity;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.Instant;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDto {

    private Long id;

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 5000)
    private String description;

    @NotBlank
    @Size(max = 300)
    private String address;

    @NotBlank
    @Size(max = 50)
    private String district;

    @NotNull
    @DecimalMin("-90.0") @DecimalMax("90.0")
    private Double latitude;

    @NotNull
    @DecimalMin("-180.0") @DecimalMax("180.0")
    private Double longitude;

    @NotNull
    private Instant startTime;

    private Instant endTime;

    // When set, startTime's time-of-day is overwritten with that prayer's time
    // from the prayer_times calendar, and clients show the prayer, not a clock time.
    private EventEntity.StartPrayer startPrayer;

    @NotEmpty
    private Set<EventEntity.EventCategory> categories;

    @Size(max = 200)
    private String organizer;

    @Size(max = 200)
    private String contactInfo;

    private Boolean isFree;

    @Size(max = 500)
    @Pattern(regexp = "^(https?://.*)?$", message = "googleMapsUrl must start with http:// or https://")
    private String googleMapsUrl;

    @Size(max = 500)
    @Pattern(regexp = "^https?://.*", message = "registrationUrl must start with http:// or https://")
    private String registrationUrl;

    private EventEntity.ApprovalStatus status;
    private Integer upvotes;
    private Double distanceKm;
}
