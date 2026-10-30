package org.bbyriny.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.bbyriny.backend.entity.DragonHead;

@Repository
public interface DragonHeadRepository extends JpaRepository<DragonHead, Long> {

}
