package org.bbyriny.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;

@Entity
@Table(name = "coordinates")
public class Coordinates {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false)
    private Long id;

    @Max(value = 32, message = "X не может быть больше 32")
    private long x;

    @NotNull(message = "Координата Y обязательна")
    @Column(nullable = false)
    private Integer y;

    public Long getId() {
        return id;
    }

    public long getX() {
        return x;
    }
    public void setX(long x) {
        this.x = x;
    }

    public Integer getY() {
        return y;
    }
    public void setY(Integer y) {
        this.y = y;
    }
}
