package com.suhba.services.dto;

import com.suhba.persistence.entities.HalalSpotEntity;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HalalSpotDto {

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
    private HalalSpotEntity.BusinessCategory category;

    private List<String> cuisines;
    private String phone;
    private String website;
    private Boolean certified;
    private String certificationBody;
    private String openingHours;
    private Double rating;

    private Boolean featured;
    private HalalSpotEntity.ApprovalStatus status;
    private Integer upvotes;

    private Double distanceKm;
}
