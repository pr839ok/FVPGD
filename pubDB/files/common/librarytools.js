$(function(){
	$('#librarytools').load('librarytools.html?v=' + Date.parse(new Date()),function(){
	}); 
	window.onload=function(){
    	$('#librarytools').fadeIn();
	}
})