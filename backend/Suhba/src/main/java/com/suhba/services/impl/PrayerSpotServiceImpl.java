package com.suhba.services.impl;

import com.suhba.exception.BLException;
import com.suhba.persistence.entities.PrayerSpotEntity;
import com.suhba.persistence.repositories.PrayerSpotRepository;
import com.suhba.services.PrayerSpotService;
import com.suhba.services.dto.NearbyQueryDto;
import com.suhba.services.dto.PrayerSpotDto;
import com.suhba.services.mapper.PrayerSpotMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Sort;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrayerSpotServiceImpl implements PrayerSpotService {

    private final PrayerSpotRepository repository;
    private final PrayerSpotMapper mapper;

    @Override
    public List<PrayerSpotDto> getAll() {
        return mapper.entityListToDtoList(
            repository.findAllByStatus(PrayerSpotEntity.ApprovalStatus.APPROVED)
        );
    }

    @Override
    public List<PrayerSpotDto> findNearby(NearbyQueryDto query) {
        double[] bbox = boundingBox(query.getLatitude(), query.getLongitude(), query.getRadiusKm());
        List<PrayerSpotEntity> candidates = repository.findInBoundingBox(
            bbox[0], bbox[1], bbox[2], bbox[3]
        );
        return candidates.stream()
            .map(entity -> {
                PrayerSpotDto dto = mapper.entityToDto(entity);
                double dist = haversine(
                    query.getLatitude(), query.getLongitude(),
                    entity.getLatitude(), entity.getLongitude()
                );
                dto.setDistanceKm(Math.round(dist * 100.0) / 100.0);
                return dto;
            })
            .filter(dto -> dto.getDistanceKm() <= query.getRadiusKm())
            .sorted(Comparator.comparingDouble(PrayerSpotDto::getDistanceKm))
            .collect(Collectors.toList());
    }

    @Override
    public PrayerSpotDto submit(PrayerSpotDto dto, String submittedBy) {
        PrayerSpotEntity entity = mapper.dtoToEntity(dto);
        entity.setStatus(PrayerSpotEntity.ApprovalStatus.PENDING);
        entity.setSubmittedBy(submittedBy);
        entity.setUpvotes(0);
        entity.setVerified(false);
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public PrayerSpotDto getById(Long id) {
        return repository.findById(id)
            .map(mapper::entityToDto)
            .orElseThrow(() -> new BLException("Prayer spot not found: " + id));
    }

    @Override
    public PrayerSpotDto approve(Long id) {
        PrayerSpotEntity entity = findOrThrow(id);
        entity.setStatus(PrayerSpotEntity.ApprovalStatus.APPROVED);
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public PrayerSpotDto reject(Long id) {
        PrayerSpotEntity entity = findOrThrow(id);
        entity.setStatus(PrayerSpotEntity.ApprovalStatus.REJECTED);
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public PrayerSpotDto upvote(Long id) {
        PrayerSpotEntity entity = findOrThrow(id);
        entity.setUpvotes(entity.getUpvotes() + 1);
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public List<PrayerSpotDto> getPending() {
        return mapper.entityListToDtoList(
            repository.findAllByStatus(PrayerSpotEntity.ApprovalStatus.PENDING)
        );
    }

    @Override
    public List<PrayerSpotDto> getAllAdmin() {
        return mapper.entityListToDtoList(
            repository.findAll(Sort.by(Sort.Direction.DESC, "id"))
        );
    }

    @Override
    public PrayerSpotDto update(Long id, PrayerSpotDto dto) {
        PrayerSpotEntity entity = findOrThrow(id);
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setAddress(dto.getAddress());
        entity.setDistrict(dto.getDistrict());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setType(dto.getType());
        entity.setWuduAvailable(dto.getWuduAvailable());
        entity.setSistanAvailable(dto.getSistanAvailable());
        entity.setFridayPrayer(dto.getFridayPrayer());
        entity.setJumaTime(dto.getJumaTime());
        entity.setOpeningHours(dto.getOpeningHours());
        entity.setParking(dto.getParking());
        entity.setVerified(dto.getVerified());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public void delete(Long id) {
        findOrThrow(id);
        repository.deleteById(id);
    }

    private PrayerSpotEntity findOrThrow(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new BLException("Prayer spot not found: " + id));
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
