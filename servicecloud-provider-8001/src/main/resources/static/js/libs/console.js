var status2color = {
    "ERROR": "#bc2538",
    "ALERT": "#f6d34e"
}

// 在内存中将array设为[]
var EmptyArray = function (array) {
    return array.length = 0;
}
var alertLinkHistoryType = '';

// TODO 20K 模拟数据，方便开发
// isOps = true; // 运维人员
// isOps = false; // 非运维人员

// var username = decodeURI(window.location.href.split('username=')[1]);
console.log("当前用户" + username + "是" + (isOps ? '运维人员。' : '非运维人员。'));

// 自动刷新接口的setInterval定时器
var timerConsole = null;

/** ------ START ------ 接口路径（全局变量） ---- START ---- */
var urlMd = (function () {
    var base = "console/";
    return {
        base: base,
        heart: base + "openUrl?",
        reduced: base + "actAlarm/suppress/", // 强制降级
        unreduced: base + "actAlarm/unsuppress/", // 解除降级
        monitor: base + "get", // 页面刷新
        // TODO 20K degubbed on 3.21
        stepMsg: base + "stepMsg?key=", // 监控点故障处理步骤
        history: base + "history/", // 历史数据
        refresh: base + "refresh", // 强制刷新
    }
})();
/** ------ END ------ 接口路径（全局变量） ---- END ------ */


/** ------ START ------ 页面加载时，获取应用监控，接口监控，业务监控，非业务监控 ---- START ---- */
{
    var appWebMonitor = [];
    var interfacesMonitor = [];
    var ticketsVerify = [];
    var businessMonitor = [];
    var serverMonitor = {};
    var GetMonitorData = function () {
        $.ajax({
            type: 'get',
            url: urlMd.monitor,
            // 因为跟随在GetMonitorData后面的各种config函数必须在success回调函数之后调用，所以这里不能用异步，而是采用同步
            async: false,
            dataType: 'json',
            success: function (data) {
                if (data.success) {
                    appWebMonitor = data.data.zapps;
                    interfacesMonitor = data.data.zinterfaces;
                    ticketsVerify = data.data.ztickets;
                    businessMonitor = data.data.bzs;
                    serverMonitor = data.data.zserver;
                }
            },
            error: function () {
                console.log('newmonitor/console/get接口获取数据失败');
            }
        })
    };
    GetMonitorData();
}
;
/** ------ END ------ 页面加载时，获取应用监控，接口监控，业务监控，非业务监控 ---- END ---- */


/** ------ START ------ 强制刷新、暂停刷新、自动刷新按钮component ------ START ------ */
{
    var controlButtonListData = [];
    var RefreshAll = function () {
        GetMonitorData();
        // 因为下面这些config函数必须要在get的success函数之后执行，所以GetMonitor使用了同步（async: false）
        AppWebConfig();
        linkHistoryConfig();
        InterfacesConfig();
        InterfacesAlertConfig();
        TicketVerifyConfig();
        ServerConfig();
        ServerAlertConfig();
        new_monitor_console.$data.contentsCenterList = contentsCenterData;
        new_monitor_console.$data.contentsCenterPages = contentsCenterPages;
        new_monitor_console.$data.linkNameList = linkNameList;
        new_monitor_console.$data.websitePortList = websitePortData;
        new_monitor_console.$data.interfacesTicketPages = interfacesTicketPages;
        new_monitor_console.$data.interfacesAlertList = interfacesAlertList;
        new_monitor_console.$data.ticketVerifyData = ticketVerifyData;

        new_monitor_console.$data.serverPortData = serverPortData;
        new_monitor_console.$data.serverMonitor = serverMonitor;
        // new_monitor_console.$data.ticketVerifyList = ticketVerifyList;
        GetConsoleStatus();
    };
    var RefreshAuto = function () {
        if (!controlButtonListData[0].button_isactive && !controlButtonListData[2].button_isactive) {
            clearInterval(timerConsole);
            RefreshAll();
            timerConsole = setInterval(function () {
                RefreshAll();
            }, 30000);
            controlButtonListData[0].button_isactive = true;
            controlButtonListData[0].button_icon = "images/icon_refresh_auto_active.png";
            controlButtonListData[1].button_isactive = false;
            controlButtonListData[1].button_icon = "images/icon_refresh_pause_inactive.png";
        }
    }
    var RefreshPause = function () {
        // audio.pause();
        if (!controlButtonListData[1].button_isactive && !controlButtonListData[2].button_isactive) {
            clearInterval(timerConsole);
            controlButtonListData[0].button_isactive = false;
            controlButtonListData[0].button_icon = 'images/icon_refresh_auto_inactive.png';
            controlButtonListData[1].button_isactive = true;
            controlButtonListData[1].button_icon = 'images/icon_refresh_pause_active.png';
        }
    };
    var RefreshForced = function () {
        controlButtonListData[2].button_isactive = true;
        controlButtonListData[2].button_icon = 'images/icon_refresh_forced_active.png';
        controlButtonListData[1].button_isactive = false;
        controlButtonListData[1].button_icon = 'images/icon_refresh_pause_inactive.png';
        controlButtonListData[0].button_isactive = false;
        controlButtonListData[0].button_icon = 'images/icon_refresh_auto_inactive.png';
        clearInterval(timerConsole);
        // 设置延时是为了防止：刚刚自动刷新了一次，组件数据还没有更新和渲染完毕。
        setTimeout(function () {
            $.ajax({
                type: 'get',
                url: urlMd.refresh,
                async: false,
                dataType: 'json',
                error: function () {
                    console.log('强制刷新失败');
                },
                success: function () {
                    RefreshAll();
                    timerConsole = setInterval(function () {
                        RefreshAll();
                    }, 30000);
                    controlButtonListData[0].button_isactive = true;
                    controlButtonListData[0].button_icon = 'images/icon_refresh_auto_active.png';
                    controlButtonListData[2].button_isactive = false;
                    controlButtonListData[2].button_icon = 'images/icon_refresh_forced_inactive.png';
                }
            });
        }, 50)
    };
    var BgWarningPlayer = function () {
        controlButtonListData[3].button_isactive = !controlButtonListData[3].button_isactive;
        if (controlButtonListData[3].button_isactive) {
            controlButtonListData[3].button_icon = "images/icon_close_active.png";
        }
        else {
            controlButtonListData[3].button_icon = "images/icon_close_inactive.png";
        }
        GetConsoleStatus();
    };
    (function () {
        var TitleIsHidden = function (event, index) {
            controlButtonListData[index].button_title_ishidden = (event.type === 'mouseout');
        };
        var controlButton_temp = {};
        // 自动刷新 ------ START ------
        controlButton_temp.button_title = "自动刷新";
        controlButton_temp.button_title_ishidden = true;
        controlButton_temp.button_isactive = true;
        controlButton_temp.button_icon = "images/icon_refresh_auto_active.png";
        controlButton_temp.button_link = "javascript:;";
        controlButton_temp.TitleIsHidden = function (event) {
            TitleIsHidden(event, 0);
        };
        controlButton_temp.FnControl = RefreshAuto;
        controlButtonListData.push(controlButton_temp);
        controlButton_temp = {};
        // 自动刷新 ------ END ------

        // 暂停刷新 ------ START ------
        controlButton_temp.button_title = "暂停刷新";
        controlButton_temp.button_title_ishidden = true;
        controlButton_temp.button_isactive = false;
        controlButton_temp.button_icon = "images/icon_refresh_pause_inactive.png";
        controlButton_temp.button_link = "javascript:;";
        controlButton_temp.TitleIsHidden = function () {
            TitleIsHidden(event, 1);
        };
        controlButton_temp.FnControl = RefreshPause;
        controlButtonListData.push(controlButton_temp);
        controlButton_temp = {};
        // 暂停刷新 ------ END ------

        // 强制刷新 ------ START ------
        controlButton_temp.button_title = "强制刷新";
        controlButton_temp.button_title_ishidden = true;
        controlButton_temp.button_isactive = false;
        controlButton_temp.button_icon = "images/icon_refresh_forced_inactive.png";
        controlButton_temp.button_link = "javascript:;";
        controlButton_temp.TitleIsHidden = function () {
            TitleIsHidden(event, 2);
        };
        controlButton_temp.FnControl = RefreshForced;
        controlButtonListData.push(controlButton_temp);
        controlButton_temp = {};
        // 强制刷新 ------ END ------

        // 警报音效 ------ START ------
        controlButton_temp.button_title = "警报开关";
        controlButton_temp.button_title_ishidden = true;
        controlButton_temp.button_isactive = true;
        controlButton_temp.button_icon = "images/icon_close_active.png";
        controlButton_temp.button_link = "javascript:;";
        controlButton_temp.TitleIsHidden = function (event) {
            TitleIsHidden(event, 3);
        };
        controlButton_temp.FnControl = BgWarningPlayer;
        controlButtonListData.push(controlButton_temp);
        controlButton_temp = {};
        // 警报音效 ------ END ------
    })();
    Vue.component('control-button-list', {
        props: ['todo'],
        template: '\
            <li class="contents_top_control_button_list"\
                v-on:mouseover="todo.TitleIsHidden" v-on:mouseout="todo.TitleIsHidden" \
                v-on:click="todo.FnControl">\
                <a v-bind:href="todo.button_link">\
                    <p class="contents_top_control_button_title" \
                        v-bind:class="{hidden:todo.button_title_ishidden}"> \
                        {{todo.button_title}} \
                    </p>\
                    <img v-bind:src="todo.button_icon"/>\
                </a>\
            </li>'
    });

}
; // 栅栏
/** ------ END ------ 强制刷新、暂停刷新、自动刷新按钮component ----- END ------ */


/** ------ START ------ app-web-monitor component（cpu，memory，rsptime，报警灯颜色，报警转状态排序） --------- START -------- */
{
    var contentsCenterData = [];
    var contentsCenterPages = 0;
    var currentPage = 0;
    var pagePointGap = 10;
    var appWebHasErrorAppKeys = [];
    var iconReduce = {
        unreduce: 'images/icon_unreduce.png',
        reduce: 'images/icon_reduce.png',
        reduceDisabled: 'images/icon_reduce_disabled.png'
    };
    // TODO 20K 用于判断鼠标是否在故障处理步骤弹窗上
    var onStepsTable = false;
    var AppWebSort = function (a, b) {
        var lights = {direction: ['up_is', 'down_is'], color: ['green', 'yellow', 'red']};
        var level = function (obj) {
            var score = 0;
            for (var i = 0; i < lights.direction.length; i++) {
                for (var j = 0; j < lights.color.length; j++) {
                    score += obj[lights.direction[i] + lights.color[j]] ? j * j : 0;
                }
            }
            return score;
        };
        return level(b) - level(a);
    };
    var ReduceRank = function (event) {
        var $this = $(event.currentTarget); // 将图标img标签转为jquery对象
        // 获取当前app或web监控信息展示板的id
        var currentHostId = $this.parent().siblings('.contents_center_list_cell').eq($this.hasClass('up') ? 0 : 1).attr('id');
        var currentAppId = '';
        var appWebIndex = 0; // appWebMonitor索引
        var appWebIndexIndex = 0; // appWebMonitor的元素app和web对中的索引，appWebMonitor 数据格式更改后添加的处理逻辑
        var dataIndex = 0; // contentsCenterData索引
        for (var i = 0; i < appWebMonitor.length; i++) {
            for (var j = 0; j < appWebMonitor[i].length; j++) {
                /** 需要做非空判断。这里做过非空判断，下面不用做 */
                if (appWebMonitor[i][j] !== null && currentHostId === appWebMonitor[i][j].key) {
                    appWebIndex = i; // 通过比对hostId来获取索引
                    appWebIndexIndex = j;
                    // 至少到这里，还看不出这个变量的用处，完全可以用currentHostId来替代
                    currentAppId = appWebMonitor[i][j].key;
                }
            }
        }
        for (var j = 0; j < contentsCenterData.length; j++) {
            if (currentHostId === contentsCenterData[j].up_hostId || currentHostId === contentsCenterData[j].down_hostId) {
                // 获取在contentsCenterData中的索引
                dataIndex = j; // 此处并没有判断是up还是down，在后面的赋值中进行判断
            }
        }
        if (appWebMonitor[appWebIndex][appWebIndexIndex].reduced) {
            // 还原处理
            $.ajax({
                type: 'get',
                url: urlMd.unreduced + currentAppId,
                async: false,
                dataType: 'json',
                success: function (data) {
                    if (data.success) {
                        /** 还原处理之后，应该要重新获取数据; debugged on 9th,Jan,2018
                         * 严格说来，其实只要获取当前appWeb的数据就可以了，但是考虑到当前接口的情况，只能使用get接口
                         * 使用refreshAll，有不必要的运算，应该设法优化
                         */
                        RefreshAll();
                    }
                },
                error: function () {
                    console.log('\n');
                    console.log('还原警报状态失败。');
                }
            });
        } else {
            // 降级处理
            $.ajax({
                type: 'get',
                url: urlMd.reduced + currentAppId,
                async: false,
                dataType: 'json',
                success: function (data) {
                    if (data.success) {
                        RefreshAll();
                    }
                },
                error: function () {
                    console.log('强制降级失败。');
                }
            })
        }
    };
    var appWebSolvingStepsList = {};
    var GetAppWebSolvingSteps = function () {
        appWebHasErrorAppKeys.length = 0;
        for (var i = 0; i < appWebMonitor.length; i++) {
            for (var j = 0; j < appWebMonitor[i].length; j++) {
                /** 需要做非空判断 */
                if (appWebMonitor[i][j] !== null) {
                    /**　报警、被强制降级的监控点，需要请求故障解决方案　*/
                    if (appWebMonitor[i][j].status.trim().toLowerCase() === 'error' ||
                        (appWebMonitor[i][j].status.trim().toLowerCase() === 'alert' && appWebMonitor[i][j].reduced)) {
                        appWebHasErrorAppKeys.push(appWebMonitor[i][j].key);
                    }
                }
            }
        }
        ;
        /** 只有当appWebHasErrorAppKeys.length !== 0,才需要请求故障解决方案 */
        if (appWebHasErrorAppKeys.length !== 0) {
            $.ajax({
                type: 'get',
                url: urlMd.stepMsg + appWebHasErrorAppKeys.join(','),
                async: false,
                dataType: 'json',
                success: function (data) {
                    // TODO 20k debugged on 3.22
                    if (data.success) {
                        appWebSolvingStepsList = data.data;
                    }
                },
                error: function () {
                    console.log('\n');
                    console.warn('获取官网应用故障处理步骤信息失败。');
                }
            })
        }
    };
    var ShowLinkHistory = function (event) {
        interfacesTicketsSwiper.el.onmouseout = function () {
        };
        appWebSwiper.el.onmouseout = function () {
        };
        appWebSwiper.autoplay.stop();
        interfacesTicketsSwiper.autoplay.stop();

        var ID = event.currentTarget.id;
        var heartUrl = '';
        /** 客票验证默认是查看第一个链路的历史监控数据，因此，不需要for循环 */
        if (ID === ticketsVerify[0].key) {
            alertLinkHistoryType = 'ticketsVerifying';
            try {
                if (ticketsVerify[0].dataBody.httpCheckCode != null) {
                    heartUrl = urlMd.heart + "key=" + ticketsVerify[0].key + "&httpCheckCode=" + ticketsVerify[0].dataBody.httpCheckCode;
                }
                else {
                    heartUrl = "暂无心跳地址";
                }
            } catch (e) {
                console.log('\n');
                console.log('客票验证心跳地址的错误：');
                console.warn(e);
                heartUrl = '暂无心跳地址';
            }
            new_monitor_console.$data.noHeartUrl = (heartUrl === '暂无心跳地址');
        }
        else {
            alertLinkHistoryType = 'appWeb';
            for (var i = 0; i < appWebMonitor.length; i++) {
                for (var j = 0; j < appWebMonitor[i].length; j++) {
                    /** 需要添加非空判断 */
                    if (appWebMonitor[i][j] !== null && ID === appWebMonitor[i][j].key) {
                        try {
                            if (appWebMonitor[i][j].dataBody.httpCheckCode != null) {
                                heartUrl = urlMd.heart + 'key=' + appWebMonitor[i][j].key + '&httpCheckCode=' + appWebMonitor[i][j].dataBody.httpCheckCode;
                            }
                            else {
                                heartUrl = "暂无心跳地址";
                            }
                        } catch (e) {
                            console.log('\n');
                            console.log('app,web心跳地址的错误：');
                            console.warn(e);
                            heartUrl = '暂无心跳地址';
                        }
                        new_monitor_console.$data.noHeartUrl = (heartUrl === '暂无心跳地址');
                        break;
                    }
                }
            }
            ;
        }
        ;
        if (!isOps) {
            appWebSwiper.autoplay.start();
            interfacesTicketsSwiper.autoplay.start();
            appWebSwiper.el.onmouseout = function () {
                appWebSwiper.autoplay.start();
            };
            interfacesTicketsSwiper.el.onmouseout = function () {
                interfacesTicketsSwiper.autoplay.start();
            };
            heartUrl !== '暂无心跳地址' ? window.open(heartUrl) : false; // 非运维人员，直接打开心跳地址
        }
        else {
            if (alertLinkHistoryType === 'appWeb') {
                interfacesTicketsSwiper.autoplay.start();
                interfacesTicketsSwiper.el.onmouseout = function () {
                    interfacesTicketsSwiper.autoplay.start();
                };
            } else {
                appWebSwiper.autoplay.start();
                appWebSwiper.el.onmouseout = function () {
                    appWebSwiper.autoplay.start();
                };
            }
            $(".blackly").removeClass("hidden");
            $(".alert_contents_echart").removeClass("hidden");
            // 每次都要先恢复链路列表的滚动条的滚动距离为0
            $('.echart_contents_left').scrollTop(0);

            $(".echart_links_list").each(function () {
                var $this = $(this);
                if ($this.attr("id") == ID) {
                    $this.addClass("links_list_select");
                    if ((Math.ceil($this.offset().top) - Math.ceil($('.echart_contents_left').offset().top) + 10) > Math.ceil($('.echart_contents_left').height())) {
                        $('.echart_contents_left').scrollTop(
                            Math.ceil($this.offset().top) -
                            Math.ceil($('.echart_contents_left').offset().top) -
                            Math.ceil($('.echart_contents_left').height()) +
                            $this.height() + 10
                        );
                    } else {
                        $('.echart_contents_left').scrollTop(0);
                    }
                    $("#current_link").text($this.text());
                } else {
                    $this.removeClass("links_list_select");
                }
            });
            fnGetCpu(urlMd.history + ID + "/cpu/" + getNowFormatDate());
            if (cpuTime.length > 0 && cpuValue.length > 0) {
                $("#cpu_chart").html("");
                CreatechartCpu();
            } else {
                $("#cpu_chart").html("");
                $("#cpu_chart").append("<div class='nochart'><p class='nochart_title'>CPU 趋势（%）</p>\
                    <p class='nochart_text'>暂无数据</p></div>");
            }
            fnGetMemory(urlMd.history + ID + '/memory/' + getNowFormatDate());
            if (memoryTime.length > 0 && memoryValue.length > 0) {
                $("#memory_chart").html("");
                CreatechartMemory();
            } else {
                $("#memory_chart").html("");
                $("#memory_chart").append("<div class='nochart'><p class='nochart_title'>内存趋势（GB）</p>\
                    <p class='nochart_text'>暂无数据</p></div>");
            }
            fnGetResptime(urlMd.history + ID + "/resptime/" + getNowFormatDate());
            if (resptimeTime.length > 0 && resptimeValue.length > 0) {
                $("#resptime_chart").html("");
                CreatechartResptime();
            } else {
                $("#resptime_chart").html("");
                $("#resptime_chart").append("<div class='nochart'><p class='nochart_title'>响应时间（ms）</p>\
                    <p class='nochart_text'>暂无数据</p></div>");
            }
            fnGetqps(urlMd.history + ID + "/qps/" + getNowFormatDate());
            if (qpsTime.length > 0 && qpsValue.length > 0) {
                $("#qps_chart").html("");
                CreatechartQPS();
            } else {
                $("#qps_chart").html("");
                $("#qps_chart").append("<div class='nochart'><p class='nochart_title'>请求次数（次数）</p>\
                    <p class='nochart_text'>暂无数据</p></div>");
            }
            fnGetDisk(urlMd.history + ID + "/disk/" + getNowFormatDate());
            if (diskTime.length > 0 && diskData.length > 0) {
                $("#disk_chart").html("");
                CreatechartDisk();
            } else {
                $("#disk_chart").html("");
                $("#disk_chart").append("<div class='nochart'><p class='nochart_title'>磁盘空间（百分比）</p>\
                    <p class='nochart_text'>暂无数据</p></div>");
            }
            $('.ops_new_window a').html(heartUrl).attr('href', heartUrl);
        }
        ;
    };
    var AppWebConfig = function () {
        // 获取故障处理步骤信息
        GetAppWebSolvingSteps();
        contentsCenterData = [];
        var temp_center = {};
        // var app_web_couples = appWebMonitor.length; // TODO no usage to be deleted
        // 配置web和app的展示数据
        for (var h = 0; h < appWebMonitor.length; h++) {
            for (var i = 0; i < appWebMonitor[h].length; i++) {
                var config = function (positionOfDisplaying) {
                    // TODO 20K appId和hostId是不是可以去掉一个？
                    temp_center[positionOfDisplaying + '_mouseEnter'] = false;
                    temp_center[positionOfDisplaying + '_appId'] = appWebMonitor[h][i].key;
                    temp_center[positionOfDisplaying + '_hostname'] = appWebMonitor[h][i].dataBody.type + " " + appWebMonitor[h][i].dataBody.ip;
                    temp_center[positionOfDisplaying + '_hostId'] = appWebMonitor[h][i].key;
                    temp_center[positionOfDisplaying + '_contacts'] = '';
                    temp_center[positionOfDisplaying + '_steps'] = '';
                    temp_center[positionOfDisplaying + '_mouseenterYellow'] = false;
                    temp_center[positionOfDisplaying + '_mouseenterGreen'] = false;
                    temp_center[positionOfDisplaying + '_reduced'] = appWebMonitor[h][i].reduced;
                    temp_center[positionOfDisplaying + '_ReduceRank'] = ReduceRank;
                    temp_center[positionOfDisplaying + '_showLinkHistory'] = ShowLinkHistory;
                    temp_center[positionOfDisplaying + '_ShowSolvingSteps'] = function (event) {
                        var $this = $(event.currentTarget);
                        var ID = $this.attr('id');
                        var _index = $this.parent().index();
                        var positionInPage = ['left', 'left', 'center', 'right', 'right',
                            'left', 'left', 'center', 'right', 'right'
                        ];
                        var stepsMsg = $this.children('.' + ($this.hasClass('up') ? 'up' : 'down') + '_solving_steps');
                        var indexInContents = 0;
                        for (var h = 0; h < contentsCenterData.length; h++) {
                            if (ID === contentsCenterData[h].up_hostId || ID === contentsCenterData[h].down_hostId) {
                                indexInContents = h;
                                break;
                            }
                        }
                        for (var i = 0; i < appWebMonitor.length; i++) {
                            /** 红灯就展示，前面已经做了判断，是红灯就一定有故障处理信息 */
                            /** appWebMonitor 需要做非空判断 */
                            for (var j = 0; j < appWebMonitor[i].length; j++) {
                                if (appWebMonitor[i][j] !== null && ID === appWebMonitor[i][j].key &&
                                    contentsCenterData[indexInContents][$this.hasClass('up') ? 'up_isred' : 'down_isred']) {
                                    stepsMsg.addClass(positionInPage[_index]).fadeIn(10);
                                    contentsCenterData[indexInContents][$this.hasClass('up') ? 'up_mouseEnter' : 'down_mouseEnter'] = true;
                                }
                                else if (appWebMonitor[i][j] !== null && ID === appWebMonitor[i][j].key &&
                                    contentsCenterData[indexInContents][$this.hasClass('up') ? 'up_isyellow' : 'down_isyellow']) {
                                    contentsCenterData[indexInContents][$this.hasClass('up') ? 'up_mouseenterYellow' : 'down_mouseenterYellow'] = true;
                                }
                                else if (appWebMonitor[i][j] !== null && ID === appWebMonitor[i][j].key &&
                                    contentsCenterData[indexInContents][$this.hasClass('up') ? 'up_isgreen' : 'down_isgreen']) {
                                    contentsCenterData[indexInContents][$this.hasClass('up') ? 'up_mouseenterGreen' : 'down_mouseenterGreen'] = true;
                                }
                            }
                        }
                        ;
                    };

                    temp_center[positionOfDisplaying + '_HideSolvingSteps'] = function (event) {
                        var $this = $(event.currentTarget);
                        var position = $this.hasClass('up') ? 'up' : 'down';
                        var ID = $this.attr('id');
                        var indexInContents = 0;
                        for (var h = 0; h < contentsCenterData.length; h++) {
                            if (ID === contentsCenterData[h].up_hostId || ID === contentsCenterData[h].down_hostId) {
                                indexInContents = h;
                                break;
                            }
                        }
                        contentsCenterData[indexInContents][position + '_mouseEnter'] = false;
                        contentsCenterData[indexInContents][position + '_mouseenterYellow'] = false;
                        contentsCenterData[indexInContents][position + '_mouseenterGreen'] = false;
                        $this.children('.' + position + '_solving_steps').fadeOut(10);
                    };

                    /** 监控灯颜色（警报状态）的配置 */
                    {
                        var $this = appWebMonitor[h][i].dataBody;
                        // TODO 20K debugged on 3.21 cpu不用作非空判断
                        temp_center[positionOfDisplaying + '_cpu_percent'] = parseFloat($this.cpu.val);
                        temp_center[positionOfDisplaying + '_cpu_percent_green'] = false;
                        temp_center[positionOfDisplaying + '_cpu_percent_yellow'] = false;
                        temp_center[positionOfDisplaying + '_cpu_percent_red'] = false;
                        if (temp_center[positionOfDisplaying + '_cpu_percent'] <= 50) {
                            temp_center[positionOfDisplaying + '_cpu_percent_green'] = true;
                        } else if (temp_center[positionOfDisplaying + '_cpu_percent'] > 50 && temp_center[positionOfDisplaying + '_cpu_percent'] < 90) {
                            temp_center[positionOfDisplaying + '_cpu_percent_yellow'] = true;
                        } else {
                            temp_center[positionOfDisplaying + '_cpu_percent_red'] = true;
                        }

                        // TODO 20K debugged on 3.21 cpu不用作非空判断
                        temp_center[positionOfDisplaying + '_memory_percent'] = parseFloat($this.memUsedPer.val);
                        // temp_center[positionOfDisplaying + '_memory_percent'] = ($this.memUsed && $this.memTotal && parseFloat($this.memTotal.val) !== 0) ? (parseFloat(parseFloat($this.memUsed.val) / parseFloat($this.memTotal.val)) + '%') : '';
                        temp_center[positionOfDisplaying + '_memory_percent_green'] = false;
                        temp_center[positionOfDisplaying + '_memory_percent_yellow'] = false;
                        temp_center[positionOfDisplaying + '_memory_percent_red'] = false;
                        if (temp_center[positionOfDisplaying + '_memory_percent'] <= 50) {
                            temp_center[positionOfDisplaying + '_memory_percent_green'] = true;
                        } else if (temp_center[positionOfDisplaying + '_memory_percent'] > 50 && temp_center[positionOfDisplaying + '_' + 'memory_percent'] < 90) {
                            temp_center[positionOfDisplaying + '_memory_percent_yellow'] = true;
                        } else {
                            temp_center[positionOfDisplaying + '_' + 'memory_percent_red'] = true;
                        }
                        // TODO 20K debugged on 3.21 cpu不用作非空判断
                        temp_center[positionOfDisplaying + '_rspTime'] = $this.rsptime.val;
                        temp_center[positionOfDisplaying + '_time_percent_green'] = false;
                        temp_center[positionOfDisplaying + '_time_percent_yellow'] = false;
                        temp_center[positionOfDisplaying + '_time_percent_red'] = false;
                        if (temp_center[positionOfDisplaying + '_rspTime'] <= 1000) {
                            if (temp_center[positionOfDisplaying + '_rspTime'] <= 15) {
                                temp_center[positionOfDisplaying + '_time_percent'] = "13%";
                            } else if (temp_center[positionOfDisplaying + '_rspTime'] > 15 && temp_center[positionOfDisplaying + '_rspTime'] <= 55) {
                                temp_center[positionOfDisplaying + '_' + 'time_percent'] = "20%";
                            } else if (temp_center[positionOfDisplaying + '_rspTime'] > 55 && temp_center[positionOfDisplaying + '_rspTime'] <= 105) {
                                temp_center[positionOfDisplaying + '_time_percent'] = "30%";
                            } else {
                                temp_center[positionOfDisplaying + '_time_percent'] = "45%";
                            }
                            temp_center[positionOfDisplaying + '_time_percent_green'] = true;
                        } else if (temp_center[positionOfDisplaying + '_rspTime'] > 1000 && temp_center[positionOfDisplaying + '_rspTime'] < 2000) {
                            temp_center[positionOfDisplaying + '_time_percent'] = "70%";
                            temp_center[positionOfDisplaying + '_time_percent_yellow'] = true;
                        } else {
                            temp_center[positionOfDisplaying + '_time_percent'] = "93%";
                            temp_center[positionOfDisplaying + '_time_percent_red'] = true;
                        }

                        temp_center[positionOfDisplaying + '_status'] = appWebMonitor[h][i].status.trim().toLowerCase();
                        temp_center[positionOfDisplaying + '_isgreen'] = false;
                        temp_center[positionOfDisplaying + '_isyellow'] = false;
                        temp_center[positionOfDisplaying + '_isred'] = false;
                        temp_center[positionOfDisplaying + '_reducedUrl'] = '';
                        switch (temp_center[positionOfDisplaying + '_status']) {
                            case 'success':
                                temp_center[positionOfDisplaying + '_isgreen'] = true;
                                break;
                            case 'alert':
                                temp_center[positionOfDisplaying + '_isyellow'] = true;
                                temp_center[positionOfDisplaying + '_reducedUrl'] = temp_center[positionOfDisplaying + '_reduced'] ? iconReduce.unreduce : '';
                                break;
                            default:
                                temp_center[positionOfDisplaying + '_isred'] = true;
                                temp_center[positionOfDisplaying + '_reducedUrl'] = iconReduce.reduce;
                                try {
                                    temp_center[positionOfDisplaying + '_contacts'] = appWebSolvingStepsList[appWebMonitor[h][i].key].name;
                                    temp_center[positionOfDisplaying + '_steps'] = appWebSolvingStepsList[appWebMonitor[h][i].key].step;
                                } catch (e) {
                                    temp_center[positionOfDisplaying + '_contacts'] = '';
                                    temp_center[positionOfDisplaying + '_steps'] = '';
                                    console.log('\n');
                                    console.log('app,web故障处理处理信息的错误：');
                                    console.warn(e);
                                }
                                break;
                        }
                    }
                    ;
                };

                // 如果不是null，则对改web或者app进行配置，但是web或app的某些数据为null，这里不判断
                if (appWebMonitor[h][i] !== null) {
                    switch (appWebMonitor[h][i].dataBody.type.trim().toLowerCase()) {
                        case 'web':
                            /** 配置 WEB 的数据 */
                            config('up');
                            break;
                        case 'app':
                            /**　配置 APP 的数据 */
                            config('down');
                            break;
                    }
                }
            }
            contentsCenterData.push(temp_center);
            temp_center = {};
        }
        // 对应用状态排序，优先级依次降低：红黄绿
        contentsCenterData.sort(AppWebSort);
        contentsCenterPages = Math.ceil(contentsCenterData.length / 10);
    };
    AppWebConfig();
    Vue.component('app-web-monitor', {
        props: ['todo'],
        data: function () {
            return {
                appId: '监控点ID',
                contacts: '紧急联系人',
                steps: '故障处理步骤'
            }
        },
        template: '\
                <li class="contents_center_app">\
                    <div class="contents_center_list_cell up"\
                     v-bind:id=todo.up_hostId\
                     v-on:click=todo.up_showLinkHistory \
                     v-on:mouseenter=todo.up_ShowSolvingSteps\
                     v-on:mouseleave="todo.down_HideSolvingSteps"\
                     v-if="todo.up_hostId">\
                        <div class="cell_status_up" v-bind:class="{icom_green:todo.up_isgreen,icom_yellow:todo.up_isyellow,icom_red:todo.up_isred}"></div>\
                        <div class="cell_text">\
                            <div class="cell_text_link" \
                                 v-bind:class="{mouse_enter: todo.up_mouseEnter,\
                                         mouseenter_yellow: todo.up_mouseenterYellow,\
                                         mouseenter_green: todo.up_mouseenterGreen}">{{todo.up_hostname}}</div>\
                            <div class="cell_text_percent">\
                                <div class="cell_text_percent_left">\
                                    <div class="percent_left" v-bind:title=todo.up_cpu_percent>\
                                        <div class="percent_left_inner " \
                                             v-bind:class="{percent_inner_green:todo.up_cpu_percent_green,percent_inner_yellow:todo.up_cpu_percent_yellow,percent_inner_red:todo.up_cpu_percent_red}"\
                                             v-bind:style="{width:todo.up_cpu_percent}"></div>\
                                    </div>\
                                </div>\
                                <div class="cell_text_percent_right" ><span class="icom_cpu"></span></div>\
                            </div>\
                            <div class="cell_text_percent">\
                                <div class="cell_text_percent_left">\
                                    <div class="percent_left" v-bind:title=todo.up_memory_percent>\
                                        <div class="percent_left_inner" \
                                             v-bind:class="{percent_inner_green:todo.up_memory_percent_green,percent_inner_yellow:todo.up_memory_percent_yellow,percent_inner_red:todo.up_memory_percent_red}"\
                                             v-bind:style="{width:todo.up_memory_percent}"></div>\
                                    </div>\
                                </div>\
                                <div class="cell_text_percent_right"><span class="icom_memory"></span></div>\
                            </div>\
                            <div class="cell_text_percent">\
                                <div class="cell_text_percent_left">\
                                    <div class="percent_left" v-bind:title=todo.up_rspTime>\
                                        <div class="percent_left_inner" \
                                             v-bind:class="{percent_inner_green:todo.up_time_percent_green,percent_inner_yellow:todo.up_time_percent_yellow,percent_inner_red:todo.up_time_percent_red}"\
                                             v-bind:style="{width:todo.up_time_percent}"></div>\
                                    </div>\
                                </div>\
                                <div class="cell_text_percent_right"><span class="icom_clock"></span></div>\
                            </div>\
                        </div>\
                        <div class="up_solving_steps">\
                            <div class="contacts_wrapper"\>\
                                <div class="contacts_title">{{contacts}}</div>\
                                <div class="contacts_content">{{todo.up_contacts}}</div>\
                            </div>\
                            <div class="steps_wrapper">\
                                <div class="steps_title">{{steps}}</div>\
                                <div class="steps_content">\
                                    <div class="steps_content_text">{{todo.up_steps}}</div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    <div class="up_reduce_button up_reduce" v-show=todo.up_reducedUrl>\
                        <img class="up" v-bind:src=todo.up_reducedUrl v-on:click=todo.up_ReduceRank>\
                    </div>\
                    \
                    \
                    \
                    <div class="contents_center_list_cell down" v-bind:id=todo.down_hostId \
                     v-on:click=todo.down_showLinkHistory \
                     v-on:mouseenter=todo.down_ShowSolvingSteps\
                     v-on:mouseleave=todo.down_HideSolvingSteps\
                         v-if="todo.down_hostId">\
                        <div class="cell_status_down" v-bind:class="{icom_green:todo.down_isgreen,icom_yellow:todo.down_isyellow,icom_red:todo.down_isred}"></div>\
                        <div class="cell_text">\
                            <div class="cell_text_link_app" \
                                 v-bind:class="{mouse_enter: todo.down_mouseEnter,\
                                        mouseenter_yellow: todo.down_mouseenterYellow,\
                                        mouseenter_green: todo.down_mouseenterGreen\
                                        }">{{todo.down_hostname}}</div>\
                            <div class="cell_text_percent">\
                                <div class="cell_text_percent_left">\
                                    <div class="percent_left" v-bind:title=todo.down_cpu_percent>\
                                        <div class="percent_left_inner" \
                                             v-bind:class="{percent_inner_green:todo.down_cpu_percent_green,percent_inner_yellow:todo.down_cpu_percent_yellow,percent_inner_red:todo.down_cpu_percent_red}"\
                                             v-bind:style="{width:todo.down_cpu_percent}"></div>\
                                    </div>\
                                </div>\
                                <div class="cell_text_percent_right" ><span class="icom_cpu"></span></div>\
                            </div>\
                            <div class="cell_text_percent">\
                                <div class="cell_text_percent_left">\
                                    <div class="percent_left" v-bind:title=todo.down_memory_percent>\
                                        <div class="percent_left_inner" \
                                             v-bind:class="{percent_inner_green:todo.down_memory_percent_green,percent_inner_yellow:todo.down_memory_percent_yellow,percent_inner_red:todo.down_memory_percent_red}"\
                                             v-bind:style="{width:todo.down_memory_percent}"></div>\
                                    </div>\
                                </div>\
                                <div class="cell_text_percent_right"><span class="icom_memory"></span></div>\
                            </div>\
                            <div class="cell_text_percent">\
                                <div class="cell_text_percent_left">\
                                    <div class="percent_left" v-bind:title=todo.down_rspTime>\
                                        <div class="percent_left_inner" \
                                             v-bind:class="{percent_inner_green:todo.down_time_percent_green,percent_inner_yellow:todo.down_time_percent_yellow,percent_inner_red:todo.down_time_percent_red}"\
                                             v-bind:style="{width:todo.down_time_percent}"></div>\
                                    </div>\
                                </div>\
                                <div class="cell_text_percent_right"><span class="icom_clock"></span></div>\
                            </div>\
                        </div>\
                        <div class="down_solving_steps"\
                                    v-on:mouseenter=todo.down_ShowSolvingSteps\
                                    v-on:mouseleave=todo.down_HideSolvingSteps>\
                            <div class="contacts_wrapper">\
                                <div class="contacts_title">{{contacts}}</div>\
                                <div class="contacts_content">{{todo.down_contacts}}</div>\
                            </div>\
                            <div class="steps_wrapper">\
                                <div class="steps_title">{{steps}}</div>\
                                <div class="steps_content">\
                                    <div class="steps_content_text">{{todo.down_steps}}</div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    <div class="down_reduce_button down_reduce" v-show=todo.down_reducedUrl>\
                        <img class="down" v-bind:src=todo.down_reducedUrl v-on:click=todo.down_ReduceRank>\
                    </div>\
                </li>'
    });
}
; // 栅栏
/** ------ END ------ app-web-monitor component（cpu，memory，rsptime，报警灯颜色，报警转状态排序） --------- END -------- */


/** ------ START ------ link-history component ------ START ------ */
{
    var linkNameList = [];
    var GetLinkHistory = function (event) {
        console.log('\n');
        console.log('******************************');
        console.log('executing GetLinkHistory');
        var $this_out = $(event.currentTarget);
        var ID = event.currentTarget.id;
        $('#current_link').text($this_out.text());
        var indexOfAppWebMonitor = 0;
        var indexOfAppWeb = 0;
        var heartUrl = '';
        var doGoOn = true;
        for (var h = 0; h < ticketsVerify.length; h++) {
            if (ID === ticketsVerify[h].key) {
                index = h;
                try {
                    if (ticketsVerify[index].dataBody.httpCheckCode != null) {
                        heartUrl = urlMd.heart + 'key=' + ticketsVerify[index].key + '&' + 'httpCheckCode=' + ticketsVerify[index].dataBody.httpCheckCode;
                    }
                    else {
                        heartUrl = "暂无心跳地址";
                    }
                } catch (e) {
                    console.log('\n');
                    console.log('客票验证的心跳地址错误：');
                    console.warn(e);
                    heartUrl = '暂无心跳地址';
                }
                new_monitor_console.$data.noHeartUrl = (heartUrl === '暂无心跳地址');
                doGoOn = false;
                break;
            }
        }
        ;
        if (doGoOn) {
            for (var i = 0; i < appWebMonitor.length; i++) {
                /** 此处需要做非空判断 */
                for (var j = 0; j < appWebMonitor[i].length; j++) {
                    if (appWebMonitor[i][j] !== null && ID === appWebMonitor[i][j].key) {
                        indexOfAppWebMonitor = i; // TODO 需要注意哦！
                        indexOfAppWeb = j;
                        try {
                            if (appWebMonitor[indexOfAppWebMonitor][indexOfAppWeb].dataBody.httpCheckCode != null) {
                                heartUrl = urlMd.heart + 'key=' + appWebMonitor[indexOfAppWebMonitor][indexOfAppWeb].key + '&httpCheckCode=' + appWebMonitor[indexOfAppWebMonitor][indexOfAppWeb].dataBody.httpCheckCode;
                            }
                            else {
                                heartUrl = "暂无心跳地址";
                            }
                        } catch (e) {
                            heartUrl = '暂无心跳地址';
                            console.log('\n');
                            console.log('app,web的心跳地址错误：');
                            console.warn(e);
                        }
                        new_monitor_console.$data.noHeartUrl = (heartUrl === '暂无心跳地址');
                        doGoOn = false;
                        break;
                    }
                }
            }
            ;
        }
        $(".echart_links_list").each(function () {
            var $this = $(this);
            if (parseInt($this.attr("id")) == parseInt(ID)) {
                $this.addClass("links_list_select");
                $("#current_link").text($this.text());
            } else {
                $this.removeClass("links_list_select");
            }
        });
        fnGetCpu(urlMd.history + ID + "/cpu/" + getNowFormatDate());
        if (cpuTime.length > 0 && cpuValue.length > 0) {
            $("#cpu_chart").html("");
            CreatechartCpu();
        } else {
            $("#cpu_chart").html("");
            $("#cpu_chart").append("<div class='nochart'><p class='nochart_title'>CPU 趋势（%）</p>\
            <p class='nochart_text'>暂无数据</p></div>");
        }
        fnGetMemory(urlMd.history + ID + '/memory/' + getNowFormatDate());
        if (memoryTime.length > 0 && memoryValue.length > 0) {
            $("#memory_chart").html("");
            CreatechartMemory();
        } else {
            $("#memory_chart").html("");
            $("#memory_chart").append("<div class='nochart'><p class='nochart_title'>内存趋势（GB）</p>\
            <p class='nochart_text'>暂无数据</p></div>");
        }
        fnGetResptime(urlMd.history + ID + "/resptime/" + getNowFormatDate());
        if (resptimeTime.length > 0 && resptimeValue.length > 0) {
            $("#resptime_chart").html("");
            CreatechartResptime();
        } else {
            $("#resptime_chart").html("");
            $("#resptime_chart").append("<div class='nochart'><p class='nochart_title'>响应时间（ms）</p>\
            <p class='nochart_text'>暂无数据</p></div>");
        }
        fnGetqps(urlMd.history + ID + "/qps/" + getNowFormatDate());
        if (qpsTime.length > 0 && qpsValue.length > 0) {
            $("#qps_chart").html("");
            CreatechartQPS();
        } else {
            $("#qps_chart").html("");
            $("#qps_chart").append("<div class='nochart'><p class='nochart_title'>请求次数（次数）</p>\
            <p class='nochart_text'>暂无数据</p></div>");
        }
        fnGetDisk(urlMd.history + ID + "/disk/" + getNowFormatDate());
        if (diskTime.length > 0 && diskData.length > 0) {
            $("#disk_chart").html("");
            CreatechartDisk();
        } else {
            $("#disk_chart").html("");
            $("#disk_chart").append("<div class='nochart'><p class='nochart_title'>磁盘空间（百分比）</p>\
            <p class='nochart_text'>暂无数据</p></div>");
        }
        $('.ops_new_window a').html(heartUrl).attr('href', heartUrl);
    };
    var linkHistoryConfig = function () {
        linkNameList = [];
        var linkName_temp = {};
        for (var i = 0; i < appWebMonitor.length; i++) {
            for (var j = 0; j < appWebMonitor[i].length; j++) {
                /** 需要做非空判断 */
                if (appWebMonitor[i][j] !== null) {
                    linkName_temp.linkIP = appWebMonitor[i][j].dataBody.type + ' ' + appWebMonitor[i][j].dataBody.ip;
                    linkName_temp.hostID = appWebMonitor[i][j].key;
                    /**　上面已经做过非空判断了，GetLinkHistory 还需要做非空判断吗？视情况而定 TODO */
                    linkName_temp.GetLinkHistory = GetLinkHistory;
                    linkNameList.push(linkName_temp);
                    linkName_temp = {};
                }
            }
        }
        for (var j = 0; j < ticketsVerify.length; j++) {
            linkName_temp.linkIP = ticketsVerify[j].dataBody.type + ' ' + ticketsVerify[j].dataBody.ip;
            linkName_temp.hostID = ticketsVerify[j].key;
            linkName_temp.GetLinkHistory = GetLinkHistory;
            linkNameList.push(linkName_temp);
            linkName_temp = {};
        }
        return linkNameList;
    }
    linkHistoryConfig();
    Vue.component('link-history', {
        props: ['todo'],
        template: '<li class="echart_links_list"\
             v-bind:id="todo.hostID" \
             v-on:click="todo.GetLinkHistory" >\
            {{todo.linkIP}}\
            </li>'
    });
}
;// 栅栏
/** ------ END ------ link-history component ------ END ------ */


/** ------ START ------ interface-alert-list component ------ START ------ */
{
    var interfacesAlertListData = {};
    var interfacesAlertList = null;
    var InterfacesAlertConfig = function () {
        interfacesAlertListData = {};
        var temp_interfacesAlertList = [];
        var temp_interfaceAlert = {};
        var temp_key = '';
        for (var i = 0; i < interfacesMonitor.length; i++) {
            // TODO 20K debugged on 3.26 appId改为key
            temp_key = interfacesMonitor[i].key;
            for (var j = 0; j < interfacesMonitor[i].dataBody.length; j++) {
                // TODO 20K debugged on 3.22 id改为key
                temp_interfaceAlert.id = interfacesMonitor[i].key;
                temp_interfaceAlert.fristName = interfacesMonitor[i].name.split('[')[0];
                // TODO 20K debugged on 3.26 typename改为type
                temp_interfaceAlert.secondName = (interfacesMonitor[i].dataBody[j].type != null && interfacesMonitor[i].dataBody[j].type != '') ? interfacesMonitor[i].dataBody[j].type : '/';
                temp_interfaceAlert.lastName = (interfacesMonitor[i].dataBody[j].name != null && interfacesMonitor[i].dataBody[j].name != '') ? interfacesMonitor[i].dataBody[j].name : '/';
                // TODO 2OK debugged on 3.22 id改为httpCheckCode
                // temp_interfaceAlert.httpstepid = interfacesMonitor[i].dataBody[j].httpCheckcode != null ? interfacesMonitor[i].dataBody[j].httpCheckcode : '/';
                temp_interfaceAlert.reqTime = (interfacesMonitor[i].dataBody[j].rsptime != null && interfacesMonitor[i].dataBody[j].rsptime != '') ? interfacesMonitor[i].dataBody[j].rsptime : '/';

                temp_interfaceAlert.reqCode = (interfacesMonitor[i].dataBody[j].rspcode != null && interfacesMonitor[i].dataBody[j].rspcode != '') ? interfacesMonitor[i].dataBody[j].rspcode : '/';

                temp_interfaceAlert.status = (interfacesMonitor[i].dataBody[j].status != null && interfacesMonitor[i].dataBody[j].status != '') ? interfacesMonitor[i].dataBody[j].status : '/';
                temp_interfaceAlert.latestTime = (interfacesMonitor[i].dataBody[j].lastclock != null && interfacesMonitor[i].dataBody[j].lastclock != '') ? interfacesMonitor[i].dataBody[j].lastclock : '/';
                temp_interfaceAlert.errorTimes = (interfacesMonitor[i].dataBody[j].errorNum != null && interfacesMonitor[i].dataBody[j].errorNum != '') ? interfacesMonitor[i].dataBody[j].errorNum : '/';

                temp_interfaceAlert.diskShowStatus = (interfacesMonitor[i].dataBody[j].diskShowStatus != null && interfacesMonitor[i].dataBody[j].diskShowStatus != '') ? interfacesMonitor[i].dataBody[j].diskShowStatus : '/';
                temp_interfaceAlert.diskShowColor = interfacesMonitor[i].dataBody[j].diskShowColor;
                temp_interfaceAlert.cpuStatus = (interfacesMonitor[i].dataBody[j].cpuStatus != null && interfacesMonitor[i].dataBody[j].cpuStatus != '') ? interfacesMonitor[i].dataBody[j].cpuStatus : '/';
                temp_interfaceAlert.cpuStatusColor = interfacesMonitor[i].dataBody[j].cpuStatusColor;
                temp_interfaceAlert.diskStatus = (interfacesMonitor[i].dataBody[j].diskStatus != null && interfacesMonitor[i].dataBody[j].diskStatus != '') ? interfacesMonitor[i].dataBody[j].diskStatus : '/';
                temp_interfaceAlert.diskStatusColor = interfacesMonitor[i].dataBody[j].diskStatusColor;
                temp_interfaceAlert.optDiskStatus = (interfacesMonitor[i].dataBody[j].optDiskStatus != null && interfacesMonitor[i].dataBody[j].optDiskStatus != '') ? interfacesMonitor[i].dataBody[j].optDiskStatus : '/';
                temp_interfaceAlert.optDiskStatusColor = interfacesMonitor[i].dataBody[j].optDiskStatusColor;
                temp_interfaceAlert.dataDiskStatus = (interfacesMonitor[i].dataBody[j].dataDiskStatus != null && interfacesMonitor[i].dataBody[j].dataDiskStatus != '') ? interfacesMonitor[i].dataBody[j].dataDiskStatus : '/';
                temp_interfaceAlert.dataDiskStatusColor = interfacesMonitor[i].dataBody[j].dataDiskStatusColor;
                temp_interfaceAlert.momeryStatus = (interfacesMonitor[i].dataBody[j].momeryStatus != null && interfacesMonitor[i].dataBody[j].momeryStatus != '') ? interfacesMonitor[i].dataBody[j].momeryStatus : '/';
                temp_interfaceAlert.momeryStatusColor = interfacesMonitor[i].dataBody[j].momeryStatusColor;
                temp_interfaceAlert.connectNum = (interfacesMonitor[i].dataBody[j].connectNum != null && interfacesMonitor[i].dataBody[j].connectNum != '') ? interfacesMonitor[i].dataBody[j].connectNum : '/';
                temp_interfaceAlert.isRestart = (interfacesMonitor[i].dataBody[j].connectNum != null ) ? interfacesMonitor[i].dataBody[j].connectNum : false;

                // TODO 20K debugged on 3.21
                try {
                    if (interfacesMonitor[i].dataBody[j].httpCheckCode != null && interfacesMonitor[i].dataBody[j].httpCheckCode != '') {
                        temp_interfaceAlert.url = urlMd.heart + 'key=' + interfacesMonitor[i].key + '&httpCheckCode=' + interfacesMonitor[i].dataBody[j].httpCheckCode;
                    }
                    else {
                        temp_interfaceAlert.url = false;
                    }

                    if (interfacesMonitor[i].dataBody[j].details != null && interfacesMonitor[i].dataBody[j].details.length > 0) {
                        var details = [];
                        for (var k = 0; k < interfacesMonitor[i].dataBody[j].details.length; k++) {
                            details[k] = interfacesMonitor[i].dataBody[j].details[k];
                        }
                        temp_interfaceAlert.details = details;
                        // alert(details);
                        details = [];
                    }
                    else {
                        temp_interfaceAlert.details = false;
                    }
                    if (interfacesMonitor[i].dataBody[j].shardList != null && interfacesMonitor[i].dataBody[j].shardList.length > 0) {
                        var shardList = [];
                        for (var k = 0; k < interfacesMonitor[i].dataBody[j].shardList.length; k++) {
                            shardList[k] = interfacesMonitor[i].dataBody[j].shardList[k];
                        }
                        temp_interfaceAlert.shardList = shardList;
                        // alert(details);
                        shardList = [];
                    }
                    else {
                        temp_interfaceAlert.shardList = false;
                    }
                    if (interfacesMonitor[i].dataBody[j].rocketMqMesList != null && interfacesMonitor[i].dataBody[j].rocketMqMesList.length > 0) {
                        var rocketMqMesList = [];
                        for (var k = 0; k < interfacesMonitor[i].dataBody[j].rocketMqMesList.length; k++) {
                            rocketMqMesList[k] = interfacesMonitor[i].dataBody[j].rocketMqMesList[k];
                        }
                        temp_interfaceAlert.rocketMqMesList = rocketMqMesList;
                        // alert(details);
                        rocketMqMesList = [];
                    }
                    else {
                        temp_interfaceAlert.rocketMqMesList = false;
                    }
                } catch (error) {
                    temp_interfaceAlert.url = false;
                }
                temp_interfaceAlert.look = "查看";
                temp_interfaceAlert.warmColorError = (interfacesMonitor[i].dataBody[j].status.trim().toLowerCase() === 'error');
                temp_interfaceAlert.warmColorAlert = (interfacesMonitor[i].dataBody[j].status.trim().toLowerCase() === 'alert');
                temp_interfaceAlert.individuation = interfacesMonitor[i].dataBody[j].individuation;
                temp_interfaceAlert.restart = function (todo) {

                    alert("已经开始重启！");
                    var txt = "提示文字，提示文字，提示文字，提示文字，提示文字，提示文字";
                    window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);

                }

                temp_interfaceAlert.MQMsg = function (ip_port, rocketMqMesList) {
                    $(".socketMQMsgAlert  span.nochart_title").html(ip_port);
                    for (var i = 0; i < rocketMqMesList.length; i++) {
                        var line = rocketMqMesList[i];
                        if (!isEmpty(line)) {
                            var spite = line.split(":");
                            $("#" + spite[0]).text(line);
                        }
                    }
                    $('#socketMQMsgAlert').show();

                }
                temp_interfaceAlert.shardMsg = function (shardList) {
                    if (isEmpty(shardList) || shardList.length == 0) {
                        return;
                    }
                    var tableContext = "";
                    for (var i = 0; i < shardList.length; i++) {
                        var status = "未知"
                        if (parseInt(shardList[i].state) == 1) {
                            status = "SUCCESS"
                        } else {
                            status = "ERROR"
                        }
                        var cos = "<li class=\"test_table_list\">\n" +
                            " <p class=\"test_table_list_text \">" + parseInt(i + 1) + "</p>\n" +
                            " <p class=\"test_table_list_text \">" + shardList[i]._id + "</p>\n" +
                            " <p class=\"test_table_list_text \" style=\"width: 55%;\">" + shardList[i].host + "</p>\n" +
                            " <p class=\"test_table_list_text \" style=\"width: 14%;border-right: solid 0px #3bd3d4;\">" + status +
                            "</p>\n" +
                            " </li>";
                        tableContext = tableContext + cos;
                    }
                    $("#shardUl").html(tableContext);

                    $('#shardAlert').show();

                }
                temp_interfaceAlert.alertMsg = function (todo) {
                    ip_port = todo.lastName;
                    details = todo.details;
                    $(".alert_contents_echart_title  span").html(ip_port);
                    $("#detailsAlert").removeClass("hidden");
                    $("#detailsAlert").show();
                    $("#alert_contents_echart").removeClass("hidden");
                    var result = "";
                    var dataMap = {};
                    for (var i = 0; i < details.length; i++) {
                        var item = details[i];
                        var spite = item.split(":");
                        dataMap[spite[0]] = spite[1];
                    }
                    var used_memory = dataMap['used_memory'];
                    var used_memory_rss = dataMap['used_memory_rss'];
                    var total_disk = dataMap['total_disk'];
                    var used_disk = dataMap['used_disk'];
                    var opt_total_disk = dataMap['opt_total_disk'];
                    var opt_used_disk = dataMap['opt_used_disk'];
                    var data_total_disk = dataMap['data_total_disk'];
                    var data_used_disk = dataMap['data_used_disk'];
                    var connected_clients = dataMap['connected_clients'];
                    var free_cpu = dataMap['free_cpu'];
                    var used_cpu = dataMap['used_cpu'];


                    var current = dataMap['current'];

                    var resident = dataMap['resident'];
                    var mapped = dataMap['mapped'];
                    var mysql_connected_clients = dataMap['mysql_connected_clients'];
                    //redis、mongodb内存
                    if (!isEmpty(used_memory) && !isEmpty(used_memory_rss)) {
                        $("#redis_details > div > p.nochart_title").html("REDIS内存的使用情况");
                        if (todo.momeryStatusColor) {
                            $("#redis_details > div > p.nochart_text").html("<br />" + "<br />" + "<b class='cpu_disk_error_color'>" + Math.round(parseInt(used_memory) / 1024 / 1024 * 100) / 100 + "M(已用)/" + Math.round(parseInt(used_memory_rss) / 1024 / 1024 * 100) / 100 + "M(总数)" + "</b>");
                        } else {
                            $("#redis_details > div > p.nochart_text").html("<br />" + "<br />" + Math.round(parseInt(used_memory) / 1024 / 1024 * 100) / 100 + "M(已用)/" + Math.round(parseInt(used_memory_rss) / 1024 / 1024 * 100) / 100 + "M(总数)");
                        }
                    }
                    else if (!isEmpty(resident) && resident != "0" && !isEmpty(mapped) && mapped != "0") {
                        $("#redis_details > div > p.nochart_title").html("MONGODB内存的使用情况");
                        if (todo.momeryStatusColor) {
                            $("#redis_details > div > p.nochart_text").html("<br />" + "<br />" + "<b class='cpu_disk_error_color'>" + Math.round(parseInt(resident) * 100) / 100 + "M(已用)/" + Math.round(parseInt(mapped) * 100) / 100 + "M(总数)" + "</b>");
                        } else {
                            $("#redis_details > div > p.nochart_text").html("<br />" + "<br />" + Math.round(parseInt(resident) * 100) / 100 + "M(已用)/" + Math.round(parseInt(mapped) * 100) / 100 + "M(总数)");
                        }
                    }
                    else {
                        $("#redis_details > div > p.nochart_title").html("");
                        $("#redis_details > div > p.nochart_text").html("<br />" + "<br />" + "暂无数据");
                    }
                    //cpu
                    if (!isEmpty(free_cpu) && free_cpu != "0" && !isEmpty(used_cpu) && used_cpu != "0") {
                        if (todo.cpuStatusColor) {
                            $("#cpu_details> div > p.nochart_text").html("<br />" + "<br />" + "<b class='cpu_disk_error_color'>" + Math.round(parseInt(used_cpu * 100)) / 100 + "%(在用)/" + Math.round(parseInt(free_cpu * 100)) / 100 + "%(空闲)" + "</b>");
                        } else {
                            $("#cpu_details > div > p.nochart_text").html("<br />" + "<br />" + Math.round(parseInt(used_cpu * 100)) / 100 + "%(在用)/" + Math.round(parseInt(free_cpu * 100)) / 100 + "%(空闲)");
                        }
                    } else {
                        $("#cpu_details > div > p.nochart_text").html("<br />" + "<br />" + "暂无数据");
                    }
                    //磁盘
                    if (!isEmpty(total_disk) && !isEmpty(used_disk)) {
                        if (todo.diskStatusColor) {
                            $("#disk_details > div > p.nochart_text").html("<b class='cpu_disk_error_color'>" + "【/:】" + Math.round(parseInt(used_disk) / 1024 / 1024 * 100) / 100 + "M(已用)/" + Math.round(parseInt(total_disk) / 1024 / 1024 * 100) / 100 + "M(总数)" + "</b>");
                        } else {
                            $("#disk_details > div > p.nochart_text").html("【/:】" + Math.round(parseInt(used_disk) / 1024 / 1024 * 100) / 100 + "M(已用)/" + Math.round(parseInt(total_disk) / 1024 / 1024 * 100) / 100 + "M(总数)");
                        }
                        if (!isEmpty(opt_total_disk) && !isEmpty(opt_used_disk)) {
                            if (todo.optDiskStatusColor) {
                                $("#disk_details > div > p.nochart_text").html($("#disk_details > div > p.nochart_text").html() + "<br />" + "<b class='cpu_disk_error_color'>" + "【/opt:】" + Math.round(parseInt(opt_used_disk) / 1024 / 1024 * 100) / 100 + "M(已用)/" + Math.round(parseInt(opt_total_disk) / 1024 / 1024 * 100) / 100 + "M(总数)" + "</b>");
                            } else {
                                $("#disk_details > div > p.nochart_text").html($("#disk_details > div > p.nochart_text").html() + "<br />" + "【/opt:】" + Math.round(parseInt(opt_used_disk) / 1024 / 1024 * 100) / 100 + "M(已用)/" + Math.round(parseInt(opt_total_disk) / 1024 / 1024 * 100) / 100 + "M(总数)");
                            }
                            if (!isEmpty(data_total_disk) && !isEmpty(data_used_disk)) {
                                if (todo.dataDiskStatusColor) {
                                    $("#disk_details > div > p.nochart_text").html($("#disk_details > div > p.nochart_text").html() + "<br />" + "<b class='cpu_disk_error_color'>" + "【/data:】" + Math.round(parseInt(data_used_disk) / 1024 / 1024 * 100) / 100 + "M(已用)/" + Math.round(parseInt(data_total_disk) / 1024 / 1024 * 100) / 100 + "M(总数)" + "</b>");
                                } else {
                                    $("#disk_details > div > p.nochart_text").html($("#disk_details > div > p.nochart_text").html() + "<br />" + "【/data:】" + Math.round(parseInt(data_used_disk) / 1024 / 1024 * 100) / 100 + "M(已用)/" + Math.round(parseInt(data_total_disk) / 1024 / 1024 * 100) / 100 + "M(总数)");
                                }
                            }
                        }
                    } else {
                        $("#disk_details > div > p.nochart_text").html("<br />" + "<br />" + "暂无数据");
                    }
                    //redis、mongodb连接数
                    if (!isEmpty(connected_clients)) {
                        $("#connected_details > div > p.nochart_title").html("REDIS连接数");
                        $("#connected_details > div > p.nochart_text").html("<br />" + "<br />" + connected_clients);
                    }
                    else if (!isEmpty(current)) {
                        $("#connected_details > div > p.nochart_title").html("MONGODB连接数");
                        $("#connected_details > div > p.nochart_text").html("<br />" + "<br />" + parseInt(current));
                    }
                    else if (!isEmpty(mysql_connected_clients)) {
                        $("#connected_details > div > p.nochart_title").html("MYSQL连接数");
                        $("#connected_details > div > p.nochart_text").html("<br />" + "<br />" + parseInt(mysql_connected_clients));
                    }
                    else {
                        $("#connected_details > div > p.nochart_title").html("");
                        $("#connected_details > div > p.nochart_text").html("<br />" + "<br />" + "暂无数据");
                    }

                };
                temp_interfacesAlertList.push(temp_interfaceAlert);
                temp_interfaceAlert = {};
            }
            interfacesAlertListData[temp_key] = temp_interfacesAlertList;
            temp_interfacesAlertList = [];
            temp_key = '';
        }
        if (checkingInterfacesAppId) {
            interfacesAlertList = interfacesAlertListData[checkingInterfacesAppId];
        }
    };

//判断字符是否为空的方法
    function isEmpty(obj) {
        if (typeof obj == "undefined" || obj == null || obj == "" || obj == "null") {
            return true;
        } else {
            return false;
        }
    }

    InterfacesAlertConfig();

    Vue.component("interface-alert-list", {
        props: ['todo'],
        template: '\
                <li class="test_table_list" v-bind:class="{warm_error:todo.warmColorError, warm_alert:todo.warmColorAlert}">\
                    <p class="test_table_list_text test_table_list_text_ip" v-bind:title="todo.lastName">{{todo.lastName}}</p>\
                    <p class="test_table_list_text test_table_list_text_secondName">{{todo.secondName}}</p>\
                    <p class="test_table_list_text test_table_list_text_reqTime">{{todo.reqTime}}</p>\
                    <p class="test_table_list_text test_table_list_text_reqCode">{{todo.reqCode}}</p>\
                    <p class="test_table_list_text test_table_list_text_status">{{todo.status}}</p>\
                    <p class="test_table_list_text test_table_list_text_latestTime">{{todo.latestTime}}</p>\
                    \
                    \
                    \
                    <p class="test_table_list_text test_table_list_text_errorTimes" >{{todo.errorTimes}}</p>\
                    <p class="test_table_list_text test_table_list_text_look">\
                    <a v-if=todo.url v-bind:href=todo.url target="_blank">{{todo.look}}</a>\
                    <a v-if=todo.details v-on:click=todo.alertMsg(todo)>详情</a>\
                    <a v-if=todo.shardList v-on:click=todo.shardMsg(todo.shardList)>分片</a>\
                    <a v-if=todo.rocketMqMesList v-on:click=todo.MQMsg(todo.lastName,todo.rocketMqMesList)>MQmsg</a>\
                    <a v-if=todo.isRestart v-on:click=todo.restart(todo)>重启</a>\
                    <span v-if=!todo.url&&!todo.details&&!todo.shardList&&!todo.rocketMqMesList&&!todo.isRestart>/</span>\
                    </p>\
                </li>'
    });


}
; // 栅栏
/** ------ END ------ interface-alert-list component ------ END ------ */

/** ------ START ------ server-alert component ------ START ------ */
{
    // var serverListData = {};
    // var serverList = null;
    var serverPortData = {};
    var ServerConfig = function () {
        serverPortData.port_name = serverMonitor.name;
        serverPortData.id = serverMonitor.key;
        serverPortData.showSteps = false;
        serverPortData.status = serverMonitor.status.trim().toLowerCase();
        serverPortData.reduced = serverMonitor.reduced;
        serverPortData.part_isgreen = false;
        serverPortData.part_isyellow = false;
        serverPortData.part_isred = false;
        serverPortData.mouseEnterRed = false;
        serverPortData.mouseEnterYellow = false;
        serverPortData.mouseEnterGreen = false;
        serverPortData.iconSrc_reduceButton = '';
        switch (serverPortData.status) {
            case 'success':
                serverPortData.part_isgreen = true;
                break;
            case 'alert':
                serverPortData.part_isyellow = true;
                if (serverPortData.reduced) {
                    // TODO 20K debugged on 3.22
                    serverPortData.iconSrc_reduceButton = iconReduce.unreduce;
                }
                break;
            default:
                serverPortData.part_isred = true;
                serverPortData.iconSrc_reduceButton = iconReduce.reduce;
                // TODO 20K debugged on 3.22
                break;
        }
        serverPortData.AlertList = function (event) {
            /**　停止轮播：轮播因为onmouseover已经停止，但是要阻止鼠标移出恢复轮播　*/
            interfacesTicketsSwiper.el.onmouseout = function () {
            };
            /** 恢复监控列表的轮播 */
            if (interfacesTicketPages > 1) {
                interfacesTicketsSwiper.autoplay.start();
                $('.book_interfaces_ticket').mouseout(function () {
                    interfacesTicketsSwiper.autoplay.start();
                });
            }
            $(".blackly").removeClass("hidden");
            $(".alert_contents_test").removeClass("hidden");
            $('.test_table_ul').removeClass('hidden');
            $('.ticket_verify_alert').addClass('hidden');

        };
        serverPortData.ReduceRank = function (event) {
            var $this = $(event.currentTarget);
            if (serverPortData.part_isred) {
                // 降级处理
                $.ajax({
                    type: 'get',
                    async: false,
                    url: urlMd.reduced + ID,
                    dataType: 'json',
                    success: function () {
                        /** 降级处理之后，立马刷新所有接口 */
                        RefreshAll();
                    },
                    error: function () {
                        console.log('强制降级失败。');
                    }
                })
            } else {
                // 还原处理
                $.ajax({
                    type: 'get',
                    async: false,
                    url: urlMd.unreduced + ID,
                    dataType: 'json',
                    success: function () {
                        /** 还原之后，立马刷新　*/
                        RefreshAll();
                    },
                    error: function () {
                        console.log('还原警报级别失败。')
                    }

                })
            }

        };
        // new_monitor_console.$data.serverPortData = serverPortData;
    };
    ServerConfig();
}
{
    var serverAlertData = {};
    var ServerAlertConfig = function () {
        serverAlertListData = {};
        if (checkingInterfacesAppId) {
            interfacesAlertList = interfacesAlertListData[checkingInterfacesAppId];
        }
    };

    // InterfacesAlertConfig();
    Vue.component('server-monitor', {
        props: ['todo'],
        template: "<li class='website_port_list'\
                v-bind:id='todo.id'>\
                    <div class='reduce_button' v-show='todo.part_isred || todo.reduced'>\
                        <img v-bind:src=todo.iconSrc_reduceButton v-on:click=todo.ReduceRank>\
                    </div>\
                    <p class='website_port_list_icom' v-on:click=todo.AlertList\
                    v-bind:class='{icom_green_bottom:todo.part_isgreen,\
                    icom_yellow_bottom:todo.part_isyellow,\
                    icom_red_bottom:todo.part_isred}'></p>\
                    <p class='website_port_list_name' \
                    v-bind:class='{mouseenter_red: todo.mouseEnterRed,mouseenter_yellow: todo.mouseEnterYellow,mouseenter_green:todo.mouseEnterGreen}'>\
                  {{todo.port_name}}\
                    </p>\
                </li>"
    });
    // 磁盘cpu弹窗组件
    Vue.component('individuation-window', {
        props: ['todo'],
        template: "\
            		<div class='individuation_win' v-bind:style={width:todo.winWidth}>\
            			<div class='individuation_win_content'>\
	            			<div id='individuation_win_close' class='individuation_win_close'>×</div>\
	            			<div class='individuation_win_title'>{{todo.title}}</div>\
        					<table class='individuation_win_table'>\
						        <tr>\
						        	<template v-for='(col ,index) in todo.cols'>\
										<th v-bind:style='{width:col.width}'>{{col.title}}</th>\
									</template>\
						        </tr>\
				            	<tr>\
				            		<td colspan='100'>\
				            			<div style='overflow-x: hidden;width: 100%;max-height: 502px;'>\
            								<table class='individuation_win_tab_tbody'>\
										        <template v-for='(row ,index) in todo.rows'>\
											        <tr v-bind:id='index' v-bind:style='{background:row.background}'>\
											        	<template v-for='(col ,index) in todo.cols'>\
															<td v-bind:style='{width:col.width}' v-html='row[col.field]'></td>\
														</template>\
													</tr>\
												</template>\
        									</table>\
            							</div>\
				            		</td>\
				            	</tr>\
				            </table>\
		         		<div>\
            		</div>"
    });


}
/** ------ END ------ server-alert component ------ END ------ */


/** ------ START ------ interfaces-monitor component ------ START ------ */
{
    var websitePortData = [];
    var interfacesErrorAppIds = [];
    var websitePortsPerPage = 28;
    var interfacesTicketPages = 0;
    var interfacesPages = 0;
    // Math.ceil((interfacesMonitor.length + 1) / websitePortsPerPage); // +1是因为要加上客票验证
    var scrollPointGap = 10;
    // 当用户查看某个监控点的监控详情时，详情展板的数据应该在自动刷新时，跟着更新。这就需要记录下当前的监控点ID
    var checkingInterfacesAppId = '';
    var stepsMsgList = {};
    var SortInterface = function (a, b) {
        var rankA = 0;
        var rankB = 0;
        a.part_isred ? rankA += 3 : rankA += 0;
        a.part_isyellow ? rankA += 2 : rankA += 0;
        a.part_isgreen ? rankA += 1 : rankA += 0;
        b.part_isred ? rankB += 3 : rankB += 0;
        b.part_isyellow ? rankB += 2 : rankB += 0;
        b.part_isgreen ? rankB += 1 : rankB += 0;
        return rankB - rankA;
    };
    var GetInterfacesSolutions = function (interfacesErrorAppIds) {
        $.ajax({
            type: 'get',
            async: false,
            url: urlMd.stepMsg + interfacesErrorAppIds.join(','),
            dataType: 'json',
            success: function (data) {
                interfacesErrorAppIds.length = 0;
                stepsMsgList = data.data;
                for (var j = 0; j < websitePortData.length; j++) {
                    if (websitePortData[j].part_isred || (websitePortData[j].part_isyellow && websitePortData[j].reduced)) {
                        // 添加非空判断
                        try {
                            websitePortData[j].contacts = stepsMsgList[websitePortData[j].id].name;
                            websitePortData[j].steps = stepsMsgList[websitePortData[j].id].step;
                        } catch (e) {
                            websitePortData[j].contacts = '';
                            websitePortData[j].steps = '';
                            console.log('\n');
                            console.log('接口监控的故障处理信息错误：');
                            console.warn(e);
                        }

                    }
                }
            },
            error: function () {
                console.log('监控点故障处理步骤接口获取数据失败。接口：newmonitor/console/stepMsg/');
            }
        })
    };
    var ShowInterfacesSolutions = function (event) {
        var $this = $(event.currentTarget);
        var $steps = $this.children(':last');
        var indexOfWebsitePortData = 0;
        var ID = event.currentTarget.id;
        for (var i = 0; i < websitePortData.length; i++) {
            // 获取当前interface在websitePortData中的索引
            if (ID === websitePortData[i].id) {
                indexOfWebsitePortData = i;
            }
        }
        ;
        // 根据灯的颜色--而不是根据status和reduced，决定是否显示故障处理步骤信息，
        if (websitePortData[indexOfWebsitePortData].part_isred) {
            var positionInPage = Math.ceil((indexOfWebsitePortData + 1) / 7) % 4;
            switch (positionInPage) {
                case 1:
                    $steps.addClass('up_left');
                    break;
                case 2:
                    $steps.addClass('up_right');
                    break;
                case 3:
                    $steps.addClass('down_left');
                    break;
                case 0:
                    $steps.addClass('down_right');
                    break;
            }
            websitePortData[indexOfWebsitePortData].mouseEnterRed = true;
            $steps.fadeIn(10);
        }
        else if (websitePortData[indexOfWebsitePortData].part_isyellow) {
            websitePortData[indexOfWebsitePortData].mouseEnterYellow = true;
        } else {
            websitePortData[indexOfWebsitePortData].mouseEnterGreen = true;
        }
    };
    var InterfacesConfig = function () {
        EmptyArray(websitePortData);
        interfacesTicketPages = Math.ceil((interfacesMonitor.length + 1) / websitePortsPerPage);
        interfacesPages = Math.ceil(interfacesMonitor.length / websitePortsPerPage);
        var temp = {};
        for (var i = 0; i < interfacesMonitor.length; i++) {
            temp.port_name = interfacesMonitor[i].name.split('[')[0];
            // TODO 20K debugged on 3.22
            temp.id = interfacesMonitor[i].key;
            temp.individuation = interfacesMonitor[i].individuation;//个性化展示标识
            temp.showSteps = false;
            temp.status = interfacesMonitor[i].status.trim().toLowerCase();
            temp.reduced = interfacesMonitor[i].reduced;
            temp.part_isgreen = false;
            temp.part_isyellow = false;
            temp.part_isred = false;
            temp.mouseEnterRed = false;
            temp.mouseEnterYellow = false;
            temp.mouseEnterGreen = false;
            temp.iconSrc_reduceButton = '';
            switch (temp.status) {
                case 'success':
                    temp.part_isgreen = true;
                    break;
                case 'alert':
                    temp.part_isyellow = true;
                    if (interfacesMonitor[i].reduced) {
                        // TODO 20K debugged on 3.22
                        interfacesErrorAppIds.push(interfacesMonitor[i].key);
                        temp.iconSrc_reduceButton = iconReduce.unreduce;
                    }
                    ;
                    break;
                default:
                    temp.part_isred = true;
                    temp.iconSrc_reduceButton = iconReduce.reduce;
                    // TODO 20K debugged on 3.22
                    interfacesErrorAppIds.push(interfacesMonitor[i].key);
                    break;
            }
            temp.contacts = '';
            temp.steps = '';
            temp.ShowSolvingSteps = ShowInterfacesSolutions;
            temp.HideSolvingSteps = function (event) {
                var $this = $(event.currentTarget);
                var index = 0;
                var ID = event.currentTarget.id;
                for (var i = 0; i < websitePortData.length; i++) {
                    if (ID === websitePortData[i].id) {
                        index = i;
                    }
                }
                websitePortData[index].mouseEnterRed = false;
                websitePortData[index].mouseEnterYellow = false;
                websitePortData[index].mouseEnterGreen = false;
                $this.children(':last').hide();
            };
            temp.AlertList = function (event) {
                /**　停止轮播：轮播因为onmouseover已经停止，但是要阻止鼠标移出恢复轮播　*/
                interfacesTicketsSwiper.el.onmouseout = function () {
                };

                // 通过DOM上面绑定的ID来确认弹窗数据。这种做法真的优雅吗？
                var ID = $(event.currentTarget).parent().attr('id');
                checkingInterfacesAppId = ID;
                interfacesAlertList = interfacesAlertListData[checkingInterfacesAppId];

                // 判断是否个性化展示弹窗
                var individuation = false;
                /** 恢复监控列表的轮播 */
                if (interfacesTicketPages > 1) {
                    interfacesTicketsSwiper.autoplay.start();
                    $('.book_interfaces_ticket').mouseout(function () {
                        interfacesTicketsSwiper.autoplay.start();
                    });
                }
                var application;
                for (var i = 0; i < websitePortData.length; i++) {
                    if (ID === websitePortData[i].id) {
                        individuation = websitePortData[i].individuation || false;
                        application = websitePortData[i];
                        break;
                    }
                }
                if (!individuation) {
                    new_monitor_console.$data.interfacesAlertList = interfacesAlertList;
                    $(".blackly").removeClass("hidden");
                    $(".alert_contents_test").removeClass("hidden");
                    $('.test_table_ul').removeClass('hidden');
                    $('.ticket_verify_alert').addClass('hidden');
                } else {
                    // 个性化弹窗
                    var data = getIndividuationShowData(application, interfacesAlertList);
                    new_monitor_console.$data.individuationShowData = data;
                    $(".individuation_wrapper").removeClass("hidden");
                    $(".blackly").addClass("hidden");
                }
            };
            temp.ReduceRank = function (event) {
                var $this = $(event.currentTarget);
                var ID = $this.parent().parent().attr('id');
                // 在websitePortData中的索引
                var index = 0;
                for (var i = 0; i < websitePortData.length; i++) {
                    if (ID === websitePortData[i].id) {
                        index = i;
                    }
                }
                if (websitePortData[index].part_isred) {
                    // 降级处理
                    $.ajax({
                        type: 'get',
                        async: false,
                        url: urlMd.reduced + ID,
                        dataType: 'json',
                        success: function () {
                            /** 降级处理之后，立马刷新所有接口 */
                            RefreshAll();
                        },
                        error: function () {
                            console.log('强制降级失败。');
                        }
                    })
                } else {
                    // 还原处理
                    $.ajax({
                        type: 'get',
                        async: false,
                        url: urlMd.unreduced + ID,
                        dataType: 'json',
                        success: function () {
                            /** 还原之后，立马刷新　*/
                            RefreshAll();
                        },
                        error: function () {
                            console.log('还原警报级别失败。')
                        }

                    })
                }
            };
            websitePortData.push(temp);
            temp = {};
        }
        ;
        // 按照警报状态对接口监控进行排序
        websitePortData.sort(SortInterface);
        InterfacesAlertConfig();
        if (interfacesErrorAppIds.length !== 0) {
            GetInterfacesSolutions(interfacesErrorAppIds);
        }
    };
    interfacesMonitor.length !== 0 ? InterfacesConfig() : false;

    // 个性化数据组装
    var getIndividuationShowData = function (application, details) {
//        	details = [{"httpRequest":{"method":"get","url":"http://10.68.34.35:8879/monitor/monitorTravelData"},"individuation":{"winWidth":"80%","statusDict":{"ALERT":"ALERT","error":"ERROR","success":"SUCCESS"},"pkField":"name","statusField":"status","columns":[{"field":"name","title":"服务名称"},{"field":"type","title":"服务类型"},{"field":"sampleNum","title":"样本数目"},{"field":"abnormalNum","title":"问题数据"},{"field":"checkTime","title":"检测时间","width":"160px"},{"field":"url","title":"查看","formatter":"function(){return  \"<a href = helper/http?target=\" + encodeURIComponent(\"{?}\") + \" target = _blank >查看</a>&nbsp;&nbsp;<a href=javascript:void(0); onclick=showIndividuationDetail(this) >详情</a>\"}"}],"detail":{"field":"details","columns":[{"field":"a","title":"A"},{"field":"b","title":"B"}]},"rows":[{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"success","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a1","b":"b1"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"success","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"success","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"ALERT","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"ALERT","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"success","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"success","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"success","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]}]}}];
//        	console.log("----返回数据----", details);
        var title = application.port_name + "监控列表";
        if (!details || details.length == 0) {
            return {title: title};//zabbix数据配置错误
        }
        // 默认只取一个其他忽略
        var individuation = details[0].individuation;
        if (!individuation) {
            return {title: title};//zabbix数据配置错误
        }
        var cols = individuation.columns || [];//字段数据
        var rows = individuation.rows || [];//具体数据
        var winWidth = individuation.winWidth || "1120px";//控制弹窗宽度
        var width = "150px";// 默认宽度
        var formatterFields = {};
        for (var i = 0; i < cols.length; i++) {
            var col = cols[i];
            if (i < cols.length - 1) {
                col.width = col.width || width;
            }
            if (col.formatter) {
                formatterFields[col.field] = col;
            }
        }
        //是否需要状态对照翻译-然后显示不同背景色
        var statusField = individuation.statusField;
        var statusDict = individuation.statusDict;
        var translateStatus = individuation.statusField && individuation.statusDict;

        // rows数据处理
        for (var k = 0; k < rows.length; k++) {
            var row = rows[k];
            // 1.formatter
            if (formatterFields) {
                for (var field in formatterFields) {
                    var col = formatterFields[field];
                    var fn = col.formatter.replace('{?}', row[field]);
                    fn = eval('(' + fn + ')');
                    row[field] = $.isFunction(fn) ? fn() : fn;
                }
            }
            // 状态对照翻译
            if (translateStatus) {
                var st = statusDict[row[statusField]];
                row.background = (st && status2color[st.toUpperCase()]) || '';
            }
        }
        return {
            winWidth: winWidth,
            title: title,
            cols: cols,
            rows: rows
        };
    };

    /**
     * 个性化二级弹窗
     */
    var showIndividuationDetail = function (_this) {
        // 二级弹窗
        var index = $(_this).parent().parent('tr').attr('id');
        if (index) {
            //var itemValues = [{"individuation":{"winWidth":"80%","statusDict":{"alram":"alram","error":"error","success":"success"},"pkField":"name","statusField":"status","columns":[{"field":"name","title":"服务名称"},{"field":"type","title":"服务类型"},{"field":"sampleNum","title":"样本数目"},{"field":"abnormalNum","title":"问题数据"},{"field":"checkTime","title":"检测时间"},{"field":"url","title":"查看","formatter":"<a href=\"?\" target=\"_blank\">查看</a>&nbsp;&nbsp;<a href=\"javascript:void(0);\" onclick=\"showIndividuationDetail(this)\">详情</a>"}],"detail":{"field":"details","columns":[{"field":"a","title":"A"},{"field":"b","title":"B"}]},"rows":[{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"alram","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a1","b":"b1"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]},{"name":"CBD订座PNR","checkTime":"2018-10-23 16:01:19","sampleNum":16,"abnormalNum":16,"type":"NPSFLIGHTDATE","status":"error","url":"http://10.68.34.35:8879/monitor/monitorTravelData?typeName=NPSFLIGHTDATE","details":[{"a":"a2","b":"b2"}]}]}}];
            var itemValues = interfacesAlertListData[checkingInterfacesAppId];
            var itemValue = itemValues[0];
            var individuation = itemValue.individuation;
            var detailDef = individuation.detail;
            var rows = individuation.rows;
            var _row = rows[index];
            var data = getIndividuationDetailData(detailDef, _row);
            new_monitor_console.$data.individuationDetailData = data;
            $(".individuation_wrapper_2").removeClass("hidden");
        } else {
            console.log("No find row index");
        }
    }

    /**
     * 个性化二级弹窗数据组装
     */
    var getIndividuationDetailData = function (detailDef, _row) {
        if (!detailDef || !_row) {
            return {};//未定义详情字段
        }
        var cols = detailDef.columns || [];//字段数据
        var rows = _row[detailDef.field] || [];//具体数据
        var title = "其他信息";
        var winWidth = "1120px";//控制弹窗宽度
        var width = "150px";// 默认宽度
        var formatterFields = {};
        for (var i = 0; i < cols.length; i++) {
            var col = cols[i];
            if (i < cols.length - 1) {
                col.width = col.width || width;
            }
            if (col.formatter) {
                formatterFields[col.field] = col;
            }
        }
        // rows数据处理
        // 1.formatter
        if (formatterFields) {
            for (var k = 0; k < rows.length; k++) {
                var row = rows[k];
                for (var field in formatterFields) {
                    var col = formatterFields[field];
                    var fn = col.formatter.replace('{?}', row[field]);
                    fn = eval('(' + fn + ')');
                    row[field] = $.isFunction(fn) ? fn() : fn;
                }
            }
        }
        return {
            winWidth: winWidth,
            title: title,
            cols: cols,
            rows: rows
        };
    };

    // 个性化弹窗组件
    Vue.component('individuation-window', {
        props: ['todo'],
        template: "\
            		<div class='individuation_win' v-bind:style={width:todo.winWidth}>\
            			<div class='individuation_win_content'>\
	            			<div id='individuation_win_close' class='individuation_win_close'>×</div>\
	            			<div class='individuation_win_title'>{{todo.title}}</div>\
        					<table class='individuation_win_table'>\
						        <tr>\
						        	<template v-for='(col ,index) in todo.cols'>\
										<th v-bind:style='{width:col.width}'>{{col.title}}</th>\
									</template>\
						        </tr>\
				            	<tr>\
				            		<td colspan='100'>\
				            			<div style='overflow-x: hidden;width: 100%;max-height: 502px;'>\
            								<table class='individuation_win_tab_tbody'>\
										        <template v-for='(row ,index) in todo.rows'>\
											        <tr v-bind:id='index' v-bind:style='{background:row.background}'>\
											        	<template v-for='(col ,index) in todo.cols'>\
															<td v-bind:style='{width:col.width}' v-html='row[col.field]'></td>\
														</template>\
													</tr>\
												</template>\
        									</table>\
            							</div>\
				            		</td>\
				            	</tr>\
				            </table>\
		         		<div>\
            		</div>"
    });

    // 个性化弹窗组件
    Vue.component('individuation-window-2', {
        props: ['todo'],
        template: "\
            		<div class='individuation_win' v-bind:style={width:todo.winWidth}>\
            			<div class='individuation_win_content'>\
	            			<div id='individuation_win_close_2' class='individuation_win_close'>×</div>\
	            			<div class='individuation_win_title'>{{todo.title}}</div>\
        					<table class='individuation_win_table'>\
						        <tr>\
						        	<template v-for='(col ,index) in todo.cols'>\
										<th v-bind:style='{width:col.width}'>{{col.title}}</th>\
									</template>\
						        </tr>\
				            	<tr>\
				            		<td colspan='100'>\
				            			<div style='overflow-x: hidden;width: 100%;max-height: 502px;'>\
            								<table class='individuation_win_tab_tbody'>\
										        <template v-for='(row ,index) in todo.rows'>\
											        <tr>\
											        	<template v-for='(col ,index) in todo.cols'>\
															<td v-bind:style='{width:col.width}' v-html='row[col.field]'></td>\
														</template>\
													</tr>\
												</template>\
        									</table>\
            							</div>\
				            		</td>\
				            	</tr>\
				            </table>\
		         		<div>\
            		</div>"
    });

    Vue.component('interfaces-monitor', {
        props: ['todo'],
        template: "<li class='website_port_list'\
                v-bind:id='todo.id'\
                v-on:mouseenter=todo.ShowSolvingSteps\
                v-on:mouseleave=todo.HideSolvingSteps>\
                    <div class='reduce_button' v-show='todo.part_isred || todo.reduced'>\
                        <img v-bind:src=todo.iconSrc_reduceButton v-on:click=todo.ReduceRank>\
                    </div>\
                    <p class='website_port_list_icom' v-on:click=todo.AlertList\
                    v-bind:class='{icom_green_bottom:todo.part_isgreen,\
                    icom_yellow_bottom:todo.part_isyellow,\
                    icom_red_bottom:todo.part_isred}'></p>\
                    <p class='website_port_list_name' \
                    v-bind:class='{mouseenter_red: todo.mouseEnterRed,mouseenter_yellow: todo.mouseEnterYellow,mouseenter_green:todo.mouseEnterGreen}'>\
                    {{todo.port_name}}\
                    </p>\
                    <div class='solving_steps'>\
                        <div class='contacts_wrapper'>\
                            <div class='contacts_title'>紧急联系人</div>\
                            <div class='contacts_content'>{{todo.contacts}}</div>\
                        </div>\
                        <div class='steps_wrapper'>\
                            <div class='steps_title'>故障处理步骤</div>\
                            <div class='steps_content'>\
                                <div class='steps_content_text'>{{todo.steps}}</div>\
                            </div>\
                        </div>\
                    </div>\
                </li>"
    });
    // 为了把组件中的todo这个很弱智的写法换成interface，改写了interface-monitor component TODO，
    // 等完工之后再替换
}
; // 栅栏
/** ------ END ------ interfaces-monitor component ------ END ------ */

/** ------ START ------ ticket-verify component ------ START ------ */
{
    var ticketVerifyData = {};
    var ticketVerifySolutions = [];
    var ticketHasErrorAppIds = [];
    var ticketPureErrorAppIds = [];
    var ticketReducedAppIds = [];
    var GetTicketVerifySolutions = function (ticketHasErrorAppIds) {
        $.ajax({
            type: 'get',
            url: urlMd.stepMsg + ticketHasErrorAppIds.join(','),
            async: false,
            dataType: 'json',
            success: function (data) {
                if (data.success) {
                    ticketVerifySolutions = data.data;
                }
            },
            error: function () {
                console.log('\n');
                console.warn('获取客票验证故障解决方案失败。')
            }
        });
    };
    var ShowFirstSolutions = function (event) {
        var $this = $(event.currentTarget);
        var $steps = $this.children(':last');
        // 获取当前监控灯在接口监控列表中的位置，从而确定solutions列表的展示位置
        if (ticketVerifyData.part_isred) {
            var positionInPage = Math.ceil(($this.index() + 1) / 7);
            switch (positionInPage) {
                case 1:
                    $steps.addClass('up_left');
                    break;
                case 2:
                    $steps.addClass('up_right');
                    break;
                case 3:
                    $steps.addClass('down_left');
                    break;
                case 4:
                    $steps.addClass('down_right');
                    break;
            }
            ;
            $steps.stop(false, true).fadeIn(10);
            ticketVerifyData.mouseEnterRed = true;
        }
        else if (ticketVerifyData.part_isyellow) {
            ticketVerifyData.mouseEnterYellow = true;
        }
        else {
            ticketVerifyData.mouseEnterGreen = true;
        }
    };
    var HideFirstSolutions = function (event) {
        var $this = $(event.currentTarget);
        var $steps = $this.children(':last');
        ticketVerifyData.mouseEnterRed = false;
        ticketVerifyData.mouseEnterYellow = false;
        ticketVerifyData.mouseEnterGreen = false;
        $steps.fadeOut(10);
    };
    var TicketReduceRank = function (event) {
        if (ticketVerifyData.part_isred) {
            // 降级处理
            ticketVerifyData.reduced = true;
            ticketVerifyData.part_isyellow = true;
            ticketVerifyData.reducedUrl = 'images/icon_unreduce.png';
            ticketVerifyData.status = 'alert';
            var reduceCounter = 0;
            for (var i = 0; i < ticketPureErrorAppIds.length; i++) {
                var toReduceCurrentAppId = ticketPureErrorAppIds[i];
                $.ajax({
                    type: 'get',
                    async: false,
                    url: urlMd.reduced + toReduceCurrentAppId,
                    success: function (data) {
                        reduceCounter++;
                        ticketReducedAppIds.push(toReduceCurrentAppId);
                        GetConsoleStatus();
                    },
                    error: function () {
                        console.log('\n');
                        console.warn('客票验证监控点appId为' + toReduceCurrentAppId + ', 强制降级失败。');
                    }
                });
            }
            ;
            RefreshAll();

            reduceCounter + 1 === ticketPureErrorAppIds.length ? (ticketPureErrorAppIds.length = 0) : false;
        } else if (ticketReducedAppIds.length !== 0) {
            // 还原处理
            ticketVerifyData.reduced = false;
            ticketVerifyData.part_isred = true;
            ticketVerifyData.reducedUrl = 'images/icon_reduce.png';
            ticketVerifyData.status = 'alert';
            var unreduceCounter = 0;
            for (var j = 0; j < ticketReducedAppIds.length; j++) {
                var toUnredceCurrentAppId = ticketReducedAppIds[j];
                $.ajax({
                    type: 'get',
                    async: false,
                    url: urlMd.unreduced + toUnredceCurrentAppId,
                    success: function () {
                        unreduceCounter++;
                        ticketPureErrorAppIds.push(toUnredceCurrentAppId);
                        GetConsoleStatus();
                        console.log('\n');
                        console.log('客票验证监控点appId为' + toReduceCurrentAppId + ', 还原警报状态成功。')
                    },
                    error: function () {
                        console.log('\n');
                        console.warn('客票验证监控点appId为' + toUnreduceCurrentAppId + ', 还原警报状态失败。')
                    }
                });
            }
            RefreshAll();
            // 全部还原成功之后，清空已经强制降级的appId数组
            unreduceCounter + 1 === ticketReducedAppIds.length ? (ticketReducedAppIds.length = 0) : false;
        }
    };
    var TicketVerifyConfig = function () {
        ticketVerifyData = {};
        var isGreen = 0;
        var isYellow = 0;
        var isRed = 0;
        ticketHasErrorAppIds = [];
        ticketPureErrorAppIds = [];
        ticketVerifyData.firstHostId = ticketsVerify.length !== 0 && ticketsVerify[0].key ? ticketsVerify[0].key : '';
        ticketVerifyData.firstErrorAppId = '';
        ticketVerifyData.firstErrorContacts = '';
        ticketVerifyData.firstErrorSteps = '';
        ticketVerifyData.part_isgreen = false;
        ticketVerifyData.part_isyellow = false;
        ticketVerifyData.part_isred = false;
        ticketVerifyData.mouseEnterRed = false;
        ticketVerifyData.mouseEnterYellow = false;
        ticketVerifyData.mouseEnterGreen = false;

        ticketVerifyData.showReduceBtn = false;
        ticketVerifyData.reduced = false;
        ticketVerifyData.reducedUrl = '';
        ticketVerifyData.ReduceRank = TicketReduceRank;
        ticketVerifyData.status = '';
        // 客票验证的监控灯的状态是有全部监控接口的status决定的，而不像interface是单个接口的status决定的
        for (var i = 0; i < ticketsVerify.length; i++) {
            switch (ticketsVerify[i].status.trim().toLowerCase()) {
                case 'success':
                    isGreen++;
                    break;
                case 'alert':
                    isYellow++;
                    if (ticketsVerify[i].reduced) {
                        ticketVerifyData.reduced = true;
                        // TODO 20K debugged on 3.22
                        ticketHasErrorAppIds.push(ticketsVerify[i].key);
                        ticketReducedAppIds.push(ticketsVerify[i].key);
                    }
                    break;
                case 'error':
                    isRed++;
                    // TODO 20K debugged on 3.22
                    ticketHasErrorAppIds.push(ticketsVerify[i].key);
                    ticketPureErrorAppIds.push(ticketsVerify[i].key);
                    break;
            }
            ;
        }
        if (isRed !== 0) {
            ticketVerifyData.part_isred = true;
            ticketVerifyData.status = 'error';
            // 有error和alert&reduced=true的时候，展示降级按钮
            ticketVerifyData.showReduceBtn = true;
            ticketVerifyData.reducedUrl = 'images/icon_reduce.png';
        } else if (isYellow !== 0) {
            ticketVerifyData.part_isyellow = true;
            ticketVerifyData.status = 'alert';
            if (ticketVerifyData.reduced) {
                // 在没有error的前提下，有alert&reduced=true的时候，展示还原按钮
                ticketVerifyData.showReduceBtn = true;
                ticketVerifyData.reducedUrl = 'images/icon_unreduce.png';
            }
            ;
        } else {
            ticketVerifyData.part_isgreen = true;
            ticketVerifyData.status = 'success';
        }
        if (ticketHasErrorAppIds.length !== 0) {
            GetTicketVerifySolutions(ticketHasErrorAppIds)
            ticketVerifyData.firstErrorAppId = ticketHasErrorAppIds[0];
            // 添加非空判断
            // TODO 20K debugged on 3.22
            try {
                ticketVerifyData.firstErrorContacts = ticketVerifySolutions[0].name;
                ticketVerifyData.firstErrorSteps = ticketVerifySolutions[0].step;
            } catch (e) {
                ticketVerifyData.firstErrorContacts = '';
                ticketVerifyData.firstErrorSteps = '';
                console.log('\n');
                console.log('客票验证故障处理信息的错误：');
                console.warn(e);
            }
        }
        ticketVerifyData.ShowLinkHistory = ShowLinkHistory;
        ticketVerifyData.ReduceRank = TicketReduceRank;
        ticketVerifyData.ShowSolutions = ShowFirstSolutions;
        ticketVerifyData.HideSolutions = HideFirstSolutions;
    };
    TicketVerifyConfig();

    Vue.component('ticket-verify', {
        props: ['todo'],
        template: "<li class='ticket_verify_list'\
                v-bind:id=todo.firstHostId\
                v-on:click=todo.ShowLinkHistory\
                v-on:mouseenter=todo.ShowSolutions\
                v-on:mouseleave=todo.HideSolutions>\
                    <p class='website_port_list_icom'\
                    v-bind:class='{icom_green_bottom:todo.part_isgreen,\
                    icom_yellow_bottom:todo.part_isyellow,\
                    icom_red_bottom:todo.part_isred}'></p>\
                    <p class='website_port_list_name'\
                    v-bind:class='{mouseenter_red: todo.mouseEnterRed,mouseenter_yellow: todo.mouseEnterYellow,mouseenter_green:todo.mouseEnterGreen}'>\
                    客票验证\
                    </p>\
                    <div class='ticket_reduce' v-show=todo.showReduceBtn>\
                        <img v-bind:src=todo.reducedUrl v-on:click.stop=todo.ReduceRank>\
                    </div>\
                    <div class='solving_steps'>\
                        <div class='contacts_wrapper'>\
                            <div class='contacts_title'>紧急联系人</div>\
                            <div class='contacts_content'>{{todo.firstErrorContacts}}</div>\
                        </div>\
                        <div class='steps_wrapper'>\
                            <div class='steps_title'>故障处理步骤</div>\
                            <div class='steps_content'>\
                                <div class='steps_content_text'>{{todo.firstErrorSteps}}</div>\
                            </div>\
                        </div>\
                    </div>\
                </li>"
    });
}
;// 栅栏
/** ------ END ------ ticket-verify component ------ END ------ */


/** ------ START ------ 监控当前状态，显示主控灯颜色，错误信息解决方案连接等传入参数 ------ START ------ */
{
    /* 获取当前监控总灯状态 */
    var GetConsoleStatus = function GetStatus() {
        $(".contents_top_status").removeClass("contents_top_status_red")
            .removeClass("contents_top_status_yellow")
            .removeClass("contents_top_status_green");
        var statusColorRed = 0;
        var statusColorYellow = 0;
        var statusColorGreen = 0;
        for (var h = 0; h < contentsCenterData.length; h++) {
            contentsCenterData[h].up_isred ? (statusColorRed++) : statusColorRed;
            contentsCenterData[h].up_isyellow ? (statusColorYellow++) : statusColorYellow;
            contentsCenterData[h].up_isgreen ? (statusColorGreen++) : statusColorGreen;
            contentsCenterData[h].down_isred ? (statusColorRed++) : statusColorRed;
            contentsCenterData[h].down_isyellow ? (statusColorYellow++) : statusColorYellow;
            contentsCenterData[h].down_isgreen ? (statusColorGreen++) : statusColorGreen;
        }
        ;
        for (var i = 0; i < websitePortData.length; i++) {
            websitePortData[i].part_isred ? (statusColorRed++) : statusColorRed;
            websitePortData[i].part_isyellow ? (statusColorYellow++) : statusColorYellow;
            websitePortData[i].part_isgreen ? (statusColorGreen++) : statusColorGreen;
        }
        ;
        ticketVerifyData.part_isred ? (statusColorRed++) : statusColorRed;
        ticketVerifyData.part_isyellow ? (statusColorYellow++) : statusColorYellow;
        ticketVerifyData.part_isgreen ? (statusColorGreen++) : statusColorGreen;
        if ($('#bgwarning').attr('src')) {
            $('#bgwarning').remove();
        }

        if (statusColorRed !== 0) {
            if (controlButtonListData[3].button_isactive || new_monitor_console.$data.controlButtonList[3].button_isactive) {
                $('.status_warning').append($('<audio id="bgwarning" src="' + $('#bgwarning_src').attr('src') + '" autoplay="autoplay" loop="loop" ></audio>'));
            }

            $(".contents_top_status").addClass("contents_top_status_red");
            $('.contents_look_error').show();
        } else if (statusColorYellow !== 0) {
            $(".contents_top_status").addClass("contents_top_status_yellow");
            $('.contents_look_error').hide();
        } else {
            $(".contents_top_status").addClass("contents_top_status_green");
            $('.contents_look_error').hide();
        }
    };
    GetConsoleStatus();

}
; // 栅栏
/** ------ END ------ 监控当前状态，显示主控灯颜色，错误信息解决方案连接等传入参数 ------ END ------ */


{
    timerConsole = setInterval(function () {
        RefreshAll();
    }, 30000);

    // Vue根实例
    var new_monitor_console = new Vue({
        el: '#new_monitor_console',
        data: {
            username: username,
            loginUrl: 'login',
            logOff: false,
            show_detail: false,
            isDown: true,
            isUp: false,
            /**  $('.alert_contents_test')内的数据 */
            checkingInterfaceLink: '接口链路检测',
            interfaceLink: '链路',
            linkServiceType: '服务类型',
            respondingTime: '响应时间',
            httpStatus: 'http状态',
            linkStatus: '状态',
            latestTime: '最新检测时间',
            errorTimes: '出错次数',
            solutionsLink: '查看解决方案',
            checkingLink: '查看',

            cpuStatus: 'CPU情况',
            diskStatus: '磁盘情况',
            connectNum: '连接数',
            momeryStatus: '内存情况',


            /** text in $('.alert_contents_echart') */
            linkInAlertEchart: '链路：',
            heartUrlInAlertEchart: '心跳地址：',

            /** text in $('.echart_contents') */
            linkInEchartContents: '链路',

            // control-button-list component
            controlButtonList: controlButtonListData,

            // app-web-monitor component
            appWebMonitorTitle: '官网服务器监控',
            contentsCenterList: contentsCenterData,
            contentsCenterPages: contentsCenterPages,

            // link-history component
            linkNameList: linkNameList,
            noHeartUrl: false,

            // interfaces-monitor component
            interfacesTicketsMonitorTitle: '外部依赖/接口/业务监控',
            websitePortList: websitePortData,
            websitePortsPerPage: websitePortsPerPage,
            interfacesPages: interfacesPages,
            interfacesTicketPages: interfacesTicketPages,

            // interface-alert-list component
            interfacesAlertList: interfacesAlertList,

            // ticket-verify component
            ticketVerifyData: ticketVerifyData,

            // ticket-verify-alert component
            // ticketVerifyList: ticketVerifyList,

            individuationShowData: {},
            individuationDetailData: {},
            serverPortData: {},
            serverMonitor: {},

            searchIp: '',
            searchTypeName: '',
        },
        computed: {
            serverPortData1: function () {
                var v_this = this;
                return v_this.serverPortData;
            },
            // app-web-monitor component
            contentsCenterBook: function () {
                var v_this = this;
                return v_this.Paginating({
                    'pagesNum': v_this.contentsCenterPages,
                    'list': v_this.contentsCenterList,
                    'itemsNum': 10
                });
            },
            // 用于判断接口监控是否需要把最后一页单独分出来————接口监控数整除websitePortsPerPage（每页监控数:28），则不用单独分出来
            // 有2类页面返回false, 没有返回true, 这样好变态啊
            interfacesHasTwoKindsPages: function () {
                var v_this = this;
                return !(v_this.websitePortList.length % v_this.websitePortsPerPage === 0);
            },
            // 整除，=== 0，没有2类页面，返回false
            interfacesBook: function () {
                var v_this = this;
                if (!v_this.interfacesHasTwoKindsPages) {
                    return v_this.Paginating({
                        'pagesNum': v_this.interfacesPages,
                        'list': v_this.websitePortList,
                        'itemsNum': v_this.websitePortsPerPage
                    });
                }

            },
            /* 在template已经用interfacesHasTwoKindsPages过滤了，在这里继续做if判断有必要吗？
             * 双保险？
             * 这个问题需要研究研究。
             * */
            interfacesBookWithoutLastPage: function () {
                var v_this = this;
                if (v_this.interfacesHasTwoKindsPages) {
                    return v_this.Paginating({
                        'pagesNum': v_this.interfacesPages,
                        'list': v_this.websitePortList,
                        'itemsNum': v_this.websitePortsPerPage
                    }).slice(0, v_this.interfacesPages - 1);
                }
            },
            interfacesLastPage: function () {
                var v_this = this;
                if (v_this.interfacesHasTwoKindsPages) {
                    return v_this.Paginating({
                        'pagesNum': v_this.interfacesPages,
                        'list': v_this.websitePortList,
                        'itemsNum': v_this.websitePortsPerPage
                    })[v_this.interfacesPages - 1];
                }
            },
            selectlist: function () {
                // var _this = this;
                var arrByZM = [];//声明一个空数组来存放数据
                if (this.interfacesAlertList != null) {
                    if (this.searchIp.length > 0) {
                        for (var i = 0; i < this.interfacesAlertList.length; i++) {
                            //for循环数据中的每一项（根据name值）
                            if (this.interfacesAlertList[i].lastName.toLocaleLowerCase().search(this.searchIp.toLocaleLowerCase()) != -1) {
                                //判断输入框中的值是否可以匹配到数据，如果匹配成功
                                arrByZM.push(this.interfacesAlertList[i]);
                                //向空数组中添加数据
                            }

                        }
                    } else if (this.searchTypeName.length > 0) {
                        for (var i = 0; i < this.interfacesAlertList.length; i++) {
                            if (this.interfacesAlertList[i].secondName.toLocaleLowerCase().search(this.searchTypeName.toLocaleLowerCase()) != -1) {
                                arrByZM.push(this.interfacesAlertList[i]);
                            }

                        }
                    } else {
                        for (var i = 0; i < this.interfacesAlertList.length; i++) {
                            arrByZM.push(this.interfacesAlertList[i]);

                        }
                    }

                }
                // //逻辑-->升序降序排列  false: 默认从小到大  true：默认从大到小
                // //判断，如果要letter不为空，说明要进行排序
                // if(this.letter != ''){
                //     arrByZM.sort(function( a , b){
                //         if(_this.original){
                //             return b[_this.letter] - a[_this.letter];
                //         }else{
                //             return a[_this.letter] - b[_this.letter];
                //         }
                //     });
                // }
                //一定要记得返回筛选后的数据
                return arrByZM;
            }
        },
        methods: {
            Paginating: function (opt) {
                var book = [];
                var pageStart = 0;
                var pageEnd = 0;
                for (var i = 0; i < opt.pagesNum; i++) {
                    pageStart = i * opt.itemsNum;
                    pageEnd = (i + 1) * opt.itemsNum;
                    book[i] = opt.list.slice(pageStart, pageEnd);
                }
                return book;
            },
            ShowLogOff: function () {
                this.logOff = true;
            },
            HideLogOff: function () {
                this.logOff = false;
            },
            fnOver: function () {
                this.isDown = false;
                this.isUp = true;
                this.show_detail = true;
            },
            fnOut: function () {
                this.isDown = true;
                this.isUp = false;
                this.show_detail = false;
            },
            fnOverDetail: function () {
                this.show_detail = true;
                this.isDown = false;
                this.isUp = true;
            },
            fnOutDetail: function () {
                this.show_detail = false;
                this.isDown = true;
                this.isUp = false;
            },
        },
        mounted: function () {
            var vThis = this;
            $('#messageSolution').attr('href', '/newmonitor/console/solutions');

            /** *** START *** app-web-monitor component *** START *** */
            // TODO 为什么需要多加100px，样式问题。后期要优化
            $('.contents_center_book').width(1150 * contentsCenterPages + 100 + 'px');

            pagePointGap = Math.floor((
                ($('.pages_scroll_buttons').width() - $('.page_down img').width() * 2 - $('.pages_point img').width() * contentsCenterPages) / (contentsCenterPages + 1)
            ));
            $('.page_point_app_web').each(function () {
                $(this).css('marginLeft', pagePointGap + 'px');
            });
            $('.page_point_app_web:first').css('marginLeft', pagePointGap + $('.pages_scroll_buttons .page_up').width() + 'px');

            $('.page_moving_point_app_web').css({
                'left': $('.page_point_app_web:first').css('marginLeft'),
                'display': 'inline-block',
                'background': '#1cc2ca'
            });
            if (contentsCenterPages > 1) {
                appWebPageDownTurnerUsable = true;
                $('.pages_scroll_buttons .page_down img').attr({
                    'src': 'images/icon_turn_page.png'
                });
            }
            ;

            /** *** END *** app-web-monitor component *** END *** */


            /** *** START *** interfaces-monitor component *** START *** */
            // set width of $('.book_interfaces_ticket')
            $('.book_interfaces_ticket').css({
                'width': (1140 * vThis.interfacesTicketPages) + 'px'
            });

            // 页码指示小圆点的间隙设置 TODO
            scrollPointGap = Math.floor((228 - 32 * 2 - 10 * interfacesTicketPages) / (interfacesTicketPages + 1));

            // 设置翻页按钮为可用状态
            interfacesTicketsPageDownTurnerUsable = true;
            if (interfacesTicketPages > 1) {
                $('.website_port_scroll .page_down img').attr({
                    'src': 'images/icon_turn_page.png'
                });
            }
            ;
            /** *** END *** interfaces-monitor component *** END *** */

            console.log(vThis.interfacesBookWithoutLastPage);


        }, // -- END -- mounted hook
        created: function () {
            var vThis = this;
            console.log(vThis.$data.interfacesBookWithoutLastPage);
        }
    });

    var appWebSwiper = null;
    var interfacesTicketsSwiper = null;

    appWebSwiper = new Swiper('.book_box_app_web', {
        loop: false,
        speed: 800,
        autoplay: false,
        autoplay: {
            delay: 10000,
            disableOnInteraction: false,
            stopOnlastSlide: false,
        },
        navigation: {
            nextEl: '.app_web_page_down',
            prevEl: '.app_web_page_up',
        },
        pagination: {
            el: '.app_web_pagination',
            dynamicBullets: false,
        },
    });

    appWebSwiper.el.onmouseover = function () {
        appWebSwiper.autoplay.stop();
    };
    appWebSwiper.el.onmouseout = function () {
        appWebSwiper.autoplay.start();
    };

    interfacesTicketsSwiper = new Swiper('.book_box_interfaces', {
        loop: false,
        autoplay: false,
        autoplay: {
            speed: 800,
            delay: 10000,
            disableOnInteraction: true,
            stopOnlastSlide: false,
        },
        navigation: {
            nextEl: '.interfaces_tickets_page_down',
            prevEl: '.interfaces_tickets_page_up',
        },
        pagination: {
            el: '.interfaces_tickets_pagination',
            dynamicBullets: false,
        },
    });

    interfacesTicketsSwiper.el.onmouseover = function () {
        interfacesTicketsSwiper.autoplay.stop();
    };
    interfacesTicketsSwiper.el.onmouseout = function () {
        interfacesTicketsSwiper.autoplay.start();
    };


}
; // 栅栏
