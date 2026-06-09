package com.suhba.persistence;

import com.suhba.persistence.entities.EventEntity;
import com.suhba.persistence.repositories.EventRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class EventRepositoryTest {

    @Autowired
    private EventRepository repository;

    @Test
    void findUpcoming_returnsApprovedFutureEvents() {
        Instant future = Instant.now().plusSeconds(3600);
        repository.save(buildEvent(48.2, 16.37, future, EventEntity.ApprovalStatus.APPROVED));

        List<EventEntity> result = repository.findUpcoming(Instant.now());

        assertThat(result).isNotEmpty();
    }

    @Test
    void findUpcoming_excludesPastEvents() {
        Instant past = Instant.now().minusSeconds(3600);
        repository.save(buildEvent(48.2, 16.37, past, EventEntity.ApprovalStatus.APPROVED));

        List<EventEntity> result = repository.findUpcoming(Instant.now());

        assertThat(result).isEmpty();
    }

    @Test
    void findUpcoming_excludesPendingEvents() {
        Instant future = Instant.now().plusSeconds(3600);
        repository.save(buildEvent(48.2, 16.37, future, EventEntity.ApprovalStatus.PENDING));

        List<EventEntity> result = repository.findUpcoming(Instant.now());

        assertThat(result).isEmpty();
    }

    @Test
    void findUpcoming_orderedByStartTimeAscending() {
        Instant first  = Instant.now().plusSeconds(1000);
        Instant second = Instant.now().plusSeconds(7200);
        repository.save(buildEvent(48.2, 16.37, second, EventEntity.ApprovalStatus.APPROVED));
        repository.save(buildEvent(48.21, 16.38, first, EventEntity.ApprovalStatus.APPROVED));

        List<EventEntity> result = repository.findUpcoming(Instant.now());

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getStartTime()).isBefore(result.get(1).getStartTime());
    }

    @Test
    void findUpcomingInBoundingBox_returnsEventInsideBox() {
        Instant future = Instant.now().plusSeconds(3600);
        repository.save(buildEvent(48.2, 16.37, future, EventEntity.ApprovalStatus.APPROVED));

        List<EventEntity> result = repository.findUpcomingInBoundingBox(
            Instant.now(), 48.1, 48.3, 16.3, 16.4
        );

        assertThat(result).isNotEmpty();
    }

    @Test
    void findUpcomingInBoundingBox_excludesEventOutsideBox() {
        Instant future = Instant.now().plusSeconds(3600);
        repository.save(buildEvent(48.2, 16.37, future, EventEntity.ApprovalStatus.APPROVED));

        List<EventEntity> result = repository.findUpcomingInBoundingBox(
            Instant.now(), 47.0, 47.5, 15.0, 15.5
        );

        assertThat(result).isEmpty();
    }

    @Test
    void findUpcomingInBoundingBox_excludesPastEvent() {
        Instant past = Instant.now().minusSeconds(3600);
        repository.save(buildEvent(48.2, 16.37, past, EventEntity.ApprovalStatus.APPROVED));

        List<EventEntity> result = repository.findUpcomingInBoundingBox(
            Instant.now(), 48.1, 48.3, 16.3, 16.4
        );

        assertThat(result).isEmpty();
    }

    @Test
    void findAllByStatus_returnsPendingOnly() {
        Instant future = Instant.now().plusSeconds(3600);
        repository.save(buildEvent(48.2, 16.37, future, EventEntity.ApprovalStatus.PENDING));
        repository.save(buildEvent(48.21, 16.38, future, EventEntity.ApprovalStatus.APPROVED));

        List<EventEntity> result = repository.findAllByStatus(EventEntity.ApprovalStatus.PENDING);

        assertThat(result).hasSize(1);
    }

    @Test
    void findAllByStatusOrderByStartTimeAsc_returnsInOrder() {
        Instant first  = Instant.now().plusSeconds(1000);
        Instant second = Instant.now().plusSeconds(7200);
        repository.save(buildEvent(48.2, 16.37, second, EventEntity.ApprovalStatus.APPROVED));
        repository.save(buildEvent(48.21, 16.38, first, EventEntity.ApprovalStatus.APPROVED));

        List<EventEntity> result = repository.findAllByStatusOrderByStartTimeAsc(EventEntity.ApprovalStatus.APPROVED);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getStartTime()).isBefore(result.get(1).getStartTime());
    }

    private EventEntity buildEvent(double lat, double lng, Instant startTime, EventEntity.ApprovalStatus status) {
        return EventEntity.builder()
            .title("Freitagsgebet")
            .address("Am Bruckhaufen 4")
            .district("01")
            .latitude(lat)
            .longitude(lng)
            .startTime(startTime)
            .category(EventEntity.EventCategory.PRAYER)
            .isFree(true)
            .status(status)
            .submittedBy("tester")
            .upvotes(0)
            .build();
    }
}
