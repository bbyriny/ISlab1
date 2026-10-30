package org.bbyriny.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.bbyriny.backend.entity.Location;
import org.bbyriny.backend.service.HelperService;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {
    private final HelperService service;
    public LocationController(HelperService service) {
        this.service = service;
    }

    @GetMapping
    public List<Location> all() {
        return service.locations();
    }
    @GetMapping("/{id}")
    public Location get(@PathVariable Long id) {
        return service.location(id);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Location create(@Valid @RequestBody Location value) {
        return service.createLocation(value);
    }
    @PutMapping("/{id}")
    public Location update(@PathVariable Long id, @Valid @RequestBody Location value) {
        return service.updateLocation(id, value);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.deleteLocation(id);
    }
}
