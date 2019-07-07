package com.lp.springcloud;

import com.lp.springcloud.cfgbean.MySelfRule;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.netflix.ribbon.RibbonClient;

/**
 * Hello world!
 */
@SpringBootApplication
@EnableEurekaClient
@RibbonClient(name = "SERVICECLOUD-PROVIDER", configuration = MySelfRule.class)
public class ConsumerDeptApp80 extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(ConsumerDeptApp80.class);
    }

    @Override
    protected SpringApplicationBuilder configure(
            SpringApplicationBuilder application) {
        return application.sources(ConsumerDeptApp80.class);
    }
}
