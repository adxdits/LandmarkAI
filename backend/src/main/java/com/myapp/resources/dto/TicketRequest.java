package com.myapp.resources.dto;

import java.time.LocalDate;

public class TicketRequest {

    public static class PoiRef {
        public Long id;
        public String name;
        public String description;
        public String location;
        public String image_url;
    }

    public PoiRef poi;
    public Double price;
    public String transport_mode;
    public LocalDate start_date;
    public LocalDate end_date;
}
