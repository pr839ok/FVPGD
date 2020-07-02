(function() {
    "use strict";

    var form, layer, element, laypage, laydate, table, formSelects;
    var current_user, bsuperadmin;

    getCurrentUserInit();


    function getCurrentUserInit() {
        getCurrentUser(function(result) {
            current_user = result.data.username;
            bsuperadmin = result.data.bsuperadmin;
            init();
        })
    }

    function init() {
        layui.config({
            base: '/gosweb/plugins/layui-formSelects-master/src/' //此处路径请自行处理, 可以使用绝对路径
        }).extend({
            formSelects: 'formSelects-v4',
        });
        layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table', 'formSelects'], function() {
            form = layui.form;
            layer = layui.layer;
            element = layui.element;
            laypage = layui.laypage;
            laydate = layui.laydate;
            table = layui.table;
            formSelects = layui.formSelects;
            initBtn();
            refreshDataBase();
        });
    }

    function initBtn() {
        $('#id_btn_addlibrary').unbind("click").bind("click", function() {
            $('#ea-name').val("");
            $('#type-blast').prop('checked', true);
            $('#type-cgmlst').prop('checked', true);
            $('#type-crispr').prop('checked', true);
            getGeneDb(function(genedata) {
                renderFormSelects('genedb-select', genedata, []);
                openEditAddDiv('新增分库', function(data) {
                    var url = '/fpbdb/ADDLIBRARY';
                    getAjax(true, 'post', url, JSON.stringify(data), 'json', function(result) {
                        if (result.code == 200) {
                            layer.msg(result.msg, { icon: 1, time: 2000 });
                        } else {
                            layer.msg(result.msg, { icon: 2, time: 2000 });
                        }
                        refreshDataBase();
                    });
                });
            });
        });
    }

    function refreshDataBase() {
        var url = '/fpbdb/GETALLLIBRARY';
        getAjax(true, 'GET', url, null, 'json', function(json) {
            $('#library_div').empty();
            for (var i in json.data) {
                createCardByData(json.data[i], $('#library_div'));
            }
        });
    }

    function createCardByData(data, $parent) {
        var id = data.library_id;
        var $div = $('<div class="layui-col-md6"></div>');
        var $card = $('<div class="layui-card"></div>');
        var $header = $('<div class="layui-card-header" style="cursor:pointer;"></div>');
        var $span = $('<a href="pubDBLibraryDataManager.html?libraryid=' + id + '" style="font-size:18px;">' + data.showname + '</a>');
        $span.appendTo($header);

        var $editBtn = $('<button type="button" class="layui-btn layui-btn-sm layui-btn-primary">编辑</button>');
        var $delBtn = $('<button type="button" class="layui-btn layui-btn-sm layui-btn-danger">删除</button>');
        var $opdiv = $('<div style="display:inline-block;position: absolute; right: 10px;"></div>');

        $editBtn.appendTo($opdiv);
        $delBtn.appendTo($opdiv);
        $opdiv.appendTo($header);

        var $body = $('<div class="layui-card-body"></div>');
        var $row = $('<div class="layui-row"></div>');
        var str = '<div class="layui-col-md12"><table><tbody>';
        str += '<tr><td>创建时间:</td><td>' + formatTime(data.create_time) + '</td></tr>';
        str += "</tbody></table></div>";
        $(str).appendTo($row);
        var $btnDiv = $('<div class="layui-col-md12"></div>');
        var type = data.attr[0] == '1' ? 'BLAST,' : '';
        type += data.attr[1] == '1' ? 'CGMLST,' : '';
        type += data.attr[2] == '1' ? 'CRISPR,' : '';
        type = type.substring(0, type.length - 1);
        var $btnrow = $('<div class="layui-row"><p title="类型">类型:' + type + '</p></div>');
        $btnrow.appendTo($btnDiv);
        $btnDiv.appendTo($row);
        $row.appendTo($body);
        $header.appendTo($card);
        $body.appendTo($card);
        $card.appendTo($div);
        $div.appendTo($parent);

        $editBtn.unbind("click").bind("click", function() {
            openEditDiv(id);
        });
        $delBtn.unbind("click").bind("click", function() {
            layer.confirm("确定删除分库:" + data.name + "？", {
                skin: 'layui-layer-molv',
                icon: 3,
                title: '提示'
            }, function(index) {
                var url = '/fpbdb/DELETELIBRARY?id=' + id;
                getAjax(true, 'POST', url, null, 'json', function(result) {
                    if(result.code == 200){
                        refreshDataBase();
                    }else{
                        layer.msg(result.msg, { icon: 2, time: 2000 });
                    }
                });
                layer.close(index);
            });
        });
    }

    function openEditDiv(library_id) {
        getLibraryDetail(library_id, function(data) {
            $('#ea-name').val(data.showname);
            $('#type-blast').prop('checked', data.attr[0] == 1);
            $('#type-cgmlst').prop('checked', data.attr[1] == 1);
            $('#type-crispr').prop('checked', data.attr[2] == 1);
            getGeneDb(function(genedata) {
                renderFormSelects('genedb-select', genedata, data.genedbs);
                openEditAddDiv('编辑分库', function(data) {
                    var url = '/fpbdb/EDITLIBRARY';
                    data.id = library_id;
                    getAjax(true, 'post', url, JSON.stringify(data), 'json', function(result) {
                        if (result.code == 200) {
                            layer.msg(result.msg, { icon: 1, time: 2000 });
                        } else {
                            layer.msg(result.msg, { icon: 2, time: 2000 });
                        }
                        refreshDataBase();
                    });
                });
            });
        })
    }

    function openEditAddDiv(title, callback) {
        var win = new AdaptiveWindow({
            windowTitle: title,
            windowType: 1,
            windowArea: ['600px', '400px'],
            windowContent: $('#library_edit_add_div'),
            windowBtn: ['确定', '关闭'],
            windowSuccess: function() {},
            windowBtnFunc: [
                function() {
                    var data = getChangeLibraryValue();
                    if (data.showname == null || data.showname == "") {
                        layer.msg("分库名不能为空", { icon: 2, time: 2000 });
                    } else {
                        win.close();
                        callback(data);
                    }
                },
                function() {
                    win.close();
                }
            ]
        });
        win.open();
    }

    function getChangeLibraryValue() {
        var data = {};
        data.showname = $('#ea-name').val();
        var blast = $('#type-blast').prop("checked") ? "1" : "0";
        var cgMLST = $('#type-cgmlst').prop("checked") ? "1" : "0";
        var CRISPR = $('#type-crispr').prop("checked") ? "1" : "0";
        data.attr = blast + cgMLST + CRISPR;
        data.genedbIds = formSelects.value('genedb-select', 'valStr');
        data.name=data.showname;
        return data;
    }

    function renderFormSelects(name, data, selectValue) {
        let targetArray = [];
        for (let i = 0; i < data.length; i++) {
            var isAdd = false;
            for (let j = 0; j < selectValue.length; j++) {
                if (selectValue[j].gene_database_id === data[i].gene_database_id) {
                    targetArray.push({
                        name: data[i].chinese_name,
                        value: data[i].gene_database_id,
                        selected: "selected"
                    });
                    isAdd = true;
                    break;
                }
            }
            if (!isAdd) {
                targetArray.push({
                    name: data[i].chinese_name,
                    value: data[i].gene_database_id
                });
            }
        }
        formSelects.data(name, 'local', { arr: targetArray });
    }

    function formatTime(timestr) {
        if (timestr == null) {
            return "";
        }
        if (timestr.indexOf(":") > 0) {
            var index = timestr.lastIndexOf(":");
            return timestr.substring(0, index);
        }
    }

    function getLibraryDetail(id, callback) {
        var url = '/fpbdb/GETLIBRARYDETAIL?id=' + id;
        getAjax(true, 'GET', url, null, 'json', function(result) {
            if (result.code == 200) {
                callback(result.data);
            } else {
                layer.msg(result.msg, { icon: 2, time: 2000 });
            }
        });
    }

    function getGeneDb(callback) {
        var url = '/base/GETGENEDATABASENOTPIC';
        getAjax(true, 'GET', url, null, 'json', function(result) {
            callback(result);
        });
    }
})();