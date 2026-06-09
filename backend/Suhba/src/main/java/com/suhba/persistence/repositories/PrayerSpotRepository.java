package com.suhba.persistence.repositories;

import com.suhba.persistence.entities.PrayerSpotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PrayerSpotRepository extends JpaRepository<PrayerSpotEntity, Long> {

    List<PrayerSpotEntity> findAllByStatus(PrayerSpotEntity.ApprovalStatus status);

    @Query("""
        SELECT p FROM PrayerSpotEntity p
        WHERE p.status = 'APPROVED'
          AND p.latitude  BETWEEN :latMin AND :latMax
          AND p.longitude BETWEEN :lngMin AND :lngMax
        """)
    List<PrayerSpotEntity> findInBoundingBox(
        @Param("latMin") double latMin,
        @Param("latMax") double latMax,
        @Param("lngMin") double lngMin,
        @Param("lngMax") double lngMax
    );
}
