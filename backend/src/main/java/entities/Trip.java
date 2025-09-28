package entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;

@Entity
public class Trip extends PanacheEntity {
    public String destination;
    public String startDate;
    public String endDate;
    public Double budget;
    public Integer people;
    public String transport;
    public Double latitude;
    public Double longitude;
}
