package org.bbyriny.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.bbyriny.backend.entity.Coordinates;
import org.bbyriny.backend.service.HelperService;

import java.util.List;

@RestController
@RequestMapping("/api/coordinates")
public class CoordinatesController {
    private final HelperService service;
    public CoordinatesController(HelperService service) {
        this.service = service;
    }

    @GetMapping
    public List<Coordinates> all() {
        return service.coordinates();
    }
    @GetMapping("/{id}")
    public Coordinates get(@PathVariable Long id) {
        return service.coordinate(id);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Coordinates create(@Valid @RequestBody Coordinates value) {
        return service.createCoordinate(value);
    }
    @PutMapping("/{id}")
    public Coordinates update(@PathVariable Long id, @Valid @RequestBody Coordinates value) {
        return service.updateCoordinate(id, value);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.deleteCoordinate(id);
    }
}
