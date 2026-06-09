package com.suhba.persistence;

import com.suhba.persistence.entities.PrayerTimeEntity;
import com.suhba.persistence.repositories.PrayerTimeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class PrayerTimeRepositoryTest {

    @Autowired
    private PrayerTimeRepository repository;

    @Test
    void findByDate_returnsPresentOptional_whenDateExists() {
        LocalDate date = LocalDate.of(2026, 6, 5);
        repository.save(buildEntity(date));

        Optional<PrayerTimeEntity> result = repository.findByDate(date);

        assertThat(result).isPresent();
    }

    @Test
    void findByDate_returnsEmptyOptional_whenDateNotFound() {
        Optional<PrayerTimeEntity> result = repository.findByDate(LocalDate.of(1999, 1, 1));

        assertThat(result).isEmpty();
    }

    @Test
    void findByDate_returnsCorrectFajrTime() {
        LocalDate date = LocalDate.of(2026, 3, 10);
        repository.save(buildEntity(date));

        PrayerTimeEntity entity = repository.findByDate(date).orElseThrow();

        assertThat(entity.getFajr()).isEqualTo(LocalTime.of(4, 30));
    }

    @Test
    void findByDate_returnsCorrectIshaTime() {
        LocalDate date = LocalDate.of(2026, 8, 15);
        repository.save(buildEntity(date));

        PrayerTimeEntity entity = repository.findByDate(date).orElseThrow();

        assertThat(entity.getIsha()).isEqualTo(LocalTime.of(21, 30));
    }

    @Test
    void findByDate_doesNotReturnOtherDates() {
        LocalDate dateA = LocalDate.of(2026, 6, 1);
        LocalDate dateB = LocalDate.of(2026, 6, 2);
        repository.save(buildEntity(dateA));
        repository.save(buildEntity(dateB));

        Optional<PrayerTimeEntity> result = repository.findByDate(dateA);

        assertThat(result).isPresent();
        assertThat(result.get().getDate()).isEqualTo(dateA);
    }

    @Test
    void save_persistsAllPrayerTimes() {
        LocalDate date = LocalDate.of(2026, 12, 1);
        repository.save(buildEntity(date));

        PrayerTimeEntity entity = repository.findByDate(date).orElseThrow();
        assertThat(entity.getFajr()).isNotNull();
        assertThat(entity.getShuruq()).isNotNull();
        assertThat(entity.getDhuhr()).isNotNull();
        assertThat(entity.getAsr()).isNotNull();
        assertThat(entity.getMaghrib()).isNotNull();
        assertThat(entity.getIsha()).isNotNull();
    }

    private PrayerTimeEntity buildEntity(LocalDate date) {
        return PrayerTimeEntity.builder()
            .date(date)
            .fajr(LocalTime.of(4, 30))
            .shuruq(LocalTime.of(6, 15))
            .dhuhr(LocalTime.of(12, 0))
            .asr(LocalTime.of(15, 30))
            .maghrib(LocalTime.of(19, 45))
            .isha(LocalTime.of(21, 30))
            .build();
    }
}
