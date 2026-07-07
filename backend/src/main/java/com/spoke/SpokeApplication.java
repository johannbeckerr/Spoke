package com.spoke;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Entry point. Spring Boot scans this package (and sub-packages) for
// controllers, entities and repositories, wires everything, and starts
// an embedded web server on port 8080.
@SpringBootApplication
public class SpokeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpokeApplication.class, args);
    }
}
