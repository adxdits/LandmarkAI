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
    com.myapp.repositories.PoiRepository poiRepository;

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

    @GET
    @Path("/user/{userId}")
    public List<History> findByUser(@PathParam("userId") Long userId) {
        if (userId == null) throw new NotFoundException("User id required");
        return repository.find("user.id = ?1 order by purchase_date desc", userId).list();
    }

    @POST
    @Path("/check")
    public boolean checkExists(com.myapp.resources.dto.HistoryCheckRequest req) {
        if (req == null || req.userId == null) {
            return false;
        }

        // Resolve ticket either by poiId or by matching unique fields
        Long ticketId = null;
        com.myapp.entities.Ticket ticket = null;
        if (req.poiId != null && req.price != null) {
            // try to parse transport mode enum
            com.myapp.entities.Ticket.TransportMode tm = null;
            try {
                if (req.transportMode != null) {
                    tm = com.myapp.entities.Ticket.TransportMode.valueOf(req.transportMode);
                }
            } catch (IllegalArgumentException iae) {
                tm = null;
            }
            java.time.LocalDate sd = null;
            java.time.LocalDate ed = null;
            try { 
                if (req.startDate != null) {
                    sd = java.time.LocalDate.parse(req.startDate); 
                }
            } catch (Exception e) {}
            try { 
                if (req.endDate != null) {
                    ed = java.time.LocalDate.parse(req.endDate); 
                }
            } catch (Exception e) {}
            ticket = ticketRepository.findByUniqueFields(req.poiId, req.price, tm, sd, ed);
        } else if (req.poiName != null) {
            // try to find poi by name/location
            com.myapp.entities.Poi found = poiRepository.findByNameAndLocationIgnoreCase(req.poiName, req.poiLocation);
            if (found != null && found.id != null && req.price != null) {
                com.myapp.entities.Ticket.TransportMode tm = null;
                try { 
                    if (req.transportMode != null) {
                        tm = com.myapp.entities.Ticket.TransportMode.valueOf(req.transportMode); 
                    }
                } catch (Exception e) { 
                    tm = null; 
                }
                java.time.LocalDate sd = null;
                java.time.LocalDate ed = null;
                try { 
                    if (req.startDate != null) {
                        sd = java.time.LocalDate.parse(req.startDate); 
                    }
                } catch (Exception e) {}
                try { 
                    if (req.endDate != null) {
                        ed = java.time.LocalDate.parse(req.endDate); 
                    }
                } catch (Exception e) {}
                ticket = ticketRepository.findByUniqueFields(found.id, req.price, tm, sd, ed);
            }
        }

        if (ticket != null) {
            ticketId = ticket.id;
        }
        if (ticketId == null) {
            return false;
        }
        com.myapp.entities.History hist = repository.findByUserAndTicket(req.userId, ticketId);
        return hist != null;
    }
}
