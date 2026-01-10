package com.innovision.productivityhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ProductivityHubApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductivityHubApplication.class, args);
    }
}
