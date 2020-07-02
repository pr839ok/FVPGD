function getUrlParam(name) { //a标签跳转获取参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
}
window.onload = function() {
    function GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
    var desArrayFiled = [];
    $('title').html(GetQueryString("strain") + "--Sequence detailed");
    getFiledResult();
    search_table();

    function getFiled() {
        // body...
        var noShowField=['Sample_id','Files','Strain_permission','Preservation','Library']
        var apiUrl = '/fpbdb/SEARCHLISTFIELD';
        getAjax(true, 'GET', apiUrl, null, 'json', function(json) {
            if (json.code == 200) {
                desArrayFiled = [];
                var data = json.data;
                for(var i in data){
                    if(!arrcontent(noShowField,data[i])){
                        desArrayFiled[i] = data[i];
                    }
                }
            }
        });
    }

    function arrcontent(arr,val) {
        for(var i in arr){
            if(arr[i] == val){
                return true;
            }
        }
        return false;
    }

    var permission = "";

    function search_table() {
        layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
            form = layui.form;
            // layer = parent.layer === undefined ? layui.layer : parent.layer;
            layer = layui.layer;
            element = layui.element;
            laypage = layui.laypage;
            laydate = layui.laydate;
            table = layui.table;
            getAjax(true, 'GET', '/fpbdb/SEARCHGENEBYSTRAIN?temp=' + GetQueryString("library") + "," + GetQueryString("strain"), null, 'json', function(json) {
                table.render({
                    elem: '#search-result',
                    cols: [
                        [{ field: 'geneName', title: 'Locus', sort: true },
                            { field: 'state', title: 'Allele', templet: '#titleTpl' }
                        ]
                    ],
                    data: json.data,
                    page: true
                });
                initDownloadTable(json.data);
            });
            // initPhenotypeTable();
        });
    }

    function initDownloadTable(data) {
        $('#export_table').click(function() {
            var edata = [];
            for (var i in data) {
                var line = [];
                line.push(data[i].geneName);
                line.push(data[i].state);
                edata.push(line);
            }
            table.exportFile(['Locus', 'Allele'], edata, 'csv');
        })
    }

    function getFiledResult() {
        getFiled();
        getAjax(true, 'GET', '/fpbdb/SEARCHSTRAIN?temp=' + GetQueryString("library") + "," + GetQueryString("strain"), null, 'json', function(json) {
            var desArray = json.data[0];
            var permission = "";
            permission = desArray["string_col_016"];
            if (permission != null) {
                permission = permission.split('');
            }

            if (JSON.stringify(json.data[1]) != '{}') {
                $("#Downloads").css("display", "inline");
                for (var j in json.data[1]) {
                    // alert(json.data[1][j]);
                    var k = j + ".size";
                    var downloadFiles = $("<tr><td ><a style='color:#01AAED;' href=/fpbdb/STRAINFILEDOWNLOAD/" + json.data[1][j] + "?temp=" + GetQueryString("library") + ">" + j + "<p style='float:right;color:#333;'>" + json.data[2][k] + "</p></a></td></tr>")
                    $("#loadFile").append(downloadFiles);
                }
            }

            for (var j in desArrayFiled) {
                if (j == "search_id") {
                    desArray[j] = desArray["pubDB_search_id"];
                }
                if (desArray[j] == null || desArray[j] == '') {
                    desArray[j] = '--';
                }
                //var labelDiv = $("<label class='layui-form-label'>" + desArrayFiled[j] + ":</label><label class='layui-form-label' style='text-align: left;'>" + desArray[j] + "</label>");
                var labelDiv = $("<label class='layui-form-label' style='text-align:left;width:500px;'>" + desArrayFiled[j] + ":    " + desArray[j] + "</label>");
                $("#from_result").append(labelDiv);

            }
            // var labelDiv = $("<label class='layui-form-label' style='text-align:left;width:500px;'>Library:    " + GetQueryString("library") + "</label>");
            // $("#from_result").append(labelDiv);
        });
    }
    document.getElementById("ASM").innerText = "Strain:" + GetQueryString("strain");
    //    document.getElementById("Organism").innerText = GetQueryString("strain");
    //   document.getElementById("Strain").innerText = GetQueryString("strain");
    /*document.getElementById("fastq").innerText = GetQueryString("strain");
    document.getElementById("fasta").innerText = GetQueryString("strain")*/

};