package com.myapp.resources;

import com.myapp.entities.Ticket;
import com.myapp.resources.dto.TicketRequest;
import com.myapp.entities.Poi;
import com.myapp.repositories.TicketRepository;
import com.myapp.repositories.PoiRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import java.util.List;

@Path("/api/tickets")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TicketResource {

    @Inject
    TicketRepository repository;

    @Inject
    PoiRepository poiRepository;

    @Inject
    jakarta.persistence.EntityManager em;

    private static final Logger LOG = Logger.getLogger(TicketResource.class);

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
    public Ticket create(TicketRequest req) {
        // Log incoming ticket for debugging
        LOG.infof("Creating ticket, incoming poi=%s, price=%s, transport_mode=%s", req != null && req.poi != null ? req.poi.id : null, req != null ? req.price : null, req != null ? req.transport_mode : null);

        // Resolve POI: accept either poi.id or embedded poi (find-or-create by name+location)
        Poi managedPoi = null;
        if (req != null && req.poi != null) {
            if (req.poi.id != null) {
                managedPoi = poiRepository.findById(req.poi.id);
                if (managedPoi == null) {
                    String msg = "POI not found with id=" + req.poi.id;
                    LOG.warn(msg);
                    throw new WebApplicationException(msg, Response.status(Response.Status.NOT_FOUND).entity(msg).type(MediaType.TEXT_PLAIN).build());
                }
            } else if (req.poi.name != null && !req.poi.name.trim().isEmpty()) {
                // try to find existing POI by name+location
                String name = req.poi.name.trim();
                String location = req.poi.location != null ? req.poi.location.trim() : null;
                managedPoi = poiRepository.findByNameAndLocationIgnoreCase(name, location);
                if (managedPoi == null) {
                    // create new POI from embedded data
                    Poi newPoi = new Poi();
                    newPoi.name = name;
                    newPoi.description = req.poi.description;
                    newPoi.location = location;
                    newPoi.image_url = req.poi.image_url;
                    try {
                        poiRepository.persist(newPoi);
                        managedPoi = newPoi;
                        LOG.infof("Created new POI with id=%s name=%s", managedPoi.id, managedPoi.name);
                    } catch (jakarta.persistence.PersistenceException pe) {
                        // likely a unique constraint race: another request created the POI concurrently
                        LOG.warnf(pe, "Failed to persist POI (possible duplicate), attempting to re-query by name/location: %s / %s", name, location);
                        managedPoi = poiRepository.findByNameAndLocationIgnoreCase(name, location);
                        if (managedPoi == null) {
                            String msg = "Failed to create or find POI after constraint violation";
                            LOG.error(msg, pe);
                            throw new WebApplicationException(msg, Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(msg).type(MediaType.TEXT_PLAIN).build());
                        }
                        LOG.infof("Found existing POI after race: id=%s name=%s", managedPoi.id, managedPoi.name);
                    }
                } else {
                    LOG.infof("Reusing existing POI id=%s name=%s", managedPoi.id, managedPoi.name);
                }
            } else {
                String msg = "Ticket must reference an existing POI by id or include poi.name";
                LOG.warn(msg + ", incoming poi=" + (req != null && req.poi != null ? req.poi : null));
                throw new WebApplicationException(msg, Response.status(Response.Status.BAD_REQUEST).entity(msg).type(MediaType.TEXT_PLAIN).build());
            }
        } else {
            String msg = "Ticket must include poi information";
            LOG.warn(msg);
            throw new WebApplicationException(msg, Response.status(Response.Status.BAD_REQUEST).entity(msg).type(MediaType.TEXT_PLAIN).build());
        }

        Ticket toPersist = new Ticket();
        toPersist.poi = managedPoi;
        toPersist.price = req.price;
        // map transport_mode string to enum if possible
        if (req.transport_mode != null) {
            try {
                toPersist.transport_mode = Ticket.TransportMode.valueOf(req.transport_mode);
            } catch (IllegalArgumentException e) {
                // ignore and leave null
            }
        }
        toPersist.start_date = req.start_date;
        toPersist.end_date = req.end_date;
        // store optional flight booking URL from client
        toPersist.flight_url = req.flight_url;
        // Check proactively if an equivalent ticket already exists to avoid creating duplicates
        Ticket existing = repository.findByUniqueFields(managedPoi.id, toPersist.price, toPersist.transport_mode, toPersist.start_date, toPersist.end_date);
        if (existing != null) {
            LOG.infof("Reusing existing Ticket id=%s for poi=%s price=%s", existing.id, managedPoi.id, existing.price);
            return existing;
        }

        try {
            repository.persist(toPersist);
            LOG.infof("Ticket persisted with id=%s", toPersist.id);
            return toPersist;
        } catch (jakarta.persistence.PersistenceException pe) {
            // possible unique constraint race: clear EM and re-query
            LOG.warnf(pe, "Failed to persist Ticket (possible duplicate) for poi=%s price=%s", managedPoi.id, toPersist.price);
            try {
                em.clear();
            } catch (Exception e) {
                LOG.warnf(e, "Failed to clear EntityManager after Ticket persistence exception");
            }
            Ticket found = repository.findByUniqueFields(managedPoi.id, toPersist.price, toPersist.transport_mode, toPersist.start_date, toPersist.end_date);
            if (found != null) {
                LOG.infof("Found existing Ticket id=%s after constraint violation", found.id);
                return found;
            }
            String msg = "Failed to create or find Ticket after constraint violation";
            LOG.error(msg, pe);
            throw new WebApplicationException(msg, Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(msg).type(MediaType.TEXT_PLAIN).build());
        }
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
        entity.flight_url = data.flight_url;
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