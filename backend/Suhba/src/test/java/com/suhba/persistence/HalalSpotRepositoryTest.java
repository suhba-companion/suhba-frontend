package com.suhba.persistence;

import com.suhba.persistence.entities.HalalSpotEntity;
import com.suhba.persistence.repositories.HalalSpotRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class HalalSpotRepositoryTest {

    @Autowired
    private HalalSpotRepository repository;

    @Test
    void findInBoundingBox_returnsApprovedSpotInsideBox() {
        repository.save(buildSpot(48.2, 16.37, HalalSpotEntity.ApprovalStatus.APPROVED, false));

        List<HalalSpotEntity> result = repository.findInBoundingBox(48.1, 48.3, 16.3, 16.4);

        assertThat(result).isNotEmpty();
    }

    @Test
    void findInBoundingBox_excludesSpotOutsideBox() {
        repository.save(buildSpot(48.2, 16.37, HalalSpotEntity.ApprovalStatus.APPROVED, false));

        List<HalalSpotEntity> result = repository.findInBoundingBox(47.0, 47.5, 15.0, 15.5);

        assertThat(result).isEmpty();
    }

    @Test
    void findInBoundingBox_excludesPendingSpot() {
        repository.save(buildSpot(48.2, 16.37, HalalSpotEntity.ApprovalStatus.PENDING, false));

        List<HalalSpotEntity> result = repository.findInBoundingBox(48.1, 48.3, 16.3, 16.4);

        assertThat(result).isEmpty();
    }

    @Test
    void findInBoundingBox_excludesRejectedSpot() {
        repository.save(buildSpot(48.2, 16.37, HalalSpotEntity.ApprovalStatus.REJECTED, false));

        List<HalalSpotEntity> result = repository.findInBoundingBox(48.1, 48.3, 16.3, 16.4);

        assertThat(result).isEmpty();
    }

    @Test
    void findInBoundingBoxByCategory_returnsMatchingCategory() {
        repository.save(buildSpot(48.2, 16.37, HalalSpotEntity.ApprovalStatus.APPROVED, false,
            HalalSpotEntity.BusinessCategory.RESTAURANT));
        repository.save(buildSpot(48.21, 16.38, HalalSpotEntity.ApprovalStatus.APPROVED, false,
            HalalSpotEntity.BusinessCategory.CAFE));

        List<HalalSpotEntity> result = repository.findInBoundingBoxByCategory(
            48.1, 48.3, 16.3, 16.4, HalalSpotEntity.BusinessCategory.RESTAURANT
        );

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory()).isEqualTo(HalalSpotEntity.BusinessCategory.RESTAURANT);
    }

    @Test
    void findInBoundingBoxByCategory_excludesDifferentCategory() {
        repository.save(buildSpot(48.2, 16.37, HalalSpotEntity.ApprovalStatus.APPROVED, false,
            HalalSpotEntity.BusinessCategory.CAFE));

        List<HalalSpotEntity> result = repository.findInBoundingBoxByCategory(
            48.1, 48.3, 16.3, 16.4, HalalSpotEntity.BusinessCategory.RESTAURANT
        );

        assertThat(result).isEmpty();
    }

    @Test
    void findAllByFeaturedTrueAndStatus_returnsFeaturedApprovedOnly() {
        repository.save(buildSpot(48.2, 16.37, HalalSpotEntity.ApprovalStatus.APPROVED, true));
        repository.save(buildSpot(48.21, 16.38, HalalSpotEntity.ApprovalStatus.APPROVED, false));
        repository.save(buildSpot(48.22, 16.39, HalalSpotEntity.ApprovalStatus.PENDING, true));

        List<HalalSpotEntity> result = repository.findAllByFeaturedTrueAndStatus(
            HalalSpotEntity.ApprovalStatus.APPROVED
        );

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFeatured()).isTrue();
    }

    @Test
    void findAllByStatus_returnsOnlyApproved() {
        repository.save(buildSpot(48.2, 16.37, HalalSpotEntity.ApprovalStatus.APPROVED, false));
        repository.save(buildSpot(48.21, 16.38, HalalSpotEntity.ApprovalStatus.PENDING, false));

        List<HalalSpotEntity> result = repository.findAllByStatus(HalalSpotEntity.ApprovalStatus.APPROVED);

        assertThat(result).hasSize(1);
    }

    private HalalSpotEntity buildSpot(double lat, double lng, HalalSpotEntity.ApprovalStatus status, boolean featured) {
        return buildSpot(lat, lng, status, featured, HalalSpotEntity.BusinessCategory.RESTAURANT);
    }

    private HalalSpotEntity buildSpot(double lat, double lng, HalalSpotEntity.ApprovalStatus status,
                                       boolean featured, HalalSpotEntity.BusinessCategory category) {
        return HalalSpotEntity.builder()
            .name("Test Restaurant")
            .address("Teststraße 1")
            .district("01")
            .latitude(lat)
            .longitude(lng)
            .category(category)
            .status(status)
            .featured(featured)
            .submittedBy("tester")
            .upvotes(0)
            .build();
    }
}
