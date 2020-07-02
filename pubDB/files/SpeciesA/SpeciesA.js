var form, layer, element, laypage, laydate, table;
layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
    form = layui.form;
    // layer = parent.layer === undefined ? layui.layer : parent.layer;
    layer = layui.layer;
    element = layui.element;
    laypage = layui.laypage;
    laydate = layui.laydate;
    table = layui.table;
    layui.data('libraryname', {
        key: 'library',
        value: 'Escherichia'
    });
    element.on('nav(nav)', function(elem) {
        //console.log(elem)
        //alert(elem.text());
        /*if (elem.text() == "Search") {
            $("#iframe").attr("src", "search_new.html");
            document.getElementById("iframe").src="search_new.html";
        }*/
    });
    $('#map').bind('click', function() {
        var library = getUrlParam('library');
        window.location.href = "map.html?library=" + library;
    });
    $('#blast').bind('click', function() {
        var library = getUrlParam('library');
        window.location.href = "tools.html?library=" + library;
    });
    $('.cgMLST').bind('click', function() {
        var library = getUrlParam('library');
        window.location.href = "cgmlst.html?library=" + library;
    });
    $('.CRISPR').bind('click', function() {
        var library = getUrlParam('library');
        window.location.href = "crispr.html?library=" + library;
    });

});
(function() {

});

function getUrlParam(name) { //a标签跳转获取参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
}