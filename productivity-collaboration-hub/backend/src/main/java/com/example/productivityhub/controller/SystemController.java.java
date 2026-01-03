package com.example.productivityhub.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SystemController {

    @GetMapping("/status")
    public String systemStatus() {
        return "Productivity & Collaboration Hub backend is running ✅";
    }
}
