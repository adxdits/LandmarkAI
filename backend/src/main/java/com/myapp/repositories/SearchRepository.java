package com.myapp.repositories;

import com.myapp.entities.Search;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class SearchRepository implements PanacheRepository<Search> {

}
