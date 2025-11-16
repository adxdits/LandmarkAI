package com.myapp.resources;

import com.myapp.entities.PoiImage;
import com.myapp.repositories.PoiImageRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/api/poi-images")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PoiImageResource {

    @Inject
    PoiImageRepository repository;

    @GET
    public List<PoiImage> listAll() {
        return repository.listAll();
    }

    @GET
    @Path("/{id}")
    public PoiImage getById(@PathParam("id") Long id) {
        return repository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("POI Image not found"));
    }

    @POST
    @Transactional
    public PoiImage create(PoiImage image) {
        repository.persist(image);
        return image;
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public PoiImage update(@PathParam("id") Long id, PoiImage data) {
        PoiImage entity = repository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("POI Image not found"));
        entity.image_url = data.image_url;
        entity.embedding = data.embedding;
        entity.poi = data.poi;
        return entity;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public void delete(@PathParam("id") Long id) {
        if (!repository.deleteById(id)) {
            throw new NotFoundException("POI Image not found");
        }
    }
}