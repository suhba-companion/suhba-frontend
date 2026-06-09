package com.suhba.services.dto;

import com.suhba.persistence.entities.EventEntity;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDto {

    private Long id;

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String address;

    @NotBlank
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

    @NotNull
    private EventEntity.EventCategory category;

    private String organizer;
    private String contactInfo;
    private Boolean isFree;
    private String googleMapsUrl;

    private EventEntity.ApprovalStatus status;
    private Integer upvotes;
    private Double distanceKm;
}
