package com.lp.springcloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.cloud.netflix.hystrix.dashboard.EnableHystrixDashboard;

/**
 * Hello world!
 */
@SpringBootApplication
@EnableHystrixDashboard
public class ConsumerHystrixDashboard extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(ConsumerHystrixDashboard.class);
    }

    @Override
    protected SpringApplicationBuilder configure(
            SpringApplicationBuilder application) {
        return application.sources(ConsumerHystrixDashboard.class);
    }
}
