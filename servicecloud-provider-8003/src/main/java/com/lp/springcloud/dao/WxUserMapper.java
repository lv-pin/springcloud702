package com.lp.springcloud.dao;

import com.lp.springcloud.entity.WxUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Mapper
public interface WxUserMapper {

    @Select("select *from wx_user")
    List<WxUser> queryAll();

    @Select("select *from wx_user where open_id=#{openId}")
    WxUser query(@Param("openId") String openId);


}
