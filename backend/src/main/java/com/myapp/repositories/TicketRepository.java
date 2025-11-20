package com.myapp.repositories;

import com.myapp.entities.Ticket;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TicketRepository implements PanacheRepository<Ticket> {
	public Ticket findByUniqueFields(Long poiId, Double price, Ticket.TransportMode transportMode, java.time.LocalDate startDate, java.time.LocalDate endDate) {
		if (poiId == null) return null;
		String q = "poi.id = ?1 and price = ?2";
		java.util.List<Object> params = new java.util.ArrayList<>();
		params.add(poiId);
		params.add(price);
		if (transportMode != null) {
			q += " and transport_mode = ?3";
			// bind the enum value (not its name) so Hibernate matches the parameter type
			params.add(transportMode);
		}
		if (startDate != null) {
			q += " and start_date = ?" + (params.size() + 1);
			params.add(startDate);
		}
		if (endDate != null) {
			q += " and end_date = ?" + (params.size() + 1);
			params.add(endDate);
		}
		// Convert params to array
		return find(q, params.toArray()).firstResult();
	}
    
}