package com.suhba.persistence.repositories;

import com.suhba.persistence.entities.EventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface EventRepository extends JpaRepository<EventEntity, Long> {

    List<EventEntity> findAllByStatusOrderByStartTimeAsc(EventEntity.ApprovalStatus status);

    @Query("""
        SELECT e FROM EventEntity e
        WHERE e.status = 'APPROVED'
          AND e.startTime >= :from
        ORDER BY e.startTime ASC
        """)
    List<EventEntity> findUpcoming(@Param("from") Instant from);

    @Query("""
        SELECT e FROM EventEntity e
        WHERE e.status = 'APPROVED'
          AND e.startTime >= :from
          AND e.latitude  BETWEEN :latMin AND :latMax
          AND e.longitude BETWEEN :lngMin AND :lngMax
        ORDER BY e.startTime ASC
        """)
    List<EventEntity> findUpcomingInBoundingBox(
        @Param("from")    Instant from,
        @Param("latMin")  double latMin,
        @Param("latMax")  double latMax,
        @Param("lngMin")  double lngMin,
        @Param("lngMax")  double lngMax
    );

    List<EventEntity> findAllByStatus(EventEntity.ApprovalStatus status);
}
