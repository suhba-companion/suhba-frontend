package com.suhba.services;

import com.suhba.exception.BLException;
import com.suhba.persistence.entities.PrayerSpotEntity;
import com.suhba.persistence.repositories.PrayerSpotRepository;
import com.suhba.services.dto.NearbyQueryDto;
import com.suhba.services.dto.PrayerSpotDto;
import com.suhba.services.impl.PrayerSpotServiceImpl;
import com.suhba.services.mapper.PrayerSpotMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PrayerSpotServiceImplTest {

    @Mock private PrayerSpotRepository repository;
    @Mock private PrayerSpotMapper mapper;
    @InjectMocks private PrayerSpotServiceImpl service;

    @Test
    void findNearby_sortsByDistanceAscending() {
        double centerLat = 48.2, centerLng = 16.37;

        PrayerSpotEntity near = entity(48.201, 16.371);
        PrayerSpotEntity far  = entity(48.25,  16.40);

        when(repository.findInBoundingBox(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
            .thenReturn(List.of(far, near));
        when(mapper.entityToDto(near)).thenReturn(dto(48.201, 16.371));
        when(mapper.entityToDto(far)).thenReturn(dto(48.25, 16.40));

        NearbyQueryDto query = NearbyQueryDto.builder()
            .latitude(centerLat).longitude(centerLng).radiusKm(10.0).build();

        List<PrayerSpotDto> result = service.findNearby(query);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getDistanceKm()).isLessThan(result.get(1).getDistanceKm());
    }

    @Test
    void submit_savesPendingWithZeroUpvotes() {
        PrayerSpotDto input = dto(48.2, 16.37);
        PrayerSpotEntity entity = entity(48.2, 16.37);
        PrayerSpotEntity saved = entity(48.2, 16.37);
        saved.setStatus(PrayerSpotEntity.ApprovalStatus.PENDING);
        saved.setUpvotes(0);
        saved.setSubmittedBy("user1");

        when(mapper.dtoToEntity(input)).thenReturn(entity);
        when(repository.save(any())).thenReturn(saved);
        when(mapper.entityToDto(saved)).thenReturn(input);

        service.submit(input, "user1");

        verify(repository).save(argThat(e ->
            e.getStatus() == PrayerSpotEntity.ApprovalStatus.PENDING &&
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
    void upvote_incrementsUpvotesByOne() {
        PrayerSpotEntity entity = entity(48.2, 16.37);
        entity.setId(1L);
        entity.setUpvotes(3);

        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(repository.save(any())).thenReturn(entity);
        when(mapper.entityToDto(any())).thenReturn(dto(48.2, 16.37));

        service.upvote(1L);

        verify(repository).save(argThat(e -> e.getUpvotes() == 4));
    }

    private PrayerSpotEntity entity(double lat, double lng) {
        return PrayerSpotEntity.builder()
            .name("Test").address("Addr").district("01")
            .latitude(lat).longitude(lng)
            .type(PrayerSpotEntity.SpotType.MOSQUE)
            .status(PrayerSpotEntity.ApprovalStatus.APPROVED)
            .submittedBy("tester").upvotes(0).build();
    }

    private PrayerSpotDto dto(double lat, double lng) {
        return PrayerSpotDto.builder()
            .name("Test").address("Addr").district("01")
            .latitude(lat).longitude(lng)
            .type(PrayerSpotEntity.SpotType.MOSQUE).build();
    }
}
