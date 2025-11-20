package com.myapp.resources;

import com.myapp.entities.History;
import com.myapp.resources.dto.HistoryRequest;
import com.myapp.repositories.HistoryRepository;
import com.myapp.repositories.UserRepository;
import com.myapp.repositories.TicketRepository;
import com.myapp.entities.User;
import com.myapp.entities.Ticket;
import org.jboss.logging.Logger;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.WebApplicationException;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
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

    @Inject
    UserRepository userRepository;

    @Inject
    TicketRepository ticketRepository;

    @Inject
    EntityManager em;

    private static final Logger LOG = Logger.getLogger(HistoryResource.class);
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
    public History create(HistoryRequest req) {
        LOG.infof("Creating history, incoming userId=%s, ticketId=%s", req != null ? req.userId : null, req != null ? req.ticketId : null);

        if (req == null) {
            String msg = "Empty history payload";
            LOG.warn(msg);
            throw new WebApplicationException(msg, Response.status(Response.Status.BAD_REQUEST).entity(msg).type("text/plain").build());
        }
        if (req.userId == null) {
            String msg = "History must reference an existing user by id";
            LOG.warn(msg + ", incoming userId=" + req.userId);
            throw new WebApplicationException(msg, Response.status(Response.Status.BAD_REQUEST).entity(msg).type("text/plain").build());
        }
        if (req.ticketId == null) {
            String msg = "History must reference an existing ticket by id";
            LOG.warn(msg + ", incoming ticketId=" + req.ticketId);
            throw new WebApplicationException(msg, Response.status(Response.Status.BAD_REQUEST).entity(msg).type("text/plain").build());
        }

        User managedUser = userRepository.findByIdOptional(req.userId)
                .orElseThrow(() -> new WebApplicationException("User not found", Response.status(Response.Status.NOT_FOUND).entity("User not found").type("text/plain").build()));
        Ticket managedTicket = ticketRepository.findByIdOptional(req.ticketId)
                .orElseThrow(() -> new WebApplicationException("Ticket not found", Response.status(Response.Status.NOT_FOUND).entity("Ticket not found").type("text/plain").build()));

        // If a history already exists for this user+ticket, return it (idempotent)
        History existing = repository.findByUserAndTicket(managedUser.id, managedTicket.id);
        if (existing != null) {
            LOG.infof("History already exists id=%s for user=%s ticket=%s", existing.id, managedUser.id, managedTicket.id);
            return existing;
        }

        History history = new History();
        history.user = managedUser;
        history.ticket = managedTicket;
        // default purchase_date is set in entity

        try {
            repository.persist(history);
            LOG.infof("History persisted with id=%s for user=%s ticket=%s", history.id, managedUser.id, managedTicket.id);
            return history;
        } catch (jakarta.persistence.PersistenceException pe) {
            // possible unique constraint race: another request created this history concurrently
            LOG.warnf(pe, "Failed to persist History (possible duplicate) for user=%s ticket=%s", managedUser.id, managedTicket.id);
            try {
                // clear EM to avoid stale entities
                em.clear();
            } catch (Exception e) {
                LOG.warnf(e, "Failed to clear EntityManager after History persistence exception");
            }
            History found = repository.findByUserAndTicket(managedUser.id, managedTicket.id);
            if (found != null) return found;
            String msg = "Failed to create or find History after constraint violation";
            LOG.error(msg, pe);
            throw new WebApplicationException(msg, Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(msg).type("text/plain").build());
        }
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public History update(@PathParam("id") Long id, History data) {
        History entity = repository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("History not found"));
        if (data.user != null && data.user.id != null) {
            entity.user = userRepository.findByIdOptional(data.user.id)
                    .orElseThrow(() -> new NotFoundException("User not found"));
        }
        if (data.ticket != null && data.ticket.id != null) {
            entity.ticket = ticketRepository.findByIdOptional(data.ticket.id)
                    .orElseThrow(() -> new NotFoundException("Ticket not found"));
        }
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
