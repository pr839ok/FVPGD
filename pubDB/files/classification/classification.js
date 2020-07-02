(function() {
    $(".dropdown").mouseover(function () {
        $(this).addClass("open");
    });
 
    $(".dropdown").mouseleave(function(){
        $(this).removeClass("open");
    })
    //小屏幕下的导航条折叠
     if ($(window).width() < 768) {
    //点击导航链接之后，把导航选项折叠起来
    /*$("#bs-example-navbar-collapse-1 ul li a").click(function () {
      $("#bs-example-navbar-collapse-1").collapse('hide');
    });*/
    $(".dropdown-menu li a").css("color","white");
     $(".dropdown-toggle").css("width","100px");
    //滚动屏幕时，把导航选项折叠起来
    $(window).scroll(function () {
      $("#bs-example-navbar-collapse-1").collapse('hide');
    });
  }
   $(".container-fluid > .navbar-header").css("margin-right","0px");
  $(".navbar-toggle").css("margin-right","0px");
  
    init();
})();

function init() {
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

function reinitIframe() {
    var iframe = document.getElementById("iframe");
    try {
    	//document.getElementById("iframe").style.height = "0px";
        var bHeight = iframe.contentWindow.document.body.scrollHeight;
        var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
        var height = Math.max(bHeight, dHeight);
        iframe.height = height;
  //      console.log(height);
        document.getElementById("iframe").style.height = iframe.height + "px";
    } catch (ex) {}
}
var timer1 = window.setInterval("reinitIframe()", 200);
$("#iframe").load(function() {
    var height = $(this).contents().find("#box").height() + 40;
    //这样给以一个最小高度  
    $(this).height(height < 400 ? 400 : height);
})
/*
window.onload = function(){  
var iframe = document.getElementById("iframe");  
try{  
	alert('加载完毕');
   // window.clearInterval(timer1);  
    console.log(timer1);
    var bHeight = iframe.contentWindow.document.body.scrollHeight;  
    var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;  
    var height = Math.max(bHeight, dHeight);  
    iframe.height = height;  
    console.log(height);
}catch (ex){}  
    // 停止定时  
    window.clearInterval(timer1);  
}  ;*/

/*$(function(){
$("#iframe").attr("src","home.html");
});*/