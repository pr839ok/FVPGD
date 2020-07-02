var current_user = "";

function getLineName(data, word) {
    var sd = layui.sessionData(current_user + "_" + "breedingValueTable");
    if (sd.hasOwnProperty(data.sample_id))
        return word;
    else
        return "";
}

(function() {
    "use strict";

    var form, layer, element, laypage, laydate, table;
    var layerIndex;

    var bsuperadmin = false;
    var curOrderstr = "upload_start_time";
    var curOrder = "desc";
    var breedingValueTable = "breedingValueTable";
    var tableCurHeight = 75;
    var workflows = searchWorkflow();
    getCurrentUser();

    //var xsl_allow_col_name_array = ["出生日期","性别","品种","达100千克日龄","料肉比","背膘厚","品种","体型评分","体长","体高","瘦肉率"];
    var xsl_allow_col_name_array = [];

    function getCurrentUser() {
        var url = '/webhdfs/v1?op=getcurrentuser';
        $.ajax({
            url: url,
            type: 'GET',
            success: function(result) {
                if (result != "false") {
                    result = JSON.parse(result);
                    current_user = result.username;
                    bsuperadmin = result.bsuperadmin;
                    init();
                }
            },
            error: function(xhr, error, statusText) {
                if (statusText == 'Authentication required') {
                    layui.use('layer', function() {
                        var $ = layui.jquery,
                            layer = layui.layer;
                        layer.alert("请先登录系统..", { skin: 'layui-layer-molv', closeBtn: 0, anim: 1, icon: 0 },
                            function() {
                                window.parent.location.href = '../login.html';
                            });
                    });
                }
            }
        });
    }

    function init() {
        layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
            form = layui.form;
            // layer = parent.layer === undefined ? layui.layer : parent.layer;
            layer = layui.layer;
            element = layui.element;
            laypage = layui.laypage;
            laydate = layui.laydate;
            table = layui.table;
            var search_gene_database_id = getUrlParam('gene_database_id');
            var search_owner = getUrlParam('owner');
            var search_state = getUrlParam('state');
            initDateSearch();
            initGeneTypeSelect();
            initGeneDatabaseSearch();
            initTypeSearch();
            initOwnerSearch();
            initStateSearch();
            initUploadStateSearch();
            //initSearchFilter(search_owner, search_state, search_gene_database_id);
            initBtnGroupSearch();
            initSampleNameSearch();
            initSmapleManagerBatch();
            initBatchOperation();
            //initBatchSetAnalyzeResult();
            initRefreshTable();
            // var temp = getWhereInfo(search_owner, search_state, search_gene_database_id);
            var temp = getWhereInfo();
            table.on('tool(sample)', function(obj) { //注：tool是工具条事件名，test是table原始容器的属性 lay-filter="对应的值"
                var data = obj.data; //获得当前行数据
                var layEvent = obj.event; //获得 lay-event 对应的值
                var tr = obj.tr; //获得当前行 tr 的DOM对象
                var layer = layui.layer;
                if (layEvent === 'set-analyze-result') { //编辑
                    //do something
                    // clearAnalysisPanel();
                    // analysisBtnOnclick('', '', [data]);
                    initSetAnalyzeResultLayer(data['sample_name'], data['sample_id']);
                    //同步更新缓存对应的值
                    /*obj.update({
                        username: '123',
                        title: 'xxx'
                    });*/
                }
            });
            //方法级渲染
            var get_col_url = '/webhdfs/v1?op=PUBDB_SEARCHLISTFIELD';
            var test_json;
            getAjax(true, 'GET', get_col_url, null, 'json', function(result) {
                test_json = result.data;
                console.log(test_json);
                var colsArray = [
                    [{ type: 'checkbox', rowspan: 2, fixed: 'left' }
                    ]
                ];
                for (var key in test_json) {
                    if (key == "id") {
                        var new_col = { field: key, title: test_json[key], rowspan: 1, align: 'center', width: '10%', fixed: 'left' };
                    } else if (key == "float_col_000") {
                        var new_col = { field: key, title: test_json[key], rowspan: 1, align: 'center', width: '10%', fixed: 'right', toolbar: '#Security' };
                    } else {
                        var new_col = { field: key, title: test_json[key], rowspan: 1, align: 'center', width: '10%' };
                    }
                    colsArray[0].push(new_col);

                    xsl_allow_col_name_array.push(test_json[key]);
                }
                var fin_col = { fixed: 'right', width: '10%', align: 'center', toolbar: '#barDemo' };
                colsArray[0].push(fin_col);
                // console.log(colsArray);
                table.render({
                    elem: '#breeding_value_table',
                    url: '/webhdfs/v1?op=PUBDB_SEARCHLIST',
                    cols: colsArray,
                    page: true,
                    limits: [100, 200, 500, 1000],
                    loading: true,
                    id: 'breeding_value_table',
                    limit: 100,
                    height: 'full-' + tableCurHeight,
                    even: true, //开启隔行背景
                    where: {
                        temp: JSON.stringify(temp),
                        orderstr: 'id',
                        order: 'desc'
                    }
                });
            }, function(xhr, XMLHttpRequest, status) {
                if (status == 'timeout') {
                    layer.msg("结果关联请求超时", { icon: 2, time: 2000 });
                } else if (status == 'error') {
                    layer.msg("结果关联请求失败", { icon: 2, time: 2000 });
                }
            });


            //监听工具条
            table.on('tool(sample)', function(obj) { //注：tool是工具条事件名，test是table原始容器的属性 lay-filter="对应的值"
                var data = obj.data; //获得当前行数据
                var layEvent = obj.event; //获得 lay-event 对应的值
                var tr = obj.tr; //获得当前行 tr 的DOM对象
                var layer = layui.layer;
                if (layEvent === 'detail') { //查看
                    //do somehing
                    /*var $security = $('#security-database-select');
                    var $selectOp = $('<option class="security-option" value="2">' + data.float_col_000 + '</option>');
                    $selectOp.appendTo($security);*/
                    var selectList = document.getElementById("security-database-select");
                    for (var j = 0; j < selectList.length; j++) {
                        if (selectList.options[j].value == data.float_col_000) {

                            selectList.options[j].selected = true;
                        }
                    }

                    var check = document.getElementsByName('gzLoads')[1];
                    console.log(check.checked);
                    var a = '111111';
                    var arrl = a.split("");
                    for (var i in arrl) {
                        if (arrl[i] == 1) {
                            document.getElementsByName('gzLoads')[i].checked = false;
                        }
                    }
                    $.ajax({
                        url: '/webhdfs/v1?op=PUBDB_SEARCHSTRAINPERMISSION&temp=' + data.strain,
                        dataType: 'json',
                        success: function(json) {
                            var check = document.getElementsByName('gzLoads')[1];
                            var arr = json.data.split("");
                            for (var i in arr) {
                                if (arr[i] == 1) {
                                    document.getElementsByName('gzLoads')[i].checked = true;
                                }
                            }
                            form.render();
                        }
                    });

                    form.on('select(option)', function(data) {
                        var arrp=new Array('111111','111110','111100','111000','110000','100000');
                        console.log(arrp[data.value-1]);
                        var arrpl = arrp[data.value-1].split("");
                        for (var i in arrpl) {
                            document.getElementsByName('gzLoads')[i].checked = false;                               
                                if (arrpl[i] == 1) {
                                    document.getElementsByName('gzLoads')[i].checked = true;
                                }
                            }
                            form.render();
                    });
                    layerIndex = layer.open({
                        // id: 'create-workflow-property-panel-layer',
                        type: 1,
                        btn: ['confirm', 'cancel'],
                        title: 'Security classification',
                        area: ['700px', '500px'],
                        content: $('#sampleDetail'),
                        resize: true,
                        success: function(layero, index) {
                           /* var optionsa = $("#security-database-select option:selected").val();
                            console.log(optionsa);
                            $("#security-database-select").change(function() {
                                var selected = $(this).children('option:selected').val()
                                alert(selected);
                                alert("2");

                            });*/
                            /*checkSampleFile(data.sample_id, function(result) {
                                if (result.data === undefined) {
                                    layer.msg("样本校验失败", { icon: 2, time: 2000 });
                                } else {
                                    obj.update({
                                        upload_state: result.data[0].upload_state
                                    });
                                    data.upload_state = result.data[0].upload_state;
                                }
                                initBaseDetailInfo(data);
                            });
                            initFileDetailInfo(data);
                            initAnalysisDetailInfo(data);*/
                        },
                        yes: function() {
                            var permission = '';
                            var a = '111111';
                            var arrl = a.split("");
                            for (var i in arrl) {
                                var check = document.getElementsByName('gzLoads')[i];
                                if (check.checked) {
                                    permission += '1';
                                } else {
                                    permission += '0'
                                }
                            }
                            var optionCom=$("#security-database-select option:selected").val();
                            var temp = permission + "," + data.strain+","+optionCom;
                            $.ajax({
                                url: '/webhdfs/v1?op=PUBDB_SETSTRAINPERMISSION&temp=' + temp,
                                dataType: 'json',
                                success: function(json) {
                                    if (json.code == 200) {
                                        layer.msg("更新成功!", { icon: 1, time: 2000 });
                                    } else {
                                        layer.msg("更新失败!", { icon: 2, time: 2000 });
                                    }
                                }
                            });
                            layer.closeAll();
                            table.reload();
                        },
                        btn2: function() {
                            layer.closeAll();
                        },
                        cancel: function(index, layero) {},
                        end: function() {}
                    });

                } else if (layEvent === 'delete') { //删除
                    console.log(data);
                    layer.confirm('确定删除菌株 ' + data.id + '?', function(index) {
                        if (false) {
                            layer.msg("很抱歉，您没有权限。", { icon: 2, time: 2000 });
                            layer.close(index);
                            return;
                        } else {
                            deletePhenotype(data.id, function(result) {
                                //   console.log("44");
                                //    console.log(result);
                                if (result.count !== undefined && result.count == 1) {
                                    layer.msg("已删除菌株 " + data.id, { icon: 1, time: 2000 });
                                    obj.del(); //删除对应行（tr）的DOM结构，并更新缓存
                                    layer.close(index);
                                    table.reload('breeding_value_table');
                                } else {
                                    layer.msg("删除菌株" + data.id + "失败", { icon: 2, time: 2000 });
                                }
                            });
                        }
                    });
                } else if (layEvent === 'analyze') { //编辑
                    //do something
                    clearAnalysisPanel();
                    if (data.gene_database_name == null)
                        layer.msg('未入库样本不能进行分析');
                    else
                        analysisBtnOnclick('', '', [data]);
                    //同步更新缓存对应的值
                    /*obj.update({
                        username: '123',
                        title: 'xxx'
                    });*/
                }
                // else if (layEvent === 'phenotype_set_analysis') {
                //     initSetAnalyzeResultLayer(data["sample_name"], data["sample_id"]);
                // }
            });

            table.on('sort(sample)', function(obj) { //注：tool是工具条事件名，test是table原始容器的属性 lay-filter="对应的值"

                curOrderstr = obj.field;
                curOrder = obj.type;

                var fields = getWhereInfo();

                table.reload('breeding_value_table', {
                    initSort: obj //记录初始排序，如果不设的话，将无法标记表头的排序状态。 layui 2.1.1 新增参数
                        ,
                    where: { //请求参数（注意：这里面的参数可任意定义，并非下面固定的格式）
                        orderstr: obj.field //排序字段
                            ,
                        order: obj.type //排序方式
                            ,
                        temp: JSON.stringify(fields)
                    }
                });
            });
        });
        layui.use('upload', function() {
            $('#pubDBDataManager_upload').off('click').on('click', function() {
                $('#id_upload_file_input').click();
                $('#id_upload_file_input').on('change', function() {
                    var obj = document.getElementById("id_upload_file_input");
                    if (obj.value === '')
                        return;
                    var file = obj.files[0];
                    // console.log(obj.files.length);
                    console.log(file);
                    var rABS = true;
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        var data = e.target.result;
                        console.log(data);
                        if (!rABS) data = new Uint8Array(data);
                        var workbook = XLSX.read(data, { type: rABS ? 'binary' : 'array' });
                        var xlstable = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1, { defval: '' });
                        console.log(xlstable[0]["Security classification"]);
                        for(var p in xlstable){
                            if(xlstable[p]["Security classification"]==''){
                                xlstable[p]["Security classification"]=0;
                        }
                        }
                        
                        var col_names = getColNames(xlstable[0]);
                        var heads = "";
                        var col_names_array = eval(col_names);
                        var data_array = [];
                        var has_individual_id = 0;
                        for (var i = 0; i < col_names_array.length; i++) {
                            if (col_names_array[i].col_name == '个体号')
                                has_individual_id = 1;
                            else {
                                if ($.inArray(col_names_array[i].col_name, xsl_allow_col_name_array) != -1)
                                    data_array.push(col_names_array[i]);
                            }
                        }
                        for (var i = 0; i < xlstable.length; i++) {
                            if (xlstable[i]["ID"] == 'null') {
                                layer.msg("上传失败,文件中存在ID为空的数据行", { icon: 2, time: 2000 });
                                return;
                            }
                        }
                        console.log(xlstable);
                        initUpdataLayer(col_names, xlstable, data_array);
                        // var has_individual_id = 0;
                        // for(var i = 0;i < col_names_array.length;i++){
                        //     if(col_names_array[i].col_name == '个体号')
                        //         has_individual_id = 1;
                        //     else{
                        //         if($.inArray(col_names_array[i].col_name,xsl_allow_col_name_array) != -1) {
                        //             if(heads ==='')
                        //                 heads = heads + col_names_array[i].col_name;
                        //             else
                        //                 heads = heads + "," + col_names_array[i].col_name;
                        //         }

                        //     }

                        // }
                        // if(has_individual_id){
                        //     var url = '/webhdfs/v1?op=WENS_UPLOADXLSBREEDINGDETAILS';
                        //     var xhr = $.ajax({
                        //         type: 'POST',
                        //         url: url,
                        //         data: {
                        //             'updataxlsfile': JSON.stringify(xlstable),
                        //             'updatexlshead': heads
                        //         },
                        //         timeout: 60000, // 设置超时时间
                        //         contentType: 'application/json',
                        //         beforeSend: function(xhr) {
                        //             console.log(heads);
                        //         },
                        //         success: function(result) {
                        //             console.log(result);
                        //             layer.msg("成功导入 " + result.count + " 个样本", { icon: 1, time: 1000 })
                        //             table.reload('breeding_value_table');
                        //         },
                        //         error: function(textStatus) {
                        //             console.error(textStatus);
                        //         },
                        //         complete: function(XMLHttpRequest, status) {
                        //         }
                        //     })
                        // }
                        // else{
                        //     layer.msg("上传xls文件缺少个体号");
                        // }
                    };
                    if (rABS) {
                        reader.readAsBinaryString(file);
                    } else {
                        reader.readAsArrayBuffer(file);
                    }
                    var file = document.getElementById('id_upload_file_input');
                    file.value = '';
                });

            });

        });
        initDataSelect();
        initTableUpdata();
    }

    function initDataSelect() {
        $('#btn_page_help').unbind('click').bind('click', function() {
//             layer.open({
//                 type: 2,
//                 title: "帮助文档",
//                 id:"help-document-window",
//                 area: ['930px', '620px'],
//                 content: '/gosweb/markdown/help.html?path=/pubDB/pubDBDataManager.html',
//                 btn: ['关闭'],
//                 resize: false,
//                 success: function(layero, index) {
//                      $('.layui-layer-min').addClass('layui-hide');
//                     if(($("#help-document-window")[0].offsetHeight+97 > $(window).height()) || ($("#help-document-window")[0].offsetWidth+10 > $(window).width())){
//                     	layer.full(index);
//                     }
//                 },
//                 yes: function(index, layero) {
//                     layer.close(index);
//                 },
//                 maxmin: true
//             });
			var config = {
				windowId: "help-document-window",
				windowContent: '/gosweb/markdown/help.html?path=/pubDB/pubDBDataManager.html',
				windowTitle:"帮助文档",
				windowBtn:"关闭"
			}
			var win = new AdaptiveWindow(config);
			win.open();
        });
        // $('#btn_phe_manager').unbind('click').bind('click',function(){
        //     layer.open({
        //         type: 1,
        //         title: "表型管理",
        //         area: ['920px', '700px'],
        //         content:$('#phenotypeDataManageDiv'),
        //         btn: ['确定', '取消'],
        //         resize: false,
        //         success: function(layero, index) {
        //             layer.full(index);
        //         },
        //         yes: function(index, layero) {
        //             var select_name = $('#colName-select').val();
        //             var colName = $('#colName').val();
        //             var type = $('#type-select').val();
        //             // var active01 = $('#type-select').val();
        //             var orderNum = $('#orderNum').val();
        //             console.log(select_name);
        //             console.log(colName);
        //             console.log(type);
        //             console.log(orderNum);
        //             layer.close(index);
        //         },
        //     });
        // });

        $('#data_select_btn').unbind('click').bind('click', function() {
            layer.open({
                type: 1,
                title: "数据筛选",
                area: ['920px', '700px'],
                content: $('#sample-search-bar'),
                btn: ['确定', '取消'],
                resize: false,
                success: function(layero, index) {},
                yes: function(index, layero) {
                    layer.close(index);
                }
            });
        });
    }

    function initUpdataLayer(col_names, xlsTable, data_cols) {
        var layerIndex = layer.open({
            type: 1,
            title: '选择更新的列',
            area: ['820px', '500px'],
            content: $('#updata_table_div'),
            resize: false,
            btn: ['确认', '取消'],
            success: function(layero, index) {
                initSelectUpdataColTable(data_cols);
            },
            yes: function(index, layero) {
                var checkStatus = table.checkStatus('updata_table'),
                    data = checkStatus.data;
                // console.log('initUpdataLayer');
                if (data <= 0) {
                    layer.msg("重试", { icon: 2, time: 2000 });
                    return;
                }
                var heads = '';
                for (var i = 0; i < data.length; i++) {
                    if (heads === '') {
                        heads += data[i].col_name;
                    } else {
                        heads += ',' + data[i].col_name;
                    }
                }
                var url = '/webhdfs/v1?op=PUBDB_UPLOADXLSBREEDINGDETAILS';
                var xhr = $.ajax({
                    type: 'POST',
                    url: url,
                    data: {
                        'updataxlsfile': JSON.stringify(xlsTable),
                        'updatexlshead': heads
                    },
                    timeout: 60000, // 设置超时时间
                    contentType: 'application/json',
                    beforeSend: function(xhr) {},
                    success: function(result) {
                        layer.msg("成功更新 " + result.count + " 个样本", { icon: 1, time: 1000 })
                        table.reload('breeding_value_table');
                    },
                    error: function(textStatus) {
                        console.error(textStatus);
                    },
                    complete: function(XMLHttpRequest, status) {
                        layer.close(index);
                        var file = document.getElementById('id_upload_file_input');
                        file.value = '';
                    }
                })
            },
            cancel: function(layero, index) {

            },
            end: function() {}
        });
    }



    function initTableUpdata() {
        $("#btn_table_updata").off('click').on('click', function() {
            $('#id_update_file_input').click();
            $('#id_update_file_input').on("change", function() {
                var obj = document.getElementById("id_update_file_input");
                if (obj.value === '')
                    return;
                var file = obj.files[0];
                // console.log(file);
                var rABS = true;
                var reader = new FileReader();
                reader.onload = function(e) {
                    // console.log(file);
                    var data = e.target.result;
                    // console.log(data);
                    if (!rABS) data = new Uint8Array(data);
                    var workbook = XLSX.read(data, { type: rABS ? 'binary' : 'array' });
                    var table = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1, { defval: 'null' });
                    var col_names = getColNames(table[0]);
                    // console.log(col_names);
                    initUpdataLayer(col_names, table);

                };
                if (rABS) {
                    reader.readAsBinaryString(file);
                } else {
                    reader.readAsArrayBuffer(file);
                }
                var file = document.getElementById('id_update_file_input');
                file.value = '';
            });

        });
    }

    function getColNames(col) {
        var i = 0;
        var ar = new Array();
        for (var key in col) {
            if (col.hasOwnProperty(key)) {
                var b = {};
                b['col_name'] = key;
                ar[i++] = b;
            }
        }
        return JSON.stringify(ar);
    }

    function initSmapleManagerBatch() {
        var sd = layui.sessionData(current_user + "_" + breedingValueTable);
        var len = 0;
        $.each(sd, function() {
            len++;
        });
        $('#target_sample_num').text(len);

        $('#target_sample_line').unbind('click').bind('click', function() {
            openLineManagerPage(current_user + "_" + breedingValueTable);
        });

        $('#batch-clear-manager').unbind('click').bind('click', function() {
            clearSeesionTable(current_user + "_" + breedingValueTable);
            var sd = layui.sessionData(current_user + "_" + breedingValueTable);
            var len = 0;
            $.each(sd, function() {
                len++;
            });

            $('#target_sample_num').text(len);
            table.reload('breeding_value_table', {});
        });

        // $('#batch-reference-manager').unbind('click').bind('click',function(){
        //     uploadSeesionTable(ref_session_name);
        //     $('#ref_sample_num').text(line_list[0].length);
        //     table.reload('breeding_value_table',{});
        // });

        $('#batch-target-manager').unbind('click').bind('click', function() {

            uploadSeesionTable(current_user + "_" + breedingValueTable);
            var sd = layui.sessionData(current_user + "_" + breedingValueTable);
            var len = 0;
            $.each(sd, function() {
                len++;
            });

            $('#target_sample_num').text(len);
            table.reload('breeding_value_table', {});
        });
    }


    function openLineManagerPage(tableName) {

        layer.open({
            type: 1,
            title: "分析目标样本队列",
            area: ['920px', '700px'],
            content: $('.sampleInLineTable-div'),
            btn: ['删除', '取消'],
            resize: false,
            success: function(layero, index) {
                layero.find('.layui-layer-content').css('padding', '10px');
                var selectData = [];
                $.each(layui.sessionData(tableName), function() {
                    selectData.push($(this)[0]);
                });
                table.render({
                    elem: '#selectedSampleTable',
                    cols: [
                        [
                            { type: 'checkbox', name: 'checkbox_row', width: '20%', },
                            { field: 'individual_id', title: '个体号', sort: true, width: '40%' },
                            { field: 'sample_name', title: '样品编号', sort: true, width: '40%' },
                        ]
                    ],
                    data: selectData,

                    done: function(res, curr, count) {}
                });
            },
            yes: function(index, layero) {
                // console.log("delete");
                var checkStatus = table.checkStatus('selectedSampleTable');
                $.each(checkStatus.data, function() {
                    var data = $(this)[0];
                    layui.sessionData(tableName, {
                        key: data.sample_id,
                        remove: true
                    });
                });
                layer.msg(checkStatus.data.length + "个样本移除成功");
                window.location.reload();
                //layer.close(index);
            }
        });

    }

    function uploadSeesionTable(tableName) {
        var checkStatus = table.checkStatus('breeding_value_table');
        var error_num = 0;

        var nameSD = layui.sessionData(tableName);
        $.each(checkStatus.data, function() {
            var data = $(this)[0];

            if (!nameSD.hasOwnProperty(data.sample_id)) {
                layui.sessionData(tableName, {
                    key: data.sample_id,
                    value: data
                });

            } else {
                error_num++;
            }

        });
        var success_num = checkStatus.data.length - error_num;
        var output_msg = success_num + "个样本添加成功," + error_num + "个样本添加失败.";
        if (error_num != 0) {
            output_msg += "请先将失败样本移出队列再进行添加操作."
        }

        layer.msg(output_msg);

    }

    function clearSeesionTable(tableName) {
        var checkStatus = table.checkStatus('breeding_value_table');
        $.each(checkStatus.data, function() {
            var data = $(this)[0];
            layui.sessionData(tableName, {
                key: data.sample_id,
                remove: true
            });
        });
        layer.msg(checkStatus.data.length + "个样本移除成功");
    }

    function initBatchSetAnalyzeResult() {
        // $('#phenotype_set_analysis').unbind('click').bind('click', function() {
        //     var checkStatus = table.checkStatus('breeding_value_table');
        //     if (checkStatus.data.length <= 0) {
        //         layer.msg("请选择需要设置分析关联结果的样本");
        //         return;
        //     }

        //     var sampleNames = "";
        //     var ids = "";
        //     for (var i = 0; i < checkStatus.data.length; i++) {
        //         if (sampleNames === "") {
        //             sampleNames += checkStatus.data[i]['sample_name'];
        //         } else {
        //             sampleNames += ',' + checkStatus.data[i]['sample_name'];
        //         }
        //         if (ids === "") {
        //             ids += checkStatus.data[i]['sample_id'];
        //         } else {
        //             ids += ',' + checkStatus.data[i]['sample_id'];
        //         }
        //     }

        //     initSetAnalyzeResultLayer(sampleNames, ids);
        // });
    }

    function initSelectUpdataColTable(col_names) {
        // console.log(col_names);
        layui.use('table', function() {
            var table = layui.table;

            //展示已知数据
            table.render({
                elem: '#updata_table',
                cols: [
                    [ //标题栏
                        { type: 'checkbox', name: '选择' },
                        { field: 'col_name', align: 'center', title: '列名' }
                    ]
                ],
                data: col_names
                    //,skin: 'line' //表格风格
                    ,
                even: true,
                limit: 20,


            });
        });

    }

    function initSetAnalyzeResultTable(sampleNames) {
        //方法级渲染
        table.render({
            elem: '#analyzeResultTable',
            url: '/webhdfs/v1?op=WENS_GETPHENOTYPESAMPLENAMESSEARCH&samplenames=' + sampleNames,
            // initSort: {
            //     field: 'size', //排序字段，对应 cols 设定的各字段名
            //     type: 'desc' //排序方式  asc: 升序、desc: 降序、null: 默认排序
            // },
            cols: [
                [
                    { title: '选择', width: '10%', templet: '#analyze-result-div', align: 'center' },
                    { field: 'size', title: '次数', width: '15%' },
                    { field: 'batchNum', title: '批次号', width: '25%' },
                    { field: 'workflowName', title: '分析流程', width: '25%' },
                    { field: 'startTime', title: '分析时间', width: '25%' }
                ]
            ],
            // page: true,
            // height: 'full-20',
            // width: 1640 + 11,
            // limits: [2, 10, 60, 90, 150, 300, 1000],
            loading: true,
            id: 'analyzeResultTable',
            // limit: 10,
            skin: 'row', //行边框风格
            even: true, //开启隔行背景
            height: 'full-220',
            // size: 'lg' //尺寸的表格
            /*where: {
                orderstr: 'upload_start_time',
                order: 'desc'
            },*/
            done: function(res, curr, count) {}
        });
    }



    // function initSetAnalyzeResultLayer(sampleNames, ids) {

    //     var layerIndex = layer.open({
    //         // id: 'create-workflow-property-panel-layer',
    //         type: 1,
    //         title: '设置样本关联结果',
    //         area: ['820px', '700px'],
    //         content: $('#analyzeResultTableDiv'),
    //         resize: false,
    //         btn: ['确认', '取消'],
    //         success: function(layero, index) {
    //             layero.find('.layui-layer-content').css('padding', '10px');
    //             initSetAnalyzeResultTable(sampleNames);
    //         },
    //         yes: function(index, layero) {
    //             var $selectedRadio = $('.analyze-result-radio:checked');
    //             if ($selectedRadio.length <= 0) {
    //                 layer.msg("请选择需要关联的分析结果.");
    //                 return false;
    //             }
    //             var url = "/webhdfs/v1?op=UPDATEPHENOTYPE";
    //             url += '&phenotypeids=' + $selectedRadio.attr('data-sample-ids') + '&samplenames=' + $selectedRadio.attr('data-sample-names') +
    //                 '&batchnum=' + $selectedRadio.attr('data-batch-num') + '&workflowname=' + $selectedRadio.attr('data-workflow-name');
    //             getAjax(true, 'POST', url, null, 'json', function(result) {
    //                 console.log(result);
    //                 layer.close(index);
    //                 table.reload('breeding_value_table', {});
    //             }, function(xhr, XMLHttpRequest, status) {
    //                 if (status == 'timeout') {
    //                     layer.msg("结果关联请求超时", { icon: 2, time: 2000 });
    //                 } else if (status == 'error') {
    //                     layer.msg("结果关联请求失败", { icon: 2, time: 2000 });
    //                 }
    //             });
    //             console.log("batch_num:" + $selectedRadio.attr('data-batch-num'), "workflow_name:" + $selectedRadio.attr('data-workflow-name'), "sampleNames:" + $selectedRadio.attr('data-sample-names'), "sampleIds:" + $selectedRadio.attr('data-sample-ids'));
    //         },
    //         cancel: function(index, layero) {},
    //         end: function() {}
    //     });
    // }

    function initSearchFilter(ownerDefault, stateDefault, geneDatabaseDefalut) {
        var url = "/webhdfs/v1?op=LISTPHENOTYPE";
        getAjax(true, 'GET', url, null, 'json', function(result) {
            if (typeof(result.owner) == 'undefined') {
                // layer.msg('获取查询列表失败', { icon: 2, time: 2000 });
                console.log('获取查询列表失败');
            } else {
                var $ownerSelector = $('#sample-owner-select');
                var $stateSelector = $('#sample-state-select');
                var $uploadBatchSelector = $('#sample-upload-batch-select');
                var $geneDatabaseSelector = $('#sample-gene-database-select');
                var ownerArray = result.owner;
                var stateArray = result.state;
                var stateNameArray = new Array();
                var geneDatabaseArray = result.geneDatabase;

                for (var i = 0; i < stateArray.length; i++) {
                    var val = stateArray[i];
                    var name = '';
                    var len = 0;
                    if (val.startWith('Compressing:')) {
                        len = 'Compressing:'.length;
                        name = val.substring(len, val.length);
                    } else if (val.startWith('Decompressing:')) {
                        len = 'Decompressing:'.length;
                        name = val.substring(len, val.length);
                    } else if (val.startWith('Error:')) {
                        len = 'Error:'.length;
                        name = val.substring(len, val.length);
                    } else if (val === 'UNCOMPRESS') {
                        name = '未压缩';
                    } else {
                        name = val;
                    }
                    stateNameArray[i] = name;
                }

                var uploadBatchArray = result.uploadBatchArray;
                initSelector($ownerSelector, ownerArray, ownerArray, ownerDefault);
                initSelector($stateSelector, stateArray, stateNameArray, stateDefault);
                initSelector($geneDatabaseSelector, geneDatabaseArray.ids, geneDatabaseArray.names, geneDatabaseDefalut);
                // initSelector($uploadBatchSelector, uploadBatchArray, uploadBatchArray);
                form.render('select');
            }
        }, function(xhr, XMLHttpRequest, status) {
            if (status == 'timeout') {
                layer.msg("获取查询列表超时", { icon: 2, time: 2000 });
            } else if (status == 'error') {
                layer.msg("获取查询列表失败", { icon: 2, time: 2000 });
            }
        });
    }

    function initSelector($selector, values, names, defaultValue) {
        $selector.empty();
        $('<option value="" selected=""></option>').appendTo($selector);
        for (var i = 0; i < values.length; i++) {
            var $op = $('<option value="' + values[i] + '">' + names[i] + '</option>');
            if (
                defaultValue != null &&
                defaultValue === values[i]) {
                $op.prop('selected', true);
            }
            $op.appendTo($selector);
        }
    }

    function initGeneDatabaseSearch() {
        form.on('select(sample-gene-database)', function(data) {

            doSearch();
        });
    }

    function initTypeSearch() {
        form.on('select(sample-type)', function(data) {

            doSearch();
        });
    }

    function initOwnerSearch() {
        form.on('select(sample-owner)', function(data) {

            doSearch();
        });
    }

    function initStateSearch() {
        form.on('select(sample-state)', function(data) {

            doSearch();
        });
    }

    function initDateSearch() {
        laydate.render({
            elem: '#time-search-input',
            type: 'date',
            range: true,
            format: 'yyyy-MM-dd',
            theme: 'molv',
            value: new Date().pattern("yyyy-MM-dd") + " - " + new Date().pattern("yyyy-MM-dd"),
            done: function(value, date, endDate) {
                if (value !== '') {
                    var that = $('#sample-lastest-search-bar .layui-btn-group button:contains("全部")');
                    that.siblings().addClass('layui-btn-primary').attr('data-selected', '');
                    that.removeClass('layui-btn-primary').attr('data-selected', 'selected');
                }
                doSearch();

            }
        });
    }

    function initGeneTypeSelect() {
        var url = "/webhdfs/v1?op=SELECTWORKFLOW";
        if (typeof(workflowId) != "undefined" && workflowId != "") {
            url += "&workflow=" + workflowId;
        }
        $.ajax({
            async: false,
            url: url,
            type: 'POST',
            success: function(result) {
                var $workflow_select = $('#gene-type-workflow-select');
                $workflow_select.empty();
                var $conjoint_workflow_first = $('<option value="">请选择流程</option>');
                $conjoint_workflow_first.appendTo($workflow_select);
                var workflowList = result.workflowList;
                for (var i = 0; i < workflowList.length; i++) {
                    if (workflowList[i].workflow_json != "null") {
                        var workflow = JSON.parse(workflowList[i].workflow_json);
                        var workflowName = workflow.title;
                        var workflowID = workflowList[i].workflow_id;
                        if (workflow.type == 2) {
                            var $conjoint_workflow = $('<option value="' + workflowID + '">' + workflowName + '</option>');
                            $conjoint_workflow.appendTo($workflow_select);
                        }

                    }
                }

                form.render();
                form.on('select(gene-type-workflow)', function(data) {
                    if (data.value == "") {
                        $('#gene-type-batch-select-div').addClass('layui-hide');
                    } else {
                        var selected_workflow_id = data.value;
                        var selected_workflow_name = $(this).text();
                        $('#gene-type-batch-select-div').removeClass('layui-hide');
                        var url = "/webhdfs/v1?op=WENS_LISTBATCHBYWORKFLOWNAME&temp=" + selected_workflow_name;
                        $.ajax({
                            async: false,
                            url: url,
                            type: 'GET',
                            success: function(result) {
                                var $batch_select = $('#gene-type-batch-select');
                                $batch_select.empty();
                                var $batch_first = $('<option value="">请选择批次</option>');
                                $batch_first.appendTo($batch_select);
                                var batchList = result.data;
                                for (var i = 0; i < batchList.length; i++) {
                                    var $batch = $('<option value="' + i + '">' + batchList[i].batchNum + '</option>');
                                    $batch.appendTo($batch_select);
                                }
                                form.render();
                                form.on('select(gene-type-batch)', function(data) {
                                    if (data.value == "") {
                                        $('#gene-type-preview-div').addClass('layui-hide');
                                    } else {
                                        var selected_batch_name = $(this).text();
                                        $('#gene-type-preview-div').removeClass('layui-hide');
                                        $('#gene-type-preview-btn').unbind('click').bind('click', function() {
                                            // console.log(selected_workflow_name);
                                            // console.log(selected_batch_name);
                                            layer.open({
                                                type: 2,
                                                maxmin: true,
                                                content: 'jointCalling.html' //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
                                            });

                                            var sample_num = 10;
                                            $('#gene-type-sample-num-div').removeClass('layui-hide');
                                            $('#gene-type-sample_num').text(sample_num);
                                        });
                                    }

                                });
                            },
                            error: function(error) {
                                // console.log(error);
                            }
                        });
                    }

                });
            },
            error: function(error) {
                // console.log(error);
            }
        });
    }

    function initUploadStateSearch() {
        form.on('checkbox(succeeded-checkbox)', function(data) {

            doSearch();
        });

        form.on('checkbox(error-checkbox)', function(data) {

            doSearch();
        });

        form.on('checkbox(uploading-checkbox)', function(data) {

            doSearch();
        });
    }

    function initSampleNameSearch() {
        $('#sample-search-btn').off('click').on('click', function() {
            doSearch();
        });
    }

    function initBtnGroupSearch() {
        $('#sample-lastest-search-bar .layui-btn-group button').off('click').on('click', function() {
            $(this).siblings().addClass('layui-btn-primary').attr('data-selected', '');
            $(this).removeClass('layui-btn-primary').attr('data-selected', 'selected');
            var date = new Date();
            var today = date.pattern('yyyy-MM-dd');
            var last7day = new Date(date.getTime() - 6 * 24 * 60 * 60 * 1000).pattern('yyyy-MM-dd');
            var last30day = new Date(date.getTime() - 29 * 24 * 60 * 60 * 1000).pattern('yyyy-MM-dd');
            if ($(this).text() === '今天') {
                $('#time-search-input').val(today + ' - ' + today);
            } else if ($(this).text() === '最近7天') {
                $('#time-search-input').val(last7day + ' - ' + today);
            } else if ($(this).text() === '最近30天') {
                $('#time-search-input').val(last30day + ' - ' + today);
            } else if ($(this).text() === '全部') {
                $('#time-search-input').val('');
            }
            doSearch();
        });
    }

    function doSearch() {
        var temp = getWhereInfo();
        table.reload('breeding_value_table', {
            where: { //设定异步数据接口的额外参数，任意设
                temp: JSON.stringify(temp),
                orderstr: curOrderstr,
                order: curOrder
            },
            page: {
                curr: 1 //重新从第 1 页开始
            }
        });
    }

    function initRefreshTable() {
        var $flushBar = $('.log-flush-bar');
        $flushBar.unbind('click').bind('click', function() {
            table.reload('breeding_value_table');
            // console.log("refresh;");
        });
        $flushBar.unbind('mouseover').bind('mouseover', function() {
            $(this).find('#logFlush i').addClass('layui-anim');
            $(this).find('#logFlush i').addClass('layui-anim-rotate');
            $(this).find('#logFlush i').addClass('layui-anim-loop');
            $(this).addClass('log-flush-bar-mouseover');
        });
        $flushBar.unbind('mouseout').bind('mouseout', function() {
            $(this).find('#logFlush i').removeClass('layui-anim');
            $(this).find('#logFlush i').removeClass('layui-anim-rotate');
            $(this).find('#logFlush i').removeClass('layui-anim-loop');
            $(this).removeClass('log-flush-bar-mouseover');
        });
    }

    // function getWhereInfo(search_owner, search_state, search_gene_database_id) {
    //     var type = $('#sample-type-select').val();
    //     var owner = "";
    //     if (search_owner != null || search_owner != undefined) {
    //         owner = search_owner;
    //     } else {
    //         owner = $('#sample-owner-select').val();
    //         if (owner == null || owner == undefined) {
    //             owner = "";
    //         }
    //     }

    //     var state = "";
    //     if (search_state != null || search_state != undefined) {
    //         state = search_state;
    //     } else {
    //         state = $('#sample-state-select').val();
    //         if (state == null || state == undefined) {
    //             state = "";
    //         }
    //     }

    //     var geneDatabaseId = "";
    //     if (search_gene_database_id != null || search_gene_database_id != undefined) {
    //         geneDatabaseId = search_gene_database_id;
    //     } else {
    //         geneDatabaseId = $('#sample-gene-database-select').val();
    //         if (geneDatabaseId == null || geneDatabaseId == undefined) {
    //             geneDatabaseId = "";
    //         }
    //     }
    //     var succeeded = $('#succeeded-search-checkbox').is(':checked');
    //     var error = $('#error-search-checkbox').is(':checked');;
    //     var uploading = $('#uploading-search-checkbox').is(':checked');;
    //     var sampleName = $('#sample-name-search-input').val().trim();
    //     var time = $('#time-search-input').val().trim();
    //     var startTime = "";
    //     var endTime = "";
    //     if (time != "") {
    //         var strs = time.split(' - ');
    //         startTime = strs[0];
    //         endTime = strs[1];
    //     }

    //     var temp = {
    //         type: type,
    //         owner: owner,
    //         state: state,
    //         succeeded: succeeded,
    //         error: error,
    //         uploading: uploading,
    //         sampleName: sampleName,
    //         startTime: startTime,
    //         endTime: endTime,
    //         geneDatabaseId: geneDatabaseId
    //     };
    //     return temp
    // }

    function getWhereInfo() {

        // var individual_id = $('#individual-id-search-input').val();
        // var $stringDivInput = $('#string-search-div').find('input');
        var individual_id = "";
        var temp = {
            individual_id: individual_id,
        };
        // $.each($stringDivInput,function(){
        //     var id = this.id;
        //     var val = $('#' + id).val();
        //     temp[id] = val;
        // });
        // console.log(temp);
        return temp;

    }

    function updateFileStatInfo(fileStatus, data) {
        var fileNum = fileStatus.length;
        $('#totalFileNum').text(fileNum);
    }

    function checkSampleFile(ids, succeedFunction) {
        var url = '/webhdfs/v1?op=CHECKSAMPLE';
        var data = { 'sampleids': ids };
        getAjax(true, "POST", url, data, "json", succeedFunction, function(xhr, XMLHttpRequest, status) {
            if (status == 'timeout') {
                layer.msg("样本校验超时", { icon: 2, time: 2000 });
            } else if (status == 'error') {
                layer.msg("样本校验失败", { icon: 2, time: 2000 });
            }
        })
    }



    var configLayerIndex = "";

    function getSelectedIds(data) {
        var ids = "";
        for (var i = 0; i < data.length; i++) {
            if (i == 0) {
                ids += data[i].sample_id;
            } else {
                ids += ',' + data[i].sample_id;
            }
        }
        return ids;
    }

    function initBatchOperation() {

    }

    function getArrayFromSession(tableName) {
        var dS = layui.sessionData(tableName);
        var retArray = [];
        $.each(dS, function() {
            retArray.push($(this)[0])
        });
        return retArray;
    }

    function getSampleNames(data) {
        var sampleNames = "";
        for (var i = 0; i < data.length; i++) {
            if (sampleNames === "") {
                sampleNames += data[i]['sample_name'];
            } else {
                sampleNames += ',' + data[i]['sample_name'];
            }
        }
        return sampleNames;
    }

    function transformConfigData(sampleName) {
        var sample = {};
        var sampleFiles1 = [];
        var sampleFiles2 = [];
        var sampleArrays = configData[sampleName];
        var samplePairFiles1 = [];
        var samplePairFiles2 = [];
        if (sampleArrays.length >= 1) { //PMY
            samplePairFiles1 = sampleArrays[0];
            for (var j = 0; j < samplePairFiles1.length; j++) {
                sampleFiles1.push(samplePairFiles1[j][0]);
                if (samplePairFiles1[j][1] != "") {
                    sampleFiles1.push(samplePairFiles1[j][1]);
                }
            }
        }
        if (sampleArrays.length == 2) { //tumor
            samplePairFiles2 = sampleArrays[1];
            for (var j = 0; j < samplePairFiles2.length; j++) {
                sampleFiles2.push(samplePairFiles2[j][0]);
                sampleFiles2.push(samplePairFiles2[j][1]);
            }
        }

        sample.sampleName = sampleName;
        sample.sampleFiles1 = sampleFiles1;
        sample.sampleFiles2 = sampleFiles2;
        return sample;
    }

    function addConfigFileTreeNode(parent, pl, prefixPath, filename, subDirectoryNum, nodeType) {
        var $li = $('<li></li>');
        var $treeNode = $('<div class="treeNode" _pl="' + pl + '" style="padding-left: ' + pl + 'px"></div>');
        var pathstr = append_path(prefixPath, filename);
        if (pathstr == "/") {
            filename = "全部文件";
        }
        if (pathstr == "/") {
            pathstr = "";
        } else {
            pathstr = prefixPath;
        }
        var $handler = $('<span class="treeNode-handler" node-path="' + pathstr + '" spread="false" data-file-type="' + nodeType + '"></span>');
        var $nodeItem;
        if (nodeType == "DIRECTORY") {
            $nodeItem = $('<em class="nodeItem plusIcon"></em><dfn class="nodeItem closeIcon"></dfn><span class="nodename">' + filename + '</span>');
        } else if (nodeType == "SAMPLEROOT") {
            $nodeItem = $('<span style="padding: 0 10px;"><i class="fa fa-database text-green"></i></span><span class="nodename">' + filename + '</span>');
        } else if (nodeType == "SAMPLE") {
            $nodeItem = $('<span style="padding: 0 10px;"><i class="fa fa-eyedropper text-green"></i></span><span class="nodename">' + filename + '</span>');
        } else {
            $nodeItem = $('<em class="nodeItem plusIcon"></em><dfn class="nodeItemFile closeIcon"></dfn><span class="nodename">' + filename + '</span>');
        }
        var $branch = $('<ul class="tree-branch tree-branch-collapse" _pl="' + (pl + 15) + '"></ul>');
        $nodeItem.appendTo($handler);
        $handler.appendTo($treeNode);
        $treeNode.appendTo($li);
        $branch.appendTo($li);

        if (nodeType == "SAMPLE") {
            $treeNode.unbind('click').on('click', sampleTreeLeafOnclick);
        } else if (nodeType == "SAMPLEROOT") {
            $treeNode.unbind('click').on('click', allSampleOnclick);
        } else {
            if (subDirectoryNum > 0) {
                $treeNode.unbind('click').on('click', localTreeNodeOnclick);
            } else {
                $treeNode.unbind('click').on('click', localTreeLeafOnclick);
                $treeNode.unbind('dblclick').on('dblclick', localTreeLeafOndblclick);
                $handler.find('.plusIcon').css('visibility', 'hidden');
            }
        }

        $treeNode.unbind('mouseover').on('mouseover', function() {
            $(this).addClass('treeNode-hover');
        });
        $treeNode.unbind('mouseout').on('mouseout', function() {
            $(this).removeClass('treeNode-hover');
        });
        $li.appendTo(parent);
    }

    function localTreeNodeOnclick() {
        var $handler = $(this).find('.treeNode-handler');
        var path = $handler.attr('node-path');
        var spread = $handler.attr('spread');
        var $branch = $(this).siblings('.tree-branch');
        if (spread == "false") {
            $handler.find('.plusIcon').addClass('minusIcon');
            $handler.find('.closeIcon').addClass('openIcon');
            $handler.attr('spread', 'true');
            var abs_path = encode_path(path);
            var url = "/webhdfs/v1?op=LISTNFSFILE&nfspath=" + abs_path;
            $.ajax({
                async: true,
                url: url,
                type: 'GET',
                success: function(result) {
                    initLocalTreeBranch($branch, path, result.nfsFileArray);
                },
                error: function(error) {
                    console.log(error);
                }
            });
        } else if (spread == "true") {
            $handler.find('.plusIcon').removeClass('minusIcon');
            $handler.find('.closeIcon').removeClass('openIcon');
            $handler.attr('spread', 'false');
            $branch.addClass('tree-branch-collapse');
        }
    }

    function localTreeLeafOnclick() {
        if ($(this).hasClass('treeNode-on')) {
            $(this).removeClass('treeNode-on');
        } else {
            var $handler = $(this).find('.treeNode-handler');
            if ($handler.attr('data-file-type') == 'FILE') {
                var $treeNodeOn = $('#configFileTree').find('.treeNode-on');
                $.each($treeNodeOn, function() {
                    $(this).removeClass('treeNode-on');
                });
                $(this).addClass('treeNode-on');
            }
        }
    }

    function localTreeLeafOndblclick() {
        var $treeNodeOn = $(this);
        var $handler = $treeNodeOn.find('.treeNode-handler');
        var filepath = $handler.attr('node-path');
        readConfigFile(filepath, configLayerIndex);
        $('#configFileTree').animate({ 'scrollTop': '0' }, 500);
    }

    function allSampleOnclick() {
        var $branch = $(this).next();
        if ($(this).hasClass('treeNode-on')) {
            $(this).removeClass('treeNode-on');
            $branch.find('li .treeNode').each(function() {
                if ($(this).hasClass('treeNode-on')) {
                    $(this).removeClass('treeNode-on');
                }
            });
        } else {
            $(this).addClass('treeNode-on');
            $branch.find('li .treeNode').each(function() {
                if (!$(this).hasClass('treeNode-on')) {
                    $(this).addClass('treeNode-on');
                }
            });
        }
    }

    function sampleTreeLeafOnclick() {
        if ($(this).hasClass('treeNode-on')) {
            $(this).removeClass('treeNode-on');
        } else {
            $(this).addClass('treeNode-on');
        }
    }

    function initLocalTreeBranch($branch, path, nfsFileArray) {
        $branch.empty();
        var pl = $branch.attr('_pl');
        for (var i = 0; i < nfsFileArray.length; i++) {
            addConfigFileTreeNode($branch, parseInt(pl), nfsFileArray[i].filepath, nfsFileArray[i].filename, parseInt(nfsFileArray[i].subDirectoryNum), nfsFileArray[i].type);
        }
        $branch.removeClass('tree-branch-collapse');
    }

    function initSampleTree(configData) {
        var $sampleTree = $('#configFileTree');
        $sampleTree.empty();
        addConfigFileTreeNode($sampleTree, 0, "", "全部样品", 0, "SAMPLEROOT");
        var $branch = $sampleTree.find("li:first .tree-branch");
        $branch.removeClass('tree-branch-collapse');
        for (var key in configData) {
            addConfigFileTreeNode($branch, 15, "", key, 0, "SAMPLE");
        }
    }

    var configData = [];

    function readConfigFile(filepath, index) {
        filepath = encode_path(filepath);
        var url = '/webhdfs/v1/?op=READCONFIGFILE&localfilepath=' + filepath;
        getAjax(true, 'POST', url, null, 'json', function(data) {
            if (typeof(data.boolean) != 'undefined' && !data.boolean) {
                layer.msg("读取配置文件失败", { icon: 2, time: 2000 });
            }
            if (typeof(data.result) != 'undefined') {
                var sampleMap = data.result;
                configData = filterConfig(sampleMap);
                layer.title("请选择上传的样本", configLayerIndex);
                initSampleTree(configData);
            }
        }, function(xhr, XMLHttpRequest, status) {
            if (status == 'timeout') {
                layer.msg("读取配置文件超时", { icon: 2, time: 2000 });
            } else if (status == 'error') {
                layer.msg("读取配置文件失败", { icon: 2, time: 2000 });
            }
        });
    }

    function filterConfig(configMap) {
        var data = {};
        for (var sampleName in configMap) {
            if (sampleName.endWith('_normal')) {
                var newSampleName = sampleName.substring(0, sampleName.length - '_normal'.length);
                if (typeof(data[newSampleName]) == 'undefined') {
                    data[newSampleName] = new Array(2);
                } else if (data[newSampleName].length != 2) {
                    newSampleName += '(collision)';
                    if (typeof(data[newSampleName]) == 'undefined') {
                        data[newSampleName] = new Array(2);
                    }
                }
                data[newSampleName][0] = configMap[sampleName];
            } else if (sampleName.endWith('_tumor')) {
                var newSampleName = sampleName.substring(0, sampleName.length - '_tumor'.length);
                if (typeof(data[newSampleName]) == 'undefined') {
                    data[newSampleName] = new Array(2);
                } else if (data[newSampleName].length != 2) {
                    newSampleName += '(collision)';
                    if (typeof(data[newSampleName]) == 'undefined') {
                        data[newSampleName] = new Array(2);
                    }
                }
                data[newSampleName][1] = configMap[sampleName];
            } else {
                if (typeof(data[sampleName]) != 'undefined') {
                    data[sampleName + '(collision)'] = new Array(1);
                    data[sampleName + '(collision)'][0] = configMap[sampleName];
                } else {
                    data[sampleName] = new Array(1);
                    data[sampleName][0] = configMap[sampleName];
                }
            }
        }
        return data;
    }

    function uploadSample(index, uploadsamplestr) {
        var url = '/webhdfs/v1/?op=UPLOADSAMPLE';
        var data = { 'uploadsamplestr': uploadsamplestr };
        getAjax(true, 'POST', url, data, 'json', function(data) {
            if (typeof(data.boolean) != 'undefined' && !data.boolean) {
                layer.msg("样本上传失败", { icon: 2, time: 2000 });
            } else {
                layer.msg('样本上传已提交', { icon: 1, time: 2000 });
                layer.close(index);
            }
        }, function(xhr, XMLHttpRequest, status) {
            if (status == 'timeout') {
                layer.msg("样本上传超时", { icon: 2, time: 2000 });
            } else if (status == 'error') {
                layer.msg("样本上传失败", { icon: 2, time: 2000 });
            }
        });
    }

    function compressSample(method, sampleIDs) {
        var url = "/webhdfs/v1?op=SAMPLECOMPRESS&recursive=true&user.name=" + current_user + "&method=" + method;
        var data = { 'sampleids': sampleIDs };
        getAjax(true, 'POST', url, data, 'json', function(result) {
            if (typeof(result.succeedCount) == 'undefined' || result.succeedCount == 0) {
                layer.msg('压缩提交失败', { icon: 2, time: 2000 });
            } else {
                layer.msg('压缩已提交', { icon: 1, time: 2000 });
            }
        }, function(xhr, XMLHttpRequest, status) {
            if (status == 'timeout') {
                layer.msg("压缩提交超时", { icon: 2, time: 2000 });
            } else if (status == 'error') {
                layer.msg("压缩提交失败", { icon: 2, time: 2000 });
            }
        });
    }

    function decompressSample(sampleIDs) {
        var url = "/webhdfs/v1?op=SAMPLEDECOMPRESS&user.name=" + current_user + "&recursive=true";
        var data = { 'sampleids': sampleIDs };
        getAjax(true, 'POST', url, data, 'json', function(result) {
            if (typeof(result.succeedCount) == 'undefined' || result.succeedCount == 0) {
                layer.msg('快速解压提交失败', { icon: 2, time: 2000 });
            } else {
                layer.msg('快速解压已提交', { icon: 1, time: 2000 });
            }
        }, function(xhr, XMLHttpRequest, status) {
            if (status == 'timeout') {
                layer.msg("快速解压提交超时", { icon: 2, time: 2000 });
            } else if (status == 'error') {
                layer.msg("快速解压提交失败", { icon: 2, time: 2000 });
            }
        });
    }

    function deletePhenotype(strainID, succeedFunction) {
        var url = "/webhdfs/v1?op=PUBDB_DELETESTRAIN&temp=" + strainID;
        var data = strainID;
        //向服务端发送删除指令
        getAjax(true, 'POST', url, data, "json", succeedFunction, function(xhr, XMLHttpRequest, status) {
            console.log(status);
            if (status == 'timeout') {
                layer.msg("删除样本超时", { icon: 2, time: 2000 });
            } else if (status == 'error') {
                layer.msg("删除样本失败", { icon: 2, time: 2000 });
            }
        });
    }

    function updateSampleType(sampleIDs, type, succeedFunction) {
        var url = "/webhdfs/v1?op=UPDATESAMPLETYPE&sampletype=" + type;
        var data = { 'sampleids': sampleIDs };
        //向服务端发送删除指令
        getAjax(true, 'POST', url, data, "json", succeedFunction, function(xhr, XMLHttpRequest, status) {
            if (status == 'timeout') {
                layer.msg("修改样本类型超时", { icon: 2, time: 2000 });
            } else if (status == 'error') {
                layer.msg("修改样本类型失败", { icon: 2, time: 2000 });
            }
        });
    }

    function updateSampleReplication(sampleIDs, replication, succeedFunction) {
        var url = "/webhdfs/v1?op=UPDATESAMPLEREPLICATION&user.name=gosadmin&temp=" + replication;
        var data = { 'sampleids': sampleIDs };
        //向服务端发送删除指令
        getAjax(true, 'POST', url, data, "json", succeedFunction, function(xhr, XMLHttpRequest, status) {
            if (status == 'timeout') {
                layer.msg("修改样本副本数超时", { icon: 2, time: 2000 });
            } else if (status == 'error') {
                layer.msg("修改样本副本数失败", { icon: 2, time: 2000 });
            }
        });
    }

    /* Gene Analysis Init */

    var workflowSelect = [];
    var layerindex = "";

    function clearAnalysisPanel() {
        emptyAnalysisGroupTree();
        $('#analysis-filepath').val('');
        $('#local-output-dir-input').val('');
        // $('#batch-number-input').val('');
        $('#local-output-dir-input').attr('data-origin', '');
        $('.form-input-files-list').empty();
        $('.form-input-params-list').empty();
        $('.form-optional-params-list').empty();
        $('.form-output-files-list').empty();
    }

    function emptyAnalysisGroupTree() {
        $('#analysis-group-tree').empty();
    }

    function analysisBtnOnclick(filename, abs_path, data) {
        $('.form-file-info-item .attr-item').text("");
        initAnalysisPage(filename, abs_path, data);
        var layer = layui.layer;
        layerindex = layer.open({
            type: 1,
            title: '',
            area: ['1100px', '650px'],
            content: $('#analysis-configurator'),
            btn: ['提交分析', '取消'],
            resize: true,
            success: function(layero, index) {},
            yes: function(index, layero) {
                var $configurator = layero.find('#analysis-configurator');
                var $workflowSelect = $configurator.find('#form-workflow-select');
                if ($workflowSelect.val() == "") {
                    layer.msg("请选择工作流", { icon: 0, time: 1500 });
                    return;
                }

                var $batchNumInput = $('#batch-number-input');
                if ($batchNumInput.val().trim() == "") {
                    layer.msg("请输入批次号", { icon: 0, time: 1500 });
                    return;
                }

                var selectedSamples = [];
                var commitWorkflows = [];

                var $groupTree = $('#analysis-group-tree');
                var $groupsNode = $groupTree.find('.treeNode');
                var $branch = $($groupsNode[0]).siblings('.tree-branch');

                var $sampleLis = $branch.children();
                if ($sampleLis.length == 0) {
                    layer.msg("请选择分析样本", { icon: 0, time: 1500 });
                    return false;
                } else {
                    $.each($sampleLis, function() {
                        var $treeNode = $(this).find('.treeNode');
                        var sampleName = $treeNode.children('.treeNode-handler').attr('node-path');
                        selectedSamples.push(sampleName);
                    });
                }

                var workflowTemplate = transformWorkflowStr($workflowSelect);
                commitWorkflows = createWorkflowsWithWildcard(workflowTemplate, selectedSamples, data);

                commitAnalysis(JSON.stringify(commitWorkflows), layerindex);
            },
            btn2: function(index, layero) {
                layer.close(index);
                return false;
            }
        });
    }

    function initAnalysisPage(filename, filepath, filedata) {
        searchWorkflow();
        initOutputDir();
        initWorkflowSelectorAndSubprocessSelector(filedata);
        initSetStartNodeBtn();
        initSetEndNodeBtn();
        initAnalysisGroupTree('analysis-group-tree', filedata);

        form.on('select(workflow)', function(data) {
            var workflowNum = parseInt(data.value);
            var workflowsInfo = workflows[workflowNum].workflow.nodes;
            var $subprocessSelect = $('#form-sub-process-select').empty();
            $subprocessSelect.attr('data-workflow-index', workflowNum);
            var $defaultSubprocess = $('<option value="">请配置各个子过程参数</option>');
            $defaultSubprocess.appendTo($subprocessSelect);

            //remove existed sub process
            var $subprocessList = $('.form-sub-process-item-list');
            $subprocessList.children().each(function() {
                if ($(this).attr('id') != "task-name") {
                    $(this).remove();
                } else {
                    $(this).css('display', 'block');
                }
            });

            var workflowLines = workflows[workflowNum].workflow.lines;
            var lines = transformLines(workflowLines);

            var startRoundNodeId = null;
            var endRoundNodeId = null;
            var nodes = workflowsInfo;
            for (var key in nodes) {
                if (nodes[key].type == "start round mix") {
                    startRoundNodeId = key;
                } else if (nodes[key].type == "end round") {
                    endRoundNodeId = key;
                }
            }
            if (startRoundNodeId == null || endRoundNodeId == null) {
                console.log("can not find start node or end node!! wait for change to layer");
                return;
            }

            var nodeId = startRoundNodeId;
            var visitedTaskIdList = new Set();
            var nextVisitTaskIdQueue = [];
            var sortedTaskIdList = [];

            nextVisitTaskIdQueue.push(startRoundNodeId);

            while (nextVisitTaskIdQueue.length > 0) {
                var nodeId = nextVisitTaskIdQueue.shift();
                sortedTaskIdList.push(nodeId);
                visitedTaskIdList.add(nodeId);

                for (var i = 0; i < lines[nodeId].to.length; i++) {
                    var toTaskId = lines[nodeId].to[i];
                    if (!visitedTaskIdList.has(toTaskId)) {
                        var j = 0;
                        for (; j < lines[toTaskId].from.length; j++) {
                            var fromTaskId = lines[toTaskId].from[j];
                            if (!visitedTaskIdList.has(fromTaskId)) {
                                break;
                            }
                        }
                        if (j >= lines[toTaskId].from.length) {
                            nextVisitTaskIdQueue.push(toTaskId);
                        }
                    }
                }
            }

            for (var k = 0; k < sortedTaskIdList.length; k++) {
                var taskId = sortedTaskIdList[k];

                if (workflowsInfo[taskId].type == "start round mix") {
                    continue;
                }
                if (workflowsInfo[taskId].type == "end round")
                    break;
                var $opt = $('<option value="' + taskId + '" data-sub-process-type="' + workflowsInfo[taskId].type + '">' + workflowsInfo[taskId].name +
                    '</option>');
                $opt.appendTo($subprocessSelect);

                var $subprocessDiv = $('<div class="layui-form-item form-sub-process-item" id="task_' + taskId + '">');
                var $blockquote = $('<blockquote class="layui-elem-quote layui-quote-nm">');

                var $inputFilesTitle = $('<div class="form-input-files-title">' +
                    '<fieldset class="layui-elem-field layui-field-title" style="margin-top: 0px;">' +
                    '<legend>输入文件</legend></fieldset></div>');
                var $inputFilesList = $('<div class="form-input-files-list"></div');

                var $inputTitle = $('<div class="form-input-params-title">' +
                    '<fieldset class="layui-elem-field layui-field-title" style="margin-top: 0px;">' +
                    '<legend>输入参数</legend></fieldset></div>');
                var $inputParamsList = $('<div class="form-input-params-list"></div');

                var $optionalTitle = $('<div class="form-input-optional-params-title">' +
                    '<fieldset class="layui-elem-field layui-field-title" style="margin-top: 0px;">' +
                    '<legend>可选参数</legend></fieldset></div>');
                var $optinalParamsList = $('<div class="form-input-optional-params-list"></div>');

                var $outputFilesTitle = $('<div class="form-output-files-title">' +
                    '<fieldset class="layui-elem-field layui-field-title" style="margin-top: 0px;">' +
                    '<legend>输出文件</legend></fieldset></div>');
                var $outputFilesList = $('<div class="form-output-files-list"></div');

                $subprocessDiv.css('display', 'none');

                $inputFilesTitle.appendTo($blockquote);
                $inputFilesList.appendTo($blockquote);
                $inputTitle.appendTo($blockquote);
                $inputParamsList.appendTo($blockquote);
                $optionalTitle.appendTo($blockquote);
                $optinalParamsList.appendTo($blockquote);
                $outputFilesTitle.appendTo($blockquote);
                $outputFilesList.appendTo($blockquote);
                $blockquote.appendTo($subprocessDiv);
                $subprocessDiv.appendTo($subprocessList);

                var ti = workflowsInfo[taskId].taskInfo;
                var inputFilesList = ti.input_files;
                var inputAttrsList = ti.input_attrs;
                var optionalAttrsList = ti.optional_attrs;
                var outputFilesList = ti.output_files;

                if (inputFilesList.length == 0) {
                    var $item = $('<div class="layui-form-item"><label class="layui-form-label"><i>无</i></label></div>');
                    $item.appendTo($inputFilesList);
                }

                if (inputAttrsList.length == 0) {
                    var $item = $('<div class="layui-form-item"><label class="layui-form-label"><i>无</i></label></div>');
                    $item.appendTo($inputParamsList);
                }

                if (optionalAttrsList.length == 0) {
                    var $item = $('<div class="layui-form-item"><label class="layui-form-label"><i>无</i></label></div>');
                    $item.appendTo($optinalParamsList);
                }

                if (outputFilesList.length == 0) {
                    var $item = $('<div class="layui-form-item"><label class="layui-form-label"><i>无</i></label></div>');
                    $item.appendTo($outputFilesList);
                }

                for (var i = 0; i < inputFilesList.length; i++) {
                    ti.input_files[i].input = transformTextareaToInput(ti.input_files[i].input);
                    var $item = $('<div class="layui-form-item"><label class="layui-form-label layui-elip" title="' + ti.input_files[i].command +
                        '"><i>' + ti.input_files[i].command + '(' + ti.input_files[i].info + ')' + '</i>：</label>' + '<div class="layui-input-block">' +
                        '<input lay-verify="params" autocomplete="off" placeholder="请输入" class="layui-input" type="text" value="' +
                        ti.input_files[i].input + '" data-default="' + ti.input_files[i].input + '" data-origin="' +
                        ti.input_files[i].input + '" data-command="' + ti.input_files[i].command + '"' +
                        ' data-index="' + ti.input_files[i].index + '"' + '>' +
                        '</div></div>');
                    $item.appendTo($inputFilesList);
                }

                for (var i = 0; i < inputAttrsList.length; i++) {
                    ti.input_attrs[i].input = transformTextareaToInput(ti.input_attrs[i].input);
                    var $item = $('<div class="layui-form-item"><label class="layui-form-label layui-elip" title="' + ti.input_attrs[i].command +
                        '"><i>' + ti.input_attrs[i].command + '(' + ti.input_attrs[i].info + ')' + '</i>：</label>' + '<div class="layui-input-block">' +
                        '<input lay-verify="params" autocomplete="off" placeholder="请输入" class="layui-input" type="text" value="' +
                        ti.input_attrs[i].input + '" data-default="' + ti.input_attrs[i].input + '" data-origin="' +
                        ti.input_attrs[i].input + '" data-command="' + ti.input_attrs[i].command + '"' +
                        ' data-index="' + ti.input_attrs[i].index + '"' + '>' +
                        '</div></div>');
                    $item.appendTo($inputParamsList);
                }

                for (var i = 0; i < optionalAttrsList.length; i++) {
                    ti.optional_attrs[i].input = transformTextareaToInput(ti.optional_attrs[i].input);
                    var $item = $('<div class="layui-form-item"><label class="layui-form-label layui-elip" title="' + ti.optional_attrs[i].command +
                        '"><i>' + ti.optional_attrs[i].command + '(' + ti.optional_attrs.info + ')' + '</i>：</label>' + '<div class="layui-input-block">' +
                        '<input lay-verify="params" autocomplete="off" placeholder="请输入" class="layui-input" type="text" value="' +
                        ti.optional_attrs[i].input + '" data-default="' + ti.optional_attrs[i].input + '" data-origin="' +
                        ti.optional_attrs[i].input + '"  data-command="' + ti.optional_attrs[i].command + '"' +
                        ' data-index="' + ti.optional_attrs[i].index + '"' + '>' +
                        '</div></div>');
                    $item.appendTo($optinalParamsList);
                }

                for (var i = 0; i < outputFilesList.length; i++) {
                    ti.output_files[i].input = transformTextareaToInput(ti.output_files[i].input);
                    var $item = $('<div class="layui-form-item"><label class="layui-form-label layui-elip" title="' + ti.output_files[i].command +
                        '"><i>' + ti.output_files[i].command + '(' + ti.output_files[i].info + ')' + '</i>：</label>' + '<div class="layui-input-block">' +
                        '<input lay-verify="params" autocomplete="off" placeholder="请输入" class="layui-input" type="text" value="' +
                        ti.output_files[i].input + '" data-default="' + ti.output_files[i].input + '" data-origin="' +
                        ti.output_files[i].input + '" data-command="' + ti.output_files[i].command + '"' +
                        ' data-index="' + ti.output_files[i].index + '"' + '>' +
                        '</div></div>');
                    $item.appendTo($outputFilesList);
                }
            }

            $('[lay-verify="params"]').unbind('change').bind('change', function() {
                var defaultValue = $(this).attr('data-default');
                if (defaultValue != $(this).val()) {
                    $(this).addClass('input-change-border');
                } else {
                    $(this).removeClass('input-change-border');
                }
            });

            form.on('select(sub-process)', function(taskData) {
                initSubprocessSelectorInputTitle();
                var taskId = taskData.value;
                var select = taskData.elem;
                var $selectOpt = $(select).find('option:selected');
                var subprocessType = $selectOpt.attr('data-sub-process-type');

                $subprocessList.children().each(function() {
                    if ($(this).attr('id') == "task_" + taskId) {
                        $(this).css('display', 'block');
                        setStartNodeBtnStatus();
                        setEndNodeBtnStatus();
                    } else {
                        $(this).css('display', 'none');
                    }
                });
            });
            form.render();
            initWorkflowSelectorTitle();
            initWorkflowSelectorInputTitle();
            initSubprocessSelectorTitle();
        });
        form.render();
        initWorkflowSelectorTitle();
    }

    function transformTextareaToInput(input) {
        var inputs = input.split(/[\r\n]+/);
        var str = "";
        for (var i = 0; i < inputs.length; i++) {
            if (str == "") {
                str += inputs[i];
            } else {
                str += " " + inputs[i];
            }
        }
        return str;
    }

    function searchWorkflow(workflowId) {
        var url = "/webhdfs/v1?op=SELECTWORKFLOW";
        if (typeof(workflowId) != "undefined" && workflowId != "") {
            url += "&workflow=" + workflowId;
        }
        var workflows_results;
        $.ajax({
            async: false,
            url: url,
            type: 'POST',
            success: function(result) {
                var iworkflows = [];
                var workflowList = result.workflowList;
                for (var i = 0; i < workflowList.length; i++) {
                    if (workflowList[i].workflow_json != "null") {
                        var workflow = JSON.parse(workflowList[i].workflow_json);
                        // console.log(workflow);
                        if (workflow.type == 2) {
                            iworkflows.push(workflow);
                        }

                    }
                }
                workflows_results = iworkflows;
            },
            error: function(error) {}
        });
        return workflows_results;
    }

    function initOutputDir() {
        $('#local-output-dir-input').val("/analyze");
        $('#local-output-dir-input').prop('disabled', 'disabled');
    }

    function initWorkflowSelectorAndSubprocessSelector(filedata) {
        var $workflowSelect = $('#form-workflow-select').empty();
        var $defaultOpt = $('<option value="" >请选择一个工作流</option>');
        $defaultOpt.appendTo($workflowSelect);

        for (var i = 0; i < workflows.length; i++) {
            var wf_databases = workflows[i].stepsInfo.split(";");
            var $opt = $('<option value="' + i + '">' + workflows[i].title + '</option>');
            $opt.appendTo($workflowSelect);


        }
        var $subprocessSelect = $('#form-sub-process-select').empty();
        var $defaultSubprocess = $('<option value="">请配置各个子过程参数</optionalon>');
        $defaultSubprocess.appendTo($subprocessSelect);
        var $subprocessList = $('.form-sub-process-item-list');
        $subprocessList.children().each(function() {
            if ($(this).attr('id') != "task-name") {
                $(this).remove();
            } else {
                $(this).css('display', 'block');
            }
        });
        form.render();
    }

    function initSetStartNodeBtn() {
        $('#set-start-node-btn').unbind('click').bind('click', function() {
            var $select = $('#form-sub-process-select');
            var $selectedOpt = $select.find('option:selected');
            $('.analysis-start-node').each(function() {
                $(this).removeClass('analysis-start-node');
            });
            $selectedOpt.addClass('analysis-start-node');
            $('#set-start-node-btn').addClass('layui-hide');

            var $dd = $select.next().find('dd');

            $dd.each(function() {
                var $i = $(this).find('.start-icon');
                if ($i.length > 0 && !$(this).hasClass('layui-this')) {
                    $i.remove();
                } else if ($(this).hasClass('layui-this')) {
                    var $icon = $('<i class="start-icon">(开始)</i>');
                    if ($(this).find('.end-icon').length > 0) {
                        $(this).find('.end-icon').before($icon);
                    } else {
                        $icon.appendTo($(this));
                    }
                    $(this).attr('title', $(this).text());
                    $(this).parent().prev().find('input').val($(this).text());
                    $(this).parent().prev().find('input').attr('title', $(this).text());
                }
            });
        });
    }

    function setStartNodeBtnStatus() {
        var $select = $('#form-sub-process-select');
        var $selectedOpt = $select.find('option:selected');
        if ($selectedOpt.hasClass('analysis-start-node')) {
            $('#set-start-node-btn').addClass('layui-hide');
        } else {
            //end opt
            var $endOpt = $select.find('.analysis-end-node');
            var endIndex = $endOpt.index();

            //current opt
            var currentIndex = $selectedOpt.index();
            if (endIndex != -1 && endIndex < currentIndex) {
                $('#set-start-node-btn').addClass('layui-hide');
            } else {
                $('#set-start-node-btn').removeClass('layui-hide');
            }
        }
    }

    function initSetEndNodeBtn() {
        $('#set-end-node-btn').unbind('click').bind('click', function() {
            var $select = $('#form-sub-process-select');
            var $selectedOpt = $select.find('option:selected');
            $('.analysis-end-node').each(function() {
                $(this).removeClass('analysis-end-node');
            });
            $selectedOpt.addClass('analysis-end-node');
            $('#set-end-node-btn').addClass('layui-hide');

            var $dd = $select.next().find('dd');

            $dd.each(function() {
                var $i = $(this).find('.end-icon');
                if ($i.length > 0 && !$(this).hasClass('layui-this')) {
                    $i.remove();
                } else if ($(this).hasClass('layui-this')) {
                    var $icon = $('<i class="end-icon">(结束)</i>');
                    $icon.appendTo($(this));
                    $(this).attr('title', $(this).text());
                    $(this).parent().prev().find('input').val($(this).text());
                    $(this).parent().prev().find('input').attr('title', $(this).text());
                }
            });
        });
    }

    function setEndNodeBtnStatus() {
        var $select = $('#form-sub-process-select');
        var $selectedOpt = $select.find('option:selected');
        if ($selectedOpt.hasClass('analysis-end-node')) {
            $('#set-end-node-btn').addClass('layui-hide');
        } else {
            //start opt
            var $startOpt = $select.find('.analysis-start-node');
            var startIndex = $startOpt.index();

            //current opt
            var currentIndex = $selectedOpt.index();

            if (startIndex > currentIndex) {
                $('#set-end-node-btn').addClass('layui-hide');
            } else {
                $('#set-end-node-btn').removeClass('layui-hide');
            }
        }
    }

    function initAnalysisGroupTree(treeID, data) {
        emptyAnalysisGroupTree();
        addGroupNode($('#' + treeID), "group", "样本集", "group");

        var $groupTree = $('#analysis-group-tree');
        var $groupsNode = $groupTree.find('.treeNode');
        var $branch = $($groupsNode[0]).siblings('.tree-branch');
        // console.log(data);
        for (var i = 0; i < data.length; i++) {
            addGroupNode($branch, data[i].sample_name, data[i].sample_name, "leaf");
        }
        updateSelectedSampleNum(data.length);
    }

    function addGroupNode(parent, path, filename, nodeType) {
        var pl;
        if (nodeType == "group") {
            pl = 0;
        } else {
            pl = 15;
        }
        var $li = $('<li></li>');
        var $treeNode = $('<div class="treeNode" _pl="' + pl + '" style="padding-left: ' + pl + 'px"></div>');
        var $handler = $('<span class="treeNode-handler" node-path="' + path + '" data-file-type="' + nodeType + '"></span>');
        var $nodeItem;
        if (nodeType == "group") {
            $nodeItem = $('<i class="fa fa-th-large group-icon"></i>' + '<span class="nodename group-type">' + filename +
                '<span id="selected-sample-num-label" style="padding-left:10px;">已选择:0</span>' + '</span>');
        } else { //leaf
            $nodeItem = $('<i class="fa fa-file-text-o input-file-icon"></i>' + '<span class="nodename file-type" title="' + path + '">' + filename + '</span>');
        }
        var $branch = $('<ul class="tree-branch" _pl="' + (pl + 15) + '"></ul>');
        $nodeItem.appendTo($handler);
        $handler.appendTo($treeNode);
        $treeNode.appendTo($li);
        $branch.appendTo($li);
        $li.appendTo(parent);
    }

    function initSubprocessSelectorInputTitle() {
        var $input = $('#form-sub-process-select').next().find('input');
        $input.attr('title', $input.val());
    }

    function initWorkflowSelectorTitle() {
        $('#form-workflow-select').next().find('dd').each(function() {
            $(this).attr('title', $(this).text());
        });
    }

    function initWorkflowSelectorInputTitle() {
        var $input = $('#form-workflow-select').next().find('input');
        $input.attr('title', $input.val());
    }

    function initSubprocessSelectorTitle() {
        $('#form-sub-process-select').next().find('dd').each(function() {
            $(this).attr('title', $(this).text());
        });
    }

    function transformLines(lines) {
        var tlines = {};
        for (var key in lines) {
            var fromTaskId = lines[key].from;
            var toTaskId = lines[key].to;
            if (typeof(tlines[fromTaskId]) == 'undefined') {
                tlines[fromTaskId] = {};
                tlines[fromTaskId].to = [];
                tlines[fromTaskId].from = [];
            }
            if (typeof(tlines[toTaskId]) == 'undefined') {
                tlines[toTaskId] = {};
                tlines[toTaskId].to = [];
                tlines[toTaskId].from = [];
            }
            tlines[fromTaskId].to.push(toTaskId);
            tlines[toTaskId].from.push(fromTaskId);
        }
        return tlines;
    }

    function updateSelectedSampleNum(length) {
        $('#selected-sample-num-label').text('已选择:' + length);
    }

    function transformWorkflowStr(workflowSelect) {
        var $workflowSelect = $(workflowSelect);
        var index = parseInt($workflowSelect.val());
        var workflow = workflows[index].workflow;
        var commitWorkflow = {};

        commitWorkflow['outputDir'] = $('#local-output-dir-input').val();
        commitWorkflow['dataUpload'] = $('#data-upload-checkbox').is(":checked");
        commitWorkflow['type'] = "";
        commitWorkflow['workflowName'] = workflows[index].workflow.title;
        commitWorkflow['tasks'] = [];
        // commitWorkflow['sampleFiles1'] = [];
        // commitWorkflow['sampleFiles2'] = [];
        commitWorkflow['sampleNames'] = "";
        commitWorkflow['hdfs'] = true;

        var nodes = workflow.nodes;
        var lines = transformLines2(workflow.lines);
        var startRoundNodeId = null;
        var endRoundNodeId = null;
        for (var key in nodes) {
            if (nodes[key].type == "start round mix") {
                startRoundNodeId = key;
            } else if (nodes[key].type == "end round") {
                endRoundNodeId = key;
            }
        }
        if (startRoundNodeId == null || endRoundNodeId == null) {
            console.log("can not find start node or end node!! wait for change to layer");
            return;
        }

        var startNodeId = null;

        var $startNode = $('.analysis-start-node');
        if ($startNode.length > 0) {
            var snVal = $startNode.val();
            startNodeId = snVal;
        }

        var $endNode = $('.analysis-end-node');
        var endNodeId = null;
        if ($endNode.length > 0) {
            var enVal = $endNode.val();
            endNodeId = enVal;
        }

        commitWorkflow['tasks'] = transformNodes(nodes);
        commitWorkflow['lines'] = lines;
        commitWorkflow['startRoundNodeId'] = startRoundNodeId;
        commitWorkflow['endRoundNodeId'] = endRoundNodeId;
        commitWorkflow['startNodeId'] = startNodeId;
        commitWorkflow['endNodeId'] = endNodeId;
        return commitWorkflow;
    }

    function transformLines2(lines) {
        var tlines = {};
        for (var key in lines) {
            tlines[key] = {};
            tlines[key].from = lines[key].from;
            tlines[key].to = lines[key].to;
        }
        return tlines;
    }

    function transformNodes(nodes) {
        var tasks = {};
        for (var key in nodes) {
            var node = nodes[key];
            var taskInfo = node.taskInfo;
            var commitTask = {};
            commitTask['id'] = key;
            commitTask['methodName'] = taskInfo.task_name;
            commitTask['commandNum'] = 1;

            if (typeof(taskInfo.base_attrs[0]) != 'undefined') {
                commitTask['commandNum'] = taskInfo.base_attrs[0].input;
            }

            if (node.type == 'task') {
                commitTask['type'] = 'common';
            } else if (node.type == 'complex') {
                commitTask['type'] = 'bwa';
            } else if (node.type == 'plug') {
                commitTask['type'] = 'spark';
                initCommitWorkflowSparkNode(commitTask, node);
            } else if (node.type == 'start round mix') {
                commitTask['type'] = 'start';
            } else if (node.type == 'end round') {
                commitTask['type'] = 'end';
            } else {
                commitTask['type'] = 'common';
            }

            commitTask['inputFiles'] = [];
            commitTask['params'] = [];
            commitTask['outputFiles'] = [];

            var $subproessDiv = $('#task_' + key);
            var $inputFilesListDiv = $subproessDiv.find('.form-input-files-list');
            var $inputAttrsListDiv = $subproessDiv.find('.form-input-params-list');
            var $optionalAttrsListDiv = $subproessDiv.find('.form-input-optional-params-list');
            var $outputFilesListDiv = $subproessDiv.find('.form-output-files-list');

            var $inputFilesList = $inputFilesListDiv.find('input');
            var $inputAttrsList = $inputAttrsListDiv.find('input');
            var $optionalAttrsList = $optionalAttrsListDiv.find('input');
            var $outputFilesList = $outputFilesListDiv.find('input');

            var allParams = [];
            for (var k = 0; k < $inputFilesList.length; k++) {
                var param = {};
                param['command'] = $($inputFilesList[k]).attr('data-command');
                param['input'] = $($inputFilesList[k]).val();
                param['type'] = 'input';
                param['index'] = parseInt($($inputFilesList[k]).attr('data-index'));
                allParams.push(param);
            }
            var i = 0;
            for (; i < $inputAttrsList.length; i++) {
                var param = {};
                param['command'] = $($inputAttrsList[i]).attr('data-command');
                param['input'] = $($inputAttrsList[i]).val();
                param['type'] = 'params';
                param['index'] = parseInt($($inputAttrsList[i]).attr('data-index'));
                allParams.push(param);
            }
            for (var j = 0; j < $optionalAttrsList.length; j++) {
                var param = {};
                param['command'] = $($optionalAttrsList[j]).attr('data-command');
                param['input'] = $($optionalAttrsList[j]).val();
                param['type'] = 'optional';
                param['index'] = parseInt($($optionalAttrsList[j]).attr('data-index'));
                allParams.push(param);
            }
            for (var k = 0; k < $outputFilesList.length; k++) {
                var param = {};
                param['command'] = $($outputFilesList[k]).attr('data-command');
                param['input'] = $($outputFilesList[k]).val();
                param['type'] = 'output';
                param['index'] = parseInt($($outputFilesList[k]).attr('data-index'));
                allParams.push(param);
            }

            //sortParams
            allParams.sort(sortParams);

            commitTask['params'] = allParams;

            tasks[key] = commitTask;
        }
        return tasks;
    }

    function countGeneralTaskInputNum(input) {
        var inputs = input.split(/[\,]+/);
        return inputs.length;
    }

    function initCommitWorkflowSparkNode(commitTask, nodeData) {
        commitTask['executorCores'] = 1;
        commitTask['totalExecutorCores'] = 1;
        commitTask['executorMemory'] = '2g';
        commitTask['driverMemory'] = '64m';
        var taskInfo = nodeData.taskInfo;
        var base_attrs = taskInfo.base_attrs;
        for (var i = 0; i < base_attrs.length; i++) {
            var param = base_attrs[i];
            var command = param.command;
            if (command == "--executor-cores") {
                commitTask['executorCores'] = parseInt(param.input);
            } else if (command == "--total-executor-cores") {
                commitTask['totalExecutorCores'] = parseInt(param.input);
            } else if (command == "--executor-memory") {
                commitTask['executorMemory'] = param.input;
            } else if (command == "--driver-memory") {
                commitTask['driverMemory'] = param.input;
            } else if (command == "" && param.info == "执行次数") {
                commitTask['commandNum'] = param.input;
            }
        }
    }

    function sortParams(o1, o2) {
        return o1['index'] <= o2['index'] ? -1 : 1;
    }

    function createWorkflowsWithWildcard(workflowTemplate, selectedSamples, data) {
        var commitWorkflows = [];
        var sampleData = transformSampleData(data);
        var randomNum = Math.random() * (remote.length == 0 ? 1 : remote.length);
        randomNum = Math.floor(randomNum);
        var aWorkflow = JSON.parse(JSON.stringify(workflowTemplate)); //深拷贝
        aWorkflow = replaceAllInput(aWorkflow, "", randomNum, sampleData);
        commitWorkflows.push(aWorkflow);
        return commitWorkflows;
    }

    function replaceAllInput(aWorkflow, sampleName, index, data) {
        //because tumor
        var sampleFiles1 = [];
        var sampleFiles2 = [];

        // var samplePairFiles = configData[sampleName];
        var sampleFile1 = "";
        var sampleFile2 = "";

        aWorkflow.sampleNames = data["sample_names"];
        // console.log(aWorkflow);
        var batchNumber = $('#batch-number-input').val().trim();
        aWorkflow.batchNum = batchNumber;
        if (batchNumber != "") {
            if (aWorkflow.outputDir == "/") {
                aWorkflow.outputDir += batchNumber;
            } else {
                aWorkflow.outputDir += "/" + batchNumber
            }
        }

        aWorkflow.sampleName = sampleName;
        if (aWorkflow.outputDir == "/") {
            aWorkflow.outputDir += sampleName;
        } else {
            aWorkflow.outputDir += "/" + sampleName;
        }

        /*var md5Name = $.md5($.trim(sampleName));
        var md5NameStr = md5Name.substr(0,8);
        var md5NameInt = parseInt(md5NameStr, 16) % 5;
        if(md5NameInt < 0){
            md5NameInt += 5;
        }
        var md5NameIndex = md5NameInt == 0? '' : '0' + md5NameInt;*/
        var len = remote.length == 0 ? 1 : remote.length;
        var md5NameIndex = remote[index % len];
        var localResultPath = '/home/gosadmin/gos-1.0/data/remote' + md5NameIndex + "/analyze";
        aWorkflow.localResultPath = localResultPath;

        var tasks = aWorkflow.tasks;
        for (var key in tasks) {
            var params = tasks[key].params;
            for (var j = 0; j < params.length; j++) {
                params[j].input = params[j].input;
            }
        }
        return aWorkflow;
    }

    function transformSampleData(data) {
        var tdata = {};
        // console.log(data);
        var f1 = "sample_names";
        if (data.length > 0) {
            tdata["result_type"] = data[0]["result"];
            tdata[f1] = "";
            tdata[""] = "";
        }
        for (var i = 0; i < data.length; i++) {
            if (tdata[f1] === "") {
                tdata[f1] += data[i]["sample_name"];
            } else {
                tdata[f1] += "," + data[i]["sample_name"];
            }
        }
        // console.log(tdata);
        return tdata;
    }


    function commitAnalysis(workflowStr, index) {
        var url = "/webhdfs/v1?op=ANALYSISWS";
        layui.use('layer', function() {
            var layer = layui.layer,
                $ = layui.jquery;
            var loadIndex;
            var xhr = $.ajax({
                type: 'POST',
                url: url,
                data: { 'workflowStr': workflowStr },
                timeout: 60000, // 设置超时时间
                contentType: 'application/json',
                beforeSend: function(xhr) {
                    loadIndex = layer.load(1); // 数据加载成功之前，使用loading组件
                },
                success: function(result) {
                    if (result.code === undefined) {
                        layer.msg("服务器错误，请稍后重试", { icon: 2, time: 2000 });
                    } else if (result.code === 200) {
                        var layer = layui.layer;
                        layer.msg("分析已提交", { icon: 1, time: 2000 });
                        layer.close(index);
                    } else {
                        var layer = layui.layer;
                        layer.msg("分析失败:" + result.msg, { icon: 2, time: 2000 });
                        layer.close(index);
                    }
                },
                error: function(textStatus) {
                    console.error(textStatus);
                },
                complete: function(XMLHttpRequest, status) {
                    layer.close(loadIndex);
                }
            })
        });
    }

    /* Set Gene Database */
    // function initSetGeneDatabaseLayer(geneDatabases, samples) {
    //     var ids = getSelectedIds(samples);

    //     var title = '';
    //     if (samples.length == 1) {
    //         title = '样本 ' + samples[0].name;
    //     } else {
    //         title = '设置样本归属基因库,已选择' + samples.length + '个样本';
    //     }
    //     layer.open({
    //         type: 1,
    //         title: title,
    //         area: ['400px', '230px'],
    //         content: $('#sample-gene-database-div').text(),
    //         btn: ['确定', '取消'],
    //         resize: false,
    //         success: function(layero, index) {
    //             layui.use('form', function() {
    //                 var form = layui.form;
    //                 layero.find('.layui-layer-content').css('overflow', 'visible');
    //                 layero.find('.layui-layer-content').css('overflow-x', 'visible');
    //                 layero.find('.layui-layer-content').css('overflow-y', 'visible');
    //                 var $geneDatabaseSelector = layero.find('#sampleChangeGeneDatabase');
    //                 // $geneDatabaseSelector.empty();

    //                 if (samples.length == 1) {
    //                     if (samples[0]['gene_database_id'] == null) {
    //                         layero.find('#current-gene-database').text('未入库');
    //                     } else {
    //                         $('<option value="-1">移出基因库</option>').appendTo($geneDatabaseSelector);
    //                         layero.find('#current-gene-database').text(samples[0]['gene_database_name']);
    //                     }
    //                 } else {
    //                     $('<option value="-1">移出基因库</option>').appendTo($geneDatabaseSelector);
    //                     layero.find('.layui-form .layui-form-item:first').remove();
    //                     layero.find('.layui-form .layui-form-item').css('margin-top', '20px');
    //                 }

    //                 for (var i = 0; i < geneDatabases.length; i++) {
    //                     if (samples.length == 1) {
    //                         if (geneDatabases[i]['gene_database_id'] == samples[0]['gene_database_id']) {
    //                             continue;
    //                         }
    //                     }
    //                     var $op = $('<option value="' + geneDatabases[i]['gene_database_id'] + '">' +
    //                         geneDatabases[i]['gene_database_name'] + '</option>');
    //                     $op.appendTo($geneDatabaseSelector);
    //                 }
    //                 form.render();
    //             });
    //         },
    //         yes: function(index, layero) {
    //             var geneDatabaseId = layero.find('#sampleChangeGeneDatabase').val();
    //             if (geneDatabaseId == '') {
    //                 layui.layer.msg('请选择基因库', { icon: 0, time: 2000 });
    //                 return;
    //             }

    //             updateSampleGeneDatabase(ids, geneDatabaseId, function(result) {
    //                 if (result.msg !== undefined) {
    //                     layer.msg(result.msg, { icon: 0, time: 3000 });
    //                 } else if (result.succeedCount === undefined) {
    //                     layer.msg("样本设置基因库失败", { icon: 2, time: 2000 });
    //                 } else {
    //                     var temp = getWhereInfo();
    //                     table.reload('breeding_value_table', {
    //                         where: { //设定异步数据接口的额外参数，任意设
    //                             temp: JSON.stringify(temp),
    //                             orderstr: curOrderstr,
    //                             order: curOrder
    //                         }
    //                     });
    //                     initSearchFilter($('#sample-owner-select').val(), $('#sample-state-select').val(), $('#sample-gene-database-select').val());
    //                     layer.msg("成功设置样本基因库" + result.succeedCount + "个，失败" + result.failedCount + "个", { icon: result.failedCount > 0 ? 0 : 1, time: 3000 });
    //                 }
    //                 layer.close(index);
    //             });
    //         }
    //     });
    // }

    function updateSampleGeneDatabase(ids, geneDatabaseId, succeedFunction) {
        var url = "/webhdfs/v1?op=UPDATESAMPLEGENEDATABASE&user.name=gosadmin&temp=" + geneDatabaseId;
        var data = { 'sampleids': ids };
        //向服务端发送删除指令
        getAjax(true, 'POST', url, data, "json", succeedFunction, function(xhr, XMLHttpRequest, status) {
            if (status == 'timeout') {
                layer.msg("修改样本基因库超时", { icon: 2, time: 2000 });
            } else if (status == 'error') {
                layer.msg("修改样本基因库失败", { icon: 2, time: 2000 });
            }
        });
    }

    // function setGeneDatabaseBtnOnclick(data) {
    //     var url = "/webhdfs/v1?op=GETGENEDATABASE";
    //     getAjax(true, "GET", url, null, 'json', function(geneDatabases) {
    //         initSetGeneDatabaseLayer(geneDatabases, [data]);
    //     }, function(xhr, XMLHttpRequest, status) {
    //         if (status == 'timeout') {
    //             layer.msg("获取基因库超时", { icon: 2, time: 2000 });
    //         } else if (status == 'error') {
    //             layer.msg("获取基因库失败", { icon: 2, time: 2000 });
    //         }
    //     });
    // }

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
        layui.use('layer', function() {
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
                beforeSend: function(xhr) {
                    index = layer.load(1); // 数据加载成功之前，使用loading组件
                },
                success: function(json) {
                    if (callback && typeof(callback) == "function") {
                        callback(json);
                    }
                },
                error: function(textStatus) {
                    console.error(textStatus);
                },
                complete: function(XMLHttpRequest, status) {
                    layer.close(index);
                    if (complete && typeof(complete) == "function") {
                        complete(xhr, XMLHttpRequest, status);
                    }
                }
            })
        });
    }

    String.prototype.endWith = function(s) {
        if (s == null || s == "" || this.length == 0 || s.length > this.length)
            return false;
        if (this.substring(this.length - s.length) == s)
            return true;
        else
            return false;
        return true;
    }
    String.prototype.startWith = function(s) {
        if (s == null || s == "" || this.length == 0 || s.length > this.length)
            return false;
        if (this.substr(0, s.length) == s)
            return true;
        else
            return false;
        return true;
    }

})();

function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';

    var k = 1024;

    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    //toPrecision(3) 后面保留一位小数，如1.0GB                                                                                                                  //return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];  
}

function dateToDiffStr(date) {
    var t = Date.parse(date);
    if (isNaN(t)) {
        return '';
    } else {
        var tnow = Math.floor(new Date().getTime() / 1000);
        t = Math.floor(t / 1000);
        var diff = tnow - t;
        if (diff < 0) {
            return '';
        } else {
            if (diff < 60) {
                return diff + '秒前';
            } else if (diff >= 60 && diff < 60 * 60) {
                return Math.floor(diff / 60) + '分钟前';
            } else if (diff >= 60 * 60 && diff < 60 * 60 * 24) {
                return Math.floor(diff / (60 * 60)) + '小时前';
            } else if (diff >= 60 * 60 * 24 && diff < 60 * 60 * 24 * 30) {
                return Math.floor(diff / (60 * 60 * 24)) + '天前';
            } else if (diff >= 60 * 60 * 24 * 30 && diff < 60 * 60 * 24 * 30 * 12) {
                return Math.floor(diff / (60 * 60 * 24 * 30)) + '个月前';
            } else {
                return Math.floor(diff / (60 * 60 * 24 * 30 * 12)) + '年前';
            }
        }
    }
}

function dateToLastTime(startStr, endStr) {
    var startTime = Date.parse(startStr);
    var endTime = Date.parse(endStr);
    var time = endTime - startTime;
    var timeStr = "";
    var negative = false;
    if (time < 0) {
        time = -time;
        negative = true;
    } else {
        time = Math.floor(time / 1000);
        var hour = Math.floor(time / (60 * 60));
        var min = Math.floor((time % (60 * 60)) / 60);
        var second = time % (60);
        if (hour < 10) {
            timeStr += '0';
        }
        timeStr += hour + ':';
        if (min < 10) {
            timeStr += '0';
        }
        timeStr += min + ':';
        if (second < 10) {
            timeStr += '0';
        }
        timeStr += second;
    }
    if (negative) {
        return '-' + timeStr;
    } else {
        return timeStr;
    }
}

//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
}