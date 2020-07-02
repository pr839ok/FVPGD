(function() {
    "use strict";
    var layer, element, table, form;
    var current_user, bsuperadmin, bAccessReadOnly;
    var tableCurHeight = 75;
    var jobDetailData = [];
    var jobHistoryData = [];
    var addJobWin;
    init();

    function createData() {
        for (var i = 1; i < 11; i++) {
            var obj = {};
            obj.jobname = "name" + i;
            obj.beginTime = getNowFormatDate();
            obj.endTime = getNowFormatDate();
            obj.jobid = i;
            if (i % 3 != 0) {
                obj.state = "success";
            } else {
                obj.state = "running";
            }
            jobHistoryData.push(obj);
        }
    }

    function initReadOnly() {
        var ids = [];
        for (var i in ids) {
            $('#' + ids[i]).addClass("layui-disabled");
            $('#' + ids[i]).attr("disabled", true);
        }
    }

    function init() {
        getCurrentUser(function(result) {
            current_user = result.username;
            bsuperadmin = result.bsuperadmin;
            bAccessReadOnly = result.bAccessReadOnly;
            layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
                layer = layui.layer;
                element = layui.element;
                table = layui.table;
                form = layui.form;
                createData();
                initBtn();
                renderHistory();
                initWebsocket();
            });
            if (bAccessReadOnly) {
                initReadOnly();
            }
        });

    }

    function initBtn() {
        $("#btn_job_manager").unbind('click').bind('click', function() {
            openJobManagerDiv();
        });
        // $("#btn_job_history").unbind('click').bind('click', function() {
        //     openJobHistoryDiv();
        // });
        $("#btn_add_job").unbind('click').bind('click', function() {
            openAddJobDiv();
        });

        form.on('submit(add_job_submit)', function(data) {
            data.field.createtime = getNowFormatDate();
            console.log(data.field);
            jobDetailData.push(data.field);
            renderJobManagerTable();
            addJobWin.close();
            return false;
        });
    }

    function getNowFormatDate() {
        var date = new Date();
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate;
        return currentdate;
    }

    function openJobDetailDiv(jobid) {
        var config = {
            windowId: "jobdetail_div1",
            windowTitle: '任务详情',
            windowType: 1,
            windowContent: $('#jobdetail_div'),
            windowArea: ['900px', '600px'],
            windowSuccess: function(layero, index) {
                renderJobDetail(jobid);
            }
        };
        var win = new AdaptiveWindow(config);
        win.open();
    }

    function renderJobDetail(jobid) {
        var data = [];
        for (var i = 1; i < 6; i++) {
            var obj = {};
            obj.filename = "file" + i;
            obj.size = "128M";
            obj.beginTime = getNowFormatDate();
            obj.endTime = getNowFormatDate();
            obj.state = "success";
            data.push(obj);
        }
        table.render({
            elem: '#job_detail_table',
            page: true,
            cols: [
                [
                    { field: 'filename', title: '名称', width: 200 },
                    { field: 'size', title: '大小', width: 200 },
                    { field: 'beginTime', title: '开始时间', width: 200 },
                    { field: 'endTime', title: '结束时间', width: 200 },
                    { field: 'state', title: '状态' }
                ]
            ],
            data: data
        });
    }

    function openJobHistoryDiv() {
        var config = {
            windowId: "history_job_div1",
            windowTitle: '历史任务',
            windowType: 1,
            windowContent: $('#history_job_div'),
            windowArea: ['650px', '450px'],
            windowSuccess: function(layero, index) {
                renderHistory();
            }
        };
        var win = new AdaptiveWindow(config);
        win.open();
    }

    function renderHistory() {
        table.render({
            elem: '#history_job_table',
            page: true,
            cols: [
                [
                    { field: 'jobname', title: '名称', width: 200 },
                    { field: 'beginTime', title: '开始时间', width: 200 },
                    { field: 'endTime', title: '结束时间', width: 200 },
                    { field: 'state', title: '状态' },
                    { title: '操作', width: 80, toolbar: '#job_history_opbar' }
                ]
            ],
            data: jobHistoryData
        });
        table.on('tool(history_job_table)', function(obj) {
            switch (obj.event) {
                case 'job_history_detail':
                    openJobDetailDiv(obj.data.jobid);
                    break;
            };
        });
    }

    function openAddJobDiv() {
        $('#add_job_div').find('input').val("");
        var config = {
            windowId: "add_job_div1",
            windowTitle: '添加任务',
            windowType: 1,
            windowContent: $('#add_job_div'),
            windowArea: ['650px', '450px'],
            windowSuccess: function(layero, index) {

            }
        };
        addJobWin = new AdaptiveWindow(config);
        addJobWin.open();
    }

    function openJobManagerDiv() {
        var config = {
            windowId: "job_manager_div1",
            windowTitle: '任务管理',
            windowType: 1,
            windowContent: $('#job_manager_div'),
            windowArea: ['900px', '450px'],
            windowSuccess: function(layero, index) {
                renderJobManagerTable();
            }
        };
        var win = new AdaptiveWindow(config);
        win.open();
    }

    function renderJobManagerTable() {
        table.render({
            elem: '#job_manager_table',
            page: true,
            cols: [
                [
                    { field: 'jobname', title: '名称', width: 80 },
                    { field: 'jobaddr', title: '网址' },
                    { field: 'jobrule', title: '规则', width: 200 },
                    { field: 'createtime', title: '创建时间', width: 200 },
                    { title: '操作', width: 200, toolbar: '#job_manager_opbar' }
                ]
            ],
            data: jobDetailData
        });
    }

    function initWebsocket() {
        var websocket = null;

        //判断当前浏览器是否支持WebSocket
        if ('WebSocket' in window) {
            websocket = new WebSocket("ws://" + document.domain + ":8040/websocket");
        } else {
            alert('Not support websocket')
        }

        //连接发生错误的回调方法
        websocket.onerror = function() {
            setMessageInnerHTML("error");
        };

        //连接成功建立的回调方法
        websocket.onopen = function(event) {
            // setMessageInnerHTML("open");
        }

        //接收到消息的回调方法
        websocket.onmessage = function(event) {
            // HightLight(event.data);
            setMessageInnerHTML(event.data);
        }

        //连接关闭的回调方法
        websocket.onclose = function() {
            setMessageInnerHTML("close");
        }

        //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = function() {
            websocket.close();
        }

        //将消息显示在网页上
        function setMessageInnerHTML(innerHTML) {
            console.log(innerHTML);
            document.getElementById('message').innerHTML += innerHTML + '<br/>';
        }

        //关闭连接
        function closeWebSocket() {
            websocket.close();
        }

        //发送消息
        function send() {
            var message = document.getElementById('text').value;
            websocket.send(message);
        }
    }
})();