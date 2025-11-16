package com.myapp.resources;

import com.myapp.entities.Ticket;
import com.myapp.repositories.TicketRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/api/tickets")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TicketResource {

    @Inject
    TicketRepository repository;

    @GET
    public List<Ticket> listAll() {
        return repository.listAll();
    }

    @GET
    @Path("/{id}")
    public Ticket getById(@PathParam("id") Long id) {
        return repository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Ticket not found"));
    }

    @POST
    @Transactional
    public Ticket create(Ticket ticket) {
        repository.persist(ticket);
        return ticket;
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Ticket update(@PathParam("id") Long id, Ticket data) {
        Ticket entity = repository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Ticket not found"));
        entity.poi = data.poi;
        entity.price = data.price;
        entity.transport_mode = data.transport_mode;
        entity.start_date = data.start_date;
        entity.end_date = data.end_date;
        return entity;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public void delete(@PathParam("id") Long id) {
        if (!repository.deleteById(id)) {
            throw new NotFoundException("Ticket not found");
        }
    }
}