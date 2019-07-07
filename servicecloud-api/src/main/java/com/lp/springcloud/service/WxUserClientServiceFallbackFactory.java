package com.lp.springcloud.service;

import com.lp.springcloud.common.Result;
import feign.hystrix.FallbackFactory;
import org.springframework.stereotype.Component;

@Component
public class WxUserClientServiceFallbackFactory implements FallbackFactory<WxUserClientService> {
    @Override
    public WxUserClientService create(Throwable throwable) {
        return new WxUserClientService() {
            @Override
            public Object getAll(int id) {
                Result result = new Result();
                result.setData("wo cao ni ma bi cxk");
                return result;
            }
        };
    }
}
