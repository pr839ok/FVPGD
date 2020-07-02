(function() {

    //小屏幕下的导航条折叠
    if ($(window).width() < 768) {
        //点击导航链接之后，把导航选项折叠起来
        $("#bs-example-navbar-collapse-1 a").click(function() {
            $("#bs-example-navbar-collapse-1").collapse('hide');
        });
        //滚动屏幕时，把导航选项折叠起来
        $(window).scroll(function() {
            $("#bs-example-navbar-collapse-1").collapse('hide');
        });
    }
    $(".container-fluid > .navbar-header").css("margin-right", "0px");
    $(".navbar-toggle").css("margin-right", "0px");
    init();
    //   refreshFrame();
})();

function init() {
    //  IframeLoadEND();
    var form, layer, element, laypage, laydate, table;
    layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
        form = layui.form;
        // layer = parent.layer === undefined ? layui.layer : parent.layer;
        layer = layui.layer;
        element = layui.element;
        laypage = layui.laypage;
        laydate = layui.laydate;
        table = layui.table;
        element.on('nav(nav)', function(elem) {
            //console.log(elem)
            //alert(elem.text());
            /*if (elem.text() == "Search") {
                $("#iframe").attr("src", "search_new.html");
                document.getElementById("iframe").src="search_new.html";
            }*/
        });
    });
};
/*function refreshFrame(){

    document.getElementById('iframe').contentWindow.location.reload(true);
    reinitIframe();
}*/

function reinitIframe() {
    var iframe = document.getElementById("iframe");
    try {
        //document.getElementById("iframe").style.height = "0px";
        var bHeight = iframe.contentWindow.document.body.scrollHeight;
        var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
        //  console.log(bHeight+"-"+dHeight);
        var height = Math.max(bHeight, dHeight);
        iframe.height = height;
        // console.log(height);
        document.getElementById("iframe").style.height = iframe.height + "px";
    } catch (ex) {}
}
var timer1 = window.setInterval("reinitIframe()", 200);

function IframeLoadEND() {

    var iframe = document.getElementById("iframe");
    try {
        window.clearInterval(timer1);
        var bHeight = iframe.contentWindow.document.body.scrollHeight;
        var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
        var height = Math.max(bHeight, dHeight);
        iframe.height = height;
    } catch (ex) {}
    // 停止定时  
    window.clearInterval(timer1);

}


$("#iframe").load(function() {
    var height = $(this).contents().find("#box").height() + 40;
    //这样给以一个最小高度  
    $(this).height(height < 400 ? 400 : height);
})
window.onscroll = function() {
    //变量t是滚动条滚动时，距离顶部的距离
    var t = document.documentElement.scrollTop || document.body.scrollTop;
    //当滚动到距离顶部200px时，返回顶部的锚点显示
    if (t >= 300) {
        $(".navbar").css({"position":"fixed","top":"-60px","height": "50px","width": "1354px"});
        $(".sr").css({"line-height":"6px","font-size":"19px"});
        $("#fol").css({"top":"60px"});
    } else { //恢复正常
       $(".navbar").css({"position":"","top":"","height": "","width": ""});
        $(".sr").css({"line-height":"","font-size":""});
        $("#fol").css({"top":"408px"});
    }
    if (t >= 100) {
        
        $("#fol").css({"top":"60px"});
    } else { //恢复正常
       
    }
}