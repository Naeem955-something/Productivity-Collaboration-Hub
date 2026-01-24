package com.innovision.scheduler;

import com.innovision.service.DailySummaryService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DailySummaryScheduler {

    private final DailySummaryService dailySummaryService;

    public DailySummaryScheduler(DailySummaryService dailySummaryService) {
        this.dailySummaryService = dailySummaryService;
    }

    /**
     * Runs every day at 11:59 PM
     */
    @Scheduled(cron = "0 59 23 * * ?")
    public void runDailySummaryJob() {
        try {
            dailySummaryService.generateDailySummary();
            System.out.println("✅ Daily summary generated successfully");
        } catch (Exception e) {
            System.err.println("❌ Daily summary job failed: " + e.getMessage());
        }
    }
}
