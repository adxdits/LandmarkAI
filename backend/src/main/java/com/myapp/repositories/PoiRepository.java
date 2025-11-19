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
		String n = name.trim().toLowerCase();
		if (location != null && !location.trim().isEmpty()) {
			String loc = location.trim().toLowerCase();
			return find("lower(name) = ?1 and lower(location) = ?2", n, loc).firstResult();
		} else {
			return find("lower(name) = ?1", n).firstResult();
		}
	}
}
