package com.suhba.persistence.repositories;

import com.suhba.persistence.entities.PrayerTimeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface PrayerTimeRepository extends JpaRepository<PrayerTimeEntity, Long> {

    Optional<PrayerTimeEntity> findByDate(LocalDate date);
}
