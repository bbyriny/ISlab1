package org.bbyriny.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.bbyriny.backend.entity.Color;
import org.bbyriny.backend.entity.Dragon;
import org.bbyriny.backend.entity.DragonCharacter;

import java.util.Optional;

@Repository
public interface DragonRepository extends JpaRepository<Dragon, Long> {

    @EntityGraph(attributePaths = {"coordinates", "cave", "killer", "killer.location", "head"})
    @Override
    Page<Dragon> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"coordinates", "cave", "killer", "killer.location", "head"})
    Page<Dragon> findByName(String name, Pageable pageable);

    @EntityGraph(attributePaths = {"coordinates", "cave", "killer", "killer.location", "head"})
    Page<Dragon> findByDescription(String description, Pageable pageable);

    @EntityGraph(attributePaths = {"coordinates", "cave", "killer", "killer.location", "head"})
    Page<Dragon> findByColor(Color color, Pageable pageable);

    @EntityGraph(attributePaths = {"coordinates", "cave", "killer", "killer.location", "head"})
    Page<Dragon> findByCharacter(DragonCharacter character, Pageable pageable);

    @EntityGraph(attributePaths = {"coordinates", "cave", "killer", "killer.location", "head"})
    Page<Dragon> findByKillerName(String killerName, Pageable pageable);

    Optional<Dragon> findFirstByAge(Long age);

    boolean existsByCoordinatesId(Long id);
    boolean existsByCaveId(Long id);
    boolean existsByKillerId(Long id);
    boolean existsByHeadId(Long id);
}
