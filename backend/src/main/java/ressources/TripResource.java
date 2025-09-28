package resources;

import entities.Trip;
import repositories.TripRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/trips")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TripResource {

    @Inject
    TripRepository tripRepository;

    @GET
    public List<Trip> list() {
        return tripRepository.listAll();
    }

    @POST
    @Transactional
    public Trip add(Trip trip) {
        tripRepository.persist(trip);
        return trip;
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Trip update(@PathParam("id") Long id, Trip trip) {
        Trip entity = tripRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException();
        }
        entity.destination = trip.destination;
        entity.startDate = trip.startDate;
        entity.endDate = trip.endDate;
        entity.budget = trip.budget;
        entity.people = trip.people;
        entity.transport = trip.transport;
        entity.latitude = trip.latitude;
        entity.longitude = trip.longitude;
        return entity;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public void delete(@PathParam("id") Long id) {
        tripRepository.deleteById(id);
    }
}
