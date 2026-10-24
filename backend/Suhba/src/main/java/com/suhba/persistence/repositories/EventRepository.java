package com.suhba.persistence.repositories;

import com.suhba.persistence.entities.EventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<EventEntity, Long> {

    List<EventEntity> findAllByStatusOrderByStartTimeAsc(EventEntity.ApprovalStatus status);

    /**
     * A one-off is upcoming while its own start is ahead. A series is upcoming while the
     * series itself is alive, however long ago its first occurrence was — the occurrence
     * that is actually ahead is projected in the service, so it cannot be filtered here.
     */
    @Query("""
        SELECT e FROM EventEntity e
        WHERE e.status = 'APPROVED'
          AND (
                (e.recurrence IS NULL AND e.startTime >= :from)
             OR (e.recurrence IS NOT NULL
                 AND (e.recurrenceUntil IS NULL OR e.recurrenceUntil >= :untilFrom))
          )
        ORDER BY e.startTime ASC
        """)
    List<EventEntity> findUpcoming(@Param("from") Instant from, @Param("untilFrom") LocalDate untilFrom);

    @Query("""
        SELECT e FROM EventEntity e
        WHERE e.status = 'APPROVED'
          AND (
                (e.recurrence IS NULL AND e.startTime >= :from)
             OR (e.recurrence IS NOT NULL
                 AND (e.recurrenceUntil IS NULL OR e.recurrenceUntil >= :untilFrom))
          )
          AND e.latitude  BETWEEN :latMin AND :latMax
          AND e.longitude BETWEEN :lngMin AND :lngMax
        ORDER BY e.startTime ASC
        """)
    List<EventEntity> findUpcomingInBoundingBox(
        @Param("from")      Instant from,
        @Param("untilFrom") LocalDate untilFrom,
        @Param("latMin")    double latMin,
        @Param("latMax")    double latMax,
        @Param("lngMin")    double lngMin,
        @Param("lngMax")    double lngMax
    );

    List<EventEntity> findAllByStatus(EventEntity.ApprovalStatus status);
}
