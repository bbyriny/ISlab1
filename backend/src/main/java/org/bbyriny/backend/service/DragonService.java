package org.bbyriny.backend.service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.bbyriny.backend.dto.DragonEvent;
import org.bbyriny.backend.dto.DragonRequest;
import org.bbyriny.backend.dto.KillDragonRequest;
import org.bbyriny.backend.entity.*;
import org.bbyriny.backend.exception.ConflictException;
import org.bbyriny.backend.exception.NotFoundException;
import org.bbyriny.backend.exception.ObjectUsedException;
import org.bbyriny.backend.repository.*;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class DragonService {
    private static final Set<String> SORT_FIELDS = Set.of(
            "id", "name", "creationDate", "age", "description", "color", "character",
            "coordinates.x", "coordinates.y", "cave.depth", "killer.name", "head.size");

    private final DragonRepository dragonRepository;
    private final CoordinatesRepository coordinatesRepository;
    private final DragonCaveRepository caveRepository;
    private final PersonRepository personRepository;
    private final DragonHeadRepository headRepository;
    private final ApplicationEventPublisher events;

    public DragonService(
            DragonRepository dragonRepository,
            CoordinatesRepository coordinatesRepository,
            DragonCaveRepository caveRepository,
            PersonRepository personRepository,
            DragonHeadRepository headRepository,
            ApplicationEventPublisher events) {
        this.dragonRepository = dragonRepository;
        this.coordinatesRepository = coordinatesRepository;
        this.caveRepository = caveRepository;
        this.personRepository = personRepository;
        this.headRepository = headRepository;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public Page<Dragon> getAll(int page, int size, String sortBy, String direction,
                               String filterField, String filterValue) {
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("Размер страницы должен быть от 1 до 100");
        }
        if (page < 0) {
            throw new IllegalArgumentException("Номер страницы не может быть отрицательным");
        }
        if (!SORT_FIELDS.contains(sortBy)) {
            throw new IllegalArgumentException("Сортировка по полю \"" + sortBy + "\" не поддерживается");
        }
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(dir, sortBy);
        if (!"id".equals(sortBy)) {
            sort = sort.and(Sort.by(Sort.Direction.ASC, "id"));
        }
        Pageable pageable = PageRequest.of(page, size, sort);

        if (filterValue == null || filterValue.isEmpty()) {
            return dragonRepository.findAll(pageable);
        }
        if (filterField == null) {
            throw new IllegalArgumentException("Не указано поле для фильтрации");
        }
        return switch (filterField) {
            case "name" -> dragonRepository.findByName(filterValue, pageable);
            case "description" -> dragonRepository.findByDescription(filterValue, pageable);
            case "color" -> dragonRepository.findByColor(parseEnum(filterValue, Color.class, "color"), pageable);
            case "character" -> dragonRepository.findByCharacter(
                    parseEnum(filterValue, DragonCharacter.class, "character"), pageable);
            case "killerName" -> dragonRepository.findByKillerName(filterValue, pageable);
            default -> throw new IllegalArgumentException(
                    "Фильтровать можно только по name, description, color, character или killerName");
        };
    }

    @Transactional(readOnly = true)
    public Dragon getById(Long id) {
        return dragonRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Дракон с id=" + id + " не найден"));
    }

    @Transactional
    public Dragon create(DragonRequest request) {
        Dragon dragon = new Dragon();
        applyRequest(dragon, request);
        Dragon saved = dragonRepository.save(dragon);
        events.publishEvent(new DragonEvent("CREATED", saved.getId()));
        return saved;
    }

    @Transactional
    public Dragon update(Long id, DragonRequest request) {
        Dragon dragon = getById(id);
        applyRequest(dragon, request);
        Dragon saved = dragonRepository.save(dragon);
        events.publishEvent(new DragonEvent("UPDATED", saved.getId()));
        return saved;
    }

    private void applyRequest(Dragon dragon, DragonRequest request) {
        dragon.setName(request.name());
        dragon.setCoordinates(coordinatesRepository.findById(request.coordinatesId())
                .orElseThrow(() -> new NotFoundException("Координаты с id=" + request.coordinatesId() + " не найдены")));
        dragon.setCave(caveRepository.findById(request.caveId())
                .orElseThrow(() -> new NotFoundException("Пещера с id=" + request.caveId() + " не найдена")));
        dragon.setKiller(request.killerId() == null ? null : personRepository.findById(request.killerId())
                .orElseThrow(() -> new NotFoundException("Человек с id=" + request.killerId() + " не найден")));
        dragon.setAge(request.age());
        dragon.setDescription(request.description());
        dragon.setColor(parseEnum(request.color(), Color.class, "color"));
        dragon.setCharacter(parseEnum(request.character(), DragonCharacter.class, "character"));
        dragon.setHead(request.headId() == null ? null : headRepository.findById(request.headId())
                .orElseThrow(() -> new NotFoundException("Голова с id=" + request.headId() + " не найдена")));
    }

    private <E extends Enum<E>> E parseEnum(String value, Class<E> type, String field) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Enum.valueOf(type, value);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Недопустимое значение " + field + ": " + value);
        }
    }

    @Transactional
    public void delete(Long id) {
        Dragon dragon = getById(id);
        dragonRepository.delete(dragon);
        events.publishEvent(new DragonEvent("DELETED", id));
    }

    @Transactional
    public Long deleteOneByAge(Long age) {
        if (age == null || age <= 0) {
            throw new IllegalArgumentException("Возраст должен быть больше 0");
        }
        Dragon dragon = dragonRepository.findFirstByAge(age)
                .orElseThrow(() -> new NotFoundException("Драконов с возрастом " + age + " не найдено"));
        Long id = dragon.getId();
        dragonRepository.delete(dragon);
        events.publishEvent(new DragonEvent("DELETED", id));
        return id;
    }

    @Transactional(readOnly = true)
    public Long sumAge() {
        return dragonRepository.findAll().stream()
                .map(Dragon::getAge)
                .filter(Objects::nonNull)
                .mapToLong(Long::longValue)
                .sum();
    }

    @Transactional(readOnly = true)
    public List<Dragon> findByNameSubstring(String substring) {
        if (substring == null) {
            throw new IllegalArgumentException("Подстрока обязательна");
        }
        return dragonRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .filter(d -> d.getName() != null && d.getName().contains(substring))
                .toList();
    }

    @Transactional(readOnly = true)
    public Dragon findDeepestCaveDragon() {
        return dragonRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .max(Comparator.comparing((Dragon d) -> d.getCave().getDepth()))
                .orElseThrow(() -> new NotFoundException("Драконов нет"));
    }

    @Transactional
    public Dragon kill(KillDragonRequest request) {
        Dragon dragon = getById(request.dragonId());
        if (dragon.getKiller() != null) {
            throw new ConflictException("Дракон с id=" + dragon.getId()
                    + " уже убит (убийца: " + dragon.getKiller().getName() + ")");
        }
        Person killer = personRepository.findById(request.killerId())
                .orElseThrow(() -> new NotFoundException("Человек с id=" + request.killerId() + " не найден"));
        dragon.setKiller(killer);
        Dragon saved = dragonRepository.save(dragon);
        events.publishEvent(new DragonEvent("UPDATED", saved.getId()));
        return saved;
    }

    @Transactional(readOnly = true)
    public void assertHelperCanDelete(String type, Long id) {
        switch (type) {
            case "coordinates" -> {
                if (dragonRepository.existsByCoordinatesId(id))
                    throw new ObjectUsedException("Координаты используются одним или несколькими драконами.");
            }
            case "cave" -> {
                if (dragonRepository.existsByCaveId(id))
                    throw new ObjectUsedException("Пещера используется одним или несколькими драконами.");
            }
            case "person" -> {
                if (dragonRepository.existsByKillerId(id))
                    throw new ObjectUsedException("Человек является киллером у одного или нескольких драконов.");
            }
            case "head" -> {
                if (dragonRepository.existsByHeadId(id))
                    throw new ObjectUsedException("Голова используется одним или несколькими драконами.");
            }
            default -> throw new IllegalArgumentException("Неизвестный тип вспомогательного объекта");
        }
    }
}
