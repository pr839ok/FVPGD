window.onscroll = function() {
    layui.use('element', function() {
        var element = layui.element;

        //…
    });

    //变量t是滚动条滚动时，距离顶部的距离
    var t = document.documentElement.scrollTop || document.body.scrollTop;
    //当滚动到距离顶部200px时，返回顶部的锚点显示
    if (t >= 300) {
        $("#nss").css({ "display": "block", "z-index": "999", "position": "fixed", "top": "0px", "margin-top": "0px", "height": "50px", "background-color": "#f2f2f2", "color": "black" });
    } else { //恢复正常
        $("#nss").css({ "display": "none" });
    }
    /*if (t >= 300) {
        
         $(".sr").css({"line-height":"6px","font-size":"19px"});

     } else { //恢复正常
      
         $(".sr").css({"line-height":"","font-size":""});

     }*/
}
var lb = getLibrary();
if (lb != null && lb != "" && lb != 'null') {
    var method = "";
    if (lb == 'Vpfasta') {
        method = "js_VP()";
    } else {
        // lb=getUrlParam('library');
        method = 'js_' + lb + '()'
    }
    var $po = '<a href="javascript:void(0);" onclick="' + method + '" >' + 'Home' + '</a>';
    $("#starin-tab").append($po);
} else {
    var method = "js_VP()";
    var $po = '<a href="javascript:void(0);" onclick="' + method + '" >' + 'Home' + '</a>';
    $("#starin-tab").append($po);
}
$('#tab-h2').text(getLibraryHeader(lb));
$(document).ready(function() {
    $("#MALL").hide();
    $("#MHover").mouseover(function(e) {

        $("#MALL").show();
    });
    $("#MHover").mousemove(function(e) {
        document.getElementById("MALL").innerHTML = document.getElementById('MHover').innerHTML;
        $("#MALL").css({ "position": "absolute", "top": e.pageY + 5, "left": e.pageX + 5 });
    });
    $("#MHover").mouseout(function() {
        $(this).next("#MALL").hide();
    });
});

function getLibraryHeader(library){
    switch(library){
        case 'listeriafasta':return 'Foodborne Listeria monocytogenes genome database';
        default:return 'Foodborne Vibrio parahaemolyticus genome database';
    }
}

function js_search() {
    var library = getLibrary();
    window.location.href = "searchlibrary.html?library=" + library;
}

function js_Escherichia() {
    window.location.href = "escherichia.html?library=Escherichia";
}

function js_cgmlst() {
    var library = getLibrary();
    window.location.href = "cgmlst.html?library=" + library;
}

function js_crispr() {
    var library = getLibrary();
    window.location.href = "crispr.html?library=" + library;
}

function js_blast() {
    var library = getLibrary();
    window.location.href = "tools.html?library=" + library;
}

function js_map() {
    var library = getLibrary();
    window.location.href = "map.html?library=" + library;
}

function js_Campylobacter() {
    window.location.href = "Campylobacter.html?library=Campylobacter";
}

function js_VP() {
    window.location.href = "VP.html?library=Vpfasta";
}

function js_listeriafasta() {
    window.location.href = "Listeriafasta.html?library=listeriafasta";
}

function getLibrary() {
    var library = getUrlParam('library');
    return library ? library : "Vpfasta";
}

function getUrlParam(name) { //a标签跳转获取参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
}