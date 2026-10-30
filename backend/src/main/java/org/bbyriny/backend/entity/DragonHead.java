package org.bbyriny.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "dragon_head")
public class DragonHead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false)
    private Long id;

    private long size;

    public Long getId() {
        return id;
    }
    public long getSize() {
        return size;
    }
    public void setSize(long size) {
        this.size = size;
    }
}
