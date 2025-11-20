-- Flyway migration: create unique indexes to prevent duplicates
-- Idempotent: uses IF NOT EXISTS where supported

-- POI: case-insensitive unique on name+location (treat NULL as empty)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_poi_name_location
    ON poi(lower(name), lower(COALESCE(location, '')));

-- Ticket: unique key to avoid duplicate identical tickets for same poi
CREATE UNIQUE INDEX IF NOT EXISTS uniq_ticket_key
    ON ticket(poi_id, price, transport_mode, start_date, end_date);

-- History: one entry per user/ticket
CREATE UNIQUE INDEX IF NOT EXISTS uniq_history_user_ticket
    ON history(user_id, ticket_id);
