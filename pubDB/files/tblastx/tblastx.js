var uploaded = {};
uploaded.filename = '';
var myjson = {};
var flag = false;
var temp = 0;
(function() {
    var form, layer, element, laypage, laydate, table;
    layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
        form = layui.form;
        // layer = parent.layer === undefined ? layui.layer : parent.layer;
        layer = layui.layer;
        element = layui.element;
        laypage = layui.laypage;
        laydate = layui.laydate;
        table = layui.table;

        form.on('select(aihao)', function(data) {
            // console.log(data.value); //得到被选中的值
            var json = myjson;
            for (var i in JSON.parse(json.data.output_json).BlastOutput2) {
                if (JSON.parse(json.data.output_json).BlastOutput2[i].report.results.search.query_title == data.value) {
                    //   console.log(i);
                    rers(json, i);
                }
            }
        });
    });
    "use strict";

    initFunction();


    function blastNExe() {
        // document.getElementById("show-content").className = "layui-colla-content";
        document.getElementById("show-content-1").className = "layui-colla-content";
        $('#loadingnew').css({ 'display': 'inline' });
        $('#anim').css('display', 'block');
        temp = 0;
        var flag = false;
        var apiUrl = '/fpbdb/BLASTEXE';
        var query = $('.query_input_div').val();
        var from = $('#from').val();
        var to = $('#to').val();
        if (from != null && from != "" && to != null && to != "") {
            query = query.substring((from - 1), to);
        }
        // console.log(query);
        var tempdata = {};
        tempdata.library = getUrlParam('library');
        /*alert(layui.sessionData('test').fileName);*/
        tempdata.filename = '';
        tempdata.query = query;
        tempdata.blastClass = "tblastx";
        tempdata.analysisClass = "input";
        tempdata.max_target_seqs = $('.max_target_seqs_input').val();
        tempdata.evalue = $('.evalue_input').val();
        tempdata.word_size = $('.word_size_input').val();
        tempdata.culling_limit = $('.culling_limit_input').val();
        /*tempdata.penalty = $('.penalty_input').val();
        tempdata.reward = $('.reward_input').val();*/
        tempdata.matrix = $('#matrixName').val();
        tempdata.job_title = $('.job_title_input').val();
        tempdata.database = $("input[name='databases']:checked").val();
        // alert(tempdata.job_title);
        /*if (tempdata.job_title == null || tempdata.job_title == '') {
            alert("Job title can't be empty");
            $('.job_title_input').addClass("invalid");
            $('.job_title_input').attr('placeholder', 'Job title can not be empty');
            return false;
        }*/
        // -evalue 10 -word_size 28 -gapopen 5 -gapextend 2 -penalty -2 -reward 1 -max_target_seqs 100 -culling_limit 2
        getAjax(true, 'POST', apiUrl, JSON.stringify(tempdata), 'json', function(json) {
            if (json.code == 200) {
                uploaded.filename = '';
                var table = layui.table;
                $('#loadingnew').css({ 'display': 'none' });
                $('#anim').css('display', 'none');
                $('.result-div').css({ 'display': 'inline', ' margin-top': '1000px' });
                //  console.log(json);
                myjson = json;
                //  console.log(json.data.output_json);

                if (json.data.output_json == null) {
                    $(".result-div").css("display", "none");
                    return false;
                }
                var $input_title = $('#rs');
                $input_title.empty();
                $("#form_l").css("display", "inline");
                //      console.log(JSON.parse(json.data.output_json).BlastOutput2.length);
                if ($('.job_title_input_jtb').val() != "") {
                    $("#rs_l").html("<span style='font-weight:600'>Job title: " + $('.job_title_input_jtb').val() + "</span> --- <span>" + JSON.parse(json.data.output_json).BlastOutput2.length + " sequences</span>");
                } else {
                    $("#rs_l").html("<span style='font-weight:600'>Job title: " + JSON.parse(json.data.output_json).BlastOutput2[0].report.results.search.query_title + "</span> --- <span>" + JSON.parse(json.data.output_json).BlastOutput2.length + " sequences</span>")
                }
                var $input_title_div = '';
                for (var i in JSON.parse(json.data.output_json).BlastOutput2) {
                    //    console.log(JSON.parse(json.data.output_json).BlastOutput2[i].report.results.search.query_title.replace(/(^\s*)|(\s*$)/g, ""));

                    $input_title_div += '<option value=' + JSON.parse(json.data.output_json).BlastOutput2[i].report.results.search.query_title + '>' + JSON.parse(json.data.output_json).BlastOutput2[i].report.results.search.query_title + '</option>';
                }

                //    console.log($input_title_div);
                //$input_title_div.appendTo($input_title);
                $input_title.append($input_title_div);
                form.render('select');
                rers(json, 0);
            }
        });
    }

    function blastNExeFile() {
        /*document.getElementById("show-content").className = "layui-colla-content";*/
        document.getElementById("show-content-1").className = "layui-colla-content";
        $('#loadingnew').css({ 'display': 'inline' });
        $('#anim').css('display', 'block');
        temp = 1;
        flag = false;
        var apiUrl = '/fpbdb/BLASTEXE';
        var query = $('.query_input_div').val();
        //console.log(query);
        var tempdata = {};
        tempdata.library = getUrlParam('library');
        /*alert(layui.sessionData('test').fileName);*/
        tempdata.filename = layui.sessionData('test').fileName;
        tempdata.query = query;
        tempdata.blastClass = "tblastx";
        tempdata.analysisClass = "file";
        tempdata.max_target_seqs = $('.max_target_seqs_input').val();
        tempdata.evalue = $('.evalue_input').val();
        tempdata.word_size = $('.word_size_input').val();
        tempdata.culling_limit = $('.culling_limit_input').val();
        /*tempdata.penalty = $('.penalty_input').val();
        tempdata.reward = $('.reward_input').val();*/
        tempdata.matrix = $('#matrixName').val();
        tempdata.job_title = $('.job_title_input').val();
        tempdata.database = $("input[name='databases']:checked").val();
        // -evalue 10 -word_size 28 -gapopen 5 -gapextend 2 -penalty -2 -reward 1 -max_target_seqs 100 -culling_limit 2
        getAjax(true, 'POST', apiUrl, JSON.stringify(tempdata), 'json', function(json) {
            if (json.code == 200) {
                flag = true;
                uploaded.filename = '';

                var table = layui.table;
                //alert(json.data.output_json);
                $('#loadingnew').css({ 'display': 'none' });
                $('#anim').css('display', 'none');
                $('.result-div').css({ 'display': 'inline', ' margin-top': '1000px' });
                //  console.log(json);
                myjson = json;
                // console.log(json.data.output_json);

                if (json.data.output_json == null) {
                    return false;
                }
                var $input_title = $('#rs');
                $input_title.empty();
                $("#form_l").css("display", "inline");
                //  console.log(JSON.parse(json.data.output_json).BlastOutput2.length);
                if ($('.job_title_input_jtb').val() != "") {
                    $("#rs_l").html("<span style='font-weight:600'>Job title: " + $('.job_title_input_jtb').val() + "</span> --- <span>" + JSON.parse(json.data.output_json).BlastOutput2.length + " sequences</span>");
                } else {
                    $("#rs_l").html("<span style='font-weight:600'>Job title: " + JSON.parse(json.data.output_json).BlastOutput2[0].report.results.search.query_title + "</span> --- <span>" + JSON.parse(json.data.output_json).BlastOutput2.length + " sequences</span>")
                }
                var $input_title_div = '';
                for (var i in JSON.parse(json.data.output_json).BlastOutput2) {
                    //      console.log(JSON.parse(json.data.output_json).BlastOutput2[i].report.results.search.query_title.replace(/(^\s*)|(\s*$)/g, ""));

                    $input_title_div += '<option value=' + JSON.parse(json.data.output_json).BlastOutput2[i].report.results.search.query_title + '>' + JSON.parse(json.data.output_json).BlastOutput2[i].report.results.search.query_title + '</option>';
                }

                //  console.log($input_title_div);
                //$input_title_div.appendTo($input_title);
                $input_title.append($input_title_div);
                form.render('select');
                rers(json, 0);
            }
        });
    }


    function initFunction() {

        /* layui.use('form', function(){
           var form = layui.form;
           form.on('radio(filter)', function(data){
             //alert(data.elem); //得到radio原始DOM对象
             console.log(data.value); //被点击的radio的value值
           }); 
           
           //各种基于事件的操作，下面会有进一步介绍
         });*/
        /*var form=layui.form;*/

        $('#u260_button').bind('click', function() {
            //     console.log("upload");
            uploader.upload();
        });
        $('#blast-button').bind('click', function() {
            /*alert("666");*/
            /*if (uploaded.filename != null) {
              alert(uploaded.filename);
              alert(uploaded.path);
              blastNExeFile();
            } else {
              alert("!");
              blastNExe();
            }*/
            /*alert($('[name=selectRadio]:checked').val());*/
            if ($('[name=selectRadio]:checked').val() == 0) {
                if ($('.query_input_div').val() != "") {
                    $('#form_l').css({ 'display': 'none', ' margin-top': '1000px' });
                    $('.result-div').css({ 'display': 'none', ' margin-top': '1000px' });
                    setTimeout(blastNExe, 1000);
                } else {
                    layer.msg('No input！！！');
                }
            } else {
                /*alert(uploaded.filename)*/
                //  $('#form_l').css({ 'display': 'none', ' margin-top': '1000px' });
                // $('.result-div').css({ 'display': 'none', ' margin-top': '1000px' });
                // setTimeout(blastNExeFile, 1000);
                if ($("#select_file").text() != "") {
                    $('#form_l').css({ 'display': 'none', ' margin-top': '1000px' });
                    $('.result-div').css({ 'display': 'none', ' margin-top': '1000px' });
                    setTimeout(blastNExeFile, 1000);
                } else {
                    layer.msg('No files selected！！！');
                }

            }


        });
        $('body').on('focus', 'input[placeholder]', function() {
            var valueBak = $(this).attr('xplaceholder');
            if (!valueBak) {
                $(this).attr('xplaceholder', $(this).attr('placeholder'));
            }
            $(this).attr('placeholder', '');
        }).on('blur', 'input[placeholder]', function() {
            $(this).attr('placeholder', $(this).attr('xplaceholder'));
        });
        /*alert(layui.data('test').fileName);*/
        if (layui.sessionData('test').fileName != null) {
            $('#infoNFS').css('display', 'none');
            $('#selectFile').css('display', 'inline');
            $('#selectFileDiv').css('display', 'inline');

            var $selectFileDiv = $('#selectFileDiv');
            var $selectFileDivOl = $('<li id="select_file" style="margin-top: 5px;display: inline;"><span>Uploaded file:</span>' + layui.sessionData('test').fileName + '</li>');
            $selectFileDiv.append($selectFileDivOl);
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
        //   console.log("init ok");
        uploader.on('fileQueued', function(file) {
            $('#infoNFS').css('display', 'none');
            $('#selectFile').css('display', 'inline');
            $('#selectFileDiv').css('display', 'inline');

            var $selectFileDiv = $('#selectFileDiv');
            $selectFileDiv.empty();
            /*$("#filePicker").append(file.name);*/
            layui.sessionData('test', {
                key: 'fileName',
                value: file.name
            });

            var $selectFileDivOl = $('<li id="select_file" style="margin-top: 5px;display: inline;"><span>Uploaded file:</span>' + layui.sessionData('test').fileName + '</li>');
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
            //  console.log("uploadSuccess");
        });
        uploader.on('uploadSuccess', function(file, response) {
            var upload_data = response._raw;
            // console.log(typeof(uploaddata));
            var upload_json = $.parseJSON(upload_data);
            //  console.log(upload_json);
            uploaded = {};
            /*tempdata.filename = upload_json.data.filename;*/
            uploaded.filename = upload_json.data.filename;
            /*uploaded.path=upload_json.data.realSavePath;
            console.log(uploaded.path);*/
        });

    }

    function rers(json, argument) {
        //  console.log(json,argument);
        var res_json = JSON.parse(json.data.output_json).BlastOutput2[argument];
        var report = res_json.report;
        var results = res_json.report.results;
        var search_res = results.search;

        var program = report.program;
        var version = report.version;
        var dbname = report.search_target.db; //here
        /*var postDate=*/
        var query_id = search_res.query_id;
        // console.log(search_res.query_title);
        var query_name = search_res.query_title;
        $("#brs").html(query_name);
        var query_len = search_res.query_len;
        var hits = search_res.hits;
        // var nowDate = new Date().pattern("yyyyMMdd_HHmm");
        var nowDate = new Date();
        //console.log(nowDate);
        $('#RID_label').text(nowDate.toLocaleDateString());
        $('#QueryID_label').text(query_id);
        $('#Molecule_label').text('nucleic acid');
        $('#QueryLength_label').text(query_len);
        $('#query_title').text(search_res.query_title);
        $('#version').text(version);
        var dbnameStr = dbname.split("/");
        $('#DB_name_label').text(dbnameStr[dbnameStr.length - 1]);
        $('#Program_label').text(program);
        var description_array = [];
        var alignment = [];
        for (var i in hits) {
            var hit = hits[i];
            var desArray = hit.description;
            for (var j in desArray) {
                var des = desArray[j];
                var hsps = hit.hsps[j];
                var from = hsps.query_from;
                var to = hsps.query_to;
                var score = hsps.score;
                var max_score = hsps.bit_score;
                var evalue = hsps.evalue;
                var identity = hsps.identity;
                var query_cover = Number((to - from + 1) / query_len * 100).toFixed(1) + "%";
                var query_identity = identity / query_len;
                var gaps = hsps.gaps / query_len;
                var query_strand = hsps.query_strand;
                var hit_strand = hsps.hit_strand;
                //cover=align_len/query_len
                //indentify=identity/align_len
                var strainSrt = des.id;
                var strainArr = strainSrt.split("__");
                /*alert(arr[arr.length - 1])*/

                var des = {
                    'id': des.id,
                    'description': des.title,
                    'accession': des.accession,
                    'max_score': max_score,
                    'score': score,
                    'evalue': evalue,
                    'query_cover': query_cover,
                    'ident': Number(query_identity * 100).toFixed(1) + "%",
                    'strain': strainArr[strainArr.length - 1]
                };

                description_array.push(des);
                //console.log(des);
                var ali = {
                    'description': des.description,
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
                    "midline": hsps.midline,
                    'query_identity': query_identity
                };
                alignment.push(ali);

            }


        }



        $('#tabular-download-tabular').attr('href', '/fpbdb/BLASTNFILEDOWNLOAD' + json.data.outputFile_tabular + '?temp=' + temp);
        $('#tabular-download-pair').attr('href', '/fpbdb/BLASTNFILEDOWNLOAD' + json.data.outputFile_asn + '?temp=' + temp);
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
                        { field: 'subject titles', title: 'subject titles', sort: true, width: '7%' },
                        { field: 'description', title: 'Description', sort: true, width: '45%' },*/
                        { field: 'max_score', title: 'Bit_score', sort: true },
                        /*{ field: 'score', title: 'Total score', sort: true, width: '10%' },*/
                        { field: 'query_cover', title: 'Query cover', sort: true },
                        { field: 'evalue', title: 'Evalue', sort: true },
                        { field: 'ident', title: 'ident', sort: true },
                        { field: 'accession', title: 'Accession', sort: true },
                        { field: 'strain', title: 'Strain', sort: true, templet: '<div><a target="_blank" href="sequence_detailed.html?library=' + getUrlParam("library") + '&strain={{d.strain}}" class="layui-table-link">{{d.strain}}</a></div>' },
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
                    //{ field: 'description', title: 'Description', visible: false },
                    { field: 'max_score', title: 'Bit_score' },
                    { field: 'query_cover', title: 'Query cover', visible: false },
                    { field: 'evalue', title: 'E value', visible: false },
                    { field: 'ident', title: 'ident', visible: false },
                    { field: 'accession', title: 'Accession', visible: false },
                    {
                        field: 'strain',
                        title: 'Strain',
                        formatter: function linkFormatter(value, row, index) {
                            return "<a target='_blank' href='sequence_detailed.html?library=" + getUrlParam("library") + "&strain=" + value + "' title='单击打开连接' target='_blank'>" + value + "</a>";
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


                /*if (Q != H) {

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
                }*/
                strQseqArr.push(Q);
                strHseqArr.push(H);
            }
            //console.log(strQseqArr);
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
                ///  console.log(strQseqArr[strKey]);
                //alert(strQseqArr[strKey]);
                /*if (strQseqArr[strKey]=='A') {
                 //   alert("666");
                   strQseqArr[strKey]= "<font color='red'>"+strQseqArr[strKey]+"</font>";
                   strQseqArr[strKey]= "&lt;div style=&quot;color:red;display:inline&quot;&gt;"+strQseqArr[strKey]+"&lt;/div&gt"; 
                }*/
                str = str + strQseqQArr[strKey] + "<br/>" + strMidlineMArr[strKey] + "<br/>" + strHseqHArr[strKey] + "<br/><hr/>";
                /*strQseqBuff.push(str);*/

            }
            var strQuery_cover = Number(ali.query_identity * 100).toFixed(1);
            strQuery_cover += "%";
            var strGaps = Number((ali.gaps / ali.query_len) * 100).toFixed(1);
            strGaps += "%";
            /*console.log(strQseqBuff);*/
            /*var $textarea = $('<textarea class="query_input_div" disabled="true">'+str+'</textarea>');*/
            /*var $textarea =$('<blockquote class="layui-elem-quote" style="weight:1200px;">'+str+'</blockquote>');*/
            /*var $textarea =$('<fieldset class="layui-elem-field"><legend></legend><div class="layui-field-box">'+str+'</div></fieldset>');*/
            var $headDiv = $('<hr class="layui-bg-black"><span>Score:' +
                ali.max_score + '</span><span>&emsp; Expect:' +
                ali.evalue + '</span><span>&emsp; Identities:' +
                ali.identity + "/" + ali.query_len + "(" + strQuery_cover + ")" + '</span><span>&emsp;Gaps:' +
                ali.gaps + "/" + ali.query_len + "(" + strGaps + ")" + '</span><hr class="layui-bg-black">');
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


    }
})();

function js_blastn() {
    var library = getUrlParam('library');
    window.location.href = "blastn.html?library=" + library;
}

function js_blastp() {
    var library = getUrlParam('library');
    window.location.href = "blastp.html?library=" + library;
}

function js_blastx() {
    var library = getUrlParam('library');
    window.location.href = "blastx.html?library=" + library;
}

function js_tblastn() {
    var library = getUrlParam('library');
    window.location.href = "tblastn.html?library=" + library;
}

function js_tblastx() {
    var library = getUrlParam('library');
    window.location.href = "tblastx.html?library=" + library;
}

function getUrlParam(name) { //a标签跳转获取参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
}