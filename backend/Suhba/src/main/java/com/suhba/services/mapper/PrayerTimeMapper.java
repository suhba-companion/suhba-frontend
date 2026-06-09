package com.suhba.services.mapper;

import com.suhba.persistence.entities.PrayerTimeEntity;
import com.suhba.services.dto.PrayerTimeDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PrayerTimeMapper {

    PrayerTimeDto entityToDto(PrayerTimeEntity entity);

    List<PrayerTimeDto> entityListToDtoList(List<PrayerTimeEntity> entities);
}
