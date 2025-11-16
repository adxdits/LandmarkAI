package com.myapp.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "poi")
public class Poi extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public Long id;

    @Column(nullable = false)
    public String name;

    public String description;
    public String location;
    public String image_url;

    @OneToMany(mappedBy = "poi", cascade = CascadeType.ALL)
    public List<PoiImage> images;
}