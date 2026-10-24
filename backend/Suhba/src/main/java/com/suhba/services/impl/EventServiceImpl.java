package com.suhba.services.impl;

import com.suhba.exception.BLException;
import com.suhba.persistence.entities.EventEntity;
import com.suhba.persistence.entities.PrayerTimeEntity;
import com.suhba.persistence.repositories.EventRepository;
import com.suhba.persistence.repositories.PrayerTimeRepository;
import com.suhba.services.EventService;
import com.suhba.services.dto.EventDto;
import com.suhba.services.dto.NearbyQueryDto;
import com.suhba.services.mapper.EventMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Sort;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private static final ZoneId VIENNA = ZoneId.of("Europe/Vienna");

    private final EventRepository repository;
    private final PrayerTimeRepository prayerTimes;
    private final EventMapper mapper;

    @Override
    public List<EventDto> getAll() {
        return project(
            repository.findAllByStatusOrderByStartTimeAsc(EventEntity.ApprovalStatus.APPROVED),
            Instant.now()
        );
    }

    @Override
    public List<EventDto> getUpcoming() {
        Instant now = Instant.now();
        return project(repository.findUpcoming(now, now.atZone(VIENNA).toLocalDate()), now);
    }

    @Override
    public List<EventDto> findNearby(NearbyQueryDto query) {
        Instant now = Instant.now();
        double[] bbox = boundingBox(query.getLatitude(), query.getLongitude(), query.getRadiusKm());
        List<EventEntity> candidates = repository.findUpcomingInBoundingBox(
            now, now.atZone(VIENNA).toLocalDate(), bbox[0], bbox[1], bbox[2], bbox[3]
        );
        return candidates.stream()
            .map(entity -> {
                EventDto dto = projectNextOccurrence(entity, now);
                if (dto == null) return null;
                double dist = haversine(
                    query.getLatitude(), query.getLongitude(),
                    entity.getLatitude(), entity.getLongitude()
                );
                dto.setDistanceKm(Math.round(dist * 100.0) / 100.0);
                return dto;
            })
            .filter(Objects::nonNull)
            .filter(dto -> dto.getDistanceKm() <= query.getRadiusKm())
            .sorted(Comparator.comparing(EventDto::getStartTime))
            .collect(Collectors.toList());
    }

    @Override
    public EventDto getById(Long id) {
        return projectOrAnchor(findOrThrow(id));
    }

    @Override
    public EventDto submit(EventDto dto, String submittedBy) {
        requireLiveSeries(dto);
        EventEntity entity = mapper.dtoToEntity(dto);
        entity.setStartTime(resolveStartTime(dto));
        entity.setRecurrenceUntil(recurrenceUntilFor(dto));
        entity.setRequiresRegistration(Boolean.TRUE.equals(dto.getRequiresRegistration()));
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
        // Public endpoint, so it answers with the same occurrence /upcoming and the detail
        // page show. Returning the raw anchor would snap a series' date back to its first
        // occurrence in whatever card the client re-renders from the response.
        return projectOrAnchor(repository.save(entity));
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
        requireLiveSeries(dto);
        EventEntity entity = findOrThrow(id);
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setAddress(dto.getAddress());
        entity.setDistrict(dto.getDistrict());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setStartPrayer(dto.getStartPrayer());
        entity.setStartTime(resolveStartTime(dto));
        entity.setEndTime(dto.getEndTime());
        entity.setRecurrence(dto.getRecurrence());
        entity.setRecurrenceUntil(recurrenceUntilFor(dto));
        entity.setCategories(dto.getCategories());
        entity.setRegistrationUrl(dto.getRegistrationUrl());
        entity.setRequiresRegistration(Boolean.TRUE.equals(dto.getRequiresRegistration()));
        entity.setAudience(dto.getAudience());
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

    /**
     * Occurrences of a series are never stored, so the one a visitor should actually see
     * is worked out here: the first occurrence that has not passed yet. A weekly circle
     * therefore stays in /upcoming forever with next week's date, instead of ageing out
     * the way a one-off does, and it keeps the single id its detail page and upvotes use.
     */
    private List<EventDto> project(List<EventEntity> entities, Instant now) {
        return entities.stream()
            .map(entity -> projectNextOccurrence(entity, now))
            .filter(Objects::nonNull)
            .sorted(Comparator.comparing(EventDto::getStartTime))
            .collect(Collectors.toList());
    }

    /**
     * A series whose last date has passed still has a detail page; it then shows the
     * occurrence the organiser gave rather than one that will never happen again.
     */
    private EventDto projectOrAnchor(EventEntity entity) {
        EventDto projected = projectNextOccurrence(entity, Instant.now());
        return projected != null ? projected : mapper.entityToDto(entity);
    }

    /**
     * An end date only means anything for a series. Storing one on a one-off leaves a row
     * that reads as a series the moment someone sets `recurrence` again, with a long-stale
     * date that quietly hides the event.
     */
    private LocalDate recurrenceUntilFor(EventDto dto) {
        return dto.getRecurrence() == null ? null : dto.getRecurrenceUntil();
    }

    /** Null when the event is a series that has no occurrence left. */
    private EventDto projectNextOccurrence(EventEntity entity, Instant now) {
        EventDto dto = mapper.entityToDto(entity);
        if (entity.getRecurrence() == null) return dto;

        Instant next = nextOccurrence(entity, now);
        if (next == null) return null;
        if (entity.getEndTime() != null) {
            dto.setEndTime(next.plus(Duration.between(entity.getStartTime(), entity.getEndTime())));
        }
        dto.setStartTime(next);
        return dto;
    }

    /** Null when the series has run past its last date. */
    private Instant nextOccurrence(EventEntity entity, Instant now) {
        ZonedDateTime anchor = entity.getStartTime().atZone(VIENNA);
        // Jump straight to roughly the right repeat instead of stepping through years of
        // them, then walk the last step or two forward to land on the exact one.
        long skipped = switch (entity.getRecurrence()) {
            case WEEKLY   -> ChronoUnit.WEEKS.between(anchor, now.atZone(VIENNA));
            case BIWEEKLY -> ChronoUnit.WEEKS.between(anchor, now.atZone(VIENNA)) / 2;
            case MONTHLY  -> ChronoUnit.MONTHS.between(anchor, now.atZone(VIENNA));
        };
        long repeat = Math.max(0, skipped);
        ZonedDateTime occurrence = occurrenceAt(entity, anchor, repeat);
        while (occurrence.toInstant().isBefore(now)) {
            occurrence = occurrenceAt(entity, anchor, ++repeat);
        }
        LocalDate until = entity.getRecurrenceUntil();
        if (until != null && occurrence.toLocalDate().isAfter(until)) return null;
        return occurrence.toInstant();
    }

    private ZonedDateTime occurrenceAt(EventEntity entity, ZonedDateTime anchor, long repeat) {
        // Always counted from the anchor, never from the previous occurrence: stepping
        // month by month would drift off a 31st once February has clamped it to the 28th.
        ZonedDateTime occurrence = switch (entity.getRecurrence()) {
            case WEEKLY   -> anchor.plusWeeks(repeat);
            case BIWEEKLY -> anchor.plusWeeks(2 * repeat);
            case MONTHLY  -> anchor.plusMonths(repeat);
        };
        if (entity.getStartPrayer() == null) return occurrence;
        // A series tied to a prayer drifts with the calendar, so each occurrence takes its
        // time of day from its own date. Past the end of the seeded calendar there is
        // nothing to read, and the anchor's time of day keeps the sort order sane.
        return prayerTimes.findByDate(occurrence.toLocalDate())
            .map(times -> occurrence.toLocalDate()
                .atTime(prayerTimeOf(times, entity.getStartPrayer()))
                .atZone(VIENNA))
            .orElse(occurrence);
    }

    /**
     * A series that ends before it starts would silently never show up, so it is rejected
     * at the edge rather than saved as a row nobody can explain later.
     */
    private void requireLiveSeries(EventDto dto) {
        if (dto.getRecurrence() == null || dto.getRecurrenceUntil() == null) return;
        LocalDate start = dto.getStartTime().atZone(VIENNA).toLocalDate();
        if (dto.getRecurrenceUntil().isBefore(start)) {
            throw new BLException(
                "recurrenceUntil " + dto.getRecurrenceUntil() + " is before the first occurrence " + start);
        }
    }

    /**
     * An event announced as "after the Maghrib prayer" carries no clock time of its own.
     * The caller still sends a startTime, but only its date matters: the time of day comes
     * from the prayer calendar, so the stored instant stays correct for sorting and
     * /upcoming while clients render the prayer name instead of the time.
     */
    private Instant resolveStartTime(EventDto dto) {
        if (dto.getStartPrayer() == null) return dto.getStartTime();
        LocalDate date = dto.getStartTime().atZone(VIENNA).toLocalDate();
        PrayerTimeEntity times = prayerTimes.findByDate(date)
            .orElseThrow(() -> new BLException(
                "No prayer times for " + date + ", cannot resolve " + dto.getStartPrayer()));
        return date.atTime(prayerTimeOf(times, dto.getStartPrayer())).atZone(VIENNA).toInstant();
    }

    private LocalTime prayerTimeOf(PrayerTimeEntity times, EventEntity.StartPrayer prayer) {
        return switch (prayer) {
            case FAJR    -> times.getFajr();
            case DHUHR   -> times.getDhuhr();
            case ASR     -> times.getAsr();
            case MAGHRIB -> times.getMaghrib();
            case ISHA    -> times.getIsha();
        };
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
