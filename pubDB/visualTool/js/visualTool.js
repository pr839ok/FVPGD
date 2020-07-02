var element, table, form;
var callbackGroup = [];
$(function () {
    var current_user = null;
    var bsuperadmin = false;

    init();

    
    //初始化
    function init() {
        layui.use(['element', 'table', 'form'], function() {
            element = layui.element;
            table = layui.table;
            form = layui.form;
            getCurrentUser(function(result) {
                var data = result.data;
                current_user = data.username;
                bsuperadmin = data.bsuperadmin;
                loadModule();
            })
        });
    }    


    //动态加载js文件
    function loadModule() {
        let type = getUrlParam("visualType");
        if (type === null || typeof visualType[type] === undefined) {
            layer.alert("请输入正确模块..", {skin: 'layui-layer-molv', closeBtn: 0, anim: 1, icon: 0},
                function () {
                    window.parent.location.href = 'visual.html';
                });
            throw new Error("visualType do not exit");
        }

        $.getScript(visualType[type].script, function () {
            initModule(type);
        });
    }

    //初始化模块
    function initModule(type) {
        let modules = new new Function('return '+ type);
        //构造函数
        let module = new modules(visualType[type].config);
        // 修改标题
        $("title").html(visualType[type].title);
        // 加载参数配置模块
        module.initParamBar();
        // 加载数据导入导出按钮
        loadIO(visualType[type], module);

    }

    // 加载数据导入导出模块
    function loadIO(config, module) {
        let io = config.io;
        if ($(io.selector).length > 0) {
            //绘制dom层
            let selector = $(io.selector);

            // 顶部按钮组
            if ($(io.btnContainer).length > 0) {
                var msg = '<div class="layui-btn-container layui-inline"></div>';
                $(msg).appendTo(selector);

                let container = $(io.selector + " .layui-btn-container");

                if (io.btnContainer.length > 0) {
                    let uploadInput = "<input type=\"file\" name=\"\" id=\"id_upload_file_input\" accept=\".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain\" style=\"display: none;\">";
                    $(uploadInput).appendTo(container);


                    let btn = "";
                    for (let i = 0; i < io.btnContainer.length; i++) {
                        btn = '<button class="layui-btn" id="' + io.btnContainer[i].btnId + '">导入' + io.btnContainer[i].btnName + '</button>';

                        $(btn).appendTo(container);

                        callbackGroup.push(io.btnContainer[i].success);

                        //回调事件功能
                        $("#" + io.btnContainer[i].btnId).off("click").on("click", function () {
                            $("#id_upload_file_input").attr("data-success", i);
                            $("#id_upload_file_input").click();

                        });
                    }
                }

                $('#id_upload_file_input').on("change", function () {
                    // console.log($(this).attr("data-success"));
                    let index = $(this).attr("data-success")
                    uploadConf(module, index);
                });


            }

            // 右侧demo文件下载
            if(io.demoFile.length > 0){
                let msg = '<div class="layui-btn-container layui-inline" style="right: 10px; position: absolute">' +
                    '<li class="dropdown" style="display: inline-block !important;">' +
                    '<a href="javascript:void(0);" class="dropdown-toggle" data-toggle="dropdown" style="display: inline-block">\n' +
                    '<button class="layui-btn layui-btn-primary layui-btn-sm">测试文件下载<span class="caret"></span></button>\n' +
                    '</a>' +
                    '<ul class="dropdown-menu dropdown-menu-right" id="demo-file-list">' +
                    '</ul>' +
                    '</li>' +
                    '</div>';
                $(msg).appendTo(selector);

                let container = $('#demo-file-list');

                for (let i = 0; i < io.demoFile.length; i++) {
                    let item = '<li><a href="'+ io.demoFile[i].href +'" download="'+ io.demoFile[i].name +'">'+ io.demoFile[i].title +'</a></li>';
                    $(item).appendTo(container);
                }

            }

            // 文本框
            if (config.io.textarea) {
                let btnmsg = '';
                for (let i = 0; i < io.btnContainer.length; i++) {

                    btnmsg += '<button class="layui-btn layui-btn-normal layui-btn-sm" id="submit-' + io.btnContainer[i].btnId + '">提交' + io.btnContainer[i].btnName + '</button>';

                }
                let textarea =
                    '<div class="layui-collapse">\n' +
                    '     <div class="layui-colla-item">\n' +
                    '          <h2 class="layui-colla-title">文本输入</h2>\n' +
                    '          <div class="layui-colla-content layui-show">\n' +
                    '               <div class="title-box">\n' +
                    '                    <textarea placeholder="请输入数据" class="layui-textarea" id="data-value" autocomplete="off"></textarea>\n' +
                    '                    <div class="layui-btn-container" style="margin-top: 10px">\n' + btnmsg +
                    '                    </div>\n' +
                    '               </div>\n' +
                    '          </div>\n' +
                    '     </div>\n' +
                    '</div>';
                $(textarea).appendTo(selector);

                for (let i = 0; i < io.btnContainer.length; i++) {

                    $('#submit-' + io.btnContainer[i].btnId).off('click').on('click', function () {
                        var value = $("#data-value").val();

                        if (!value || value.length == 0) {
                            layer.msg("请输入数据", {icon: 2, time: 2000});
                            return;
                        }
                        var data = new Array();
                        value = value.split('\n');
                        for (let i = 0; i < value.length; i++) {
                            data.push(value[i].split(' '));
                        }
                        callbackGroup[i](module, data);
                    });
                }
            }

        } else {
            throw new Error("io selector do not exist!");
        }
    }

    //上传功能
    function uploadConf(module, index) {
        var url = "/base/UPLOADFILE";
        var obj = document.getElementById("id_upload_file_input");
        if (obj.value === '')
            return;
        var file = obj.files[0];
        var formData = new FormData();
        formData.append("file", file);
        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                var resjson = res;

                if (resjson.code === 200) {
                    var url = '/biot/GETFILETOTDA?temp=' + resjson.data.realSavePath + "/" + resjson.data.saveFilename;
                    getAjax(true, 'GET', url, null, 'json', function (result) {

                        callbackGroup[index](module, result.data);

                    }, null);
                } else {
                    layer.msg(resjson.msg, {icon: 2, time: 2000});
                }

            },
            error: function (res) {
                layer.msg('上传文件失败', {icon: 2, time: 1500})
            }
        });
    }

    // //获取url中的参数
    // function getUrlParam(name) {
    //     var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    //     //构造一个含有目标参数的正则表达式对象
    //     var r = window.location.search.substr(1).match(reg);
    //     //匹配目标参数
    //     if (r != null)
    //         return unescape(r[2]);
    //     return null;
    //     //返回参数值
    // }


})