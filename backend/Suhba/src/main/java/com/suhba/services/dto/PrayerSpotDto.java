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
    @Size(max = 200)
    private String name;

    @Size(max = 1000)
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
    private PrayerSpotEntity.SpotType type;

    private Boolean wuduAvailable;
    private Boolean sistanAvailable;
    private Boolean fridayPrayer;

    @Size(max = 200)
    private String jumaTime;

    @Size(max = 200)
    private String jumaTimeSummer;

    @Size(max = 200)
    private String jumaTimeWinter;

    @Size(max = 255)
    private String openingHours;

    private Boolean parking;

    @Size(max = 200)
    private String language;

    @Size(max = 500)
    @Pattern(regexp = "^(https?://.*)?$", message = "googleMapsUrl must start with http:// or https://")
    private String googleMapsUrl;

    private Boolean verified;

    private PrayerSpotEntity.ApprovalStatus status;
    private Integer upvotes;

    private Double distanceKm;
}
