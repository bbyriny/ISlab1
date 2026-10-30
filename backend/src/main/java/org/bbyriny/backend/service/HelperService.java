package org.bbyriny.backend.service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.bbyriny.backend.dto.HelperEvent;
import org.bbyriny.backend.entity.*;
import org.bbyriny.backend.exception.NotFoundException;
import org.bbyriny.backend.exception.ObjectUsedException;
import org.bbyriny.backend.repository.*;

import java.util.List;

@Service
public class HelperService {
    private final CoordinatesRepository coordinatesRepository;
    private final DragonCaveRepository caveRepository;
    private final DragonHeadRepository headRepository;
    private final PersonRepository personRepository;
    private final LocationRepository locationRepository;
    private final DragonService dragonService;
    private final ApplicationEventPublisher events;

    public HelperService(
            CoordinatesRepository coordinatesRepository,
            DragonCaveRepository caveRepository,
            DragonHeadRepository headRepository,
            PersonRepository personRepository,
            LocationRepository locationRepository,
            DragonService dragonService,
            ApplicationEventPublisher events) {
        this.coordinatesRepository = coordinatesRepository;
        this.caveRepository = caveRepository;
        this.headRepository = headRepository;
        this.personRepository = personRepository;
        this.locationRepository = locationRepository;
        this.dragonService = dragonService;
        this.events = events;
    }

    public List<Coordinates> coordinates() {
        return coordinatesRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }
    public List<DragonCave> caves() {
        return caveRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }
    public List<DragonHead> heads() {
        return headRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }
    public List<Person> people() {
        return personRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }
    public List<Location> locations() {
        return locationRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Coordinates coordinate(Long id) {
        return coordinatesRepository.findById(id).orElseThrow(() ->
                new NotFoundException("Координаты не найдены"));
    }
    public DragonCave cave(Long id) {
        return caveRepository.findById(id).orElseThrow(() ->
                new NotFoundException("Пещера не найдена"));
    }
    public DragonHead head(Long id) {
        return headRepository.findById(id).orElseThrow(() ->
                new NotFoundException("Голова не найдена"));
    }
    public Person person(Long id) {
        return personRepository.findById(id).orElseThrow(() ->
                new NotFoundException("Человек не найден"));
    }
    public Location location(Long id) {
        return locationRepository.findById(id).orElseThrow(() ->
                new NotFoundException("Локация не найдена"));
    }

    @Transactional
    public Coordinates createCoordinate(Coordinates value) {
        Coordinates r=coordinatesRepository.save(value);
        helper("CREATED","coordinates",r.getId());
        return r;
    }
    @Transactional
    public DragonCave createCave(DragonCave value) {
        DragonCave r=caveRepository.save(value);
        helper("CREATED","cave",r.getId());
        return r;
    }
    @Transactional
    public DragonHead createHead(DragonHead value) {
        DragonHead r=headRepository.save(value);
        helper("CREATED","head",r.getId());
        return r;
    }
    @Transactional
    public Person createPerson(Person value) {
        if (value.getLocation() != null) {
            value.setLocation(value.getLocation().getId() == null
                    ? null
                    : location(value.getLocation().getId()));
        }
        Person r=personRepository.save(value);
        helper("CREATED","person",r.getId());
        return r;
    }
    @Transactional
    public Location createLocation(Location value) {
        Location r=locationRepository.save(value);
        helper("CREATED","location",r.getId());
        return r;
    }

    @Transactional
    public Coordinates updateCoordinate(Long id, Coordinates value) {
        Coordinates target=coordinate(id);
        target.setX(value.getX());
        target.setY(value.getY());
        Coordinates r=coordinatesRepository.save(target);
        helper("UPDATED","coordinates",r.getId());
        return r;
    }
    @Transactional
    public DragonCave updateCave(Long id, DragonCave value) {
        DragonCave target=cave(id);
        target.setDepth(value.getDepth());
        DragonCave r=caveRepository.save(target);
        helper("UPDATED","cave",r.getId());
        return r;
    }
    @Transactional
    public DragonHead updateHead(Long id, DragonHead value) {
        DragonHead target=head(id);
        target.setSize(value.getSize());
        DragonHead r=headRepository.save(target);
        helper("UPDATED","head",r.getId());
        return r;
    }
    @Transactional
    public Person updatePerson(Long id, Person value) {
        Person target=person(id);
        target.setName(value.getName());
        target.setEyeColor(value.getEyeColor());
        target.setHairColor(value.getHairColor());
        target.setBirthday(value.getBirthday());
        target.setWeight(value.getWeight());
        target.setPassportID(value.getPassportID());
        target.setLocation(value.getLocation() == null ||
                value.getLocation().getId() == null ? null : location(value.getLocation().getId()));
        Person r=personRepository.save(target);
        helper("UPDATED","person",r.getId());
        return r;
    }
    @Transactional
    public Location updateLocation(Long id, Location value) {
        Location target=location(id);
        target.setX(value.getX());
        target.setY(value.getY());
        target.setZ(value.getZ());
        target.setName(value.getName());
        Location r=locationRepository.save(target);
        helper("UPDATED","location",r.getId());
        return r;
    }

    @Transactional
    public void deleteCoordinate(Long id) {
        coordinate(id);
        dragonService.assertHelperCanDelete("coordinates", id);
        coordinatesRepository.deleteById(id);
        helper("DELETED","coordinates",id);
    }
    @Transactional
    public void deleteCave(Long id) {
        cave(id);
        dragonService.assertHelperCanDelete("cave", id);
        caveRepository.deleteById(id);
        helper("DELETED","cave",id);
    }
    @Transactional
    public void deleteHead(Long id) {
        head(id);
        dragonService.assertHelperCanDelete("head", id);
        headRepository.deleteById(id);
        helper("DELETED","head",id);
    }
    @Transactional
    public void deletePerson(Long id) {
        person(id);
        dragonService.assertHelperCanDelete("person", id);
        personRepository.deleteById(id);
        helper("DELETED","person",id);
    }
    @Transactional
    public void deleteLocation(Long id) {
        location(id);
        if (personRepository.existsByLocationId(id)) {
            throw new ObjectUsedException("Локация используется одним или несколькими людьми.");
        }
        locationRepository.deleteById(id); helper("DELETED","location",id);
    }

    private void helper(String type, String entity, Long id) {
        events.publishEvent(new HelperEvent(type, entity, id));
    }
}
