package org.bbyriny.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.bbyriny.backend.entity.DragonHead;
import org.bbyriny.backend.service.HelperService;

import java.util.List;

@RestController
@RequestMapping("/api/heads")
public class DragonHeadController {
    private final HelperService service;
    public DragonHeadController(HelperService service) {
        this.service = service;
    }

    @GetMapping
    public List<DragonHead> all() {
        return service.heads();
    }
    @GetMapping("/{id}")
    public DragonHead get(@PathVariable Long id) {
        return service.head(id);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DragonHead create(@Valid @RequestBody DragonHead value) {
        return service.createHead(value);
    }
    @PutMapping("/{id}")
    public DragonHead update(@PathVariable Long id, @Valid @RequestBody DragonHead value) {
        return service.updateHead(id, value);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.deleteHead(id);
    }
}
