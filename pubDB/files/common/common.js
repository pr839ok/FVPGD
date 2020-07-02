$(function(){  
    $('#header').load('header.html?v=' + Date.parse(new Date()),function(){

	});  
    $('#footer').load('footer.html?v=' + Date.parse(new Date()),function () {
        // $('#footer').show();

    });
    window.onload=function(){
        //do something
        // $('#header').show();
        $('#header').fadeIn();
        $('#footer').fadeIn();
    }
})
