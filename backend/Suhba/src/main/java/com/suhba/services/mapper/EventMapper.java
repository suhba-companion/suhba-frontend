package com.suhba.services.mapper;

import com.suhba.persistence.entities.EventEntity;
import com.suhba.services.dto.EventDto;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EventMapper {

    @Mapping(target = "distanceKm", ignore = true)
    EventDto entityToDto(EventEntity entity);

    @Mapping(target = "status",    ignore = true)
    @Mapping(target = "upvotes",   ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    EventEntity dtoToEntity(EventDto dto);

    List<EventDto> entityListToDtoList(List<EventEntity> entities);
}
