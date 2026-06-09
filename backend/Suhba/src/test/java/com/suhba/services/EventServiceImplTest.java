package com.suhba.services;

import com.suhba.exception.BLException;
import com.suhba.persistence.entities.EventEntity;
import com.suhba.persistence.repositories.EventRepository;
import com.suhba.services.dto.EventDto;
import com.suhba.services.dto.NearbyQueryDto;
import com.suhba.services.impl.EventServiceImpl;
import com.suhba.services.mapper.EventMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock private EventRepository repository;
    @Mock private EventMapper mapper;
    @InjectMocks private EventServiceImpl service;

    @Test
    void getAll_returnsApprovedEventsOrderedByStartTime() {
        EventEntity entity = buildEntity(48.2, 16.37);
        when(repository.findAllByStatusOrderByStartTimeAsc(EventEntity.ApprovalStatus.APPROVED))
            .thenReturn(List.of(entity));
        when(mapper.entityListToDtoList(anyList())).thenReturn(List.of(buildDto(48.2, 16.37)));

        List<EventDto> result = service.getAll();

        assertThat(result).hasSize(1);
        verify(repository).findAllByStatusOrderByStartTimeAsc(EventEntity.ApprovalStatus.APPROVED);
    }

    @Test
    void getUpcoming_returnsUpcomingEvents() {
        EventEntity entity = buildEntity(48.2, 16.37);
        when(repository.findUpcoming(any(Instant.class))).thenReturn(List.of(entity));
        when(mapper.entityListToDtoList(anyList())).thenReturn(List.of(buildDto(48.2, 16.37)));

        List<EventDto> result = service.getUpcoming();

        assertThat(result).hasSize(1);
        verify(repository).findUpcoming(any(Instant.class));
    }

    @Test
    void submit_savesPendingWithZeroUpvotes() {
        EventDto input = buildDto(48.2, 16.37);
        EventEntity entity = buildEntity(48.2, 16.37);
        EventEntity saved = buildEntity(48.2, 16.37);
        saved.setStatus(EventEntity.ApprovalStatus.PENDING);
        saved.setUpvotes(0);
        saved.setSubmittedBy("user1");

        when(mapper.dtoToEntity(input)).thenReturn(entity);
        when(repository.save(any())).thenReturn(saved);
        when(mapper.entityToDto(saved)).thenReturn(input);

        service.submit(input, "user1");

        verify(repository).save(argThat(e ->
            e.getStatus() == EventEntity.ApprovalStatus.PENDING &&
            e.getUpvotes() == 0 &&
            "user1".equals(e.getSubmittedBy())
        ));
    }

    @Test
    void getById_throwsBLExceptionWhenNotFound() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(999L))
            .isInstanceOf(BLException.class)
            .hasMessageContaining("999");
    }

    @Test
    void getById_returnsDto_whenFound() {
        EventEntity entity = buildEntity(48.2, 16.37);
        entity.setId(1L);
        EventDto dto = buildDto(48.2, 16.37);

        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(mapper.entityToDto(entity)).thenReturn(dto);

        EventDto result = service.getById(1L);
        assertThat(result).isNotNull();
    }

    @Test
    void approve_setsStatusToApproved() {
        EventEntity entity = buildEntity(48.2, 16.37);
        entity.setId(1L);
        entity.setStatus(EventEntity.ApprovalStatus.PENDING);

        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(repository.save(any())).thenReturn(entity);
        when(mapper.entityToDto(any())).thenReturn(buildDto(48.2, 16.37));

        service.approve(1L);

        verify(repository).save(argThat(e ->
            e.getStatus() == EventEntity.ApprovalStatus.APPROVED
        ));
    }

    @Test
    void reject_setsStatusToRejected() {
        EventEntity entity = buildEntity(48.2, 16.37);
        entity.setId(1L);
        entity.setStatus(EventEntity.ApprovalStatus.PENDING);

        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(repository.save(any())).thenReturn(entity);
        when(mapper.entityToDto(any())).thenReturn(buildDto(48.2, 16.37));

        service.reject(1L);

        verify(repository).save(argThat(e ->
            e.getStatus() == EventEntity.ApprovalStatus.REJECTED
        ));
    }

    @Test
    void upvote_incrementsUpvotesByOne() {
        EventEntity entity = buildEntity(48.2, 16.37);
        entity.setId(1L);
        entity.setUpvotes(2);

        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(repository.save(any())).thenReturn(entity);
        when(mapper.entityToDto(any())).thenReturn(buildDto(48.2, 16.37));

        service.upvote(1L);

        verify(repository).save(argThat(e -> e.getUpvotes() == 3));
    }

    @Test
    void findNearby_sortsByStartTimeAscending() {
        Instant earlier = Instant.parse("2026-06-01T10:00:00Z");
        Instant later   = Instant.parse("2026-06-01T15:00:00Z");

        EventEntity e1 = buildEntity(48.2, 16.37);
        e1.setStartTime(later);
        EventEntity e2 = buildEntity(48.201, 16.371);
        e2.setStartTime(earlier);

        EventDto dto1 = buildDto(48.2, 16.37);
        dto1.setStartTime(later);
        EventDto dto2 = buildDto(48.201, 16.371);
        dto2.setStartTime(earlier);

        when(repository.findUpcomingInBoundingBox(
                any(Instant.class), anyDouble(), anyDouble(), anyDouble(), anyDouble()))
            .thenReturn(List.of(e1, e2));
        when(mapper.entityToDto(e1)).thenReturn(dto1);
        when(mapper.entityToDto(e2)).thenReturn(dto2);

        NearbyQueryDto query = NearbyQueryDto.builder()
            .latitude(48.2).longitude(16.37).radiusKm(10.0).build();

        List<EventDto> result = service.findNearby(query);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getStartTime()).isBefore(result.get(1).getStartTime());
    }

    @Test
    void getPending_returnsOnlyPendingEvents() {
        EventEntity entity = buildEntity(48.2, 16.37);
        when(repository.findAllByStatus(EventEntity.ApprovalStatus.PENDING))
            .thenReturn(List.of(entity));
        when(mapper.entityListToDtoList(anyList())).thenReturn(List.of(buildDto(48.2, 16.37)));

        List<EventDto> result = service.getPending();

        assertThat(result).hasSize(1);
        verify(repository).findAllByStatus(EventEntity.ApprovalStatus.PENDING);
    }

    private EventEntity buildEntity(double lat, double lng) {
        return EventEntity.builder()
            .title("Freitagsgebet")
            .address("Am Bruckhaufen 4")
            .district("1210")
            .latitude(lat)
            .longitude(lng)
            .startTime(Instant.parse("2026-06-05T12:00:00Z"))
            .category(EventEntity.EventCategory.PRAYER)
            .isFree(true)
            .status(EventEntity.ApprovalStatus.APPROVED)
            .submittedBy("tester")
            .upvotes(0)
            .build();
    }

    private EventDto buildDto(double lat, double lng) {
        return EventDto.builder()
            .title("Freitagsgebet")
            .address("Am Bruckhaufen 4")
            .district("1210")
            .latitude(lat)
            .longitude(lng)
            .startTime(Instant.parse("2026-06-05T12:00:00Z"))
            .category(EventEntity.EventCategory.PRAYER)
            .isFree(true)
            .build();
    }
}
