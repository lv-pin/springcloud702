package com.lp.springcloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.context.annotation.Bean;

/**
 * Hello world!
 */
@SpringBootApplication
@EnableEurekaClient
public class ProviderApp8001 extends SpringBootServletInitializer {
    public static void main(String[] args) {
//        SpringApplication.run(Hello.class);
        SpringApplication.run(ProviderApp8001.class);
    }

    @Override
    protected SpringApplicationBuilder configure(
            SpringApplicationBuilder application) {
        return application.sources(ProviderApp8001.class);
    }

}