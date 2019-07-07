package com.lp.springcloud.service;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@Repository
//@FeignClient(value = "SERVICECLOUD-PROVIDER")
@FeignClient(value = "SERVICECLOUD-HYSTRIX-PROVIDER",fallbackFactory = WxUserClientServiceFallbackFactory.class)
public interface WxUserClientService {

    @RequestMapping(value = "/console/test", method =  RequestMethod.GET)
    public Object getAll(@RequestParam(value = "id") int id);
}
