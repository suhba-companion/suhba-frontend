package com.suhba.persistence.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "prayer_spots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrayerSpotEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @NotBlank
    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpotType type;

    @Column(name = "wudu_available")
    private Boolean wuduAvailable;

    @Column(name = "sistan_available")
    private Boolean sistanAvailable;

    @Column(name = "friday_prayer")
    private Boolean fridayPrayer;

    @Column(name = "juma_time")
    private String jumaTime;

    @Column(name = "juma_time_summer", length = 200)
    private String jumaTimeSummer;

    @Column(name = "juma_time_winter", length = 200)
    private String jumaTimeWinter;

    @Column(name = "opening_hours")
    private String openingHours;

    private Boolean parking;

    @Column(length = 200)
    private String language;

    @Column(name = "google_maps_url", length = 500)
    private String googleMapsUrl;

    private Boolean verified;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status;

    @Column(name = "submitted_by")
    private String submittedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(nullable = false)
    private Integer upvotes;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum SpotType {
        MOSQUE, MUSALLA, PUBLIC, OFFICE, OTHER
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}
