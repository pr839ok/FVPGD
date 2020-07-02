$(function() {
    // initDownloadTable();
    $("#txt_search").keyup(function(evt) {
        ChangeCoords(); //控制查询结果div坐标  
        var k = window.event ? evt.keyCode : evt.which;
        //输入框的id为txt_search，这里监听输入框的keyup事件  
        //不为空 && 不为上箭头或下箭头或回车  
        if ($("#txt_search").val() != "" && k != 38 && k != 40 && k != 13) {

            var gene_input = $("#txt_search").val();
            $.ajax({
                url: '/webhdfs/v1?op=PUBDB_SEARCHGENE&temp=' + gene_input,
                dataType: 'json',

                error: function(msg) { //请求失败处理函数  
                    alert("数据加载失败");
                },
                success: function(json) { //请求成功后处理函数。  
                    /*  var objData = eval("(" + data.userName + ")");   */
                    console.log(json);

                    if (json.data.length > 0) {
                        var layer = "";
                        layer = "<table id='aa' style='font-size:17px;'>";
                        /*$.each(data, function(idx, item) {
                            layer += "<tr class='line'><td class='std'>" + item.userName + "</td></tr>";
                        });*/
                        for (var i = 0; i < json.data.length; i++) {
                            //  console.log(json.data[i]);
                            layer += "<tr class='line'><td class='std' style=' padding-left: 10px;'>" + json.data[i] + "</td></tr>";
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
                            //$("#searchresult").css("display", "none");  
                        });
                        //鼠标点击事件  
                        $(".line").click(function() {
                            $("#txt_search").val($(this).text());
                            $("#searchresult").css("display", "none");
                        });
                    } else {
                        $("#searchresult").empty();
                        $("#searchresult").css("display", "none");
                    }
                }
            });
        } else if (k == 38) { //上箭头  
            $('#aa tr.hover').prev().addClass("hover");
            $('#aa tr.hover').next().removeClass("hover");
            $('#txt_search').val($('#aa tr.hover').text());
        } else if (k == 40) { //下箭头  
            $('#aa tr.hover').next().addClass("hover");
            $('#aa tr.hover').prev().removeClass("hover");
            $('#txt_search').val($('#aa tr.hover').text());
        } else if (k == 13) { //回车  
            //   $('#txt_search').val($('#aa tr.hover').text());
            $("#searchresult").empty();
            $("#searchresult").css("display", "none");
        } else {
            $("#searchresult").empty();
            $("#searchresult").css("display", "none");
        }
    });
    $("#searchresult").bind("mouseleave", function() {
        $("#searchresult").empty();
        $("#searchresult").css("display", "none");
    });
});
//设置查询结果div坐标  
var currentField;

function initDownloadTable() {
    $('#export_table').click(function() {
        var url = '/webhdfs/v1?op=PUBDB_EXPORTSEARCHXLSX&temp=' + currentField;
        getFileAjax(true, 'GET', url, null, 'json', function(result) {
            var number = result.number;
            if (number == undefined)
                number = 0;
            if (result.code == 200 && number <= 100000) {
                var downloadurl = '/webhdfs/v1/' + result.path + "?op=PUBDB_DOWNLOAD&temp=1";
                exportFile("pubdb_search", ".xlsx", downloadurl);
            } else {
                layer.msg(result.msg, { icon: 2, time: 2000 });
            }
        }, function(xhr, XMLHttpRequest, status) {});
    })
}

function ChangeCoords() {
    //    var left = $("#txt_search")[0].offsetLeft; //获取距离最左端的距离，像素，整型  
    //    var top = $("#txt_search")[0].offsetTop + 26; //获取距离最顶端的距离，像素，整型（20为搜索输入框的高度）  
    var left = $("#txt_search").position().left; //获取距离最左端的距离，像素，整型  
    var top = $("#txt_search").position().top + 37;; //获取距离最顶端的距离，像素，整型（20为搜索输入框的高度）  
    $("#searchresult").css("left", left + "px"); //重新定义CSS属性  
    $("#searchresult").css("top", top + "px"); //同上  
}

function deDuplicateArr(arr) {
    var result = [];
    for (var i = 0; i < arr.length - 1; i++) {
        var exit = false;
        for (var j = i + 1; j < arr.length; j++) {
            if (arr[i] == arr[j]) {
                exit = true;
            }
        }
        if (!exit) {
            result.push(arr[j]);
        }
    }
}

var form, layer, element, laypage, laydate, table;
layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
    form = layui.form;
    // layer = parent.layer === undefined ? layui.layer : parent.layer;
    layer = layui.layer;
    element = layui.element;
    laypage = layui.laypage;
    laydate = layui.laydate;
    table = layui.table;
    //监听提交
    /*form.on('select(searchPname)', function(data) {*/
    $.ajax({
        url: '/webhdfs/v1?op=PUBDB_SEARCHCONDITION&temp=' + getUrlParam("library"),
        dataType: 'json',
        success: function(json) {
            console.log(json.data);
            /*console.log(parent.dicts);
            if(parent.dicts)
            parent.dicts=json.data;*/
            for (var i = 0; i < json.data.resSpecies.length; i++) {
                var option_species = $("<option>").val(json.data.resSpecies[i]).text(json.data.resSpecies[i]);
                $("#species").append(option_species);
            }
            for (var i = 0; i < json.data.resSource.length; i++) {
                var option_source = $("<option>").val(json.data.resSource[i]).text(json.data.resSource[i]);
                $("#source").append(option_source);
            }
            for (var i = 0; i < json.data.resCountry.length; i++) {
                var option_coun = $("<option>").val(json.data.resCountry[i]).text(json.data.resCountry[i]);
                $("#coun").append(option_coun);
            }
            form.render('select');
        }
    });





    /* $.ajax({
         url: '/webhdfs/v1?op=PUBDB_SEARCHSPECIES',
         dataType: 'json',
         success: function(json) {
             console.log(json.data);
             //$("#species").html("");
             for (var i = 0; i < json.data.length; i++) {
                 console.log(json.data[i]);
                 var option_species = $("<option>").val(json.data[i]).text(json.data[i]);
                 $("#species").append(option_species);
             }

             form.render('select', 'species');
         }
     });
     $.ajax({
         url: '/webhdfs/v1?op=PUBDB_SEARCHSOURCE',
         dataType: 'json',
         success: function(json) {
             console.log(json.data);
             //$("#prov").html("");
             for (var i = 0; i < json.data.length; i++) {
                 console.log(json.data[i]);
                 var option_source = $("<option>").val(json.data[i]).text(json.data[i]);
                 $("#source").append(option_source);
             }

             form.render('select', 'source');
         }
     });
     $.ajax({
         url: '/webhdfs/v1?op=PUBDB_SEARCHCOUNTRY',
         dataType: 'json',
         success: function(json) {
             console.log(json.data);
             //$("#prov").html("");
             for (var i = 0; i < json.data.length; i++) {
                 console.log(json.data[i]);
                 var option_country = $("<option>").val(json.data[i]).text(json.data[i]);
                 $("#coun").append(option_country);
             }

             form.render('select', 'coun');
         }
     });*/

    /* });*/
    //监听下拉框选中事件
    form.on('select(provSel)', function(data) {
        // alert(data.value);
        $.ajax({
            url: "/webhdfs/v1?op=PUBDB_SEARCHCONDITIONCITY&temp=" + data.value,
            dataType: 'json',
            success: function(json) {
                $("#city").html("");
                for (var i = 0; i < json.data.length; i++) {
                    var option_city = $("<option>").val(json.data[i]).text(json.data[i]);
                    $("#city").append(option_city);
                }
                form.render('select', 'city');
            }
        });
    });


    form.on('submit(search)', function(data) {
        //  layer.msg(JSON.stringify(data.field));
        data.field.library = layui.data('libraryname').library;
        currentField = JSON.stringify(data.field);
        search(JSON.stringify(data.field));
        return false;
    });
    layui.use('table', function() {
        var table = layui.table;
        //监听单元格事件
        table.on('tool(search-result)', function(obj) {
            var data = obj.data;
            if (obj.event === 'setSign') {
                //   alert(data.string_col_002);
                /*$(this).mouseover(function(){
                  $(this).css("color","red");
                });
                $(this).mouseout(function(){
                  $(this).css("color","#666");
                });*/
                window.open("sequence_detailed.html?strain=" + data.strain + "");
            }
        });
    });


    function search(dataField) {
        //console.log(layui.data('libraryname').library);
        var apiUrl = '/webhdfs/v1?op=PUBDB_SEARCHLISTFIELD';
        var xhr = $.ajax({
            async: true,
            type: 'GET',
            url: apiUrl,
            timeout: 30000, // 设置超时时间
            dataType: 'json',
            contentType: 'application/json',
            beforeSend: function(xhr) {
                // index = layer.load(1); // 数据加载成功之前，使用loading组件
            },
            success: function(json) {
                console.log(json.data);
                var description_array = [];
                if (json.code == 200) {
                    console.log(json);
                    datalist = [];

                    var desArray = json.data;
                    // console.log(desArray);
                    for (var j in desArray) {
                        //  alert(j);
                        var f = {};
                        f.field = j;
                        f.align = "center";
                        f.title = desArray[j];
                        if (j == "string_col_009" || j == "string_col_011" || j == "float_col_000") {
                            f.width = "20%";
                        } else {
                            f.width = "15%";
                        }
                        //小屏幕下的导航条折叠
                        if ($(window).width() < 768) {
                            f.width = "15%"
                            //点击导航链接之后，把导航选项折叠起来
                            if (j == "id") {
                                f.fixed = 'left';

                            } else if (j == "strain") {
                                f.templet = '#selectTpl';
                                f.event = 'setSign';
                                f.style = 'cursor: pointer;color:red;';
                                f.fixed = 'left';
                                f.formatter = function linkFormatter(value, row, index) {
                                    return "<a href='sequence_detailed.html?strain=" + value + "' title='单击打开连接' target='_blank'>" + value + "</a>";
                                };
                            } else {
                                f.visible = false;
                            }

                        } else {
                            if (j == "id") {
                                f.fixed = 'left';

                            }
                            if (j == "strain") {
                                f.templet = '#selectTpl';
                                f.event = 'setSign';
                                f.style = 'cursor: pointer;color:red;';
                                f.fixed = 'left';
                            }
                        }

                        datalist.push(f);
                    }
                    //  console.log(datalist);

                    /* var desArray = json.data;
                    for (var j in desArray) {
                        var des = {
                            'string_col_000': json.data[j].string_col_000,
                            'string_col_001': json.data[j].string_col_001,
                            'string_col_002': json.data[j].string_col_002,
                            'string_col_003': json.data[j].string_col_003,
                            'string_col_004': json.data[j].string_col_004,
                            'string_col_005': json.data[j].string_col_005,
                            'string_col_006': json.data[j].string_col_006,
                            'string_col_007': json.data[j].string_col_007,
                            'string_col_008': json.data[j].string_col_008,
                            'string_col_009': json.data[j].string_col_009,
                            'string_col_010': json.data[j].string_col_010,
                            'string_col_011': json.data[j].string_col_011,
                            'string_col_012': json.data[j].string_col_012,
                            'date_col_000': json.data[j].date_col_000,
                            'float_col_000': json.data[j].float_col_000,
                        };
                        description_array.push(des);
                    }

                }
                console.log(description_array);*/
                    if ($(window).width() < 768) {
                        init_tableb(dataField);
                    } else {
                        search_table(dataField);
                    }

                }

                function doQuery() {
                    $("#docDateTable").bootstrapTable('destroy'); //刷新表格
                    init_tableb(dataField);
                }

                function linkFormatter(value, row, index) {
                    return "<a href='" + value + "' title='单击打开连接' target='_blank'>" + value + "</a>";
                }

                function init_tableb(dataField) {

                    $('#docDateTable').bootstrapTable('destroy');
                    console.log(dataField);
                    var url = '/webhdfs/v1?op=PUBDB_SEARCHLISTRESULT&temp=' + dataField;
                    $('#docDateTable').bootstrapTable({
                        method: 'GET',
                        dataType: 'json',
                        contentType: "application/x-www-form-urlencoded",
                        cache: false,
                        striped: true, //是否显示行间隔色
                        sidePagination: "client", //分页方式：client客户端分页，server服务端分页（*）
                        url: url,
                        /*height: $(window).height() - 110,*/
                        width: $(window).width(),
                        showColumns: true,
                        pagination: true,
                        /*queryParams: queryParams,*/
                        minimumCountColumns: 2,
                        pageNumber: 1, //初始化加载第一页，默认第一页
                        pageSize: 10, //每页的记录行数（*）
                        pageList: [10, 25, 50, 100], //可供选择的每页的行数（*）
                        uniqueId: "id", //每一行的唯一标识，一般为主键列
                        showExport: true,
                        exportDataType: 'all',
                        /*responseHandler: responseHandler,*/
                        queryParams: function(params) {
                            //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
                            var temp = {
                                temp: dataField, //页面大小
                                /*page: (params.offset / params.limit) + 1, //页码
                                sort: params.sort, //排序列名  
                                sortOrder: params.order //排位命令（desc，asc） */
                            };
                            return temp;
                        },
                        columns: [datalist]
                    });
                    $(".fixed-table-pagination").css("margin-left", "19px");
                    $(".columns").css("margin-right", "15px");
                }

                function init_table() {
                    // body...
                    //     $('body').append('<script type="text/html" id="selectTpl">$("td").focus(function(){$("td").css("background-color","#FFFFCC");});</script>');
                    table.render({
                        elem: '#search-result',
                        //   limit : 1,
                        url: '/webhdfs/v1?op=PUBDB_SEARCHLIST',
                        cols: [datalist
                            /* [
                                 
                                 { field: 'string_col_000', title: '属名', align: 'center', sort: true, width: '15%' },
                                 { field: 'string_col_001', title: '种名', align: 'center', sort: true, width: '20%' },
                                 { field: 'string_col_002', title: '菌株名', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_003', title: '菌株编号', align: 'center', sort: true, width: '17%' },
                                 { field: 'date_col_000', title: '采集时间', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_004', title: '国家', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_005', title: '地区', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_006', title: '详细分离信息', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_007', title: '来源', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_008', title: '血清型', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_009', title: '耐药性', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_010', title: '参考文献', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_011', title: '对应文件目录', align: 'center', sort: true, width: '17%' },
                                 { field: 'float_col_000', title: '密级', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_012', title: '菌种保藏信息', align: 'center', sort: true, width: '17%' },
                             ]*/
                        ],
                        page: true,
                        //   limits: [12, 60, 90, 150, 300, 1000],
                        //    data: description_array,
                        done: function(res, curr, count) {
                            // $(".layui-laypage-btn").text("33");
                        }
                    });
                }

                function search_table(dataField) {
                    // body...
                    //     $('body').append('<script type="text/html" id="selectTpl">$("td").focus(function(){$("td").css("background-color","#FFFFCC");});</script>');
                    table.render({
                        elem: '#search-result',
                        //   limit : 1,
                        url: '/webhdfs/v1?op=PUBDB_SEARCHLISTRESULT&temp=' + dataField,
                        cols: [datalist
                            /* [
                                 
                                 { field: 'string_col_000', title: '属名', align: 'center', sort: true, width: '15%' },
                                 { field: 'string_col_001', title: '种名', align: 'center', sort: true, width: '20%' },
                                 { field: 'string_col_002', title: '菌株名', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_003', title: '菌株编号', align: 'center', sort: true, width: '17%' },
                                 { field: 'date_col_000', title: '采集时间', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_004', title: '国家', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_005', title: '地区', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_006', title: '详细分离信息', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_007', title: '来源', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_008', title: '血清型', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_009', title: '耐药性', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_010', title: '参考文献', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_011', title: '对应文件目录', align: 'center', sort: true, width: '17%' },
                                 { field: 'float_col_000', title: '密级', align: 'center', sort: true, width: '17%' },
                                 { field: 'string_col_012', title: '菌种保藏信息', align: 'center', sort: true, width: '17%' },
                             ]*/
                        ],
                        page: true,
                        //   limits: [2, 60, 90, 150, 300, 1000],
                        //    data: description_array,
                        done: function(res, curr, count) {}
                    });
                }
            },

            error: function(textStatus) {
                console.error(textStatus);
            },
            complete: function(XMLHttpRequest, status) {
                // layer.close(index);
                // if (complete && typeof(complete) == "function") {
                //     complete(xhr, XMLHttpRequest, status);
                // }
                // complete(xhr, XMLHttpRequest, status);
            }
        });
    }

    /*  $('.layui-form #gene_input').live('input propertychange', function() {
          // alert($("#gene_input").val());
          var gene_input = $("#gene_input").val();
          $.ajax({
              url: '/webhdfs/v1?op=PUBDB_SEARCHGENE&temp=' + gene_input,
              dataType: 'json',
              success: function(json) {

              }
          });
      })*/


    function tableShow() {
        var description_array = [];
        var des = {
            /*'a': '1',
            'b': '2',
            'c': '2',*/
            'd': "1",
            'e': "153-1LM",
            'f': "FSCC(I) | 178104",
            'g': "单核细胞增生李斯特菌",
            /*'h': "2",*/
            'i': "1/2a",
            'j': '0.3',
            'k': '三鲜饺',
            'l': '153  ',
            /*'m': "2",*/
            'n': "11.09.19",
            'o': "11.09.25  ",
            'p': "陈谋通",
            /*'q': "2",*/
            'r': "+",
            's': 'listeria',
            't': 'monocytogenes',
            'u': '广州市',
            'v': "从化区",
            'w': "万丰连锁超市",
            'x': "4547",
            'y': "99.92%",
            // 'z': "2"
        };

        description_array.push(des);
        table.render({
            elem: '#search-result',
            cols: [
                /*[

                    { field: 'a', title: '基础信息', align: 'center', sort: true, width: '', colspan: 8 },
                    { field: 'b', title: '菌株来源信息', align: 'center', sort: true, width: '', colspan: 8 },
                    { field: 'c', title: '鉴定信息', align: 'center', sort: true, width: '', colspan: 3 },
                ],*/
                [

                    /* { field: 'd', title: '序号', align: 'center', sort: true, width: '10%', rowspan: 2 },*/
                    { field: 'e', title: '菌株编号', fixed: 'left', align: 'center', sort: true, width: '15%', style: 'height:78px;', rowspan: 2 },
                    { field: 'f', title: '环凯编号', fixed: 'left', align: 'center', sort: true, width: '20%', rowspan: 2 },
                    { field: 'g', title: '中文名', align: 'center', sort: true, width: '23%', style: 'height:66px;', rowspan: 2 },
                    { field: 'h', title: '拉丁名', align: 'center', sort: true, width: '', colspan: 2 },
                    { field: 'i', title: '血清型', align: 'center', sort: true, width: '12%', rowspan: 2 },
                    { field: 'j', title: 'MPN/g', align: 'center', sort: true, width: '12%', rowspan: 2 },
                    { field: 'k', title: '菌株分离源（样品名称）', align: 'center', sort: true, width: '24%', rowspan: 2 },
                    { field: 'l', title: '样品编号', align: 'center', sort: true, width: '15%', rowspan: 2 },
                    { field: 'm', title: '采样地点', align: 'center', sort: true, width: '', colspan: 3 },
                    { field: 'n', title: '采样时间', align: 'center', sort: true, width: '15%', rowspan: 2 },
                    { field: 'o', title: '分离鉴定日期', align: 'center', sort: true, width: '18%', rowspan: 2 },
                    { field: 'p', title: '分离鉴定人', align: 'center', sort: true, width: '16%', rowspan: 2 },
                    { field: 'q', title: 'MID-67李斯特鉴定系统', align: 'center', sort: true, width: '10%', colspan: 2 },
                    { field: 'r', title: '鉴定系统未包含的其它分类学性状:过氧化氢酶试验', align: 'center', sort: true, width: '45%', rowspan: 2 },

                ],
                [

                    { field: 's', title: '属名', align: 'center', sort: true, width: '10%' },
                    { field: 't', title: '种名', align: 'center', sort: true, width: '15%' },
                    { field: 'u', title: '城市', align: 'center', sort: true, width: '10%' },
                    { field: 'v', title: '地区', align: 'center', sort: true, width: '10%' },
                    { field: 'w', title: '具体地点', align: 'center', sort: true, width: '15%' },
                    { field: 'x', title: '反应代号', align: 'center', sort: true, width: '15%' },
                    { field: 'y', title: '符合率', align: 'center', sort: true, width: '13%' },
                    /*{ field: 'z', title: '过氧化氢酶试验', align: 'center', sort: true, width: ''},*/
                ]
            ],

            data: description_array,

            done: function(res, curr, count) {
                $('tr').css({ height: '66px' });
            }
        });
    }


});

function getUrlParam(name) { //a标签跳转获取参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
}

function change() {
    var x = document.getElementById("first");
    var y = document.getElementById("second");
    y.options.length = 0; // 清除second下拉框的所有内容  
    if (x.selectedIndex == 0) {
        y.options.add(new Option("黄冈", "0"));
        y.options.add(new Option("武汉", "1", false, true)); // 默认选中省会城市  
    }

    if (x.selectedIndex == 1) {
        y.options.add(new Option("深圳", "0"));
        y.options.add(new Option("广州", "1", false, true)); // 默认选中省会城市  
        y.options.add(new Option("肇庆", "2"));
    }

}