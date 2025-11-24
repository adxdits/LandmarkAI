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
public class UserResourceTest {

    private static Long createdUserId;

    @Test
    @Order(1)
    public void testListAllUsersEndpoint() {
        given()
            .when().get("/api/users")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON);
    }

    @Test
    @Order(2)
    public void testCreateUser() {
        String response = given()
            .contentType(ContentType.JSON)
            .body("{\"pseudo\": \"testuser\"}")
            .when().post("/api/users")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("pseudo", equalTo("testuser"))
            .body("id", notNullValue())
            .extract().path("id").toString();
        
        createdUserId = Long.parseLong(response);
    }

    @Test
    @Order(3)
    public void testGetUserById() {
        if (createdUserId != null) {
            given()
                .pathParam("id", createdUserId)
                .when().get("/api/users/{id}")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("pseudo", equalTo("testuser"))
                .body("id", equalTo(createdUserId.intValue()));
        }
    }

    @Test
    @Order(4)
    public void testUpdateUser() {
        if (createdUserId != null) {
            given()
                .contentType(ContentType.JSON)
                .pathParam("id", createdUserId)
                .body("{\"pseudo\": \"updateduser\"}")
                .when().put("/api/users/{id}")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("pseudo", equalTo("updateduser"));
        }
    }

    @Test
    @Order(5)
    public void testDeleteUser() {
        if (createdUserId != null) {
            given()
                .pathParam("id", createdUserId)
                .when().delete("/api/users/{id}")
                .then()
                .statusCode(204);
        }
    }

    @Test
    @Order(6)
    public void testGetNonExistentUser() {
        given()
            .pathParam("id", 99999)
            .when().get("/api/users/{id}")
            .then()
            .statusCode(404);
    }

    @Test
    @Order(7)
    public void testDeleteNonExistentUser() {
        given()
            .pathParam("id", 99999)
            .when().delete("/api/users/{id}")
            .then()
            .statusCode(404);
    }
}
