package com.suhba.services.dto;

import com.suhba.persistence.entities.PrayerSpotEntity;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrayerSpotDto {

    private Long id;

    @NotBlank
    private String name;

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
    private PrayerSpotEntity.SpotType type;

    private Boolean wuduAvailable;
    private Boolean sistanAvailable;
    private Boolean fridayPrayer;
    private String jumaTime;
    private String jumaTimeSummer;
    private String jumaTimeWinter;
    private String openingHours;
    private Boolean parking;
    private String language;
    private String googleMapsUrl;
    private Boolean verified;

    private PrayerSpotEntity.ApprovalStatus status;
    private Integer upvotes;

    private Double distanceKm;
}
