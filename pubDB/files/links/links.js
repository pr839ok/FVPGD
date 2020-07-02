layui.use('util', function() {
    var util = layui.util;

    //示例
    var endTime = new Date(2099, 1, 1).getTime() //假设为结束日期
        ,
        serverTime = new Date().getTime(); //假设为当前服务器时间，这里采用的是本地时间，实际使用一般是取服务端的

    util.countdown(endTime, serverTime, function(date, serverTime, timer) {
        var str = date[0] + '天' + date[1] + '时' + date[2] + '分' + date[3] + '秒';
        layui.$('#test').html('距离2099年1月1日还有：' + str);
    });
});
var form, layer, element, laypage, laydate, table;
layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
    form = layui.form;
    // layer = parent.layer === undefined ? layui.layer : parent.layer;
    layer = layui.layer;
    element = layui.element;
    laypage = layui.laypage;
    laydate = layui.laydate;
    table = layui.table;
    //监听提交
    /*form.on('select(searchPname)', function(data) {*/
    getAjax(true, 'POST', '/fpbdb/SEARCHLINKS', null, 'json', function(json) {
        desArray = json.data;
        for (var j in desArray) {
            var li_link = $("<ol><div class='ol-f' onclick=window.open('" + desArray[j]['href'] + "');><i class='layui-icon'>&#xe64c;</i><a href='" + desArray[j]['href'] + "' target='_blank'>" + desArray[j]['name'] + "</a><p>" + desArray[j]['introduction'] + "</p></div></ol>");
            $("#links").append(li_link);

        }
    });
});