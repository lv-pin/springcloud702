package com.lp.springcloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.netflix.feign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;

/**
 * Hello world!
 */
@SpringBootApplication
//@EnableEurekaClient只适用于Eureka作为注册中心，@EnableDiscoveryClient 可以是其他注册中心。
@EnableEurekaClient
//feign
@EnableFeignClients(basePackages = {"com.lp.springcloud"})
public class ConsumerDeptAppFeign extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(ConsumerDeptAppFeign.class);
    }

    @Override
    protected SpringApplicationBuilder configure(
            SpringApplicationBuilder application) {
        return application.sources(ConsumerDeptAppFeign.class);
    }
}
