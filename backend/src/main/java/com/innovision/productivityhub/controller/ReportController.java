package com.innovision.controller;

import com.innovision.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * GET: System-wide report
     * URL: /api/reports/system
     */
    @GetMapping("/system")
    public ResponseEntity<Map<String, Object>> getSystemReport() {
        return ResponseEntity.ok(reportService.generateSystemReport());
    }

    /**
     * GET: Project-specific report
     * URL: /api/reports/project/{projectId}
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectReport(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(reportService.generateProjectReport(projectId));
    }
}
