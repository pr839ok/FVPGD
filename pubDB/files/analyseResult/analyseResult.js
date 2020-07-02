var uploaded = {};
uploaded.filename = '';
var form, layer, element, laypage, laydate, table;
(function() {
    "use strict";

    function GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    function getUrlParam(name) { //a标签跳转获取参数
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return (r[2]);
        return null;
    }
    if (getUrlParam("type") == 'CG' || getUrlParam("type") == 'CGF') {
        getAjax(true, 'GET', '/fpbdb/ANALYSIS?temp=' + getUrlParam("id"), null, 'json', function(json) {
            if (json.code == 200) {
                layer.msg('Analysis is in progress. ', { icon: 5 });
            } else if (json.code == 403) {
                layer.msg('Extraction code does not exist. ', { icon: 5 });
            } else {
                get_table(json.data.coremsg);
                initEvTree(json.data.evtreepic,getUrlParam("id"));

            }
        });
    } else if (getUrlParam("type") == 'CS' || getUrlParam("type") == 'CSF') {
        var time = "";
        getAjax(true, 'GET', '/fpbdb/TYPINGCRISPRTIME?temp=' + getUrlParam("id"), null, 'json', function(json) {
            time = json.data;
            getAjax(true, 'GET', '/fpbdb/ANALYSISCRISPR?temp=' + getUrlParam("id") + "," + time, null, 'json', function(json) {
                if (json.code == 200) {

                } else if (json.code == 403) {

                } else {
                    $('#anim').css('display', 'none');
                    //$('#loadingnew').css({ 'display': 'none' });
                    $('#clickp').css('display', 'block');
                    get_table_1(json.data);
                }
            });
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
        $("#filelist_table").css("display", "block");
        layui.use(['table'], function() {

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
    initFunction();

    function initFunction() {

        layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
            form = layui.form;
            layer = layui.layer;
            element = layui.element;
            laypage = layui.laypage;
            laydate = layui.laydate;
            table = layui.table;
            $('#searchButton').bind('click', function() {
                $("#filelist").css("display", "none");
                getAjax(true, 'GET', '/fpbdb/ANALYSIS?temp=' + $("#par").val(), null, 'json', function(json) {
                    if (json.code == 200) {
                        layer.msg('Analysis is in progress. ', { icon: 5 });
                    } else if (json.code == 403) {
                        layer.msg('Extraction code does not exist. ', { icon: 5 });
                    } else if (json.code == 201) {
                        get_table(json.data.coremsg);
                        initEvTree(json.data.evtreepic,$("#par").val());
                    } else if (json.code == 202) {
                        get_table_2(json.data);
                    }
                });
            });
        });
    }

    function initEvTree(path,uid) {
        if (path && path != null && path != "") {
            var downloadUrl = '/fpbdb/download' + path + '?temp=0';
            $('#evtree-download').removeClass('layui-hide');
            $('#evtree-view').removeClass('layui-hide');
            $('#evtree-download').unbind('click').bind('click', function() {
                downloadFile(downloadUrl, 'circular_tree.png');
            });
            $('#pic-name').removeClass('layui-hide');
            $('#pic-name').html('circular_tree.png');
            $('#evtree-view').unbind('click').bind('click', function() {
                window.open('/gosweb/pubDB/visualTool/evolutionaryTreesShow.html?id='+uid);
            });
        }
    }

    function get_table_2(data) {

        $('#clickp').css('display', 'none');
        layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {

            form = layui.form;
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
                            area: ['700px', '400px'],
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

    function get_table_1(data) {
        $('#clickp').css('display', 'none');
        layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {

            form = layui.form;
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
                    getAjax(true, 'GET', '/fpbdb/SEARCHCRISPRSEQ?temp=' + getUrlParam("id") + "," + data.name + "," + time, null, 'json', function(json) {
                        $("#direct").val(json.data.direct_repeat);
                        $("#binding").val(json.data.binding_site);
                        form.render();
                        layer.open({
                            type: 1,
                            title: '',
                            area: ['700px', '400px'],
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
                    getAjax(true, 'GET', '/fpbdb/SEARCHCRISPRSEQ?temp=' + data.name + "," + getUrlParam("id"), null, 'json', function(json) {
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
            /*table.render({
                elem: '#filelist2',
                cols: [
                    [{ field: 'num', title: 'num', sort: true },
                        { field: 'seq', title: 'seq' }
                        
                    ]
                ],
                data: data.sakazakii_2_order,
                page: true
            });
            table.render({
                elem: '#filelist3',
                cols: [
                    [{ field: 'num', title: 'num', sort: true },
                        { field: 'seq', title: 'seq' }
                        
                    ]
                ],
                data: data.sakazakii_3_order,
                page: true
            });
            table.render({
                elem: '#filelist6',
                cols: [
                    [{ field: 'num', title: 'num', sort: true },
                        { field: 'seq', title: 'seq' }
                        
                    ]
                ],
                data: data.sakazakii_6_order,
                page: true
            });*/

            // initPhenotypeTable();
        });

    }

    function initFunction_1() {
        var form, layer, element, laypage, laydate, table;
        layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
            form = layui.form;
            layer = layui.layer;
            element = layui.element;
            laypage = layui.laypage;
            laydate = layui.laydate;
            table = layui.table;
            $('#searchButton').bind('click', function() {
                getAjax(true, 'GET', '/fpbdb/ANALYSIS?temp=' + $("#par").val(), null, 'json', function(json) {
                    if (json.code == 200) {
                        uploaded.filename = '';
                        $('#u270_1_a').text(json.data.outputFile_pair);
                        /*$('#u270_2_a').text(json.data.outputFile_asn);*/
                        $('#u270_2_a').text(json.data.outputFile_tabular);
                        $('#u270_1_a').attr('href', '/fpbdb/BLASTNFILEDOWNLOAD' + json.data.outputFile_pair);
                        $('#u270_2_a').attr('href', '/fpbdb/BLASTNFILEDOWNLOAD' + json.data.outputFile_tabular);
                        $('#u270_1').css('display', 'inline');
                        $('#u270_2').css('display', 'inline');
                        $('#u270_3').css('display', 'inline');
                        $('.result-div').css({ 'display': 'inline', ' margin-top': '1000px' });

                        if (json.data.output_json == null) {
                            return false;
                        }

                        var res_json = JSON.parse(json.data.output_json).BlastOutput2[0];
                        var report = res_json.report;
                        var results = res_json.report.results;
                        var search_res = results.search;

                        var program = report.program;
                        var version = report.version;
                        var dbname = report.search_target.db; //here
                        /*var postDate=*/
                        var query_id = search_res.query_id;
                        var query_name = search_res.query_title;
                        var query_len = search_res.query_len;
                        var hits = search_res.hits;
                        // var nowDate = new Date().pattern("yyyyMMdd_HHmm");
                        var nowDate = new Date();
                        $('#RID_label').text(nowDate.toLocaleDateString());
                        $('#QueryID_label').text(query_id);
                        $('#Molecule_label').text('nucleic acid');
                        $('#QueryLength_label').text(query_len);
                        var dbnameStr = dbname.split("/");
                        $('#DB_name_label').text(dbnameStr[dbnameStr.length - 1]);
                        $('#Program_label').text(version);
                        var description_array = [];
                        var alignment = [];
                        for (var i in hits) {
                            var hit = hits[i];
                            var desArray = hit.description;
                            for (var j in desArray) {
                                var des = desArray[j];
                                var hsps = hit.hsps[j];

                                var score = hsps.score;
                                var max_score = hsps.bit_score;
                                var evalue = hsps.evalue;
                                var identity = hsps.identity;
                                var query_cover = hsps.identity / query_len;
                                var gaps = hsps.gaps / identity;
                                var query_strand = hsps.query_strand;
                                var hit_strand = hsps.hit_strand;
                                //cover=align_len/query_len
                                //indentify=identity/align_len
                                var strainSrt = des.title;
                                var strainArr = strainSrt.split(" ");
                                /*alert(arr[arr.length - 1])*/

                                var des = {
                                    'id': des.id,
                                    'description': des.title,
                                    'accession': des.accession,
                                    'max_score': max_score,
                                    'score': score,
                                    'evalue': evalue,
                                    'query_cover': query_cover,
                                    'ident': identity,
                                    'strain': strainArr[strainArr.length - 1]
                                };

                                description_array.push(des);

                                var ali = {
                                    'description': des.title,
                                    'accession': des.accession,
                                    'sequenceId': des.id,
                                    'query_cover': des.query_cover,
                                    'max_score': max_score,
                                    'evalue': evalue,
                                    'query_len': query_len,
                                    'identity': hsps.identity,
                                    "query_strand": hsps.query_strand,
                                    "hit_strand": hsps.hit_strand,
                                    "gaps": hsps.gaps,
                                    "qseq": hsps.qseq,
                                    "hseq": hsps.hseq,
                                    "midline": hsps.midline
                                };
                                alignment.push(ali);
                            }
                        }
                        $('#tabular-download-tabular').attr('href', '/fpbdb/BLASTNFILEDOWNLOAD' + json.data.outputFile_tabular);
                        $('#tabular-download-pair').attr('href', '/fpbdb/BLASTNFILEDOWNLOAD' + json.data.outputFile_asn);
                        if ($(window).width() < 768) {
                            init_tableb();
                        } else {
                            table.render({

                                elem: '#paired',
                                cols: [
                                    [
                                        /*{ field: 'query id', title: 'query id', sort: true, width: '7%' },
                                        { field: 'subject id', title: 'subject id', sort: true, width: '7%' },
                                        { field: '% identity', title: '% identity', sort: true, width: '7%' },
                                        { field: 'alignment length', title: 'alignment length', sort: true, width: '7%' },
                                        { field: 'mismatches', title: 'mismatches', sort: true, width: '7%' },
                                        { field: 'gap opens', title: 'gap opens', sort: true, width: '7%' },
                                        { field: 'q. start', title: 'q. start', sort: true, width: '7%' },
                                        { field: 'q. end', title: 'q. end', sort: true, width: '7%' },
                                        { field: 's. start', title: 'subject id', sort: true, width: '7%' },
                                        { field: 's. end', title: 's. end', sort: true, width: '7%' },
                                        { field: 'evalue', title: 'evalue', sort: true, width: '7%' },
                                        { field: 'bit score', title: 'bit score', sort: true, width: '7%' },
                                        { field: 'subject tax ids', title: 'subject tax ids', sort: true, width: '7%' },
                                        { field: 'subject titles', title: 'subject titles', sort: true, width: '7%' },*/
                                        { field: 'description', title: 'Description', sort: true, width: '45%' },
                                        { field: 'max_score', title: 'Bit_score', sort: true },
                                        /*{ field: 'score', title: 'Total score', sort: true, width: '10%' },*/
                                        { field: 'query_cover', title: 'Query cover', sort: true },
                                        { field: 'evalue', title: 'E value', sort: true },
                                        { field: 'ident', title: 'ident', sort: true },
                                        { field: 'accession', title: 'Accession', sort: true },
                                        { field: 'strain', title: 'Strain', sort: true, templet: '<div><a href="./' + 'sequence_detailed.html?strain=' + strainArr[strainArr.length - 1] + '' + '" class="layui-table-link" target="_black">' + strainArr[strainArr.length - 1] + '</a></div>' },
                                    ]
                                ],
                                data: description_array,

                                done: function(res, curr, count) {}
                            });
                        }

                        function init_tableb() {
                            $('#table').bootstrapTable('destroy');
                            $('#table').bootstrapTable({
                                cache: false,
                                striped: true, //是否显示行间隔色
                                /*sidePagination: "client", */ //分页方式：client客户端分页，server服务端分页（*）
                                /*url: url,*/
                                /*height: $(window).height() - 110,*/
                                width: $(window).width(),
                                showColumns: true,
                                pagination: true,
                                /*queryParams: queryParams,*/
                                minimumCountColumns: 2,
                                pageNumber: 1, //初始化加载第一页，默认第一页
                                pageSize: 10, //每页的记录行数（*）
                                pageList: [10, 25, 50, 100], //可供选择的每页的行数（*）
                                /*uniqueId: "id", */ //每一行的唯一标识，一般为主键列
                                showExport: true,
                                exportDataType: 'all',
                                /*sidePagination: "client",*/
                                columns: [
                                    { field: 'description', title: 'Description', visible: false },
                                    { field: 'max_score', title: 'Bit_score' },
                                    { field: 'query_cover', title: 'Query cover', visible: false },
                                    { field: 'evalue', title: 'E value', visible: false },
                                    { field: 'ident', title: 'ident', visible: false },
                                    { field: 'accession', title: 'Accession', visible: false },
                                    {
                                        field: 'strain',
                                        title: 'Strain',
                                        formatter: function linkFormatter(value, row, index) {
                                            return "<a href='sequence_detailed.html?strain=" + value + "' title='单击打开连接' target='_blank'>" + value + "</a>";
                                        },
                                    }
                                ],
                                data: description_array,
                            });
                            $('#table').bootstrapTable('hideLoading');
                        }

                        var $textarea_div = $('#resultRequence-div');
                        var $textHead_div = $('#resultRequenceHead-div');
                        var $text_div = $('#resultRequence');
                        $textHead_div.empty();
                        $textarea_div.empty();
                        $text_div.empty();
                        /*var $requenceHead = $('<br/><h1 align="left">Sequence ID:' + query_id + '</h1><br/><hr class="layui-bg-black">');
                        $requenceHead.appendTo($textHead_div);*/
                        var strQseqBuff = [];
                        var str = '';
                        for (var key in alignment) {
                            var ali = alignment[key];
                            var sequenceId = ali.sequenceId;
                            var $requenceHead = $('<br/><h3 align="left">Sequence ID:' + sequenceId + '</h3><br/>');
                            $requenceHead.appendTo($text_div);
                            str = '';
                            var strQseq = ali.qseq;
                            var strMidline = ali.midline;
                            var strHseq = ali.hseq;
                            var strQseqArr = [];
                            var strMidlineArr = [];
                            var strHseqArr = [];
                            var n = 1;
                            for (var i = 0, l = strQseq.length; i < l / n; i++) {
                                var Q = strQseq.slice(n * i, n * (i + 1));
                                // alert(Q);


                                var M = strMidline.slice(n * i, n * (i + 1));
                                strMidlineArr.push(M);
                                // alert(M);
                                var H = strHseq.slice(n * i, n * (i + 1));


                                if (Q != H) {

                                    if (Q == 'T') {
                                        Q = "<div style='display:inline;background-color: #f00;'>" + Q + "</div>";
                                        //alert(Q);
                                        // Q = "<font color='red'>" + Q + "</font>";
                                    }
                                    if (Q == 'A') {
                                        Q = "<div style='display:inline;background-color: #00BF00;'>" + Q + "</div>";
                                        //  Q = "<font color='green'>" + Q + "</font>";
                                    }
                                    if (Q == 'C') {
                                        Q = "<div style='display:inline;background-color: #4747ff;'>" + Q + "</div>";
                                        // Q = "<font color='blue'>" + Q + "</font>";
                                    }
                                    if (Q == 'G') {
                                        Q = "<div style='display:inline;background-color: #d5bb04;'>" + Q + "</div>";
                                        //Q = "<font color='yellow'>" + Q + "</font>";
                                    }
                                    if (H == 'T') {
                                        H = "<div style='display:inline;background-color: #f00;'>" + H + "</div>";
                                        // H = "<font color='red'>" + H + "</font>";
                                    }
                                    if (H == 'A') {
                                        H = "<div style='display:inline;background-color: #00BF00;'>" + H + "</div>";
                                        // H = "<font color='green'>" + H + "</font>";
                                    }
                                    if (H == 'C') {
                                        H = "<div style='display:inline;background-color: #4747ff;'>" + H + "</div>";
                                        // H = "<font color='blue'>" + H+ "</font>";
                                    }
                                    if (H == 'G') {
                                        H = "<div style='display:inline;background-color: #d5bb04;'>" + H + "</div>";
                                        // H = "<font color='yellow'>" + H+ "</font>";
                                    }
                                }
                                strQseqArr.push(Q);
                                strHseqArr.push(H);
                            }
                            var strQ = '';
                            var strM = '';
                            var strH = '';
                            var countInLine = 117;
                            if ($(window).width() < 768) {
                                countInLine = 35;
                            } //一行几个数
                            var strQseqQArr = [];
                            var strMidlineMArr = [];
                            var strHseqHArr = [];
                            var strQQ = '';
                            var strMM = '';
                            var strHH = '';
                            // alert(strQseqArr.length);
                            for (var i = 0; i < strQseqArr.length; i++) {

                                if ((strQseqArr.length % countInLine) > strQseqArr.length - i - 1) {
                                    strQQ += strQseqArr[i];
                                    if (strQseqArr.length - 1 == i) {
                                        strQseqQArr.push(strQQ);
                                        strQQ = '';
                                    }
                                    strMM += strMidlineArr[i];
                                    if (strMidlineArr.length - 1 == i) {
                                        strMidlineMArr.push(strMM);
                                        strMM = '';
                                    }
                                    strHH += strHseqArr[i];
                                    if (strHseqArr.length - 1 == i) {
                                        strHseqHArr.push(strHH);
                                        strHH = '';
                                    }
                                } else {
                                    if ((i + 1) % countInLine == 0) {
                                        strQ += strQseqArr[i];
                                        strQseqQArr.push(strQ);
                                        strQ = '';

                                        strM += strMidlineArr[i];
                                        strMidlineMArr.push(strM);
                                        strM = '';

                                        strH += strHseqArr[i];
                                        strHseqHArr.push(strH);
                                        strH = '';
                                    } else {
                                        strQ += strQseqArr[i];
                                        strH += strHseqArr[i];
                                        strM += strMidlineArr[i];
                                    }

                                }
                            }

                            for (var strKey in strQseqQArr) {

                                //alert(strQseqArr[strKey]);
                                /*if (strQseqArr[strKey]=='A') {
                                 //   alert("666");
                                   strQseqArr[strKey]= "<font color='red'>"+strQseqArr[strKey]+"</font>";
                                   strQseqArr[strKey]= "&lt;div style=&quot;color:red;display:inline&quot;&gt;"+strQseqArr[strKey]+"&lt;/div&gt"; 
                                }*/
                                str = str + strQseqQArr[strKey] + "<br/>" + strMidlineMArr[strKey] + "<br/>" + strHseqHArr[strKey] + "<br/><hr/>";
                                /*strQseqBuff.push(str);*/

                            }
                            var strQuery_cover = Number(ali.query_cover * 100).toFixed(1);
                            strQuery_cover += "%";
                            var strGaps = Number(ali.gaps * 100).toFixed(1);
                            strGaps += "%";
                            /*console.log(strQseqBuff);*/
                            /*var $textarea = $('<textarea class="query_input_div" disabled="true">'+str+'</textarea>');*/
                            /*var $textarea =$('<blockquote class="layui-elem-quote" style="weight:1200px;">'+str+'</blockquote>');*/
                            /*var $textarea =$('<fieldset class="layui-elem-field"><legend></legend><div class="layui-field-box">'+str+'</div></fieldset>');*/
                            var $headDiv = $('<hr class="layui-bg-black"><hr class="layui-bg-black"><span>Score:' +
                                ali.max_score + '</span><span>&emsp; Expect:' +
                                ali.evalue + '</span><span>&emsp; Identities:' +
                                ali.identity + "/" + ali.query_len + "(" + strQuery_cover + ")" + '</span><span>&emsp;Gaps:' +
                                ali.gaps + "/" + ali.identity + "(" + strGaps + ")" + '</span><span>&emsp; Strand:' +
                                ali.query_strand + "/" + ali.hit_strand + '</span><hr class="layui-bg-black"><hr class="layui-bg-black">');
                            //             $headDiv.appendTo($textarea_div);
                            $headDiv.appendTo($text_div)
                            /*var textQue = '';
                            for(var strQseqBuffkey in strQseqBuff){
                              textQue = textQue+ strQseqBuff[strQseqBuffkey] + "\n";
                              
                            }*/

                            var $textarea = $('<pre><textarea  id="textarea_l" name="" required lay-verify="required"  class="layui-textarea" disabled style="min-height: 130px;" >' +
                                str + '</textarea></pre>');
                            /*$(document.getElementById(textarea_l)).onkeyup = function() {
                              this.style.height = 'auto';
                              this.style.height = this.scrollHeight + "px";
                            }*/
                            // $("#resultRequence-div").text($("#textarea_l").val());
                            //   $textarea.appendTo($textarea_div);
                            var $text = $('<div><pre>' + str + '<pre></div>');
                            //   alert($text);
                            $("resultRequence").html($text);
                            $text.appendTo($text_div);

                            $('.layui-textarea').each(function() {
                                this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
                            }).on('input', function() {
                                this.style.height = 'auto';
                                this.style.height = (this.scrollHeight) + 'px';
                            });
                        }
                        /*   },*/
                        /* yes: function(index, layero) {
                                layer.close(index);
                            }
                        });*/

                    }

                    if (json.code == 100) {
                        layer.msg("Analysis is not completed!");
                    }
                    if (json.code == 0) {
                        layer.msg("Please enter the correct extraction code!");
                    }

                });
            });

        });
    }
})();