package com.suhba.persistence.repositories;

import com.suhba.persistence.entities.HalalSpotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HalalSpotRepository extends JpaRepository<HalalSpotEntity, Long> {

    List<HalalSpotEntity> findAllByStatus(HalalSpotEntity.ApprovalStatus status);

    List<HalalSpotEntity> findAllByFeaturedTrueAndStatus(HalalSpotEntity.ApprovalStatus status);

    @Query("""
        SELECT h FROM HalalSpotEntity h
        WHERE h.status = 'APPROVED'
          AND h.latitude  BETWEEN :latMin AND :latMax
          AND h.longitude BETWEEN :lngMin AND :lngMax
        ORDER BY h.featured DESC, h.upvotes DESC
        """)
    List<HalalSpotEntity> findInBoundingBox(
        @Param("latMin") double latMin,
        @Param("latMax") double latMax,
        @Param("lngMin") double lngMin,
        @Param("lngMax") double lngMax
    );

    @Query("""
        SELECT h FROM HalalSpotEntity h
        WHERE h.status = 'APPROVED'
          AND h.latitude  BETWEEN :latMin AND :latMax
          AND h.longitude BETWEEN :lngMin AND :lngMax
          AND h.category  = :category
        ORDER BY h.featured DESC, h.upvotes DESC
        """)
    List<HalalSpotEntity> findInBoundingBoxByCategory(
        @Param("latMin") double latMin,
        @Param("latMax") double latMax,
        @Param("lngMin") double lngMin,
        @Param("lngMax") double lngMax,
        @Param("category") HalalSpotEntity.BusinessCategory category
    );
}
