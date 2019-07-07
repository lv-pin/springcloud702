
var cpuValue=[];								//全局数组用于保存从ajax获取到的CPU百分比的值
var cpuTime=[];								    //全局数组用于保存从ajax获取到的内存百分比的值
var memoryValue=[];
var memoryTime=[];
var resptimeTime=[];
var resptimeValue=[];
var qpsTime=[];
var qpsValue=[];
var diskTime=[];
var diskData=[];
var diskTemp={};
var timerHidden=null;
var basePathForEcharts = 'js/libs/dist';
var EchartsBarPath = 'echarts/chart/line';

var getNowFormatDate = function () {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate

    return currentdate.split('-').join('');
}

function CreatechartCpu(){
    require.config({
        paths: {
            echarts: basePathForEcharts,
        }
    });

    require(
        [
            'echarts',
            EchartsBarPath// 使用柱状图就加载bar模块，按需加载
        ],
        function (ec) {
            // 基于准备好的dom，初始化echarts图表
            var myChartCpu = ec.init(document.getElementById('cpu_chart')); //获取绘制图表的元素

            var option_cpu = {
                title : {
                    text: 'CPU 趋势（%）',
                    subtext: 'Working Hours'
                },
                tooltip : {
                    trigger: 'axis'
                },
                toolbox: {
                    show : false,
                    feature : {
                        mark : {show: true},
                        dataView : {show: true, readOnly: false},
                        magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                        restore : {show: true},
                        saveAsImage : {show: true}
                    }
                },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data:cpuTime,
                    }
                ],
                yAxis : [
                    {
                        type : 'value'
                    }
                ],
                series : [
                    {
                        name:'CPU百分比',
                        type:'line',
                        smooth:true,
                        itemStyle: {normal: {areaStyle: {type: 'default',color:'#471f99'}}},
                        data:cpuValue,
                    }
                ]
            };

            // 为echarts对象加载数据
            myChartCpu.setOption(option_cpu);
        }
    );

}

function CreatechartMemory(){

    require.config({
        paths: {
            echarts: basePathForEcharts,
        }
    });

    require(
        [
            'echarts',
            EchartsBarPath // 使用柱状图就加载bar模块，按需加载
        ],
        function (ec) {
            // 基于准备好的dom，初始化echarts图表
            var myChartMemory= ec.init(document.getElementById('memory_chart'));

            var option_memory = {
                title : {
                    text: '内存趋势（GB）',
                    subtext: 'Working Hours'
                },
                tooltip : {
                    trigger: 'axis'
                },
                toolbox: {
                    show : false,
                    feature : {
                        mark : {show: true},
                        dataView : {show: true, readOnly: false},
                        magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                        restore : {show: true},
                        saveAsImage : {show: true}
                    }
                },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data:memoryTime,
                    }
                ],
                yAxis : [
                    {
                        type : 'value'
                    }
                ],
                series : [
                    {
                        name:'内存大小',
                        type:'line',
                        smooth:true,
                        itemStyle: {normal: {areaStyle: {type: 'default',color:'#3278ea'}}},
                        data:memoryValue,
                    }
                ]
            };

            myChartMemory.setOption(option_memory);
        }
    );

}

function CreatechartResptime(){

    require.config({
        paths: {
            echarts: basePathForEcharts,
        }
    });

    require(
        [
            'echarts',
            EchartsBarPath
        ],
        function (ec) {

            var myChartResptime= ec.init(document.getElementById('resptime_chart'));

            var option_Resptime = {
                title : {
                    text: '响应时间（ms）',
                    subtext: 'Working Hours'
                },
                tooltip : {
                    trigger: 'axis'
                },
                toolbox: {
                    show : false,
                    feature : {
                        mark : {show: true},
                        dataView : {show: true, readOnly: false},
                        magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                        restore : {show: true},
                        saveAsImage : {show: true}
                    }
                },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data:resptimeTime,
                    }
                ],
                yAxis : [
                    {
                        type : 'value'
                    }
                ],
                series : [
                    {
                        name:'响应时间',
                        type:'line',
                        smooth:true,
                        itemStyle: {normal: {areaStyle: {type: 'default',color:'#ca0fa0'}}},
                        data:resptimeValue,
                    }
                ]
            };

            myChartResptime.setOption(option_Resptime);
        }
    );

}

function CreatechartQPS(){

    require.config({
        paths: {
            echarts: basePathForEcharts,
        }
    });

    require(
        [
            'echarts',
            EchartsBarPath // 使用柱状图就加载bar模块，按需加载
        ],
        function (ec) {
            // 基于准备好的dom，初始化echarts图表
            var myChartQPS= ec.init(document.getElementById('qps_chart'));

            var option_QPS = {
                title : {
                    text: '请求数（次数）',
                    subtext: 'Working Hours'
                },
                tooltip : {
                    trigger: 'axis'
                },
                toolbox: {
                    show : false,
                    feature : {
                        mark : {show: true},
                        dataView : {show: true, readOnly: false},
                        magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                        restore : {show: true},
                        saveAsImage : {show: true}
                    }
                },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data:qpsTime,
                    }
                ],
                yAxis : [
                    {
                        type : 'value'
                    }
                ],
                series : [
                    {
                        name:'请求数',
                        type:'line',
                        smooth:true,
                        itemStyle: {normal: {areaStyle: {type: 'default',color:'#80deea'}}},
                        data:qpsValue,
                    }
                ]
            };

            // 为echarts对象加载数据
            myChartQPS.setOption(option_QPS);
        }
    );

}

function CreatechartDisk(){

    require.config({
        paths: {
            echarts: basePathForEcharts,
        }
    });

    require(
        [
            'echarts',
            EchartsBarPath // 使用柱状图就加载bar模块，按需加载
        ],
        function (ec) {
            // 基于准备好的dom，初始化echarts图表
            var myChartDisk= ec.init(document.getElementById('disk_chart'));

            var option_disk = {
                title : {
                    text: '磁盘空间（百分比）',
                    subtext: 'Working Hours'
                },
                tooltip : {
                    trigger: 'axis'
                },
                toolbox: {
                    show : false,
                    feature : {
                        mark : {show: true},
                        dataView : {show: true, readOnly: false},
                        magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                        restore : {show: true},
                        saveAsImage : {show: true}
                    }
                },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data:diskTime,
                    }
                ],
                yAxis : [
                    {
                        type : 'value'
                    }
                ],
                series : diskData
            };

            // 为echarts对象加载数据
            myChartDisk.setOption(option_disk);
        }
    );

}

/** 官网服务器监控后台将数据格式更改，前端做相应的改动；debugged on 9th.Jan.2018 */
//获取CPU百分比的函数
function fnGetCpu(apiUrl){
    cpuValue=[];
    cpuTime=[];
    $.ajax({
        type:"post",
        url:apiUrl,
        async: false,
        dataType: "json",
        success: function(data){
            if(data.success==true){
                for(var i=0;i<data.data.length;i++){
                    cpuValue[i]=data.data[i].value;
                    cpuTime[i]=data.data[i].time;
                }
            }
        },
        error:function(){
            console.log("获取CPU百分比 error");
        }
    });
}

function fnGetMemory(apiUrlPort){
    memoryValue=[];
    memoryTime=[];
    $.ajax({
        type:"post",
        url:apiUrlPort,
        async: false,
        dataType: "json",
        success: function(data){
            if(data.success==true){
                for(var i=0;i<data.data.length;i++){
                    memoryValue[i]=Math.floor(parseFloat(data.data[i].value)/(1024*1024*1024) * 1000) / 1000
                    memoryTime[i]=data.data[i].time;
                }
            }
        },
        error:function(){
            console.log("获取内存百分比 error");
        }
    });
}
function fnGetResptime(apiUrlPort){
    resptimeTime=[];
    resptimeValue=[];
    $.ajax({
        type:"get",
        url:apiUrlPort,
        async: false,
        dataType: "json",
        success: function(data){
            if(data.success==true){
                for(var i=0;i<data.data.length;i++){
                    resptimeTime[i]=data.data[i].time;
                    resptimeValue[i]=Math.floor(parseFloat(data.data[i].value)* 1000)
                }
            }
        },
        error:function(){
            console.log("获取响应时间 error");
        }
    });
}


function fnGetqps(apiUrlPort){
    qpsTime=[];
    qpsValue=[];
    $.ajax({
        type:"get",
        url:apiUrlPort,
        async: false,
        dataType: "json",
        success: function(data){
            if(data.success==true){
                for(var i=0;i<data.data.length;i++){
                    qpsTime[i]=data.data[i].time;
                    qpsValue[i]=data.data[i].value;
                }
            }
        },
        error:function(){
            console.log("获取响应时间 error");
        }
    });
}


function fnGetDisk(apiUrlPort){
    diskData=[];
    $.ajax({
        type:"get",
        url:apiUrlPort,
        async: false,
        dataType: "json",
        success: function(data){
            if(data.success==true){
                for(var i=0;i<data.data.length;i++){
                    diskTemp.name="磁盘空间("+data.data[i].diskName+")";
                    diskTemp.type='line';
                    diskTemp.smooth=true;
                    var diskArr=[];
                    for(var j=0;j<data.data[i].values.length;j++){
                        diskArr[j]=data.data[i].values[j].value;
                        diskTime[j]=data.data[i].values[j].time;
                    }
                    diskTemp.data=diskArr;
                    diskData.push(diskTemp);
                    diskTemp={};
                }
            }
        },
        error:function(){
            console.log("获取响应时间 error");
        }
    });
}

$(function(){

    $("#start_date").val(getNowFormatDate());

    $(document).on("click",".echart_links_list", function(){
        $(".echart_links_list").removeClass("links_list_select");
        $(this).addClass("links_list_select");
        $("#curentLink").text($(this).text());
        fnGetCpu(urlMd.history+this.id+"/cpu/"+$("#start_date").val());

        if(cpuTime.length>0&&cpuValue.length>0){
            $("#cpu_chart").html("");
            CreatechartCpu();
        }
        else{
            $("#cpu_chart").html("");
            $("#cpu_chart").append("<div class='nochart'><p class='nochart_title'>CPU 趋势（%）</p>\
				<p class='nochart_text'>暂无数据</p></div>");
        }
        fnGetMemory(urlMd.history+this.id+"/memory/"+$("#start_date").val());
        if(memoryTime.length>0&&memoryValue.length>0){
            $("#memory_chart").html("");
            CreatechartMemory();
        }
        else{
            $("#memory_chart").html("");
            $("#memory_chart").append("<div class='nochart'><p class='nochart_title'>内存趋势（GB）</p>\
				<p class='nochart_text'>暂无数据</p></div>");
        }
        fnGetResptime(urlMd.history+this.id+"/resptime/"+$("#start_date").val());
        if(resptimeTime.length>0&&resptimeValue.length>0){
            $("#resptime_chart").html("");
            CreatechartResptime();
        }
        else{
            $("#resptime_chart").html("");
            $("#resptime_chart").append("<div class='nochart'><p class='nochart_title'>响应时间（ms）</p>\
				<p class='nochart_text'>暂无数据</p></div>");
        }
        fnGetqps(urlMd.history+this.id+"/qps/"+$("#start_date").val());
        if(qpsTime.length>0&&qpsValue.length>0){
            $("#qps_chart").html("");
            CreatechartQPS();
        }
        else{
            $("#qps_chart").html("");
            $("#qps_chart").append("<div class='nochart'><p class='nochart_title'>请求次数（次数）</p>\
				<p class='nochart_text'>暂无数据</p></div>");
        }
        fnGetDisk(urlMd.history+this.id+"/disk/"+$("#start_date").val());
        if(diskTime.length>0&&diskData.length>0){
            $("#disk_chart").html("");
            CreatechartDisk();
        }
        else{
            $("#disk_chart").html("");
            $("#disk_chart").append("<div class='nochart'><p class='nochart_title'>磁盘空间（百分比）</p>\
				<p class='nochart_text'>暂无数据</p></div>");
        }
    });


    $(".alert_contents_echart_close").click(function(){
        /** 恢复监控列表的轮播，具体逻辑请查看轮播的暂停逻辑 */
        if (alertLinkHistoryType === 'appWeb') {
            appWebSwiper.autoplay.start();
            $('.contents_center_book').mouseout(function () {
                appWebSwiper.autoplay.start();
            });
        }
        else {
            if (interfacesTicketPages > 1) {
                interfacesTicketsSwiper.autoplay.start();
                $('.book_interfaces_ticket').mouseout(function () {
                    interfacesTicketsSwiper.autoplay.start();
                });
            }
        }
        $(".alert_contents_echart").addClass("hidden");
        $(".blackly").addClass("hidden");
    })

    $(".alert_contents_test_close").click(function(){
        /** 恢复监控列表的轮播 */
        if (interfacesTicketPages > 1) {
            interfacesTicketsSwiper.autoplay.start();
            $('.book_interfaces_ticket').mouseout(function () {
                interfacesTicketsSwiper.autoplay.start();
            });
        }
        $(".alert_contents_test").addClass("hidden");
        $(".blackly").addClass("hidden");
    })
    
    $("#individuation_win_close").click(function(){
    	/** 恢复监控列表的轮播 */
        if (interfacesTicketPages > 1) {
            interfacesTicketsSwiper.autoplay.start();
            $('.book_interfaces_ticket').mouseout(function () {
                interfacesTicketsSwiper.autoplay.start();
            });
        }
        $(".individuation_wrapper").addClass("hidden");
    })
    
    $("#individuation_win_close_2").click(function(){
        $(".individuation_wrapper_2").addClass("hidden");
    })

    $(".alert_contents_visit_close").click(function(){
        $(".alert_contents_visit").addClass("hidden");
        $(".blackly").addClass("hidden");
        visitAlertData=[];
    })

    $(".alert_contents_suran_close").click(function(){
        $(".alert_contents_suran").addClass("hidden");
        $(".blackly").addClass("hidden");
        suranAlertData=[];
    })

    $(".alert_contents_issueticket_close").click(function(){
        $(".alert_contents_issueticket").addClass("hidden");
        $(".blackly").addClass("hidden");
        issueticketAlertData=[];
    })

    $(".alert_contents_disk_close").click(function(){
        $(".alert_contents_disk").addClass("hidden");
        $(".blackly").addClass("hidden");
        portsAlertListDiskData=[];
    })

    $("#start_date").mouseover(function(){
        calendar.show(this);
    });

    $("#__calendarPanel").mouseout(function(){
        timerHidden=null;
        timerHidden=setTimeout(function(){
            calendar.hide(this);
        },500)
    });

    $("#__calendarPanel").mouseover(function(){
        clearTimeout(timerHidden);
    });


    $(".blackly").click(function(){
        calendar.hide(this);
    });

})