package org.bbyriny.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.bbyriny.backend.entity.Person;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {

    boolean existsByLocationId(Long id);
}
