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
public class PoiResourceTest {

    private static Long createdPoiId;

    @Test
    @Order(1)
    public void testListAllPoisEndpoint() {
        given()
            .when().get("/api/pois")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON);
    }

    @Test
    @Order(2)
    public void testCreatePoi() {
        String response = given()
            .contentType(ContentType.JSON)
            .body("{\"name\": \"Eiffel Tower\", \"location\": \"Paris\", \"description\": \"Famous landmark\"}")
            .when().post("/api/pois")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("name", equalTo("Eiffel Tower"))
            .body("location", equalTo("Paris"))
            .body("id", notNullValue())
            .extract().path("id").toString();
        
        createdPoiId = Long.parseLong(response);
    }

    @Test
    @Order(3)
    public void testGetPoiById() {
        if (createdPoiId != null) {
            given()
                .pathParam("id", createdPoiId)
                .when().get("/api/pois/{id}")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("name", equalTo("Eiffel Tower"))
                .body("id", equalTo(createdPoiId.intValue()));
        }
    }

    @Test
    @Order(4)
    public void testUpdatePoi() {
        if (createdPoiId != null) {
            given()
                .contentType(ContentType.JSON)
                .pathParam("id", createdPoiId)
                .body("{\"name\": \"Eiffel Tower\", \"location\": \"Paris, France\", \"description\": \"Updated description\"}")
                .when().put("/api/pois/{id}")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("location", equalTo("Paris, France"));
        }
    }

    @Test
    @Order(5)
    public void testDeletePoi() {
        if (createdPoiId != null) {
            given()
                .pathParam("id", createdPoiId)
                .when().delete("/api/pois/{id}")
                .then()
                .statusCode(204);
        }
    }

    @Test
    @Order(6)
    public void testGetNonExistentPoi() {
        given()
            .pathParam("id", 99999)
            .when().get("/api/pois/{id}")
            .then()
            .statusCode(404);
    }
}
