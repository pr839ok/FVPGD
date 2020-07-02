layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
    form = layui.form;
    // layer = parent.layer === undefined ? layui.layer : parent.layer;
    layer = layui.layer;
    element = layui.element;
    laypage = layui.laypage;
    laydate = layui.laydate;
    table = layui.table;
    form.on('submit(submitForm)', function(data) {
        console.log(JSON.stringify(data.field));
        var varietiesID = $('#par').val();
        var email = $('#email_input').val();
        var tempform = {};
        tempform.varietiesID = varietiesID;
        tempform.email = email;
        submitForm(tempform);
        return false;
    });
});

function submitForm(tempform) {
    getAjax(true, 'POST', '/fpbdb/SUBMITREFSEQ', JSON.stringify(tempform), 'json', function(json) {
        layer.msg('successful');
    });
}
var uploader = WebUploader.create({
    auto: true,

    // swf文件路径
    swf: '../webupload/Uploader.swf', // swf文件路径
    server: '/fpbdb/UPLOADFASTA',
    pick: '#filePicker',

    // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
    resize: false
});
var file = "";
var time = "";
uploader.on('fileQueued', function(file) {
    $('#infoNFS').css('display', 'none');
    $('#selectFile').css('display', 'inline');
    $('#selectFileDiv').css('display', 'inline');

    var $selectFileDiv = $('#selectFileDiv');
    $selectFileDiv.empty();
    /*$("#filePicker").append(file.name);*/
    layui.sessionData('test2', {
        key: 'fileName',
        value: file.name
    });

    var $selectFileDivOl = $('<li id="select_file" style="margin-top: 5px;display: inline;"><span>Uploaded file:</span>' + layui.sessionData('test2').fileName + '</li>');
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
    /*tempdata.filename = upload_json.data.filename;*/
    uploaded.filename = upload_json.data.filename;
    /*uploaded.path=upload_json.data.realSavePath;
    console.log(uploaded.path);*/
});
$('#cgmlst').bind('click', function() {

    setTimeout(get_data, 1000);
});

function get_data() {

    var rtl = $("#rtl option:selected").val();
    if ($('[name=selectRadio]:checked').val() == 0) {
        $('.layui-col-md-offset2').css({ 'display': 'none' });
        $('#filelist_table').css('display', 'none');
        $('#loadingnew').css({ 'display': 'block' });
        $('#clickp').css('display', 'none');
        $('#table').css('display', 'none');
        $('#anim').css('display', 'block');
        if ($('.query_input_div').val() != "") {
            var query = $('.query_input_div').val();
            var tempdata = {};
            tempdata.query = query;
            tempdata.rtl = rtl;
            tempdata.library = getUrlParam('library');
            getAjax(true, 'POST', '/fpbdb/TYPINGCRISPR', JSON.stringify(tempdata), 'json', function(json) {
                $('#filelist_table').css('display', 'block');
                $('.layui-col-md-offset2').css({ 'display': 'block' });

                $("#par").attr("value", json.data);
                $(".par").text(json.data);
                timer = setInterval(show_data, 3000);
            });
        } else {
            layer.msg('No input！！！');
        }

    } else {
        if ($("#select_file").text() != "") {
            $('.layui-col-md-offset2').css({ 'display': 'none' });
            $('#filelist_table').css('display', 'none');
            $('#loadingnew').css({ 'display': 'block' });
            $('#clickp').css('display', 'none');
            $('#table').css('display', 'none');
            $('#anim').css('display', 'block');
            var temp = layui.sessionData('test2').fileName + "," + rtl;
            getAjax(true, 'GET', '/fpbdb/TYPINGCRISPRFILE?temp=' + temp + "," + getUrlParam('library'), null, 'json', function(json) {
                $('#filelist_table').css('display', 'block');
                $('.layui-col-md-offset2').css({ 'display': 'block' });

                $("#par").attr("value", json.data);
                $(".par").text(json.data);
                timer = setInterval(show_data, 3000);
            });
        } else {
            layer.msg('No files selected！！！');
        }


    }
}

function show_data() {
    getAjax(true, 'GET', '/fpbdb/TYPINGCRISPRTIME?temp=' + $("#par").val(), null, 'json', function(json) {
        time = json.data;
        getAjax(true, 'GET', '/fpbdb/ANALYSISCRISPR?temp=' + $("#par").val() + "," + time, null, 'json', function(json) {
            if (json.code == 200) {

            } else if (json.code == 403) {

            } else {
                $('#anim').css('display', 'none');
                $('#clickp').css('display', 'block');
                tabledata = json.data;
                clearInterval(timer);
            }
        });
    });
}

function js_method() {
    $('#table').css('display', 'block');
    $('#filelist_table').css('display', 'block');
    get_table(tabledata);
}

function get_table(data) {
    $('#clickp').css('display', 'none');
    layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
        form = layui.form;
        // layer = parent.layer === undefined ? layui.layer : parent.layer;
        layer = layui.layer;
        element = layui.element;
        laypage = layui.laypage;
        laydate = layui.laydate;
        table = layui.table;
        table.render({
            elem: '#filelist',
            cols: [
                [{ field: 'name', title: 'name', align: 'center', sort: true },
                    { field: 'id', title: 'id', align: 'center' }, { fixed: 'right', title: 'tool', toolbar: '#barDemo', align: 'center', width: 150 }
                ]
            ],
            data: data,
            page: true
        });
        //监听行工具事件
        table.on('tool(filelist)', function(obj) {
            var data = obj.data;
            if (obj.event === 'check') {
                getAjax(true, 'GET', '/fpbdb/SEARCHCRISPRSEQ?temp=' + $("#par").val() + "," + data.name + "," + time, null, 'json', function(json) {
                    $("#direct").val(json.data.direct_repeat);
                    $("#binding").val(json.data.binding_site);
                    form.render();
                    layer.open({
                        type: 1,
                        title: '',
                        area: ['700px', '220px'],
                        content: $('#form'),
                        btn: ['confirm'],
                        yes: function(index, layero) {
                            layer.close(index);
                        },
                        cancel: function() {
                            //右上角关闭回调

                            //return false 开启该代码可禁止点击该按钮关闭
                        }
                    });
                });
            } else if (obj.event === 'edit') {
                getAjax(true, 'GET', '/fpbdb/SEARCHCRISPRSEQ?temp=' + data.name + "," + $("#par").val(), null, 'json', function(json) {
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
                        yes: function(index, layero) {
                            var tempdata = {};
                            tempdata.name = data.name;
                            tempdata.par = $("#par").val();
                            tempdata.rtl = $("#rtl option:selected").val();
                            tempdata.id = $("#ID").val();
                            getAjax(true, 'POST', '/fpbdb/ADDCRISPRSEQ', JSON.stringify(tempdata), 'json', function(json) {
                                if (json.code == 200) {
                                    layer.close(index);
                                }
                            });
                        },
                        cancel: function() {
                            //右上角关闭回调

                            //return false 开启该代码可禁止点击该按钮关闭
                        }
                    });
                });

            }
        });
    });

}