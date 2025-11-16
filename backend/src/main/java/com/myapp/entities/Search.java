package com.myapp.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "search")
public class Search extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public Long id;

    public String destination;
    public LocalDate start_date;
    public LocalDate end_date;
    public Double budget;
    public Integer persons;

    @Enumerated(EnumType.STRING)
    public TransportMode transport_mode;

    public enum TransportMode {
        Avion, Train, Voiture
    }
}
