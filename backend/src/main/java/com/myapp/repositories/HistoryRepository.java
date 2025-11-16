package com.myapp.repositories;

import com.myapp.entities.History;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class HistoryRepository implements PanacheRepository<History> {

}
