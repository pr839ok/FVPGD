/*$(function(){  
    $('#header').load('libraryheader.html',function(){
		
	});  
    $('#footer').load('libraryfooter.html');  

})*/
/*function js_map() {
     var library = getUrlParam('library');
     window.location.href="map.html?library="+library; 
}
function js_cgmlst() {
     var library = getUrlParam('library');
     window.location.href="cgmlst.html?library="+library; 
}
function js_crispr() {
     var library = getUrlParam('library');
     window.location.href="crispr.html?library="+library; 
}
function js_blast() {
     var library = getUrlParam('library');
     window.location.href="blast.html?library="+library; 
}
function getUrlParam(name) {//a标签跳转获取参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]); return null;
}*/
$(function(){  
    $('#header').load('libraryheader.html?v=' + Date.parse(new Date()),function(){

    });  
    $('#footer').load('libraryfooter.html?v=' + Date.parse(new Date()),function () {
        // $('#footer').show();

    });
    $('#librarytools').load('librarytools.html?v=' + Date.parse(new Date()),function(){
    }); 
    window.onload=function(){
        //do something
        // $('#header').show();
        $('#header').fadeIn();
        $('#footer').fadeIn();
        $('#librarytools').fadeIn();
    }
})

  