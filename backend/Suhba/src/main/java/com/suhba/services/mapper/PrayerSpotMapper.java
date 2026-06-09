package com.suhba.services.mapper;

import com.suhba.persistence.entities.PrayerSpotEntity;
import com.suhba.services.dto.PrayerSpotDto;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PrayerSpotMapper {

    @Mapping(target = "distanceKm", ignore = true)
    PrayerSpotDto entityToDto(PrayerSpotEntity entity);

    @Mapping(target = "status",    ignore = true)
    @Mapping(target = "upvotes",   ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    PrayerSpotEntity dtoToEntity(PrayerSpotDto dto);

    List<PrayerSpotDto> entityListToDtoList(List<PrayerSpotEntity> entities);
}
