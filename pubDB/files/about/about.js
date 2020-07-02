var form, layer, element, laypage, laydate, table;
layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
    form = layui.form;
    // layer = parent.layer === undefined ? layui.layer : parent.layer;
    layer = layui.layer;
    element = layui.element;
    laypage = layui.laypage;
    laydate = layui.laydate;
    table = layui.table;
});
$("#com-logo").bind('click', function() {
    window.open("http://www.mingleadgene.com/");
});
/*$("#contact-row").bind('click', function() {
	window.open("http://134.175.13.233");
});*/
// $("#contact").bind('click', function() {
//     window.location.href = "contact.html";
// });
/*var mapType = google.maps.MapTypeId.ROADMAP;
var lat = 23.1401938606,
    lng = 113.2990626748,
    zoom = 18;
var mapOptions = {
    center: new google.maps.LatLng(lat, lng), //地图的中心点
    zoom: zoom,
    　　　　　　　　　　 //地图缩放比例
    mapTypeId: mapType,
    　　　　　　　　　　 //指定地图展示类型：卫星图像、普通道路
    scrollwheel: true　　　　　　　　　 //是否允许滚轮滑动进行缩放
};
var map = new google.maps.Map(document.getElementById("map"), mapOptions); //创建谷歌地图
client = map.Client(key="AIzaSyC6kFenfL0aMd2ztZjblHTSJF_7JqwsoHw", queries_per_second=50, retry_over_query_limit=false)

var marker = new google.maps.Marker({
    map: map,
    position: new google.maps.LatLng(lat, lng)
});

var infowindow = new google.maps.InfoWindow({ content: "广东微生物研究所<br/>地址：广州市先烈中路100号　　邮编：510070　<br/>电话：(020)87682434　87137500　　传真：(020)87684587" }); //创建一个InfoWindow
infowindow.open(map, marker); //把这个infoWindow绑定在选定的marker上面
//使用谷歌地图定义的事件，给这个marker添加点击事件
google.maps.event.addListener(marker, "click", function() {
    infowindow.open(map, marker);
});*/

/*var map = new BMap.Map("baiduMap"); // 创建地图实例
var point = new BMap.Point(113.306524, 23.146951); // 创建点坐标也就是地图默认显示的哪一个区域
map.enableScrollWheelZoom(); //启动鼠标中键控制地图缩放
map.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别
map.enableContinuousZoom(); // 开启连续缩放效果
map.enableInertialDragging(); // 开启惯性拖拽效果
map.addControl(new BMap.NavigationControl()); //添加缩放平移控件
map.addControl(new BMap.ScaleControl()); //添加比例尺控件
map.addControl(new BMap.OverviewMapControl()); //添加缩略图控件
//设置标注的图标
var icon = new BMap.Icon('http://map.baidu.com/image/us_mk_icon.png ', new BMap.Size(0, 32), {
    anchor: new BMap.Size(10, 30)
});
//设置标注的经纬度出现图标的地方
var mkr = new BMap.Marker(new BMap.Point(113.306524, 23.146951), {
    icon: icon
});
//把标注添加到地图上
map.addOverlay(mkr);
//点击标注，显示信息
var content = "广东微生物研究所";

var infowindow = new BMap.InfoWindow(content);
mkr.addEventListener("click", function() {
    this.openInfoWindow(infowindow);
});
//点击地图，获取经纬度坐标
map.addEventListener("click", function(e) {
    document.getElementById("aa").innerHTML = "经度坐标：" + e.point.lng + "  纬度坐标：" + e.point.lat;
});
//关键字搜索
function search() {
    var keyword = document.getElementById("keyword").value;
    var local = new BMap.LocalSearch(map, {
        renderOptions: { map: map }
    });
    local.search(keyword);
}*/
//新建三个地图上点
//创建和初始化地图函数：
function initMap() {
    createMap(); //创建地图
    setMapEvent(); //设置地图事件
    addMapControl(); //向地图添加控件
    addMarker(); //向地图中添加marker
}

//创建地图函数：
function createMap() {
    var map = new BMap.Map("dituContent"); //在百度地图容器中创建一个地图
    var point = new BMap.Point(113.306524, 23.146951); //定义一个中心点坐标
    map.centerAndZoom(point, 18); //设定地图的中心点和坐标并将地图显示在地图容器中
    window.map = map; //将map变量存储在全局
}

//地图事件设置函数：
function setMapEvent() {
    map.enableDragging(); //启用地图拖拽事件，默认启用(可不写)
    map.enableScrollWheelZoom(); //启用地图滚轮放大缩小
    map.enableDoubleClickZoom(); //启用鼠标双击放大，默认启用(可不写)
    map.enableKeyboard(); //启用键盘上下左右键移动地图
}

//地图控件添加函数：
function addMapControl() {
    //向地图中添加缩放控件
    var ctrl_nav = new BMap.NavigationControl({ anchor: BMAP_ANCHOR_TOP_LEFT, type: BMAP_NAVIGATION_CONTROL_LARGE });
    map.addControl(ctrl_nav);
    //向地图中添加缩略图控件
    var ctrl_ove = new BMap.OverviewMapControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT, isOpen: 1 });
    map.addControl(ctrl_ove);
    //向地图中添加比例尺控件
    var ctrl_sca = new BMap.ScaleControl({ anchor: BMAP_ANCHOR_BOTTOM_LEFT });
    map.addControl(ctrl_sca);
}
//标注点数组
var markerArr = [{ title: "广东省微生物研究所", content: "地址：广州市先烈中路100号　　邮编：510070　<br/>电话：(020)87682434　87137500　　传真：(020)87684587 ", point: "113.306524|23.146951", isOpen: 0, icon: { w: 36, h: 36, l: 0, t: 0, x: 6, lb: 5 } }];
//创建marker
function addMarker() {
    for (var i = 0; i < markerArr.length; i++) {
        var json = markerArr[i];
        var p0 = json.point.split("|")[0];
        var p1 = json.point.split("|")[1];
        var point = new BMap.Point(p0, p1);
        var iconImg = createIcon(json.icon);
        var marker = new BMap.Marker(point, { icon: iconImg });
        var iw = createInfoWindow(i);
        var label = new BMap.Label(json.title, { "offset": new BMap.Size(json.icon.lb - json.icon.x + 10, -20) });
        marker.setLabel(label);
        map.addOverlay(marker);
        label.setStyle({
            borderColor: "#808080",
            color: "#333",
            cursor: "pointer"
        });

        (function() {
            var index = i;
            var _iw = createInfoWindow(i);
            var _marker = marker;
            _marker.openInfoWindow(_iw);
            _marker.addEventListener("click", function() {
                this.openInfoWindow(_iw);
            });
            _iw.addEventListener("open", function() {
                _marker.getLabel().hide();
            })
            _iw.addEventListener("close", function() {
                _marker.getLabel().show();
            })
            label.addEventListener("click", function() {
                _marker.openInfoWindow(_iw);
            })
            if (!!json.isOpen) {
                label.hide();
                _marker.openInfoWindow(_iw);
            }
        })()
    }
}
//创建InfoWindow
function createInfoWindow(i) {
    var json = markerArr[i];
    var iw = new
    BMap.InfoWindow("<b class='iw_poi_title' title='" + json.title + "'>" + json.title + "</b><div class='iw_poi_content'>" + json.content + "</div>");
    return iw;
}
//创建一个Icon
function createIcon(json) {
    var icon = new
    BMap.Icon("images/about/123.png",
        new BMap.Size(json.w, json.h), {
            imageOffset: new BMap.Size(-json.l, -json.t),
            infoWindowOffset: new BMap.Size(json.lb + 5, 1),
            offset: new BMap.Size(json.x, json.h)
        })
    return icon;
}
initMap();