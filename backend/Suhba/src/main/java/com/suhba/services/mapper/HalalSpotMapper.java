package com.suhba.services.mapper;

import com.suhba.persistence.entities.HalalSpotEntity;
import com.suhba.services.dto.HalalSpotDto;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface HalalSpotMapper {

    @Mapping(target = "distanceKm", ignore = true)
    HalalSpotDto entityToDto(HalalSpotEntity entity);

    @Mapping(target = "status",    ignore = true)
    @Mapping(target = "upvotes",   ignore = true)
    @Mapping(target = "featured",  ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    HalalSpotEntity dtoToEntity(HalalSpotDto dto);

    List<HalalSpotDto> entityListToDtoList(List<HalalSpotEntity> entities);
}
