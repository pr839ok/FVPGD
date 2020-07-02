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
    // swf文件路径
    swf: '../webupload/Uploader.swf', // swf文件路径
    server: '/fpbdb/UPLOADFASTA',
    pick: '#filePicker',

    // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
    resize: false
});
uploader.on('fileQueued', function(file) {
    $('#infoNFS').css('display', 'none');
    $('#selectFile').css('display', 'inline');
    $('#selectFileDiv').css('display', 'inline');
    $('#strain_input').val(file.name.substring(0, file.name.lastIndexOf(".")));

    var $selectFileDiv = $('#selectFileDiv');
    $selectFileDiv.empty();
    /*$("#filePicker").append(file.name);*/
    layui.sessionData('test1', {
        key: 'fileName',
        value: file.name
    });

    var $selectFileDivOl = $('<li id="select_file" style="margin-top: 5px;display: inline;"><span>Uploaded file:</span>' + layui.sessionData('test1').fileName + '</li>');
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
    submittypingfile();
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
    get_data();

});
var timer = null;
var tabledata = [];
var evtreeTimmer = null;

function initCreateEvTree() {
    $('#create-tree').unbind('click').bind('click', function() {
        $('#evtree-loop').addClass('layui-hide');
        $('#evtree-download').addClass('layui-hide');
        $('#evtree-view').addClass('layui-hide');
        $('#pic-name').addClass('layui-hide');
        var id = $('#par').text();
        var strain = $('#strain_input').val();
        var library = getUrlParam('library');
        if (id == null || id == "") {
            layer.msg("taskid is empty", { icon: 2 });
            return;
        }
        if (strain == null || strain.trim() == "") {
            layer.msg("strain is empty", { icon: 2 });
            return;
        }
        var email = $('#email_input').val();
        if (email == null || email.trim() == "") {
            layer.msg("It will take a while, please enter the email, we will send the result to your email", { icon: 2, time: 3000 });
            return;
        }
        var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
        if (reg.test(email)) {
            var url = '/fpbdb/CREATEEVTREE?taskid=' + id + "&library=" + library + "&strain=" + strain + "&email=" + email;
            getAjaxNotLoad(true, 'GET', url, null, 'json', function(json) {
                if (json.code == 200) {
                    $('#evtree-loop').removeClass('layui-hide');
                    evtreeTimmer = setInterval(function() {
                        getEvTreeState(json.data);
                    }, 3000);
                } else {
                    layer.msg(json.msg, { icon: 2 });
                }
            });
        } else {
            layer.msg("Please enter the correct email", { icon: 2, time: 3000 });
        }

    })
}

function getEvTreeState(uid) {
    getAjaxNotLoad(true, 'GET', '/fpbdb/ANALYSIS?temp=' + uid, null, 'json', function(json) {
        if (json.code == 203) {
            var downloadUrl = '/fpbdb/download' + json.data.evtreepic + '?temp=0';
            var txtUrl = '/fpbdb/download' + json.data.evtreetxt + '?temp=0';
            $('#evtree-loop').addClass('layui-hide');
            $('#evtree-download').removeClass('layui-hide');
            $('#evtree-view').removeClass('layui-hide');
            $('#evtree-download').unbind('click').bind('click', function() {
                downloadFile(downloadUrl, 'circular_tree.png');
            });
            $('#pic-name').removeClass('layui-hide');
            $('#pic-name').html('circular_tree.png');
            $('#evtree-view').unbind('click').bind('click', function() {
                window.open('/gosweb/pubDB/visualTool/evolutionaryTreesShow.html?id=' + uid);
            });
            clearInterval(evtreeTimmer);
        } else if (json.code == 403) {
            layer.msg("task no exit", { icon: 2 });
            clearInterval(evtreeTimmer);
        } else if (json.code == 500) {
            layer.msg("task failed", { icon: 2 });
            $('#pic-name').removeClass('layui-hide');
            $('#evtree-loop').addClass('layui-hide');
            $('#pic-name').html('failed');
            clearInterval(evtreeTimmer);
        }

    });

}

function get_data() {

    if ($('[name=selectRadio]:checked').val() == 0) {
        if ($('.query_input_div').val() != "") {
            $('.layui-col-md-offset2').css({ 'display': 'none' });
            $('#filelist_table').css('display', 'none');
            $('#loadingnew').css({ 'display': 'block' });
            $('#clickp').css('display', 'none');
            $('#table').css('display', 'none');
            $('#anim').css('display', 'block');
            var query = $('.query_input_div').val();
            var tempdata = {};
            tempdata.query = query;
            tempdata.library = getUrlParam('library');
            getAjax(true, 'POST', '/fpbdb/TYPINGCGMLST', JSON.stringify(tempdata), 'json', function(json) {
                $('#filelist_table').css('display', 'block');
                $('.layui-col-md-offset2').css({ 'display': 'block' });
                $("#par").attr("value", json.data);
                $(".par").text(json.data);
                timer = setInterval(show_data, 3000);
            });
        } else {
            layer.msg('No input', { icon: 2 });
        }

    } else {
        if ($("#select_file").text() != "") {
            uploader.upload();
        } else {
            layer.msg('No files selected', { icon: 2 });
        }
    }
}

function submittypingfile() {
    $('.layui-col-md-offset2').css({ 'display': 'none' });
    $('#filelist_table').css('display', 'none');
    $('#loadingnew').css({ 'display': 'block' });
    $('#clickp').css('display', 'none');
    $('#table').css('display', 'none');
    $('#anim').css('display', 'block');
    getAjax(true, 'GET', '/fpbdb/TYPINGCGMLSTFILE?temp=' + layui.sessionData('test1').fileName + "," + getUrlParam('library'), null, 'json', function(json) {
        $('#filelist_table').css('display', 'block');
        $('.layui-col-md-offset2').css({ 'display': 'block' });
        $("#par").attr("value", json.data);
        $(".par").text(json.data);
        timer = setInterval(show_data, 3000);
    });
}



function show_data() {
    getAjaxNotLoad(true, 'GET', '/fpbdb/ANALYSIS?temp=' + $("#par").val(), null, 'json', function(json) {
        if (json.code == 200) {

        } else if (json.code == 403) {
            layer.msg("task no exit", { icon: 2 });
            clearInterval(timer);
        } else {
            $('#anim').css('display', 'none');
            //$('#loadingnew').css({ 'display': 'none' });
            $('#clickp').css('display', 'block');
            tabledata = json.data.coremsg;
            //get_table(json.data);
            clearInterval(timer);
        }
    });
}

function initDownloadTable(data) {
    $('#export_table_div').removeClass("layui-hide");
    $('#export_table').unbind('click').bind('click', function() {
        var edata = [];
        for (var i in data) {
            var line = [];
            line.push(data[i].geneName);
            line.push(data[i].state);
            line.push(data[i].length);
            line.push(data[i].chromosome);
            line.push(data[i].start);
            line.push(data[i].end);
            edata.push(line);
        }
        table.exportFile(['Locus', 'Allele', 'length', 'chromosome', 'Start position', 'End position'], edata, 'csv');
    });
}

function get_table(data) {
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
                [{ field: 'geneName', title: 'Locus', sort: true },
                    { field: 'state', title: 'Allele', templet: '#titleTpl' },
                    { field: 'length', title: 'length', sort: true },
                    { field: 'chromosome', title: 'chromosome', sort: true },
                    { field: 'start', title: 'Start position', sort: true },
                    { field: 'end', title: 'End position', sort: true }
                ]
            ],
            data: data,
            page: true
        });
        initDownloadTable(data);
        // initPhenotypeTable();
    });

}

function js_method() {
    $('#table').css('display', 'block');
    $('#filelist_table').css('display', 'block');
    initCreateEvTree();
    get_table(tabledata);
}

function getUrlParam(name) { //a标签跳转获取参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
}