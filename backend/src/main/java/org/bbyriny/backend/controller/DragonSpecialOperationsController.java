package org.bbyriny.backend.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.bbyriny.backend.dto.KillDragonRequest;
import org.bbyriny.backend.entity.Dragon;
import org.bbyriny.backend.service.DragonService;

import java.util.List;

@RestController
@RequestMapping("/api/dragons/special")
public class DragonSpecialOperationsController {
    private final DragonService service;

    public DragonSpecialOperationsController(DragonService service) {
        this.service = service;
    }

    @DeleteMapping("/delete-by-age/{age}")
    public Long deleteByAge(@PathVariable Long age) {
        return service.deleteOneByAge(age);
    }

    @GetMapping("/sum-age")
    public Long sumAge() {
        return service.sumAge();
    }

    @GetMapping("/search-by-name")
    public List<Dragon> searchByName(@RequestParam String substring) {
        return service.findByNameSubstring(substring);
    }

    @GetMapping("/deepest-cave")
    public Dragon deepestCave() {
        return service.findDeepestCaveDragon();
    }

    @PostMapping("/kill")
    public Dragon kill(@Valid @RequestBody KillDragonRequest request) {
        return service.kill(request);
    }
}
