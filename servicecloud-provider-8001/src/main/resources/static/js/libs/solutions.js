Vue.component('solution-list',{
    props: ['solution'],
    template:  '\
    <li class="contents_lists" v-bind:key="solution.appid" v-bind:id="solution.appid">\
        <p class="monitor_kind"><span>监控点名称：</span><span class="monitor_kind_text">{{solution.title}}</span></p>\
        <p><span>紧急联系人：</span><span class="emergency_contacts_text">{{solution.emergencyContacts}}</span></p>\
        <p><span>故障处理步骤：</span><span class="step_text">{{solution.steps}}</span></p>\
    </li>'
});

// <p><span>APP ID：</span><span class="app_id_text">{{solution.appId}}</span></p>

var solutionsVueRoot = new Vue({
    el: '#solutions_vue_root',
    data: {
        solutionsOfAlarmingLinks: '【报警链路解决方案】',
        downloadTitle: '(下载故障处理手册)',
        downloadAddress: './downloadManual',
        url_monitor: './get',
        url_solutions: './stepMsg?key=',
        errorAppIds: [],
        titles: [],
        solutionsList: [],
        appWebMonitor:[],
        interfacesMonitor:[],
        ticketsVerify:[],
        businessMonitor:[]
    },
    methods: {
        GetMonitors: function () {
            var vThis = this;
            $.ajax({
                type: 'get',
                url: vThis.url_monitor,
                async: false,
                dataType: 'json',
                success: function(data) {
                    vThis.appWebMonitor = data.data.zapps;
                    vThis.interfacesMonitor = data.data.zinterfaces;
                    vThis.ticketsVerify = data.data.ztickets;
                    vThis.businessMonitor = data.data.bzs;
                    vThis.GetAppIds(vThis.appWebMonitor,'appWebMonitor');
                    vThis.GetAppIds(vThis.interfacesMonitor,'interfacesMonitor');
                    // 客票验证的解决方案也要获取
                    vThis.GetAppIds(vThis.ticketsVerify,'ticketsVerify');
                },
                error: function() {
                    console.error('newmonitor/console/get接口获取数据失败');
                }
            })
        },
        GetAppIds: function (list,monitorTitle) {
            var vThis = this;
            if (monitorTitle === 'appWebMonitor') {
                for (var h=0;h<list.length;h++) {
                    for (var i=0;i<list[h].length;i++) {
                        /** 需要做非空判断 */
                        if (list[h][i] !== null &&　list[h][i].status.trim().toLowerCase() === 'error') {
                            vThis.errorAppIds.push(list[h][i].key);
                        }
                    }
                }
            }
            else {
                // interfaces, ticketsVerify
                for (var i=0;i<list.length;i++) {
                    if (list[i].status.toLowerCase() === 'error') {
                        vThis.errorAppIds.push(list[i].key);
                    }
                };
            }
        },
        GetTitles: function (list,monitorTitle) {
            var vThis = this;
            var temp_title = {appId: '',title: ''};
            if (monitorTitle === 'appWebMonitor') {
                /** appWebMonitor */
                for (var h=0;h<list.length;h++) {
                    for (var i=0;i<list[h].length;i++) {
                        /** 做非空判断 */
                        if (list[h][i] !== null) {
                            for (var j=0;j<vThis.errorAppIds.length;j++) {
                                if (vThis.errorAppIds[j] === list[h][i].key) {
                                    temp_title.appId = list[h][i].key;
                                    temp_title.title = list[h][i].name;
                                    vThis.titles.push(temp_title);
                                    temp_title = {appId: '',title: ''};
                                }
                            }
                        }
                    }
                }
            }
            else {
                /**  interfaces, ticketsVerify */
                for (var h=0;h<list.length;h++) {
                    for (var i=0;i<vThis.errorAppIds.length;i++) {
                        if (vThis.errorAppIds[i] === list[h].key) {
                            temp_title.appId = list[h].key;
                            temp_title.title = list[h].name;
                            vThis.titles.push(temp_title);
                            temp_title = {appId: '',title: ''};
                        }
                    }
                }
            }
        },
        GetSolutions: function () {
            var vThis = this;
            vThis.GetMonitors();
            $.ajax({
                type: 'get',
                url: vThis.url_solutions + vThis.errorAppIds.join(','),
                async: false,
                dataType: 'json',
                success: function (data) {
                    vThis.GetTitles(vThis.interfacesMonitor,'interfacesMonitor');
                    vThis.GetTitles(vThis.appWebMonitor,'appWebMonitor');
                    vThis.GetTitles(vThis.ticketsVerify,'ticketsVerify');
                    vThis.titles.reverse();
                    if (data.success && ! $.isEmptyObject(data.data)) {
                        var temp_solutionList = {appId: '', title: '', emergencyContacts: '', steps: ''};
                        for (var i=0;i<vThis.titles.length;i++) {
                            for (appId in data.data) {
                                if (appId === vThis.titles[i].appId) {
                                    temp_solutionList.title = vThis.titles[i].title;
                                    temp_solutionList.appId = appId;
                                    temp_solutionList.emergencyContacts = data.data[appId].name !== null ? data.data[appId].name : '暂无数据';
                                    temp_solutionList.steps = data.data[appId].step !== null ? data.data[appId].step : '暂无数据';
                                }
                            }
                            vThis.solutionsList.push(temp_solutionList);
                            temp_solutionList = {appId: '', title: '', emergencyContacts: '', steps: ''};
                        }
                    }
                    else {
                        for (var i=0;i<vThis.titles.length;i++) {
                            vThis.solutionsList[i] = {};
                            vThis.solutionsList[i].appId = vThis.titles[i].appId;
                            vThis.solutionsList[i].title = vThis.titles[i].title;
                            vThis.solutionsList[i].emergencyContacts = '暂无数据';
                            vThis.solutionsList[i].steps = '暂无数据';
                        }
                        console.log('\n');
                        console.warn('后台出现问题。以下是相关信息：' + '\n');
                        console.warn(data.data);
                        console.log('\n');
                    };
                },
                error: function () {
                    console.error('获取故障处理步骤信息失败。');
                }
            })
        }
    },
    created: function () {
        var vThis = this;
        vThis.GetSolutions();
    },
});























