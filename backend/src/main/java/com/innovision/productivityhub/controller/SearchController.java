// Package declaration – indicates this is part of the controller layer
package com.innovision.productivityhub.controller;

// Import required classes
import com.innovision.productivityhub.service.SearchService; // Service that handles the search logic
import java.util.Map; // Map used to return search results as key-value pairs
import org.springframework.http.ResponseEntity; // For returning HTTP responses
import org.springframework.web.bind.annotation.GetMapping; // For mapping GET requests
import org.springframework.web.bind.annotation.RequestMapping; // For mapping base URL
import org.springframework.web.bind.annotation.RequestParam; // For getting query parameters from URL
import org.springframework.web.bind.annotation.RestController; // Marks this as a REST API controller

// Mark this class as a REST controller
@RestController

// Base URL for all endpoints in this controller: /api/search
@RequestMapping("/api/search")
public class SearchController {

    // Inject the SearchService to handle business logic
    private final SearchService searchService;

    // Constructor injection for SearchService
    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    // Handle GET requests at /api/search?q=keyword
    @GetMapping
    public ResponseEntity<Map<String, Object>> search(@RequestParam String q) {
        // Call the service layer to perform the search using query parameter 'q'
        // Return the search results wrapped in a ResponseEntity with HTTP 200 OK
        return ResponseEntity.ok(searchService.search(q));
    }
}
