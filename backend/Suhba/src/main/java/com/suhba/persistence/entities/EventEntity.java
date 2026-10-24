package com.suhba.persistence.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
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

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    // Set when the flyer announces a prayer instead of a clock time ("nach dem
    // Maghrib-Gebet"). startTime still holds the resolved instant for sorting.
    @Enumerated(EnumType.STRING)
    @Column(name = "start_prayer", length = 20)
    private StartPrayer startPrayer;

    // Set when the event is a series ("jeden Samstag"). startTime then holds the first
    // occurrence and anchors the series; the next occurrence is projected at read time
    // and never stored, so the series keeps one id and never ages out of /upcoming.
    // null means a one-off event.
    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence", length = 20)
    private Recurrence recurrence;

    // Inclusive last date the series may still produce an occurrence on.
    // null means it runs open-ended.
    @Column(name = "recurrence_until")
    private LocalDate recurrenceUntil;

    // Set when the announcement restricts the event to sisters or to brothers.
    // null means it is open to everyone, so no audience is shown.
    @Enumerated(EnumType.STRING)
    @Column(name = "audience", length = 20)
    private Audience audience;

    // EAGER required — LAZY causes LazyInitializationException when mapping outside transaction
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "event_categories",
        joinColumns = @JoinColumn(name = "event_id")
    )
    @Column(name = "category")
    @Enumerated(EnumType.STRING)
    private Set<EventCategory> categories;

    private String organizer;

    @Column(name = "contact_info")
    private String contactInfo;

    @Column(name = "is_free", nullable = false)
    private Boolean isFree;

    @Column(name = "google_maps_url", length = 500)
    private String googleMapsUrl;

    @Column(name = "registration_url", length = 500)
    private String registrationUrl;

    @Column(name = "requires_registration", nullable = false)
    private Boolean requiresRegistration;

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

    public enum EventCategory {
        PRAYER, LECTURE, CLASS, WORKSHOP, COMMUNITY, YOUTH, SPORT, FUNDRAISER, NEW_MUSLIMS, OTHER
    }

    public enum Recurrence {
        WEEKLY, BIWEEKLY, MONTHLY
    }

    public enum Audience {
        SISTERS_ONLY, BROTHERS_ONLY
    }

    public enum StartPrayer {
        FAJR, DHUHR, ASR, MAGHRIB, ISHA
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}
