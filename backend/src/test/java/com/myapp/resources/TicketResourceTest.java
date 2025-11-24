package com.myapp.resources;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.BeforeAll;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class TicketResourceTest {

    private static Long createdTicketId;
    private static Long testPoiId;

    @Test
    @Order(1)
    public void testSetupTestPoi() {
        // Create a POI first for foreign key constraint
        String response = given()
            .contentType(ContentType.JSON)
            .body("{\"name\": \"Test Monument\", \"location\": \"Test City\"}")
            .when().post("/api/pois")
            .then()
            .statusCode(200)
            .extract().path("id").toString();
        
        testPoiId = Long.parseLong(response);
    }

    @Test
    @Order(2)
    public void testListAllTicketsEndpoint() {
        given()
            .when().get("/api/tickets")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON);
    }

    @Test
    @Order(3)
    public void testCreateTicket() {
        if (testPoiId != null) {
            String response = given()
                .contentType(ContentType.JSON)
                .body("{\"poi\": {\"id\": " + testPoiId + "}, \"price\": 50.0, \"transport_mode\": \"Avion\"}")
                .when().post("/api/tickets")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("price", equalTo(50.0f))
                .body("transport_mode", equalTo("Avion"))
                .body("id", notNullValue())
                .extract().path("id").toString();
            
            createdTicketId = Long.parseLong(response);
        }
    }

    @Test
    @Order(4)
    public void testGetTicketById() {
        if (createdTicketId != null) {
            given()
                .pathParam("id", createdTicketId)
                .when().get("/api/tickets/{id}")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("price", equalTo(50.0f))
                .body("id", equalTo(createdTicketId.intValue()));
        }
    }



    @Test
    @Order(6)
    public void testDeleteTicket() {
        if (createdTicketId != null) {
            given()
                .pathParam("id", createdTicketId)
                .when().delete("/api/tickets/{id}")
                .then()
                .statusCode(204);
        }
    }

    @Test
    @Order(7)
    public void testGetNonExistentTicket() {
        given()
            .pathParam("id", 99999)
            .when().get("/api/tickets/{id}")
            .then()
            .statusCode(404);
    }

    @Test
    @Order(8)
    public void testCleanupTestPoi() {
        // Clean up the test POI
        if (testPoiId != null) {
            given()
                .pathParam("id", testPoiId)
                .when().delete("/api/pois/{id}")
                .then()
                .statusCode(204);
        }
    }
}
