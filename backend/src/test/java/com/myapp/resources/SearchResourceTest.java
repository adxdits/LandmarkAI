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
public class SearchResourceTest {

    private static Long createdSearchId;

    @Test
    @Order(1)
    public void testListAllSearchesEndpoint() {
        given()
            .when().get("/api/searches")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON);
    }

    @Test
    @Order(2)
    public void testCreateSearch() {
        String response = given()
            .contentType(ContentType.JSON)
            .body("{\"destination\": \"Paris\", \"budget\": 1000.0, \"persons\": 2, \"transport_mode\": \"Avion\"}")
            .when().post("/api/searches")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("destination", equalTo("Paris"))
            .body("budget", equalTo(1000.0f))
            .body("persons", equalTo(2))
            .body("id", notNullValue())
            .extract().path("id").toString();
        
        createdSearchId = Long.parseLong(response);
    }

    @Test
    @Order(3)
    public void testGetSearchById() {
        if (createdSearchId != null) {
            given()
                .pathParam("id", createdSearchId)
                .when().get("/api/searches/{id}")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("destination", equalTo("Paris"))
                .body("id", equalTo(createdSearchId.intValue()));
        }
    }

    @Test
    @Order(4)
    public void testUpdateSearch() {
        if (createdSearchId != null) {
            given()
                .contentType(ContentType.JSON)
                .pathParam("id", createdSearchId)
                .body("{\"destination\": \"London\", \"budget\": 1500.0, \"persons\": 3, \"transport_mode\": \"Train\"}")
                .when().put("/api/searches/{id}")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("destination", equalTo("London"))
                .body("budget", equalTo(1500.0f));
        }
    }

    @Test
    @Order(5)
    public void testDeleteSearch() {
        if (createdSearchId != null) {
            given()
                .pathParam("id", createdSearchId)
                .when().delete("/api/searches/{id}")
                .then()
                .statusCode(204);
        }
    }

    @Test
    @Order(6)
    public void testGetNonExistentSearch() {
        given()
            .pathParam("id", 99999)
            .when().get("/api/searches/{id}")
            .then()
            .statusCode(404);
    }
}
