package com.lp.springcloud.consumer;

import com.lp.springcloud.common.Result;
import com.lp.springcloud.service.WxUserClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;

@RestController
@RequestMapping(value = "/console")
public class ConsoleController {
    @Autowired
    private WxUserClientService wxUserClientService;

    //    private  static  final String REST_URL_PREFIX="http://192.168.1.110:8001";
//    private static final String REST_URL_PREFIX = "http://SERVICECLOUD-PROVIDER";

    @RequestMapping(value = "/test", method = {RequestMethod.POST, RequestMethod.GET})
    public Object test(@RequestParam(value = "id") int id) {
        Result result = new Result();
        Object o = wxUserClientService.getAll(id);
        result.setData(o);
        return o;
    }


}
