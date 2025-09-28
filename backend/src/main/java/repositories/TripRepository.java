package repositories;

import entities.Trip;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TripRepository implements PanacheRepository<Trip> {
}
