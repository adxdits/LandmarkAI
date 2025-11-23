package com.myapp.resources;

import com.myapp.entities.User;
import com.myapp.repositories.UserRepository;
import com.myapp.repositories.HistoryRepository;
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

    @Inject
    HistoryRepository historyRepository;

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
        // First delete any history rows for this user to avoid FK/orphan issues.
        // We perform this proactively at the application level because the
        // database foreign key may not be configured with ON DELETE CASCADE.
        try {
            historyRepository.delete("user.id = ?1", id);
        } catch (Exception e) {
            // Log and continue; if deletion fails, we still attempt to delete the user
            // which may fail at DB level if foreign key constraints are enforced.
            // The exception will propagate as a server error in that case.
        }

        if (!repository.deleteById(id)) {
            throw new NotFoundException("User not found");
        }
    }
}
