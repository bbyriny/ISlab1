package org.bbyriny.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "dragon_cave")
public class DragonCave {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false)
    private Long id;

    @NotNull(message = "Глубина пещеры обязательна")
    @Column(nullable = false)
    private Double depth;

    public Long getId() {
        return id;
    }
    public Double getDepth() {
        return depth;
    }
    public void setDepth(Double depth) {
        this.depth = depth;
    }
}
