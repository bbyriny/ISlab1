package org.bbyriny.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.bbyriny.backend.entity.DragonCave;
import org.bbyriny.backend.service.HelperService;

import java.util.List;

@RestController
@RequestMapping("/api/caves")
public class DragonCaveController {
    private final HelperService service;
    public DragonCaveController(HelperService service) {
        this.service = service;
    }

    @GetMapping
    public List<DragonCave> all() {
        return service.caves();
    }
    @GetMapping("/{id}")
    public DragonCave get(@PathVariable Long id) {
        return service.cave(id);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DragonCave create(@Valid @RequestBody DragonCave value) {
        return service.createCave(value);
    }
    @PutMapping("/{id}")
    public DragonCave update(@PathVariable Long id, @Valid @RequestBody DragonCave value) {
        return service.updateCave(id, value);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.deleteCave(id);
    }
}
