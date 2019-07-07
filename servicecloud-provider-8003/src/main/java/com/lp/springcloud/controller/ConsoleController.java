package com.lp.springcloud.controller;

import com.lp.springcloud.common.Result;
import com.lp.springcloud.dao.StudentMapper;
import com.lp.springcloud.dao.WxUserMapper;
import com.lp.springcloud.entity.WxUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
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
    public Object test(HttpServletResponse response) {
        Result result = new Result();
        List<WxUser> b =null;
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



}
