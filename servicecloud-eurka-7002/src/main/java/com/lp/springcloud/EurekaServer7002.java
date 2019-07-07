package com.lp.springcloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Hello world!
 */
@SpringBootApplication
@EnableEurekaServer
public class EurekaServer7002 extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServer7002.class);
    }

    @Override
    protected SpringApplicationBuilder configure(
            SpringApplicationBuilder application) {
        return application.sources(EurekaServer7002.class);
    }
}
