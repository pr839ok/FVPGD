(function() {
    var uploaded = {};
    uploaded.filename = '';
    var myjson = {};
    var flag = false;
    var temp = 0;
    var form, layer, element, laypage, laydate, table;
    layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
        form = layui.form;
        layer = layui.layer;
        element = layui.element;
        laypage = layui.laypage;
        laydate = layui.laydate;
        table = layui.table;

        form.on('select(aihao)', function(data) {
            console.log(data.value); //得到被选中的值
            var json = myjson;
            for (var key in json.data) {
                if (json.data[key].output_json != null) {
                    for (var i in JSON.parse(json.data[key].output_json).BlastOutput2) {
                        if ((JSON.parse(json.data[key].output_json).BlastOutput2[i].report.results.search.query_title) + "(" + key + ")" == data.value) {
                            rers(json.data[key], i, key);
                        }
                    }
                }
            }

        });
    });
    "use strict";

    initFunction();


    function blastNExe() {
        document.getElementById("show-content-1").className = "layui-colla-content";
        $('#loadingnew').css({ 'display': 'inline' });
        $('#anim').css('display', 'block');
        temp = 0;
        var flag = false;
        var apiUrl = '/fpbdb/BLASTEXEINDISTINCT';
        var query = $('.query_input_div').val();
        var from = $('#from').val();
        var to = $('#to').val();
        if (from != null && from != "" && to != null && to != "") {
            query = query.substring((from - 1), to);
        }
        var tempdata = {};
        tempdata.library = getUrlParam('library');
        tempdata.filename = '';
        tempdata.query = query;
        tempdata.blastClass = "blastn";
        tempdata.analysisClass = "input";
        tempdata.max_target_seqs = $('.max_target_seqs_input').val();
        tempdata.evalue = $('.evalue_input').val();
        tempdata.word_size = $('.word_size_input').val();
        tempdata.culling_limit = $('.culling_limit_input').val();
        tempdata.penalty = $('.penalty_input').val();
        tempdata.reward = $('.reward_input').val();
        tempdata.gapopen = $('.gapopen_input').val();
        tempdata.gapextend = $('.gapextend_input').val();
        tempdata.job_title = $('.job_title_input').val();
        tempdata.database = $("input[name='databases']:checked").val();
        tempdata.task = $("input[name='task']:checked").val();
        getAjax(true, 'POST', apiUrl, JSON.stringify(tempdata), 'json', function(json) {
            var $input_title = $('#rs');
            $input_title.empty();
            myjson = json;
            for (var key in json.data) {
                console.log(JSON.parse(json.data[key].output_json));
                var tempda = json.data[key];
                if (json.code == 200) {
                    $('#loadingnew').css({ 'display': 'none' });
                    $('#anim').css('display', 'none');
                    flag = true;
                    //uploaded.filename = '';
                    var table = layui.table;
                    $('.result-div').css({ 'display': 'inline', ' margin-top': '1000px' });

                    if (tempda.output_json == null) {
                        continue;
                    }
                    $("#form_l").css("display", "inline");

                    if ($('.job_title_input_jtb').val() != "") {
                        $("#rs_l").html("<span style='font-weight:600'>Job title: " + $('.job_title_input_jtb').val() + "</span> --- <span>" + JSON.parse(tempda.output_json).BlastOutput2.length + " sequences</span>");
                    } else {
                        $("#rs_l").html("<span style='font-weight:600'>Job title: " + JSON.parse(tempda.output_json).BlastOutput2[0].report.results.search.query_title + "</span> --- <span>" + JSON.parse(tempda.output_json).BlastOutput2.length + " sequences</span>")
                    }
                    var $input_title_div = '';
                    for (var i in JSON.parse(tempda.output_json).BlastOutput2) {
                        console.log(key);
                        $input_title_div += '<option value=' + JSON.parse(tempda.output_json).BlastOutput2[i].report.results.search.query_title + "(" + key + ")" + ' selected>' + JSON.parse(tempda.output_json).BlastOutput2[i].report.results.search.query_title + "(" + key + ")" + '</option>';
                    }
                    $input_title.append($input_title_div);
                    form.render('select');
                    rers(tempda, 0, key);
                }
            }
        });
    }

    function blastNExeFile() {
        document.getElementById("show-content-1").className = "layui-colla-content";
        $('#loadingnew').css({ 'display': 'inline' });
        $('#anim').css('display', 'block');
        temp = 1;
        flag = false;
        var apiUrl = '/fpbdb/BLASTEXEINDISTINCT';
        var query = $('.query_input_div').val();
        console.log(query);
        var tempdata = {};
        tempdata.library = getUrlParam('library');
        tempdata.filename = layui.sessionData('test').fileName;
        tempdata.query = query;
        tempdata.blastClass = "blastn";
        tempdata.analysisClass = "file";
        tempdata.max_target_seqs = $('.max_target_seqs_input').val();
        tempdata.evalue = $('.evalue_input').val();
        tempdata.word_size = $('.word_size_input').val();
        tempdata.culling_limit = $('.culling_limit_input').val();
        tempdata.penalty = $('.penalty_input').val();
        tempdata.reward = $('.reward_input').val();
        tempdata.gapopen = $('.gapopen_input').val();
        tempdata.gapextend = $('.gapextend_input').val();
        tempdata.job_title = $('.job_title_input').val();
        tempdata.database = $("input[name='databases']:checked").val();

        getAjax(true, 'POST', apiUrl, JSON.stringify(tempdata), 'json', function(json) {
            var $input_title = $('#rs');
            $input_title.empty();
            myjson = json;
            for (var key in json.data) {
                console.log(JSON.parse(json.data[key].output_json));
                var tempda = json.data[key];
                if (json.code == 200) {
                    $('#loadingnew').css({ 'display': 'none' });
                    $('#anim').css('display', 'none');
                    flag = true;
                    uploaded.filename = '';
                    var table = layui.table;
                    $('.result-div').css({ 'display': 'inline', ' margin-top': '1000px' });

                    if (tempda.output_json == null) {
                        continue;
                    }
                    $("#form_l").css("display", "inline");

                    if ($('.job_title_input_jtb').val() != "") {
                        $("#rs_l").html("<span style='font-weight:600'>Job title: " + $('.job_title_input_jtb').val() + "</span> --- <span>" + JSON.parse(tempda.output_json).BlastOutput2.length + " sequences</span>");
                    } else {
                        $("#rs_l").html("<span style='font-weight:600'>Job title: " + JSON.parse(tempda.output_json).BlastOutput2[0].report.results.search.query_title + "</span> --- <span>" + JSON.parse(tempda.output_json).BlastOutput2.length + " sequences</span>")
                    }
                    var $input_title_div = '';
                    for (var i in JSON.parse(tempda.output_json).BlastOutput2) {
                        console.log(key);
                        $input_title_div += '<option value=' + JSON.parse(tempda.output_json).BlastOutput2[i].report.results.search.query_title + "(" + key + ")" + ' selected>' + JSON.parse(tempda.output_json).BlastOutput2[i].report.results.search.query_title + "(" + key + ")" + '</option>';
                    }
                    $input_title.append($input_title_div);
                    form.render('select');
                    rers(tempda, 0, key);
                }
            }
        });
    }


    function initFunction() {
        $('#u260_button').bind('click', function() {
            uploader.upload();
        });
        $('#blast-button').bind('click', function() {
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
                // $('#form_l').css({ 'display': 'none', ' margin-top': '1000px' });
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

            var $selectFileDiv = $('#selectFileDiv');
            $selectFileDiv.empty();
            /*$("#filePicker").append(file.name);*/
            layui.sessionData('test', {
                key: 'fileName',
                value: file.name
            });

            var $selectFileDivOl = $('<li id="select_file" style="margin-top: 5px;display: inline;"><span>Uploaded file:</span>' + layui.sessionData('test').fileName + '</li>');
            $selectFileDiv.append($selectFileDivOl);
        });
        uploader.on('uploadSuccess', function(file, response) {
            uploader.removeFile(file, true);
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

    }

    function rers(json, argument, key) {
        var res_json = JSON.parse(json.output_json).BlastOutput2[argument];
        var report = res_json.report;
        var results = res_json.report.results;
        var search_res = results.search;
        var program = report.program;
        var version = report.version;
        var dbname = report.search_target.db; //here
        var query_id = search_res.query_id;
        var query_name = search_res.query_title;
        $("#brs").html(query_name);
        var query_len = search_res.query_len;
        var hits = search_res.hits;
        var nowDate = new Date();
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
                var strainSrt = des.id;
                var strainArr = strainSrt.split("__");
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
        $('#tabular-download-tabular').attr('href', '/fpbdb/BLASTNFILEDOWNLOAD' + json.outputFile_tabular + '?temp=' + temp + "," + key);
        $('#tabular-download-pair').attr('href', '/fpbdb/BLASTNFILEDOWNLOAD' + json.outputFile_asn + '?temp=' + temp + "," + key);
        if ($(window).width() < 768) {
            init_tableb();
        } else {
            table.render({

                elem: '#paired',
                cols: [
                    [
                        // { field: 'description', title: 'Description', sort: true, width: '45%' },
                        { field: 'max_score', title: 'Bit_score', sort: true },
                        { field: 'query_cover', title: 'Query cover', sort: true },
                        { field: 'evalue', title: 'Evalue', sort: true },
                        { field: 'ident', title: 'ident', sort: true },
                        { field: 'accession', title: 'Accession', sort: true },
                        { field: 'strain', title: 'Strain', sort: true, templet: '<div><a target="_blank" href="sequence_detailed.html?library=' + key + '&strain={{d.strain}}" class="layui-table-link">{{d.strain}}</a></div>' },
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
                width: $(window).width(),
                showColumns: true,
                pagination: true,
                minimumCountColumns: 2,
                pageNumber: 1, //初始化加载第一页，默认第一页
                pageSize: 10, //每页的记录行数（*）
                pageList: [10, 25, 50, 100], //可供选择的每页的行数（*）
                showExport: true,
                exportDataType: 'all',
                columns: [
                    // { field: 'description', title: 'Description', visible: false },
                    { field: 'max_score', title: 'Bit_score' },
                    { field: 'query_cover', title: 'Query cover', visible: false },
                    { field: 'evalue', title: 'E value', visible: false },
                    { field: 'ident', title: 'ident', visible: false },
                    { field: 'accession', title: 'Accession', visible: false },
                    {
                        field: 'strain',
                        title: 'Strain',
                        formatter: function linkFormatter(value, row, index) {
                            return "<a target='_blank' href='sequence_detailed.html?library=" + key + "&strain=" + value + "' title='单击打开连接' target='_blank'>" + value + "</a>";
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
                var M = strMidline.slice(n * i, n * (i + 1));
                strMidlineArr.push(M);
                var H = strHseq.slice(n * i, n * (i + 1));
                if (Q != H) {
                    if (Q == 'T') {
                        Q = "<div style='display:inline;background-color: #f00;'>" + Q + "</div>";
                    }
                    if (Q == 'A') {
                        Q = "<div style='display:inline;background-color: #00BF00;'>" + Q + "</div>";
                    }
                    if (Q == 'C') {
                        Q = "<div style='display:inline;background-color: #4747ff;'>" + Q + "</div>";
                    }
                    if (Q == 'G') {
                        Q = "<div style='display:inline;background-color: #d5bb04;'>" + Q + "</div>";
                    }
                    if (H == 'T') {
                        H = "<div style='display:inline;background-color: #f00;'>" + H + "</div>";
                    }
                    if (H == 'A') {
                        H = "<div style='display:inline;background-color: #00BF00;'>" + H + "</div>";
                    }
                    if (H == 'C') {
                        H = "<div style='display:inline;background-color: #4747ff;'>" + H + "</div>";
                    }
                    if (H == 'G') {
                        H = "<div style='display:inline;background-color: #d5bb04;'>" + H + "</div>";
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
                str = str + strQseqQArr[strKey] + "<br/>" + strMidlineMArr[strKey] + "<br/>" + strHseqHArr[strKey] + "<br/><hr/>";
            }
            var strQuery_cover = Number(ali.query_identity * 100).toFixed(1);
            strQuery_cover += "%";
            var strGaps = Number((ali.gaps / ali.query_len) * 100).toFixed(1);
            strGaps += "%";
            var $headDiv = $('<hr class="layui-bg-black"><span>Score:' +
                ali.max_score + '</span><span>&emsp; Expect:' +
                ali.evalue + '</span><span>&emsp; Identities:' +
                ali.identity + "/" + ali.query_len + "(" + strQuery_cover + ")" + '</span><span>&emsp;Gaps:' +
                ali.gaps + "/" + ali.query_len + "(" + strGaps + ")" + '</span><span>&emsp; Strand:' +
                ali.query_strand + "/" + ali.hit_strand + '</span><hr class="layui-bg-black">');
            $headDiv.appendTo($text_div)
            var $textarea = $('<pre><textarea  id="textarea_l" name="" required lay-verify="required"  class="layui-textarea" disabled style="min-height: 130px;" >' +
                str + '</textarea></pre>');
            var $text = $('<div><pre>' + str + '<pre></div>');
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