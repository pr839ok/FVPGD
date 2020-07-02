function js_blastn() {
    var library = getUrlParam('library');
    window.location.href = "blastn_l.html?library=" + library;
}

function js_blastp() {
    var library = getUrlParam('library');
    window.location.href = "blastp_l.html?library=" + library;
}

function js_blastx() {
    var library = getUrlParam('library');
    window.location.href = "blastx_l.html?library=" + library;
}

function js_tblastn() {
    var library = getUrlParam('library');
    window.location.href = "tblastn_l.html?library=" + library;
}

function js_tblastx() {
    var library = getUrlParam('library');
    window.location.href = "tblastx_l.html?library=" + library;
}

function getUrlParam(name) { //a标签跳转获取参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
}