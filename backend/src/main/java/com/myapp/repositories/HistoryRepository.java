package com.myapp.repositories;

import com.myapp.entities.History;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class HistoryRepository implements PanacheRepository<History> {
	public History findByUserAndTicket(Long userId, Long ticketId) {
		if (userId == null || ticketId == null) return null;
		return find("user.id = ?1 and ticket.id = ?2", userId, ticketId).firstResult();
	}

}
