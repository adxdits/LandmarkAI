package com.myapp.resources;

import com.myapp.entities.Poi;
import com.myapp.repositories.PoiRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import jakarta.persistence.PersistenceException;
import jakarta.persistence.EntityManager;
import java.util.List;

@Path("/api/pois")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PoiResource {

    @Inject
    PoiRepository repository;

    @Inject
    EntityManager em;

    private static final Logger LOG = Logger.getLogger(PoiResource.class);

    @GET
    public List<Poi> listAll() {
        return repository.listAll();
    }

    @GET
    @Path("/{id}")
    public Poi getById(@PathParam("id") Long id) {
        return repository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("POI not found"));
    }

    @POST
    @Transactional
    public Poi create(Poi poi) {
        // Basic validation / normalization to avoid trivial duplicates (whitespace, null location)
        if (poi == null || poi.name == null || poi.name.trim().isEmpty()) {
            throw new WebApplicationException("POI name is required", Response.status(Response.Status.BAD_REQUEST).entity("POI name is required").type(MediaType.TEXT_PLAIN).build());
        }
        poi.name = poi.name.trim();
        if (poi.location != null) poi.location = poi.location.trim();
        else poi.location = "";

        // Proactively try to find existing POI to avoid creating duplicates in the common case
        Poi existing = repository.findByNameAndLocationIgnoreCase(poi.name, poi.location);
        if (existing != null) {
            LOG.infof("Returning existing POI id=%s for name=%s", existing.id, existing.name);
            return existing;
        }

        try {
            repository.persist(poi);
            return poi;
        } catch (PersistenceException pe) {
            // likely unique constraint violation (concurrent creation). Try to find existing POI by name/location
            LOG.warnf(pe, "Failed to persist POI (possible duplicate): %s / %s", poi.name, poi.location);
            // Clear the persistence context because the previous persist/flush failed and may have left the
            // EntityManager in an inconsistent state (null identifiers). After clearing, re-query in a clean context.
            try {
                em.clear();
            } catch (Exception e) {
                LOG.warnf(e, "Failed to clear EntityManager after persistence exception");
            }

            // The unique constraint may have been created by a concurrent transaction that
            // committed just before our insert failed. Re-query a few times (short backoff)
            // to allow that transaction to become visible and return the existing POI.
            final int MAX_TRIES = 5;
            final long SLEEP_MS = 50;
            for (int attempt = 1; attempt <= MAX_TRIES; attempt++) {
                existing = repository.findByNameAndLocationIgnoreCase(poi.name, poi.location);
                if (existing != null) {
                    LOG.infof("Returning existing POI id=%s for name=%s (after %d attempts)", existing.id, existing.name, attempt);
                    return existing;
                }
                try {
                    Thread.sleep(SLEEP_MS);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }

            String msg = "Failed to create POI";
            LOG.error(msg, pe);
            throw new WebApplicationException(msg + ": " + pe.getMessage(), Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(msg).type(MediaType.TEXT_PLAIN).build());
        }
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Poi update(@PathParam("id") Long id, Poi data) {
        Poi entity = repository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("POI not found"));
        entity.name = data.name;
        entity.description = data.description;
        entity.location = data.location;
        entity.image_url = data.image_url;
        return entity;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public void delete(@PathParam("id") Long id) {
        if (!repository.deleteById(id)) {
            throw new NotFoundException("POI not found");
        }
    }
}