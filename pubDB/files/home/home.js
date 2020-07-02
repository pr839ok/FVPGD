(function() {
    window.location.href = "/gosweb/pubDB/VP.html?library=Vpfasta";
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
            value: 'All'
        });
        $('#searchButton').bind('click', function() {
            window.location.href = "analyseResult.html?code=" + $("#par").val();
            //window.open("analyseResult.html?code="+$("#par").val());
        });

        element.on('nav(nav)', function(elem) {
            //console.log(elem)
            //alert(elem.text());
            /*if (elem.text() == "Search") {
                $("#iframe").attr("src", "search_new.html");
                document.getElementById("iframe").src="search_new.html";
            }*/
        });

    });

})();
/*$(window).resize(function () {
  var height=$("#body-in").height()+20;
    $("#introduction-img").css("height",height);
 
});*/