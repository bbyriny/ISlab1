package org.bbyriny.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.bbyriny.backend.entity.DragonCave;

@Repository
public interface DragonCaveRepository extends JpaRepository<DragonCave, Long> {

}
