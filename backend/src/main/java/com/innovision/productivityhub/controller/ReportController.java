package com.innovision.controller; 
// Defines the package for this controller. All controllers are in this package.

import com.innovision.service.ReportService; 
// Import the ReportService which contains the business logic for generating reports

import org.springframework.http.ResponseEntity; 
// Used to send HTTP responses with status codes and data

import org.springframework.web.bind.annotation.*; 
// Spring annotations for REST endpoints (@RestController, @RequestMapping, @GetMapping, @PathVariable, etc.)

import java.util.Map; 
// Using Map to return report data as key-value pairs in JSON

@RestController
// Marks this class as a REST controller so it can handle HTTP requests and return JSON
@RequestMapping("/api/reports")
// Base URL for all endpoints in this controller: /api/reports
@CrossOrigin
// Allows cross-origin requests (needed for frontend to call backend if served on different port)
public class ReportController {

    private final ReportService reportService;
    // Inject ReportService to handle business logic for reports

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
        // Constructor-based dependency injection (Spring automatically provides ReportService instance)
    }

    /**
     * GET: System-wide report
     * URL: /api/reports/system
     */
    @GetMapping("/system")
    // Defines a GET HTTP endpoint at /api/reports/system
    public ResponseEntity<Map<String, Object>> getSystemReport() {
        // Calls the service to generate a system-wide report and returns it as JSON
        return ResponseEntity.ok(reportService.generateSystemReport());
        // Wraps the result in ResponseEntity with HTTP 200 OK status
    }

    /**
     * GET: Project-specific report
     * URL: /api/reports/project/{projectId}
     */
    @GetMapping("/project/{projectId}")
    // Defines a GET HTTP endpoint at /api/reports/project/{projectId} (e.g., /api/reports/project/5)
    public ResponseEntity<Map<String, Object>> getProjectReport(
            @PathVariable Long projectId) {
        // @PathVariable extracts the projectId from the URL
        return ResponseEntity.ok(reportService.generateProjectReport(projectId));
        // Calls service to generate report for a specific project and returns JSON
    }
}
