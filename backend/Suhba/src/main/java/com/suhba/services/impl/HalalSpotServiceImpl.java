package com.suhba.services.impl;

import com.suhba.exception.BLException;
import com.suhba.persistence.entities.HalalSpotEntity;
import com.suhba.persistence.repositories.HalalSpotRepository;
import com.suhba.services.HalalSpotService;
import com.suhba.services.dto.HalalSpotDto;
import com.suhba.services.dto.NearbyQueryDto;
import com.suhba.services.mapper.HalalSpotMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Sort;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HalalSpotServiceImpl implements HalalSpotService {

    private final HalalSpotRepository repository;
    private final HalalSpotMapper mapper;

    @Override
    public List<HalalSpotDto> getAll() {
        return mapper.entityListToDtoList(
            repository.findAllByStatus(HalalSpotEntity.ApprovalStatus.APPROVED)
        );
    }

    @Override
    public List<HalalSpotDto> findNearby(NearbyQueryDto query, HalalSpotEntity.BusinessCategory category) {
        double[] bbox = boundingBox(query.getLatitude(), query.getLongitude(), query.getRadiusKm());

        List<HalalSpotEntity> candidates = (category != null)
            ? repository.findInBoundingBoxByCategory(bbox[0], bbox[1], bbox[2], bbox[3], category)
            : repository.findInBoundingBox(bbox[0], bbox[1], bbox[2], bbox[3]);

        return candidates.stream()
            .map(entity -> {
                HalalSpotDto dto = mapper.entityToDto(entity);
                double dist = haversine(
                    query.getLatitude(), query.getLongitude(),
                    entity.getLatitude(), entity.getLongitude()
                );
                dto.setDistanceKm(Math.round(dist * 100.0) / 100.0);
                return dto;
            })
            .filter(dto -> dto.getDistanceKm() <= query.getRadiusKm())
            .sorted(Comparator
                .comparingDouble(HalalSpotDto::getDistanceKm)
                .thenComparing(Comparator.comparing(HalalSpotDto::getFeatured).reversed()))
            .collect(Collectors.toList());
    }

    @Override
    public List<HalalSpotDto> getFeatured() {
        return mapper.entityListToDtoList(
            repository.findAllByFeaturedTrueAndStatus(HalalSpotEntity.ApprovalStatus.APPROVED)
        );
    }

    @Override
    public HalalSpotDto submit(HalalSpotDto dto, String submittedBy) {
        HalalSpotEntity entity = mapper.dtoToEntity(dto);
        entity.setStatus(HalalSpotEntity.ApprovalStatus.PENDING);
        entity.setSubmittedBy(submittedBy);
        entity.setUpvotes(0);
        entity.setFeatured(false);
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public HalalSpotDto getById(Long id) {
        return repository.findById(id)
            .map(mapper::entityToDto)
            .orElseThrow(() -> new BLException("Halal spot not found: " + id));
    }

    @Override
    public HalalSpotDto approve(Long id) {
        HalalSpotEntity entity = findOrThrow(id);
        entity.setStatus(HalalSpotEntity.ApprovalStatus.APPROVED);
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public HalalSpotDto reject(Long id) {
        HalalSpotEntity entity = findOrThrow(id);
        entity.setStatus(HalalSpotEntity.ApprovalStatus.REJECTED);
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public HalalSpotDto upvote(Long id) {
        HalalSpotEntity entity = findOrThrow(id);
        entity.setUpvotes(entity.getUpvotes() + 1);
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public List<HalalSpotDto> getPending() {
        return mapper.entityListToDtoList(
            repository.findAllByStatus(HalalSpotEntity.ApprovalStatus.PENDING)
        );
    }

    @Override
    public List<HalalSpotDto> getAllAdmin() {
        return mapper.entityListToDtoList(
            repository.findAll(Sort.by(Sort.Direction.DESC, "id"))
        );
    }

    @Override
    public HalalSpotDto update(Long id, HalalSpotDto dto) {
        HalalSpotEntity entity = findOrThrow(id);
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setAddress(dto.getAddress());
        entity.setDistrict(dto.getDistrict());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setCategory(dto.getCategory());
        entity.setCuisines(dto.getCuisines());
        entity.setPhone(dto.getPhone());
        entity.setWebsite(dto.getWebsite());
        entity.setCertified(dto.getCertified());
        entity.setCertificationBody(dto.getCertificationBody());
        entity.setOpeningHours(dto.getOpeningHours());
        entity.setRating(dto.getRating());
        entity.setFeatured(dto.getFeatured() != null ? dto.getFeatured() : entity.getFeatured());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public void delete(Long id) {
        findOrThrow(id);
        repository.deleteById(id);
    }

    private HalalSpotEntity findOrThrow(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new BLException("Halal spot not found: " + id));
    }

    private double[] boundingBox(double lat, double lng, double radiusKm) {
        double latDelta = radiusKm / 111.0;
        double lngDelta = radiusKm / (111.0 * Math.cos(Math.toRadians(lat)));
        return new double[]{lat - latDelta, lat + latDelta, lng - lngDelta, lng + lngDelta};
    }

    private double haversine(double lat1, double lng1, double lat2, double lng2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
