package com.myapp.resources;

import com.myapp.entities.Poi;
import com.myapp.repositories.PoiRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/api/pois")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PoiResource {

    @Inject
    PoiRepository repository;

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
        repository.persist(poi);
        return poi;
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