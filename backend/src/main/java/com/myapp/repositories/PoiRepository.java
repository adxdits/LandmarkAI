package com.myapp.repositories;

import com.myapp.entities.Poi;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PoiRepository implements PanacheRepository<Poi> {
	/**
	 * Find a POI by name and location (case-insensitive). If location is null or empty,
	 * search by name only.
	 */
	public Poi findByNameAndLocationIgnoreCase(String name, String location) {
		if (name == null) return null;
		// Normalize name and location. Treat null/empty location as empty string so
		// lookups are consistent with the unique index we create (which uses COALESCE).
		String n = name.trim().toLowerCase();
		String loc = (location == null) ? "" : location.trim().toLowerCase();
		return find("lower(name) = ?1 and lower(coalesce(location,'')) = ?2", n, loc).firstResult();
	}
}
