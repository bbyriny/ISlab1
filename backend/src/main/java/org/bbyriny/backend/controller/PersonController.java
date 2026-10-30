package org.bbyriny.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.bbyriny.backend.entity.Person;
import org.bbyriny.backend.service.HelperService;

import java.util.List;

@RestController
@RequestMapping("/api/people")
public class PersonController {
    private final HelperService service;
    public PersonController(HelperService service) {
        this.service = service;
    }

    @GetMapping
    public List<Person> all() {
        return service.people();
    }
    @GetMapping("/{id}")
    public Person get(@PathVariable Long id) {
        return service.person(id);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Person create(@Valid @RequestBody Person value) {
        return service.createPerson(value);
    }
    @PutMapping("/{id}")
    public Person update(@PathVariable Long id, @Valid @RequestBody Person value) {
        return service.updatePerson(id, value);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.deletePerson(id);
    }
}
