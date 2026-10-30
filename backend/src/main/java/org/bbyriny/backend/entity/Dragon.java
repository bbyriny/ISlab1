package org.bbyriny.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.ZonedDateTime;

@Entity
@Table(name = "dragon")
public class Dragon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false)
    private Long id;

    @NotBlank(message = "Имя дракона не должно быть пустым")
    @Size(max = 100, message = "Имя дракона не должно быть длиннее 100 символов")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "Координаты обязательны")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "coordinates_id", nullable = false)
    @Fetch(FetchMode.JOIN)
    private Coordinates coordinates;

    @CreationTimestamp
    @Column(name = "creation_date", nullable = false, updatable = false)
    private ZonedDateTime creationDate;

    @NotNull(message = "Пещера обязательна")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "cave_id", nullable = false)
    @Fetch(FetchMode.JOIN)
    private DragonCave cave;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "killer_id")
    @Fetch(FetchMode.JOIN)
    private Person killer;

    @Positive(message = "Возраст должен быть больше 0")
    private Long age;

    @NotNull(message = "Описание не может быть null")
    @Size(max = 255, message = "Описание не должно быть длиннее 255 символов")
    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    private Color color;

    @Enumerated(EnumType.STRING)
    private DragonCharacter character;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "head_id")
    @Fetch(FetchMode.JOIN)
    private DragonHead head;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public Coordinates getCoordinates() {
        return coordinates;
    }
    public void setCoordinates(Coordinates coordinates) {
        this.coordinates = coordinates;
    }

    public ZonedDateTime getCreationDate() {
        return creationDate;
    }

    public DragonCave getCave() {
        return cave;
    }
    public void setCave(DragonCave cave) {
        this.cave = cave;
    }

    public Person getKiller() {
        return killer;
    }
    public void setKiller(Person killer) {
        this.killer = killer;
    }

    public Long getAge() {
        return age;
    }
    public void setAge(Long age) {
        this.age = age;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public Color getColor() {
        return color;
    }
    public void setColor(Color color) {
        this.color = color;
    }

    public DragonCharacter getCharacter() {
        return character;
    }
    public void setCharacter(DragonCharacter character) {
        this.character = character;
    }

    public DragonHead getHead() {
        return head;
    }
    public void setHead(DragonHead head) {
        this.head = head;
    }
}
