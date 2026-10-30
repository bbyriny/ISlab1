package org.bbyriny.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.LocalDate;

@Entity
@Table(name = "person")
public class Person {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false)
    private Long id;

    @NotBlank(message = "Имя человека не должно быть пустым")
    @Size(max = 100, message = "Имя не должно быть длиннее 100 символов")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "Цвет глаз обязателен")
    @Enumerated(EnumType.STRING)
    @Column(name = "eye_color", nullable = false)
    private Color eyeColor;

    @NotNull(message = "Цвет волос обязателен")
    @Enumerated(EnumType.STRING)
    @Column(name = "hair_color", nullable = false)
    private Color hairColor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "location_id")
    @Fetch(FetchMode.JOIN)
    private Location location;

    private LocalDate birthday;

    @NotNull(message = "Вес обязателен")
    @Min(value = 1, message = "Вес должен быть больше 0")
    @Column(nullable = false)
    private Long weight;

    @Size(min = 4, max = 50, message = "passportID должен содержать от 4 до 50 символов")
    @Column(name = "passport_id")
    private String passportID;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public Color getEyeColor() {
        return eyeColor;
    }
    public void setEyeColor(Color eyeColor) {
        this.eyeColor = eyeColor;
    }

    public Color getHairColor() {
        return hairColor;
    }
    public void setHairColor(Color hairColor) {
        this.hairColor = hairColor;
    }

    public Location getLocation() {
        return location;
    }
    public void setLocation(Location location) {
        this.location = location;
    }

    public LocalDate getBirthday() {
        return birthday;
    }
    public void setBirthday(LocalDate birthday) {
        this.birthday = birthday;
    }

    public Long getWeight() {
        return weight;
    }
    public void setWeight(Long weight) {
        this.weight = weight;
    }

    public String getPassportID() {
        return passportID;
    }
    public void setPassportID(String passportID) {
        this.passportID = passportID;
    }
}
