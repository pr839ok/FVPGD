(function() {
    layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
        form = layui.form;
        // layer = parent.layer === undefined ? layui.layer : parent.layer;
        layer = layui.layer;
        element = layui.element;
        laypage = layui.laypage;
        laydate = layui.laydate;
        table = layui.table;


        // initPhenotypeTable();
    });

    function GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
    $(".locus").html(GetQueryString("locus"));
    $(".allele").html(GetQueryString("Allele"));
    var desArrayFiled = [];
    getFiledResult();
    getFiledResultToStrain();

    function getFiledResult() {
        getAjax(true, 'GET', '/fpbdb/SEARCHLOCUSSEQ?temp=' + GetQueryString("file") + "." + GetQueryString("locus") + "." + GetQueryString("Allele") + "." + GetQueryString("library"), null, 'json', function(json) {
            var rs = "";
            for (var i = 0; i < json.data.length / 10; i++) {
                rs += json.data.substring(i * 10, (i + 1) * 10) + "   ";
            }
            $("#sequence").html(rs);
            $("#length").html(json.data.length);
        });
    }

    function getFiledResultToStrain() {
        getAjax(true, 'GET', '/fpbdb/SEARCHSTRAINBYGENE?temp=' + GetQueryString("library") + "," + GetQueryString("locus") + "," + GetQueryString("Allele"), null, 'json', function(json) {
            var rs = "";
            for (var i = 0; i < json.data.length; i++) {
                if (json.data[i].split("#")[1] != null) {
                    rs += "<label style='width:70px;text-overflow:ellipsis;'><a style='display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;' target='_blank' href='sequence_detailed.html?library=" + getUrlParam('library') + "&strain=" + json.data[i].split("#")[0] + "' class='layui-table-link'>" + json.data[i].split("#")[0] + "</a></label>";
                }
            }
            $("#strain").html(rs);
        });
    }
    $("#locus").bind('click', function() {
        getAjax(true, 'GET', '/fpbdb/SEARCHLOCUSALLSEQ?temp=' + GetQueryString("locus") + "," + GetQueryString("library"), null, 'json', function(json) {
            table.render({
                elem: '#filelist',
                cols: [
                    [{ field: 'locus', title: 'Locus', align: 'center', sort: true },
                        { field: 'allele', title: 'Allele id', templet: '#titleTpl', align: 'center', sort: true },
                        { field: 'sequence', title: 'sequence', align: 'center' },
                        { field: 'length', title: 'length', align: 'center', sort: true }
                    ]
                ],
                data: json.data,
                page: true
            });
            $("#ss_div").css("display", "block");
        });
    });
    $("#explorer").bind('click', function() {
        window.open("locus_explorer.html?locus=" + GetQueryString("locus") + "&library=" + GetQueryString("library"));
    });
})();

function getUrlParam(name) { //a标签跳转获取参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
}