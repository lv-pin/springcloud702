package com.lp.springcloud.controller;

import com.lp.springcloud.common.Result;
import com.lp.springcloud.dao.StudentMapper;
import com.lp.springcloud.dao.WxUserMapper;
import com.lp.springcloud.entity.WxUser;
import com.netflix.hystrix.contrib.javanica.annotation.HystrixCommand;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.util.List;

@RestController
@RequestMapping(value = "/console")
public class ConsoleController {

    protected static Logger logger = LoggerFactory.getLogger(ConsoleController.class);

    @Autowired
    private StudentMapper studentMapper;
    @Autowired
    private WxUserMapper wxUserMapper;

    @RequestMapping(value = "/test", method = {RequestMethod.POST, RequestMethod.GET})
    @HystrixCommand(fallbackMethod = "processHystrix_Get")
    public Object test(@RequestParam(value = "id") int id) {
        if (id == 2) {
          throw new RuntimeException("数据库没有数据");
        }
        Result result = new Result();
        List<WxUser> b = null;
        try {
            b = wxUserMapper.queryAll();
            result.setData(b);
            result.setErrorCode("03");
        } catch (Exception e) {
            result.setData(e.getMessage());
            logger.error("获取数据异常->", e);
        }
        return result;
    }

    public Object processHystrix_Get(int id) {
        Result result = new Result();
            result.setData("你个瘠薄数据库都没有你还乱几把查个毛线啊？");
            result.setErrorCode("hystrix_05");
        return result;
    }


}
