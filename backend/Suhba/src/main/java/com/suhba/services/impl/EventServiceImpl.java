package com.suhba.services.impl;

import com.suhba.exception.BLException;
import com.suhba.persistence.entities.EventEntity;
import com.suhba.persistence.repositories.EventRepository;
import com.suhba.services.EventService;
import com.suhba.services.dto.EventDto;
import com.suhba.services.dto.NearbyQueryDto;
import com.suhba.services.mapper.EventMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository repository;
    private final EventMapper mapper;

    @Override
    public List<EventDto> getAll() {
        return mapper.entityListToDtoList(
            repository.findAllByStatusOrderByStartTimeAsc(EventEntity.ApprovalStatus.APPROVED)
        );
    }

    @Override
    public List<EventDto> getUpcoming() {
        return mapper.entityListToDtoList(
            repository.findUpcoming(Instant.now())
        );
    }

    @Override
    public List<EventDto> findNearby(NearbyQueryDto query) {
        double[] bbox = boundingBox(query.getLatitude(), query.getLongitude(), query.getRadiusKm());
        List<EventEntity> candidates = repository.findUpcomingInBoundingBox(
            Instant.now(), bbox[0], bbox[1], bbox[2], bbox[3]
        );
        return candidates.stream()
            .map(entity -> {
                EventDto dto = mapper.entityToDto(entity);
                double dist = haversine(
                    query.getLatitude(), query.getLongitude(),
                    entity.getLatitude(), entity.getLongitude()
                );
                dto.setDistanceKm(Math.round(dist * 100.0) / 100.0);
                return dto;
            })
            .filter(dto -> dto.getDistanceKm() <= query.getRadiusKm())
            .sorted(Comparator.comparing(EventDto::getStartTime))
            .collect(Collectors.toList());
    }

    @Override
    public EventDto getById(Long id) {
        return repository.findById(id)
            .map(mapper::entityToDto)
            .orElseThrow(() -> new BLException("Event not found: " + id));
    }

    @Override
    public EventDto submit(EventDto dto, String submittedBy) {
        EventEntity entity = mapper.dtoToEntity(dto);
        entity.setStatus(EventEntity.ApprovalStatus.PENDING);
        entity.setSubmittedBy(submittedBy);
        entity.setUpvotes(0);
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public EventDto approve(Long id) {
        EventEntity entity = findOrThrow(id);
        entity.setStatus(EventEntity.ApprovalStatus.APPROVED);
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public EventDto reject(Long id) {
        EventEntity entity = findOrThrow(id);
        entity.setStatus(EventEntity.ApprovalStatus.REJECTED);
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public EventDto upvote(Long id) {
        EventEntity entity = findOrThrow(id);
        entity.setUpvotes(entity.getUpvotes() + 1);
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public List<EventDto> getPending() {
        return mapper.entityListToDtoList(
            repository.findAllByStatus(EventEntity.ApprovalStatus.PENDING)
        );
    }

    @Override
    public List<EventDto> getAllAdmin() {
        return mapper.entityListToDtoList(
            repository.findAll(Sort.by(Sort.Direction.ASC, "startTime"))
        );
    }

    @Override
    public EventDto update(Long id, EventDto dto) {
        EventEntity entity = findOrThrow(id);
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setAddress(dto.getAddress());
        entity.setDistrict(dto.getDistrict());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setCategory(dto.getCategory());
        entity.setOrganizer(dto.getOrganizer());
        entity.setContactInfo(dto.getContactInfo());
        entity.setIsFree(dto.getIsFree());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        return mapper.entityToDto(repository.save(entity));
    }

    @Override
    public void delete(Long id) {
        findOrThrow(id);
        repository.deleteById(id);
    }

    private EventEntity findOrThrow(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new BLException("Event not found: " + id));
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
