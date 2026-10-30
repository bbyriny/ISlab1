package org.bbyriny.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.bbyriny.backend.dto.DragonRequest;
import org.bbyriny.backend.dto.PageResponse;
import org.bbyriny.backend.entity.Dragon;
import org.bbyriny.backend.service.DragonService;

@RestController
@RequestMapping("/api/dragons")
public class DragonController {
    private final DragonService service;

    public DragonController(DragonService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<Dragon> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String filterField,
            @RequestParam(required = false) String filterValue) {
        return PageResponse.from(service.getAll(page, size, sortBy, direction, filterField, filterValue));
    }

    @GetMapping("/{id}")
    public Dragon getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Dragon create(@Valid @RequestBody DragonRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public Dragon update(@PathVariable Long id, @Valid @RequestBody DragonRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
