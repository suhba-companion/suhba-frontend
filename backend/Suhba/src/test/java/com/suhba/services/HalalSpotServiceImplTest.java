package com.suhba.services;

import com.suhba.exception.BLException;
import com.suhba.persistence.entities.HalalSpotEntity;
import com.suhba.persistence.repositories.HalalSpotRepository;
import com.suhba.services.dto.HalalSpotDto;
import com.suhba.services.dto.NearbyQueryDto;
import com.suhba.services.impl.HalalSpotServiceImpl;
import com.suhba.services.mapper.HalalSpotMapper;
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
class HalalSpotServiceImplTest {

    @Mock private HalalSpotRepository repository;
    @Mock private HalalSpotMapper mapper;
    @InjectMocks private HalalSpotServiceImpl service;

    @Test
    void getAll_returnsOnlyApprovedSpots() {
        HalalSpotEntity entity = buildEntity(48.2, 16.37, false);
        when(repository.findAllByStatus(HalalSpotEntity.ApprovalStatus.APPROVED))
            .thenReturn(List.of(entity));
        when(mapper.entityListToDtoList(anyList())).thenReturn(List.of(buildDto(48.2, 16.37)));

        List<HalalSpotDto> result = service.getAll();

        assertThat(result).hasSize(1);
        verify(repository).findAllByStatus(HalalSpotEntity.ApprovalStatus.APPROVED);
    }

    @Test
    void submit_savesPendingWithZeroUpvotes() {
        HalalSpotDto input = buildDto(48.2, 16.37);
        HalalSpotEntity entity = buildEntity(48.2, 16.37, false);
        HalalSpotEntity saved = buildEntity(48.2, 16.37, false);
        saved.setStatus(HalalSpotEntity.ApprovalStatus.PENDING);
        saved.setUpvotes(0);
        saved.setFeatured(false);
        saved.setSubmittedBy("user1");

        when(mapper.dtoToEntity(input)).thenReturn(entity);
        when(repository.save(any())).thenReturn(saved);
        when(mapper.entityToDto(saved)).thenReturn(input);

        service.submit(input, "user1");

        verify(repository).save(argThat(e ->
            e.getStatus() == HalalSpotEntity.ApprovalStatus.PENDING &&
            e.getUpvotes() == 0 &&
            !e.getFeatured() &&
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
        HalalSpotEntity entity = buildEntity(48.2, 16.37, false);
        entity.setId(1L);
        HalalSpotDto dto = buildDto(48.2, 16.37);

        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(mapper.entityToDto(entity)).thenReturn(dto);

        HalalSpotDto result = service.getById(1L);
        assertThat(result).isNotNull();
    }

    @Test
    void approve_setsStatusToApproved() {
        HalalSpotEntity entity = buildEntity(48.2, 16.37, false);
        entity.setId(1L);
        entity.setStatus(HalalSpotEntity.ApprovalStatus.PENDING);

        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(repository.save(any())).thenReturn(entity);
        when(mapper.entityToDto(any())).thenReturn(buildDto(48.2, 16.37));

        service.approve(1L);

        verify(repository).save(argThat(e ->
            e.getStatus() == HalalSpotEntity.ApprovalStatus.APPROVED
        ));
    }

    @Test
    void reject_setsStatusToRejected() {
        HalalSpotEntity entity = buildEntity(48.2, 16.37, false);
        entity.setId(1L);
        entity.setStatus(HalalSpotEntity.ApprovalStatus.PENDING);

        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(repository.save(any())).thenReturn(entity);
        when(mapper.entityToDto(any())).thenReturn(buildDto(48.2, 16.37));

        service.reject(1L);

        verify(repository).save(argThat(e ->
            e.getStatus() == HalalSpotEntity.ApprovalStatus.REJECTED
        ));
    }

    @Test
    void upvote_incrementsUpvotesByOne() {
        HalalSpotEntity entity = buildEntity(48.2, 16.37, false);
        entity.setId(1L);
        entity.setUpvotes(5);

        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(repository.save(any())).thenReturn(entity);
        when(mapper.entityToDto(any())).thenReturn(buildDto(48.2, 16.37));

        service.upvote(1L);

        verify(repository).save(argThat(e -> e.getUpvotes() == 6));
    }

    @Test
    void findNearby_sortsByDistanceAscendingWithFeaturedBubbling() {
        double centerLat = 48.2, centerLng = 16.37;

        HalalSpotEntity near = buildEntity(48.201, 16.371, false);
        HalalSpotEntity far  = buildEntity(48.25, 16.40, false);

        when(repository.findInBoundingBox(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
            .thenReturn(List.of(far, near));
        when(mapper.entityToDto(near)).thenReturn(buildDto(48.201, 16.371));
        when(mapper.entityToDto(far)).thenReturn(buildDto(48.25, 16.40));

        NearbyQueryDto query = NearbyQueryDto.builder()
            .latitude(centerLat).longitude(centerLng).radiusKm(10.0).build();

        List<HalalSpotDto> result = service.findNearby(query, null);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getDistanceKm()).isLessThan(result.get(1).getDistanceKm());
    }

    @Test
    void findNearby_withCategoryFilter_usesFilteredQuery() {
        HalalSpotEntity entity = buildEntity(48.2, 16.37, false);
        when(repository.findInBoundingBoxByCategory(
                anyDouble(), anyDouble(), anyDouble(), anyDouble(),
                eq(HalalSpotEntity.BusinessCategory.RESTAURANT)))
            .thenReturn(List.of(entity));
        when(mapper.entityToDto(entity)).thenReturn(buildDto(48.2, 16.37));

        NearbyQueryDto query = NearbyQueryDto.builder()
            .latitude(48.2).longitude(16.37).radiusKm(5.0).build();

        List<HalalSpotDto> result = service.findNearby(query, HalalSpotEntity.BusinessCategory.RESTAURANT);

        verify(repository).findInBoundingBoxByCategory(
            anyDouble(), anyDouble(), anyDouble(), anyDouble(),
            eq(HalalSpotEntity.BusinessCategory.RESTAURANT)
        );
        assertThat(result).isNotNull();
    }

    @Test
    void getPending_returnsOnlyPendingSpots() {
        HalalSpotEntity entity = buildEntity(48.2, 16.37, false);
        when(repository.findAllByStatus(HalalSpotEntity.ApprovalStatus.PENDING))
            .thenReturn(List.of(entity));
        when(mapper.entityListToDtoList(anyList())).thenReturn(List.of(buildDto(48.2, 16.37)));

        List<HalalSpotDto> result = service.getPending();

        assertThat(result).hasSize(1);
        verify(repository).findAllByStatus(HalalSpotEntity.ApprovalStatus.PENDING);
    }

    @Test
    void getFeatured_returnsOnlyFeaturedApproved() {
        HalalSpotEntity entity = buildEntity(48.2, 16.37, true);
        when(repository.findAllByFeaturedTrueAndStatus(HalalSpotEntity.ApprovalStatus.APPROVED))
            .thenReturn(List.of(entity));
        when(mapper.entityListToDtoList(anyList())).thenReturn(List.of(buildDto(48.2, 16.37)));

        List<HalalSpotDto> result = service.getFeatured();

        assertThat(result).hasSize(1);
        verify(repository).findAllByFeaturedTrueAndStatus(HalalSpotEntity.ApprovalStatus.APPROVED);
    }

    private HalalSpotEntity buildEntity(double lat, double lng, boolean featured) {
        return HalalSpotEntity.builder()
            .name("Al-Sham")
            .address("Favoritenstraße 62")
            .district("1100")
            .latitude(lat)
            .longitude(lng)
            .category(HalalSpotEntity.BusinessCategory.RESTAURANT)
            .status(HalalSpotEntity.ApprovalStatus.APPROVED)
            .featured(featured)
            .submittedBy("tester")
            .upvotes(0)
            .build();
    }

    private HalalSpotDto buildDto(double lat, double lng) {
        return HalalSpotDto.builder()
            .name("Al-Sham")
            .address("Favoritenstraße 62")
            .district("1100")
            .latitude(lat)
            .longitude(lng)
            .category(HalalSpotEntity.BusinessCategory.RESTAURANT)
            .featured(false)
            .build();
    }
}
