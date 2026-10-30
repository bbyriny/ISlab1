package org.bbyriny.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "location")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false)
    private Long id;

    private double x;

    @NotNull(message = "Координата Y не может быть null")
    @Column(nullable = false)
    private Double y;

    private double z;

    @NotBlank(message = "Название локации не должно быть пустым")
    @Size(max = 100, message = "Название локации не должно быть длиннее 100 символов")
    @Column(nullable = false)
    private String name;

    public Long getId() {
        return id;
    }
    public double getX() {
        return x;
    }
    public void setX(double x) {
        this.x = x;
    }
    public Double getY() {
        return y;
    }
    public void setY(Double y) {
        this.y = y;
    }
    public double getZ() {
        return z;
    }
    public void setZ(double z) {
        this.z = z;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
}
