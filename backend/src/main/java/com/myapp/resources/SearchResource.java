package com.myapp.resources;

import com.myapp.entities.Search;
import com.myapp.repositories.SearchRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/api/searches")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SearchResource {

    @Inject
    SearchRepository repository;

    @GET
    public List<Search> listAll() {
        return repository.listAll();
    }

    @GET
    @Path("/{id}")
    public Search getById(@PathParam("id") Long id) {
        return repository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Search not found"));
    }

    @POST
    @Transactional
    public Search create(Search search) {
        repository.persist(search);
        return search;
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Search update(@PathParam("id") Long id, Search data) {
        Search entity = repository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Search not found"));
        entity.destination = data.destination;
        entity.start_date = data.start_date;
        entity.end_date = data.end_date;
        entity.budget = data.budget;
        entity.persons = data.persons;
        entity.transport_mode = data.transport_mode;
        return entity;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public void delete(@PathParam("id") Long id) {
        if (!repository.deleteById(id)) {
            throw new NotFoundException("Search not found");
        }
    }
}