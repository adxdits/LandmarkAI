package com.myapp.resources;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class HistoryResourceTest {

    private static Long createdHistoryId;
    private static Long testUserId;
    private static Long testPoiId;
    private static Long testTicketId;

    @Test
    @Order(1)
    public void testSetupTestData() {
        // Create a user
        String userResponse = given()
            .contentType(ContentType.JSON)
            .body("{\"pseudo\": \"historyuser\"}")
            .when().post("/api/users")
            .then()
            .statusCode(200)
            .extract().path("id").toString();
        testUserId = Long.parseLong(userResponse);

        // Create a POI
        String poiResponse = given()
            .contentType(ContentType.JSON)
            .body("{\"name\": \"History POI\", \"location\": \"Test Location\"}")
            .when().post("/api/pois")
            .then()
            .statusCode(200)
            .extract().path("id").toString();
        testPoiId = Long.parseLong(poiResponse);

        // Create a ticket
        String ticketResponse = given()
            .contentType(ContentType.JSON)
            .body("{\"poi\": {\"id\": " + testPoiId + "}, \"price\": 100.0, \"transport_mode\": \"Avion\"}")
            .when().post("/api/tickets")
            .then()
            .statusCode(200)
            .extract().path("id").toString();
        testTicketId = Long.parseLong(ticketResponse);
    }

    @Test
    @Order(2)
    public void testListAllHistoriesEndpoint() {
        given()
            .when().get("/api/histories")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON);
    }



    @Test
    @Order(8)
    public void testCleanupTestData() {
        // Clean up in reverse order of creation
        if (testTicketId != null) {
            given().pathParam("id", testTicketId).delete("/api/tickets/{id}");
        }
        if (testPoiId != null) {
            given().pathParam("id", testPoiId).delete("/api/pois/{id}");
        }
        if (testUserId != null) {
            given().pathParam("id", testUserId).delete("/api/users/{id}");
        }
    }
}
