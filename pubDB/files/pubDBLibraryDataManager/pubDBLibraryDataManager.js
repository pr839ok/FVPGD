var current_user = "";

(function() {
    "use strict";

    var form, layer, element, laypage, laydate, table;
    var layerIndex;
    var bsuperadmin = false;
    var curOrderstr = "upload_start_time";
    var curOrder = "desc";
    var tableCurHeight = 85;
    getCurrentUserInit();
    //export data head
    var gene_database_id = -1;
    var library_id;
    var curtype;

    function getCurrentUserInit() {
        getCurrentUser(function(result) {
            current_user = result.data.username;
            bsuperadmin = result.data.bsuperadmin;
            init();
        })
    }

    function init() {
        layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
            form = layui.form;
            layer = layui.layer;
            element = layui.element;
            laypage = layui.laypage;
            laydate = layui.laydate;
            table = layui.table;
            initLibrarySelect(function() {
                initDataSelect();
                initSampleTable();
                initStorageSampleTable();
            });
        });
    }

    function initLibrarySelect(callback) {
        var url = '/fpbdb/GETALLLIBRARY';
        library_id = getUrlParam("libraryid");
        getAjax(true, 'GET', url, null, 'json', function(json) {
            if (json.code == 200) {
                var $fromselect = $("#library-select");
                $fromselect.empty();
                for (var i in json.data) {
                    var $option;
                    if (library_id == json.data[i].library_id) {
                        $option = $('<option value="' + json.data[i].library_id + '" selected>' + json.data[i].name + '</option>');
                    } else {
                        $option = $('<option value="' + json.data[i].library_id + '">' + json.data[i].name + '</option>');
                    }
                    $option.appendTo($fromselect);
                }
                form.render();
                form.on('select(library-select)', function(data) {
                    library_id = $fromselect.val();
                    curLibrary = $('#library-select').find("option:selected").text();
                    refreshStorageSampleTable();
                });
                form.on('select(type-select)', function(data) {
                    refreshStorageSampleTable();
                });
                callback();
            } else {
                layer.msg("获取分库信息失败", { icon: 2, time: 2000 });
            }
        });
    }

    function refreshAnalysisDiv(type, callback) {
        if (type == 'CRISPR') {
            $('#crisprlibrary-div').removeClass("layui-hide");
        } else {
            $('#crisprlibrary-div').addClass("layui-hide");
        }
        curtype = type;
        $('#analysis-library').text($('#library-select').find("option:selected").text());
        $('#analysis-type').text(type);
        refreshSampleTable(type);
        callback();
    }

    function refreshLibrary(callback) {
        var url = '/fpbdb/GETALLLIBRARY';
        getAjax(true, 'GET', url, null, 'json', function(json) {
            var $fromselect = $("#form-library-history");
            $fromselect.empty();
            for (var i in json.data) {
                var $option
                if (library_id == json.data[i].library_id) {
                    $option = $('<option value="' + json.data[i].library_id + '" selected>' + json.data[i].name + '</option>');
                } else {
                    $option = $('<option value="' + json.data[i].library_id + '">' + json.data[i].name + '</option>');
                }
                $option.appendTo($fromselect);
            }
            $('#form-workflow-history').val($('#type-select').val())
            form.render();
            callback();
        });
    }

    function initDataSelect() {
        initUploadGvcfFiles();
        $('#id_btn_upload_gvcf').unbind('click').bind('click', function() {
            layer.open({
                type: 1,
                content: $('#id_div_upload_gvcf'),
                area: '800px'
            });
        });
        $('#batch-more-history').unbind('click').bind('click', function() {
            refreshLibrary(function() {
                var win = new AdaptiveWindow({
                    windowTitle: '数据筛选',
                    windowType: 1,
                    windowArea: ['450px', '350px'],
                    windowContent: $('#analysis-history'),
                    windowBtn: ['确定', '取消'],
                    windowSuccess: function(layero, index) {},
                    windowBtnFunc: [function() {
                        var databaseL = $("#form-library-history").find("option:selected").text();
                        var text = $("#form-workflow-history").find("option:selected").text();
                        showHistory(databaseL, text);
                    }, function() {
                        win.close();
                    }]
                });
                win.open();
            })
        });
        $('#id_btn_upload_clean_gvcf').unbind('click').bind('click', function() {
            $('#id_tbody_upload_gvcf').empty();
        });
        $("#blast").unbind('click').bind('click', function() {
            var type = 'BLAST';
            refreshAnalysisDiv(type, function() {
                var win = new AdaptiveWindow({
                    windowTitle: type,
                    windowType: 1,
                    windowArea: ['850px', '600px'],
                    windowContent: $('#analysis-configurator'),
                    windowBtn: ['确定', '取消'],
                    windowSuccess: function(layero, index) {},
                    windowBtnFunc: [function() {
                        getAnalysisData(type, function(tempFormParam) {
                            getAjax(true, 'POST', '/fpbdb/ANALYSISBLASTFILE', JSON.stringify(tempFormParam), 'json', function(data) {
                                if (data.code == 200) {
                                    layer.msg("提交成功", { icon: 1 });
                                    win.close();
                                } else {
                                    layer.msg(data.msg, { icon: 2 });
                                }
                            });
                        });
                    }, function() {
                        win.close();
                    }]
                });
                win.open();
            });
        });
        $("#cgmlst").unbind('click').bind('click', function() {
            var type = 'CGMLST';
            refreshAnalysisDiv(type, function() {
                var win = new AdaptiveWindow({
                    windowTitle: type,
                    windowType: 1,
                    windowArea: ['850px', '600px'],
                    windowContent: $('#analysis-configurator'),
                    windowBtn: ['确定', '取消'],
                    windowSuccess: function(layero, index) {},
                    windowBtnFunc: [function() {
                        getAnalysisData(type, function(tempFormParam) {
                            getAjax(true, 'POST', '/fpbdb/ANALYSISTYPINGCGMLSTFILE', JSON.stringify(tempFormParam), 'json', function(data) {
                                if (data.code == 200) {
                                    layer.msg("提交成功", { icon: 1 });
                                    win.close();
                                } else {
                                    layer.msg(data.msg, { icon: 2 });
                                }
                            });
                        });
                    }, function() {
                        win.close();
                    }]
                });
                win.open();
            });
        });
        $("#crispr").unbind('click').bind('click', function() {
            var type = 'CRISPR';
            refreshAnalysisDiv(type, function() {
                var win = new AdaptiveWindow({
                    windowTitle: type,
                    windowType: 1,
                    windowArea: ['850px', '600px'],
                    windowContent: $('#analysis-configurator'),
                    windowBtn: ['确定', '取消'],
                    windowSuccess: function(layero, index) {},
                    windowBtnFunc: [function() {
                        getAnalysisData(type, function(tempFormParam) {
                            getAjax(true, 'POST', '/fpbdb/ANALYSISTYPINGCRISPRFILE', JSON.stringify(tempFormParam), 'json', function(data) {
                                if (data.code == 200) {
                                    layer.msg("提交成功", { icon: 1 });
                                    win.close();
                                } else {
                                    layer.msg(data.msg, { icon: 2 });
                                }
                            });
                        });
                    }, function() {
                        win.close();
                    }]
                });
                win.open();
            });
        });
    }

    function getAnalysisData(type, callback) {
        var temp = {};
        var sdata = table.checkStatus('sample_table').data;
        if (sdata.length <= 0) {
            layer.msg("未选择样本", { icon: 5 });
            return;
        }
        if (type == 'CRISPR' && !$('#crisprlibrary-div').hasClass("layui-hide")) {
            if (sdata.length > 1) {
                layer.msg("选定样本超过1", { icon: 2 });
                return;
            }
            temp.crisprlibrary = $("#form-crisprlibrary-select").find("option:selected").text();
        }
        var samples = '';
        var dbs = '';
        var exit = false;
        for (var i in sdata) {
            samples += sdata[i].name + ",";
            dbs += sdata[i].gene_database_name + ",";
            if (sdata[i].storage_state == 'exit') {
                exit = true;
            }
        }
        temp.library = $('#library-select').find("option:selected").text();
        temp.type = type;
        temp.filename = samples.substring(0, samples.length - 1);
        temp.database = dbs.substring(0, dbs.length - 1);
        if (exit) {
            layer.confirm("已选样品部分已操作，是否继续?", {
                skin: 'layui-layer-molv',
                icon: 3,
                title: '提示'
            }, function(index) {
                callback(temp);
            });
        } else {
            callback(temp);
        }
    }

    function initUploadGvcfFiles() {
        layui.use('upload', function() {
            var upload = layui.upload;
            var load_index;
            var uploadFilesTable = $("#id_tbody_upload_gvcf");
            var uploadListIns = upload.render({
                elem: '#id_btn_sel_upload_files_gvcf',
                url: '/base/UPLOADGVCFFILES',
                accept: 'file',
                acceptMime: '.fa',
                multiple: true,
                auto: false,
                bindAction: '#id_btn_upload_files_gvcf',
                choose: function(obj) {
                    var files = this.files = obj.pushFile();
                    obj.preview(function(index, file, result) {
                        var tr = $(['<tr id="upload-' + index + '">',
                            '<td>' + file.name + '</td>',
                            '<td>' + (file.size / 1024).toFixed(1) + 'kb</td>',
                            '<td>等待上传</td>',
                            '<td>' + file.name.split('.')[0] + '</td>',
                            '<td>',
                            '<button class="layui-btn layui-btn-xs upload-reload-gvcf layui-hide">重传</button>',
                            '<button class="layui-btn layui-btn-xs layui-btn-danger upload-delete-gvcf">删除</button>',
                            '</td>',
                            '</tr>'
                        ].join(''));
                        tr.find('.upload-reload-gvcf').on('click', function() {
                            obj.upload(index, file);
                        });
                        tr.find('.upload-delete-gvcf').on('click', function() {
                            delete files[index];
                            tr.remove();
                            uploadListIns.config.elem.next()[0].value = '';
                        });
                        uploadFilesTable.append(tr);
                    });
                },
                done: function(res, index, upload) {
                    var tr = uploadFilesTable.find('tr#upload-' + index);
                    var tds = tr.children();
                    tds.eq(2).html('<span style="color: #5FB878;">' + res.message + '</span>');
                    if (res.code == 200) {
                        return delete this.files[index];
                    } else {
                        tds.eq(4).find('.upload-reload').removeClass('layui-hide');
                    }

                },
                before: function(obj) {
                    load_index = layer.load(1);
                },
                allDone: function(obj) {
                    layer.close(load_index);
                },
                error: function(index, upload) {
                    var tr = uploadFilesTable.find('tr#upload-' + index);
                    var tds = tr.children();
                    tds.eq(2).html('<span style="color: #FF5722;">上传失败</span>');
                    tds.eq(3).html('.upload-reload-gvcf').removeClass('layui-hide');
                    load_index = layer.load(1);
                },
            });
        });
    }

    function initSelectUpdataColTable(col_names) {
        table.render({
            elem: '#updata_table',
            cols: [
                [ //标题栏
                    { type: 'checkbox', name: '选择' },
                    { field: 'col_name', align: 'center', title: '列名' }
                ]
            ],
            data: col_names,
            even: true,
            limit: 10000,
        });

    }

    function showHistory(library, type) {
        var temp = {};
        temp.library = library;
        temp.type = "GOS" + type;
        var win = new AdaptiveWindow({
            windowTitle: "结果查看",
            windowType: 1,
            windowContent: $('#table'),
            windowBtn: ['关闭'],
            windowSuccess: function() {
                var cols = [
                    [
                        { field: 'name', title: 'Strain', align: 'center' },
                        { field: 'state', title: 'State', align: 'center' },
                        { field: 'submit_time', title: 'Submit time', align: 'center' },
                        { field: 'end_time', title: 'End time', align: 'center' },
                        { field: 'msg', title: 'Remarks', align: 'center' }
                    ]
                ];
                if (type == 'CRISPR') {
                    cols[0].push({ fixed: 'right', title: '操作', toolbar: '#barDemoMain', align: 'center', width: 150 });
                    table.on('tool(filelist)', function(obj) {
                        var linedata = obj.data;
                        if (linedata.result && linedata.result != "" && linedata.state == 'Success') {
                            showCrisprResult(linedata.result, linedata.id);
                        } else {
                            layer.msg("结果错误", { icon: 2 })
                        }
                    });
                }
                if (type == 'CGMLST') {
                    cols[0].push({ fixed: 'right', title: '操作', toolbar: '#cg-history-btn', align: 'center', width: 150 });
                    table.on('tool(filelist)', function(obj) {
                        var linedata = obj.data;
                        var layEvent = obj.event;
                        if (layEvent == 'view-cgm-result') {
                            if (linedata.state == 'Success') {
                                if (!linedata.result || linedata.result == "") {
                                    layer.msg("无结果");
                                } else {
                                    showCgmlstResult(library,linedata.name,linedata.result);
                                }
                            } else {
                                layer.msg("结果错误", { icon: 2 })
                            }
                        } else if (layEvent == 'del-cgm-history') {
                            layer.confirm('确认删除记录' + linedata.name + "?(不会删除建库信息)", function(index) {
                                let url = '/fpbdb/deletegostask?taskid=' + linedata.id;
                                getAjax(true, 'GET', url, null, 'json', function(res) {
                                    if (res.code == 200) {
                                        layer.msg(res.msg, { icon: 1 });
                                        loadHistoryTable(cols, temp);
                                    } else {
                                        layer.msg(res.msg, { icon: 2 });
                                    }
                                })
                                layer.close(index);
                            });
                        }
                    });
                }
                loadHistoryTable(cols, temp);
            }
        });
        win.open();
    }

    function loadHistoryTable(cols, temp) {
        var url = '/fpbdb/gosgettask?temp=' + JSON.stringify(temp);
        getAjax(true, 'GET', url, null, 'json', function(json) {
            table.render({
                elem: '#filelist',
                cols: cols,
                data: json.data,
                page: true,
                initSort: {
                    field: 'submit_time',
                    type: 'desc'
                }
            });
        });

    }

    function showCgmlstResult(library,name,result) {
        var win = new AdaptiveWindow({
            windowTitle: name+"建库情况",
            windowType: 1,
            windowContent: $('#cgmlstresult'),
            windowBtn: ['关闭'],
            windowSuccess: function() {
                var obj = JSON.parse(result);
                var nofind = obj.nofind;
                var success = obj.success.split(",");
                var successdata = [];
                for(var i in success){
                    let index = success[i].lastIndexOf(".");
                    successdata.push({"seq":success[i].substring(0,index),"index":success[i].substring(index+1),"library":library})
                }
                table.render({
                    elem: '#cg-success-seq',
                    cols: [
                        [{ field: 'seq', title: 'Gene', align: 'center', sort: true },
                            { field: 'index', title: 'Allele', align: 'center',templet: '#cg-res-index' }
                        ]
                    ],
                    data: successdata,
                    page: true
                });
                $('#cg-noexit-result').empty();
                $('#cg-noexit-result').html(nofind);
            }
        });
        win.open();
    }

    function showCrisprResult(result, taskid) {
        var data = [];
        var rs = result.split(" ");
        for (var i = 0; i < rs.length; i++) {
            var val = rs.split(",");
            var obj = {};
            obj.name = val[0];
            obj.id = val[1];
            obj.taskid = taskid;
            data.push(obj);
        }
        layer.open({
            type: 1,
            title: '结果查看',
            area: ['800px', '400px'],
            content: $('#table'),
            btn: ['确定'],
            resize: true,
            success: function(layero, index) {
                table.render({
                    elem: '#filelist',
                    cols: [
                        [{ field: 'name', title: 'name', align: 'center', sort: true },
                            { field: 'id', title: 'id', align: 'center' },
                            { fixed: 'right', title: 'tool', toolbar: '#barDemo', align: 'center', width: 150 }
                        ]
                    ],
                    data: data,
                    page: true
                });
                table.on('tool(filelist)', function(obj) {
                    var names = obj.data.name;
                    if (obj.event === 'save') {
                        getAjax(true, 'GET', '/fpbdb/SEARCHCRISPRSEQ?temp=' + names + "," + task_ids, null, 'json', function(json) {
                            $("#direct").val(json.data.direct_repeat);
                            $("#binding").val(json.data.binding_site);
                            $("#ID").val(json.data.ID);
                            form.render();
                            layer.open({
                                type: 1,
                                title: '',
                                area: ['700px', '400px'],
                                content: $('#form'),
                                btn: ['confirm'],
                                yes: function(index, layero) {
                                    var tempdata = {};
                                    tempdata.name = obj.data.name;
                                    tempdata.library = database;
                                    tempdata.rtl = json.data.library;
                                    tempdata.id = $("#ID").val();
                                    tempdata.taskid = taskid;
                                    getAjax(true, 'POST', '/fpbdb/ADDCRISPRSEQ', JSON.stringify(tempdata), 'json', function(json) {
                                        if (json.code == 200) {
                                            layer.close(index);
                                        } else {
                                            layer.msg(json.msg, { icon: 2 });
                                        }
                                    });
                                    layer.close(index);
                                },
                                cancel: function() {}
                            });

                        });
                    }
                });
            },
            yes: function(index, layero) {
                layer.close(index);
            },
        });
    }

    function refreshSampleTable(type) {
        var state = $('#cg-noexitsample').prop("checked") ? "noexit" : "";
        var url = "/fpbdb/GETLIBRARYSAMPLE?libraryid=" + $('#library-select').val() + "&library=" +
            $('#library-select').find("option:selected").text() + "&type=" + type + "&state=" + state;
        getAjax(true, 'GET', url, null, 'json', function(json) {
            if (json.code == 0 || json.code == 200) {
                table.reload('sample_table', {
                    data: json.data
                });
            } else {
                layer.msg(json.msg, { icon: 2 });
            }
        });

    }

    function refreshStorageSampleTable() {
        var type = $('#type-select').val();
        var library = $('#library-select').find("option:selected").text();
        if (type == 'CGMLST') {
            var url = "/fpbdb/GOSGETEVTREESTATE?library=" + library;
            getAjax(true, 'GET', url, null, 'json', function(json) {
                if (json.code == 200) {
                    var data = json.data;
                    $('#create-tree-btn').removeClass('layui-hide');
                    $('#create-tree-btn').unbind('click').bind('click', function() {
                        createTree(library);
                    });
                    if (data.evtreetxt != null && data.evtreepic != null && data.txtContent != null) {
                        $('#evtree-download').removeClass('layui-hide');
                        $('#evtree-view').removeClass('layui-hide');
                        $('#pic-name').removeClass('layui-hide');
                        var downloadUrl = '/fpbdb/gosDownload' + data.evtreepic + '?temp=0';
                        $('#evtree-download').unbind('click').bind('click', function() {
                            downloadFile(downloadUrl, 'circular_tree.png');
                        });
                        $('#pic-name').html('circular_tree.png');
                        $('#evtree-view').unbind('click').bind('click', function() {
                            window.open('/gosweb/visualTool/evolutionaryTreesShow.html?library=' + library);
                        });
                    }
                    if (data.state != null) {
                        $('#last-time').removeClass('layui-hide');
                        $('#last-time').text("最近一次生成进化树时间：" + data.state.end_time);
                        $('#create-tree-btn').text("重新生成进化树");
                    } else {
                        $('#create-tree-btn').text("生成进化树");
                    }
                } else {
                    layer.msg(json.msg, { icon: 2 });
                }
            });
        } else {
            $('#create-tree-btn').addClass('layui-hide');
            $('#evtree-download').addClass('layui-hide');
            $('#evtree-view').addClass('layui-hide');
            $('#pic-name').addClass('layui-hide');
            $('#last-time').addClass('layui-hide');
        }
        initStorageSampleTable();
    }

    function createTree(library) {
        var url = '/fpbdb/goscreateevtree?library=' + library;
        getAjax(true, 'GET', url, null, 'json', function(json) {
            if (json.code == 200) {
                layer.msg(json.msg, { icon: 1 });
            } else {
                layer.msg(json.msg, { icon: 2 });
            }
        });
    }

    function initStorageSampleTable() {
        var mainCol = [
            // { type: 'checkbox', name: 'sample_table_checkbox_row', rowspan: 2, fixed: 'left' },
            { field: 'sample_name', title: '样本编号', width: '25%', sort: true },
            { field: 'gene_database_name', title: '数据库', width: '25%' },
            { field: 'username', title: '创建人', width: '24%' },
            { field: 'create_time', title: '创建时间', width: '25%', sort: true },
        ];
        var type = $('#type-select').val();
        var library = $('#library-select').find("option:selected").text();
        if(type == 'CGMLST'){
            mainCol[2].width='14%';
            mainCol[3].width='20%';
            mainCol.push({ field: 'link', title: '', align: 'center',width: '15%', templet:function(d){
                return '<a href="/gosweb/pubDB/sequence_detailed.html?library='+library+'&strain='+d.sample_name+'" target="_blank" class="layui-table-link">详情</a>'
            } });
        }
        var url = "/fpbdb/GETSTORAGESAMPLE";
        table.render({
            elem: '#storage_sample_table',
            url: url,
            cols: [mainCol],
            page: true,
            limits: [20, 100, 200, 500, 1000],
            loading: true,
            id: 'storage_sample_table',
            limit: 100,
            height: "full-" + tableCurHeight,
            even: true, //开启隔行背景
            where: {
                library: library,
                type: type,
                order: 'desc'
            }
        });
    }


    function initSampleTable() {
        var mainCol = [
            { type: 'checkbox', name: 'sample_table_checkbox_row' },
            { field: 'name', title: '样本编号', width: '30%', sort: true },
            { field: 'individual_id', title: '个体号', width: '30%', sort: true },
            { field: 'gene_database_name', title: '数据库', width: '20%' },
            {
                field: 'storage_state',
                title: '状态',
                width: '10%',
                templet: function(d) {
                    if (d.storage_state == 'noexit') {
                        return "未操作";
                    } else if (d.storage_state == 'exit') {
                        return "已操作";
                    } else {
                        return d.storage_state;
                    }
                }
            }
        ];

        table.render({
            elem: '#sample_table',
            cols: [mainCol],
            page: true,
            data: [],
            limits: [10, 20, 100, 200, 500, 1000, 5000],
            loading: true,
            id: 'sample_table',
            limit: 10,
            height: 360,
            even: true //开启隔行背景
        });

        form.on('radio(samplestate)', function(data) {
            refreshSampleTable(curtype);
        })
    }

})();