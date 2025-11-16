package com.myapp.resources;

import com.myapp.entities.User;
import com.myapp.repositories.UserRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    UserRepository repository;

    @GET
    public List<User> listAll() {
        return repository.listAll();
    }

    @GET
    @Path("/{id}")
    public User getById(@PathParam("id") Long id) {
        return repository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @POST
    @Transactional
    public User create(User user) {
        repository.persist(user);
        return user;
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public User update(@PathParam("id") Long id, User data) {
        User entity = repository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        entity.pseudo = data.pseudo;
        return entity;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public void delete(@PathParam("id") Long id) {
        if (!repository.deleteById(id)) {
            throw new NotFoundException("User not found");
        }
    }
}
