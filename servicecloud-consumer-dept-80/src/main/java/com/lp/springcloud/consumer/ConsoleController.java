package com.lp.springcloud.consumer;

import com.lp.springcloud.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletResponse;

@RestController
@RequestMapping(value = "/console")
public class ConsoleController {
    @Autowired
    private RestTemplate restTemplate;

//    private  static  final String REST_URL_PREFIX="http://192.168.1.110:8001";
    private  static  final String REST_URL_PREFIX="http://SERVICECLOUD-PROVIDER";
    @RequestMapping(value = "/test", method = {RequestMethod.POST, RequestMethod.GET})
    public Object test(HttpServletResponse response) {
        Result result = new Result();
        Object o = restTemplate.postForObject(REST_URL_PREFIX+"/console/test", null, Object.class);
        result.setData(o);
        return o;
    }



}
