package com.lp.springcloud.dao;

import com.lp.springcloud.entity.StudentBean;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 全舱动态里程兑换报表
 *
 * @author fxzhangc
 * @date 2018年7月2日
 */
@Repository
@Mapper
public interface StudentMapper  {

    @Select("select *from student")
    List<StudentBean> queryAllStu();


}
