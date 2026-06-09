package com.suhba.persistence;

import com.suhba.persistence.entities.PrayerSpotEntity;
import com.suhba.persistence.repositories.PrayerSpotRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class PrayerSpotRepositoryTest {

    @Autowired
    private PrayerSpotRepository repository;

    private PrayerSpotEntity buildSpot(double lat, double lng, PrayerSpotEntity.ApprovalStatus status) {
        return PrayerSpotEntity.builder()
            .name("Test Mosque")
            .address("Stephansplatz 1")
            .district("01")
            .latitude(lat)
            .longitude(lng)
            .type(PrayerSpotEntity.SpotType.MOSQUE)
            .status(status)
            .submittedBy("tester")
            .upvotes(0)
            .build();
    }

    @Test
    void findInBoundingBox_returnsApprovedSpotInsideBox() {
        repository.save(buildSpot(48.2, 16.37, PrayerSpotEntity.ApprovalStatus.APPROVED));

        List<PrayerSpotEntity> result = repository.findInBoundingBox(48.1, 48.3, 16.3, 16.4);

        assertThat(result).isNotEmpty();
    }

    @Test
    void findInBoundingBox_excludesSpotOutsideBox() {
        repository.save(buildSpot(48.2, 16.37, PrayerSpotEntity.ApprovalStatus.APPROVED));

        List<PrayerSpotEntity> result = repository.findInBoundingBox(47.0, 47.5, 15.0, 15.5);

        assertThat(result).isEmpty();
    }

    @Test
    void findInBoundingBox_excludesPendingSpot() {
        repository.save(buildSpot(48.2, 16.37, PrayerSpotEntity.ApprovalStatus.PENDING));

        List<PrayerSpotEntity> result = repository.findInBoundingBox(48.1, 48.3, 16.3, 16.4);

        assertThat(result).isEmpty();
    }
}
