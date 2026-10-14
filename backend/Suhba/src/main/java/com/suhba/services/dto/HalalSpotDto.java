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
    private HalalSpotEntity.BusinessCategory category;

    @Size(max = 20)
    private List<@Size(max = 100) String> cuisines;

    @Size(max = 50)
    private String phone;

    // Rendered as an href on the business detail page, so an unvalidated value here is a
    // stored XSS vector (javascript:...) once the spot is approved.
    @Size(max = 255)
    @Pattern(regexp = "^(https?://.*)?$", message = "website must start with http:// or https://")
    private String website;

    private Boolean certified;

    @Size(max = 200)
    private String certificationBody;

    @Size(max = 255)
    private String openingHours;

    private Double rating;

    private Boolean featured;
    private HalalSpotEntity.ApprovalStatus status;
    private Integer upvotes;

    private Double distanceKm;
}
