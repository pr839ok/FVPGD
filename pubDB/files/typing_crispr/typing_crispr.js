var current_user = "";

(function () {
    "use strict";

    var form, layer, element, laypage, laydate, table;
    var layerIndex;
    var defaultSample;

    var bsuperadmin = false;
    var curOrderstr = "upload_start_time";
    var curOrder = "desc";
    var workflowPluginsType = getUrlParam("workflowPluginsType");
    var target_session_name = workflowPluginsType + "_g1_target_table";
    var packUpNum = 0;
    var tableCurHeight = 55;
    var isAllPack = 0;
    var analysisLayerindex;
    var workflows = [];
    var userDefineTools = [];

    var pagedatas = [];

    // var workflows = searchWorkflow();
    getCurrentUser();

    function getCurrentUser() {
        var url = '/webhdfs/v1?op=getcurrentuser';
        $.ajax({
            url: url,
            type: 'GET',
            success: function (result) {
                if (result != "false") {
                    result = JSON.parse(result);
                    current_user = result.username;
                    bsuperadmin = result.bsuperadmin;
                    init();
                }
            },
            error: function (xhr, error, statusText) {
                if (statusText == 'Authentication required') {
                    layui.use('layer', function () {
                        var $ = layui.jquery,
                            layer = layui.layer;
                        layer.alert("请先登录系统..", {skin: 'layui-layer-molv', closeBtn: 0, anim: 1, icon: 0},
                            function () {
                                window.parent.location.href = '../login.html';
                            });
                    });
                }
            }
        });
    }

    function init() {
        layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function () {
            form = layui.form;
            // layer = parent.layer === undefined ? layui.layer : parent.layer;
            layer = layui.layer;
            element = layui.element;
            laypage = layui.laypage;
            laydate = layui.laydate;
            table = layui.table;
            initGeneDatabseSelect();

            // initPhenotypeTable();
        });

    }

    function initGeneDatabseSelect() {
        var url = '/webhdfs/v1?op=PUBDB_SEARCHTYPINGCRISPRFILE';
        $.ajax({
            url: url,
            type: 'GET',
            success: function (json) {
                table.render({
                    elem: '#filelist',
                    cols: [
                        [{type: 'checkbox'},
                            {field: 'file_name', title: '样本编号', sort: true},
                            {field: 'upload_state', title: '最新状态'},
                            {field: 'strain_id', title: '菌株编号', sort: true}, {
                            fixed: 'right',
                            title: '操作',
                            toolbar: '#barDemo',
                            align: 'center',
                            width: 150
                        }
                        ]
                    ],
                    data: json.data.data,
                    page: true
                });
                table.on('tool(filelist)', function (obj) {
                    var data = obj.data;
                    // console.log(data.file_name);
                    if (obj.event === 'check') {
                        show_data(data.file_name);
                    }
                })
            },
            error: function (xhr, error, statusText) {
            }
        });
    }

    $("#phenotype_analysis").bind('click', function () {

        var checkStatus = table.checkStatus('filelist'); //获取选中行状态
        var sjson = [];

        for (var i in checkStatus.data) {
            //console.log(checkStatus.data[i].file_name);
            sjson.push(checkStatus.data[i].file_name);
        }
        layer.open({
            type: 1,
            title: '',
            area: ['1100px', '500px'],
            content: $('#analysis-configurator'),
            btn: ['提交分析', '取消'],
            resize: true,
            success: function (layero, index) {
                $('#sample-num').html("已选择:" + sjson.length);

                $('.tree-branch').empty();
                for (var i = 0; i < sjson.length; i++) {

                    var $sp = $(
                        '<li>' +
                        '<div class="treeNode" _pl="15" style="padding-left: 30px">' +
                        '<span class="treeNode-handler" node-path="" data-file-type="leaf">' +
                        '<i class="fa fa-file-text-o input-file-icon"></i>' +
                        '<span class="nodename file-type" title="" > ' + sjson[i] + ' </span>' +
                        '</span>' +
                        '</div>' +
                        '</li>');
                    $sp.appendTo($('.tree-branch'));
                }
            },
            yes: function (index, layero) {
                $('#submit').html(sjson.length);
                var tempFormParam = {};
                tempFormParam.filename = sjson.toString();
                tempFormParam.library = $("#form-crisprlibrary-select option:selected").text();
                // console.log($("#form-crisprlibrary-select option:selected").text());
                $.ajax({
                    async: true,
                    type: 'POST',
                    url: '/webhdfs/v1?op=PUBDB_ANALYSISTYPINGCRISPRFILE',
                    data: {
                        'tempform': JSON.stringify(tempFormParam)
                        /*'mapdata':sjson*/
                    },
                    timeout: 30000, // 设置超时时间
                    dataType: 'json',
                    contentType: 'application/json',
                    beforeSend: function (xhr) {
                        // index = layer.load(1); // 数据加载成功之前，使用loading组件
                    },
                    success: function (json) {
                        layer.close(index);
                    },
                });
            },
            btn2: function (index, layero) {
                layer.close(index);
                return false;
            }
        });
        //var mydata=JSON.stringify(checkStatus.data);
        //console.log(mydata);

    });
    $("#logFlush").bind('click', function () {
        var url = '/webhdfs/v1?op=PUBDB_SEARCHTYPINGCRISPRFILE';
        $.ajax({
            url: url,
            type: 'GET',
            success: function (json) {
                table.render({
                    elem: '#filelist',
                    cols: [
                        [{type: 'checkbox'},
                            {field: 'file_name', title: '样本编号', sort: true},
                            {field: 'upload_state', title: '最新状态'},
                            {field: 'strain_id', title: '菌株编号', sort: true}, {
                            fixed: 'right',
                            title: '操作',
                            toolbar: '#barDemo',
                            align: 'center',
                            width: 150
                        }
                        ]
                    ],
                    data: json.data.data,
                    page: true
                });
                var r = false;
                var w = false;
                for (var i in json.data.state) {

                    for (var j in json.data.state[i]) {
                        var newid = json.data.state[i]["upload_state"];
                        if (newid == "Running") {
                            r = true;
                        }
                        if (newid == "Waitting") {
                            w = true;
                        }
                        $("#" + newid).html(json.data.state[i]["count(1)"]);
                    }
                    if (json.data.state[i]["file_name"] != null) {
                        $("#Running").html(json.data.state[i]["file_name"]);
                    }
                }
                if (!r) {
                    $("#Running").html(0);
                }
                if (!w) {
                    $("#Waitting").html(0);
                }

            },
            error: function (xhr, error, statusText) {
            }
        });

    });
    $('#data_select_btn').unbind('click').bind('click', function () {
        layer.open({
            type: 1,
            title: "数据筛选",
            area: ['920px', '700px'],
            content: $('#sample-search-bar'),
            btn: ['确定', '取消'],
            resize: false,
            success: function (layero, index) {
            },
            yes: function (index, layero) {
                var url = '/webhdfs/v1?op=PUBDB_SEARCHTYPINGFILEBYSTATE&temp=' + $("#sample-gene-database-select option:selected").text();
                $.ajax({
                    url: url,
                    type: 'GET',
                    success: function (json) {
                        table.render({
                            elem: '#filelist',
                            cols: [
                                [{type: 'checkbox'},
                                    {field: 'file_name', title: '样本编号', sort: true},
                                    {field: 'upload_state', title: '最新状态'},
                                    {field: 'strain_id', title: '菌株编号', sort: true}
                                ]
                            ],
                            data: json.data,
                            page: true,
                            done: function () {
                                $('.formbox').css({
                                    'background-color': '#fff',
                                    'box-shadow': '5px 5px 7px rgba(211,211,211,0.6)'
                                });
                            }
                        });
                    },
                    error: function (xhr, error, statusText) {
                    }
                });
                layer.close(index);
            }
        });
    });
    /* Gene Analysis Init */

    /*  Util  */
    function append_path(prefix, s) {
        var l = prefix.length;
        var p = l > 0 && prefix[l - 1] == '/' ? prefix.substring(0, l - 1) : prefix;
        return p + '/' + s;
    }

    function encode_path(abs_path) {
        abs_path = encodeURIComponent(abs_path);
        var re = /%2F/g;
        return abs_path.replace(re, '/');
    }

    function getAjax(async, method, apiUrl, options, dataType, callback, complete) {
        layui.use('layer', function () {
            var layer = layui.layer,
                $ = layui.jquery;
            var index;
            var xhr = $.ajax({
                async: async,
                type: method,
                url: apiUrl,
                data: options,
                timeout: 30000, // 设置超时时间
                dataType: dataType,
                contentType: 'application/json',
                beforeSend: function (xhr) {
                    index = layer.load(1); // 数据加载成功之前，使用loading组件
                },
                success: function (json) {
                    if (callback && typeof (callback) == "function") {
                        callback(json);
                    }
                },
                error: function (textStatus) {
                    // console.error(textStatus);
                },
                complete: function (XMLHttpRequest, status) {
                    layer.close(index);
                    if (complete && typeof (complete) == "function") {
                        complete(xhr, XMLHttpRequest, status);
                    }
                }
            })
        });
    }

    String.prototype.endWith = function (s) {
        if (s == null || s == "" || this.length == 0 || s.length > this.length)
            return false;
        if (this.substring(this.length - s.length) == s)
            return true;
        else
            return false;
        return true;
    }
    String.prototype.startWith = function (s) {
        if (s == null || s == "" || this.length == 0 || s.length > this.length)
            return false;
        if (this.substr(0, s.length) == s)
            return true;
        else
            return false;
        return true;
    }

})();

//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

function get_table(data) {
    $('#clickp').css('display', 'none');
    layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function () {
        form = layui.form;
        // layer = parent.layer === undefined ? layui.layer : parent.layer;
        layer = layui.layer;
        element = layui.element;
        laypage = layui.laypage;
        laydate = layui.laydate;
        table = layui.table;
        layer.open({
            type: 1,
            title: '',
            area: ['700px', '400px'],
            content: $('#table'),
            btn: ['commit', ' cancel'],
            yes: function (index, layero) {
                table.render({
                    elem: '#filelist1',
                    cols: [
                        [{field: 'name', title: 'name', align: 'center', sort: true},
                            {field: 'id', title: 'id', align: 'center'}, {
                            fixed: 'right',
                            title: '操作',
                            toolbar: '#baDemo',
                            align: 'center',
                            width: 150
                        }
                        ]
                    ],
                    data: data,
                    page: true
                });
                table.on('tool(filelist1)', function (obj) {
                    var data = obj.data;
                    //  console.log(data.file_name);
                    if (obj.event === 'check') {
                        $.ajax({
                            type: 'GET',
                            url: '/webhdfs/v1?op=PUBDB_SEARCHCRISPRSEQ&temp=' + data.file_name + "," + $("#form-crisprlibrary-select option:selected").text(),
                            dataType: 'json',
                            contentType: 'application/json',
                            beforeSend: function (xhr) {
                            },
                            success: function (json) {
                                $("#direct").val(json.data.direct_repeat);
                                $("#binding").val(json.data.binding_site);
                                $("#ID").val(json.data.ID);
                                form.render();
                                layer.open({
                                    type: 1,
                                    title: '',
                                    area: ['700px', '400px'],
                                    content: $('#form'),
                                    btn: ['commit', ' cancel'],
                                    yes: function (index, layero) {
                                        var tempdata = {};
                                        tempdata.name = data.name;
                                        tempdata.par = $("#par").val();
                                        tempdata.rtl = $("#rtl option:selected").val();
                                        tempdata.id = $("#ID").val();
                                        $.ajax({
                                            type: 'POST',
                                            url: '/webhdfs/v1?op=PUBDB_ADDCRISPRSEQ',
                                            data: {
                                                'tempform': JSON.stringify(tempdata)
                                            },
                                            dataType: 'json',
                                            contentType: 'application/json',
                                            beforeSend: function (xhr) {
                                            },
                                            success: function (json) {
                                                if (json.code == 200) {
                                                    layer.close(index);
                                                }
                                            },

                                        });
                                    },
                                    cancel: function () {
                                        //右上角关闭回调

                                        //return false 开启该代码可禁止点击该按钮关闭
                                    }
                                });
                            },

                        });
                    }
                })
            },
            cancel: function () {
                //右上角关闭回调

                //return false 开启该代码可禁止点击该按钮关闭
            }
        });

    })
}

function show_data(name) {
    $.ajax({
        type: 'GET',
        url: '/webhdfs/v1?op=PUBDB_ANALYSISCRISPR&temp=' + name,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function (xhr) {
        },
        success: function (json) {
            if (json.code == 200) {

            } else if (json.code == 403) {

            } else {
                get_table(json.data);

            }

        },

    });
}