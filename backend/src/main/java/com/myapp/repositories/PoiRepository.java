package com.myapp.repositories;

import com.myapp.entities.Poi;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PoiRepository implements PanacheRepository<Poi> {
    
}
