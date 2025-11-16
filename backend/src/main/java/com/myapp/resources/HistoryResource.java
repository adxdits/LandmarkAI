package com.myapp.resources;

import com.myapp.entities.History;
import com.myapp.repositories.HistoryRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/api/histories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class HistoryResource {

    @Inject
    HistoryRepository repository;

    @GET
    public List<History> listAll() {
        return repository.listAll();
    }

    @GET
    @Path("/{id}")
    public History getById(@PathParam("id") Long id) {
        return repository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("History not found"));
    }

    @POST
    @Transactional
    public History create(History history) {
        repository.persist(history);
        return history;
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public History update(@PathParam("id") Long id, History data) {
        History entity = repository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("History not found"));
        entity.user = data.user;
        entity.ticket = data.ticket;
        entity.purchase_date = data.purchase_date;
        return entity;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public void delete(@PathParam("id") Long id) {
        if (!repository.deleteById(id)) {
            throw new NotFoundException("History not found");
        }
    }
}
