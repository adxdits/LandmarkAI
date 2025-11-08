package com.myapp.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "ticket")
public class Ticket extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "poi_id", nullable = false)
    public Poi poi;

    @Column(nullable = false)
    public Double price;

    @Enumerated(EnumType.STRING)
    public TransportMode transport_mode;

    public LocalDate start_date;
    public LocalDate end_date;

    public enum TransportMode {
        Avion, Train, Voiture
    }
}
