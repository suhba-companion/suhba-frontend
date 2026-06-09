package com.suhba.persistence.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "halal_spots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HalalSpotEntity {

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
    private BusinessCategory category;

    // EAGER required — LAZY causes LazyInitializationException when mapping outside transaction
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "halal_spot_cuisines",
        joinColumns = @JoinColumn(name = "spot_id")
    )
    @Column(name = "cuisine")
    private List<String> cuisines;

    private String phone;
    private String website;

    private Boolean certified;

    @Column(name = "certification_body")
    private String certificationBody;

    @Column(name = "opening_hours")
    private String openingHours;

    private Double rating;

    @Column(nullable = false)
    private Boolean featured;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status;

    @Column(name = "submitted_by", nullable = false)
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

    public enum BusinessCategory {
        RESTAURANT, GROCERY, BUTCHER, CAFE, BAKERY, OTHER
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}
