$(function() {
    var lq = false;
    $("#txt_search").keyup(function(evt) {
        lq = false;
        ChangeCoords(); //控制查询结果div坐标  
        var k = window.event ? evt.keyCode : evt.which;
        //输入框的id为txt_search，这里监听输入框的keyup事件  
        //不为空 && 不为上箭头或下箭头或回车  
        if ($("#txt_search").val() != "" && k != 38 && k != 40 && k != 13) {
            var gene_input = $("#txt_search").val();
            var rs = search(gene_input);
            if (rs.length > 0) {
                var layer = "";
                layer = "<table id='aa' style='font-size:17px;'>";
                for (var i = 0; i < rs.length && i < 10; i++) {
                    layer += "<tr class='line'><td class='std' style=' padding-left: 10px;'>" + rs[i] + "</td></tr>";
                }
                layer += "</table>";
                //将结果添加到div中      
                $("#searchresult").empty();
                $("#searchresult").append(layer);
                $(".line:first").addClass("hover");
                $("#searchresult").css("display", "");
                //鼠标移动事件  
                $(".line").hover(function() {

                    $(".line").removeClass("hover");
                    $(this).addClass("hover");
                }, function() {
                    $(this).removeClass("hover");
                });
                //鼠标点击事件  
                $(".line").click(function() {
                    lq = true;
                    $("#txt_search").val($(this).text());
                    $("#searchresult").css("display", "none");
                });
            } else {
                $('#txt_search').val('');
                $("#searchresult").empty();
                $("#searchresult").css("display", "none");
            }
        } else if (k == 38) { //上箭头  
            lq = true;
            $('#aa tr.hover').prev().addClass("hover");
            $('#aa tr.hover').next().removeClass("hover");
            $('#txt_search').val($('#aa tr.hover').text());
        } else if (k == 40) { //下箭头  
            lq = true;
            $('#aa tr.hover').next().addClass("hover");
            $('#aa tr.hover').prev().removeClass("hover");
            $('#txt_search').val($('#aa tr.hover').text());
        } else if (k == 13) { //回车  
            lq = true;
            $('#txt_search').val($('#aa tr.hover').text());
            $("#searchresult").empty();
            $("#searchresult").css("display", "none");
        } else {
            $("#searchresult").empty();
            $("#searchresult").css("display", "none");
        }
    });

    $("#searchresult").bind("mouseleave", function() {
        if (!lq) {
            $('#txt_search').val('');
        }
        $("#searchresult").empty();
        $("#searchresult").css("display", "none");
    });
    /*$("#txt_search").blur(function(){
        $("#searchresult").css("display", "none");
    });*/
    $("#select-input-1").focus(function() {
        $("#select-input-1").keyup(function(evt) {
            if ($('#txt_search').val() == "China") {
                //console.log(10);
                var lql = false;
                lql = false;
                ChangeCoords_1(); //控制查询结果div坐标  
                var k = window.event ? evt.keyCode : evt.which;
                //输入框的id为txt_search，这里监听输入框的keyup事件  
                //不为空 && 不为上箭头或下箭头或回车  
                if ($("#select-input-1").val() != "" && k != 38 && k != 40 && k != 13) {
                    var gene_input = $("#select-input-1").val();
                    var rs = search_1(gene_input);
                    if (rs.length > 0) {
                        var layer = "";
                        layer = "<table id='aa' style='font-size:17px;'>";
                        for (var i = 0; i < rs.length && i < 10; i++) {
                            layer += "<tr class='line'><td class='std' style=' padding-left: 10px;'>" + rs[i] + "</td></tr>";
                        }
                        layer += "</table>";
                        //将结果添加到div中      
                        $("#searchresult_1").empty();
                        $("#searchresult_1").append(layer);
                        $(".line:first").addClass("hover");
                        $("#searchresult_1").css("display", "");
                        //鼠标移动事件  
                        $(".line").hover(function() {

                            $(".line").removeClass("hover");
                            $(this).addClass("hover");
                        }, function() {
                            $(this).removeClass("hover");
                        });
                        //鼠标点击事件  
                        $(".line").click(function() {
                            lql = true;
                            $("#select-input-1").val($(this).text());
                            $("#searchresult_1").css("display", "none");
                        });
                    } else {
                        $('#select-input-1').val('');
                        $("#searchresult_1").empty();
                        $("#searchresult_1").css("display", "none");
                    }
                } else if (k == 38) { //上箭头  
                    lql = true;
                    $('#aa tr.hover').prev().addClass("hover");
                    $('#aa tr.hover').next().removeClass("hover");
                    $('#select-input-1').val($('#aa tr.hover').text());
                } else if (k == 40) { //下箭头  
                    lql = true;
                    $('#aa tr.hover').next().addClass("hover");
                    $('#aa tr.hover').prev().removeClass("hover");
                    $('#select-input-1').val($('#aa tr.hover').text());
                } else if (k == 13) { //回车  
                    lql = true;
                    $('#select-input-1').val($('#aa tr.hover').text());
                    $("#searchresult_1").empty();
                    $("#searchresult_1").css("display", "none");
                } else {
                    $("#searchresult_1").empty();
                    $("#searchresult_1").css("display", "none");
                }
            } else {
                /*$("#searchresult_1").empty();
                $("#searchresult_1").css("display", "none");*/
            }

        });
        //console.log($('#txt_search').val());

    });
    $("#searchresult_1").bind("mouseleave", function() {
        if (!lq) {
            $('#select-input-1').val('');
        }
        $("#searchresult_1").empty();
        $("#searchresult_1").css("display", "none");
    });
});

function ChangeCoords() {
    //    var left = $("#txt_search")[0].offsetLeft; //获取距离最左端的距离，像素，整型  
    //    var top = $("#txt_search")[0].offsetTop + 26; //获取距离最顶端的距离，像素，整型（20为搜索输入框的高度）  
    var left = $("#txt_search").position().left; //获取距离最左端的距离，像素，整型  
    var top = $("#txt_search").position().top + 37;; //获取距离最顶端的距离，像素，整型（20为搜索输入框的高度）  
    $("#searchresult").css("left", left + "px"); //重新定义CSS属性  
    $("#searchresult").css("top", top + "px"); //同上  
}

function ChangeCoords_1() {
    //    var left = $("#txt_search")[0].offsetLeft; //获取距离最左端的距离，像素，整型  
    //    var top = $("#txt_search")[0].offsetTop + 26; //获取距离最顶端的距离，像素，整型（20为搜索输入框的高度）  
    var left = $("#select-input-1").position().left; //获取距离最左端的距离，像素，整型  
    var top = $("#select-input-1").position().top + 37;; //获取距离最顶端的距离，像素，整型（20为搜索输入框的高度）  
    $("#searchresult_1").css("left", left + "6px"); //重新定义CSS属性  
    $("#searchresult_1").css("top", top + "px"); //同上  
}

function search(keyWord) {
    var len = _areaList.length;
    var arr = [];
    for (var i = 0; i < len; i++) {
        //如果字符串中不包含目标字符会返回-1
        if (_areaList[i].toLowerCase().indexOf(keyWord.toLowerCase()) >= 0) {
            arr.push(_areaList[i]);
        }
    }
    return arr;
}

function search_1(keyWord) {
    var arr = [];
    for (var p in city) {
        if (p.toLowerCase().indexOf(keyWord.toLowerCase()) >= 0) {
            arr.push(p);
        }
    }
    return arr;
}
layui.use(['form', 'layer'], function() {

    var form = layui.form;
    var layer = layui.layer;
    init_upload(form);
    form.verify({
        security_classification: function(value, item) { //value：表单的值、item：表单的DOM对象
            if (!/^[1-6]*$/.test(value)) {
                return '请输入正确的密级';
            }
        }
    });
    //监听提交
    form.on('submit(submitForm)', function(data) {
        data.field.filename = layui.sessionData('test').fileName;
        if (data.field.Location) {
            var corrLocation = LTrim(RTrim(data.field.Location));
            data.field.Location = titleCase(corrLocation);
        }
        getAjax(true, 'POST', '/fpbdb/UPLOADSTRAINDETAILS', JSON.stringify(data.field), 'json', function(json){
            layui.sessionData('test', null);
            $('#selectFile').empty();
            layer.msg("successful");
        });
        return false;
    });
});

function init_upload(form) {
    var uploader = WebUploader.create({
        auto: true,

        // swf文件路径
        swf: '../webupload/Uploader.swf', // swf文件路径
        server: '/fpbdb/UPLOADFASTA',
        pick: '#filePicker',

        // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
        resize: false
    });
   // console.log("init ok");
    uploader.on('fileQueued', function(file) {
        $('#selectFile').css('display', 'inline');
        $('#selectFileDiv').css('display', 'inline');

        var $selectFileDiv = $('#selectFileDiv');
        $selectFileDiv.empty();
        /*$("#filePicker").append(file.name);*/
        layui.sessionData('test', {
            key: 'fileName',
            value: file.name
        });

        var $selectFileDivOl = $('<li id="select_file" style="margin-top: 5px;display: inline;">' + layui.sessionData('test').fileName + '</li>');
        // $("#filePicker").append('<div id="select_file" style=";font-size:20px">' +
        //     file.name +
        //     '</div>');
        /*$selectFileDiv.appendTo("#selectFileOl")*/

        $selectFileDiv.append($selectFileDivOl);
    });
    uploader.on('uploadSuccess', function(file, response) {
        uploader.removeFile(file, true);
        /*$("#select_file").remove();*/

    });
    // 所有文件上传成功后调用        
    uploader.on('uploadFinished', function() {
        //清空队列
        uploader.reset();
    });
    uploader.on('uploadSuccess', function(file, response) {
        var upload_data = response._raw;
        var upload_json = $.parseJSON(upload_data);
        uploaded = {};
        uploaded.filename = upload_json.data.filename;
    });

    var Country = '';
    for (var a = 0; a <= _areaList.length - 1; a++) {
        var objContry = _areaList[a];
        Country += '<option value="' + objContry + '" a="' + (a + 1) + '">' + objContry + '</option>';
    }
    var $Country = $("#Country");
    $Country.append(Country);
    $("#Country").change(function() {
        var selected = $(this).children('option:selected').val();
    });
    form.render();
}

function titleCase(str) {

    var array = str.toLowerCase().split(" ");
    for (var i = 0; i < array.length; i++) {
        array[i] = array[i][0].toUpperCase() + array[i].substring(1, array[i].length);
    }
    var string = array.join(" ");

    return string;
}
//去掉字符串左边的空格
function LTrim(value) {
    var re = /\s*((\S+\s*)*)/;
    return value.replace(re, "$1");
}
//去掉字符串右边的空格
function RTrim(value) {
    var re = /((\s*\S+)*)\s*/;
    return value.replace(re, "$1");
}