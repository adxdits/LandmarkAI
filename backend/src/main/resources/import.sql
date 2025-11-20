-- Create case-insensitive unique index on POI name+location to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS uniq_poi_name_location
    ON poi(lower(name), lower(COALESCE(location, '')));
