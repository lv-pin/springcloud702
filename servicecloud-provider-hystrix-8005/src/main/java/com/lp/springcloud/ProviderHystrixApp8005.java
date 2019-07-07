package com.lp.springcloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

/**
 * Hello world!
 */
@SpringBootApplication
@EnableEurekaClient
@EnableCircuitBreaker
public class ProviderHystrixApp8005 extends SpringBootServletInitializer {
    public static void main(String[] args) {
//        SpringApplication.run(Hello.class);
        SpringApplication.run(ProviderHystrixApp8005.class);
    }

    @Override
    protected SpringApplicationBuilder configure(
            SpringApplicationBuilder application) {
        return application.sources(ProviderHystrixApp8005.class);
    }

}