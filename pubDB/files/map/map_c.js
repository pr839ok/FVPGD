var myChart;
var allData = {};
var oldAllData = {};
var iocnall = { w: 36, h: 36, l: 0, t: 0, x: 6, lb: 5 };
var worldData = [];
var l = 0;
var g = 0;
var ll = true;
var china_map = [];
//标注点数组
var markerArr = [
    /*{ title: "Guangzhou ", point: "113.306524|23.146951", isOpen: 0, icon:iocnall  },
        { title: "Shanghai ", point: "120.631007|31.308762", isOpen: 0, icon: iocnall },
        { title: "Beijing ", point: "116.440983|39.90074", isOpen: 0, icon: iocnall },*/
];
var oldmarkerArr = [];
$(function() {
    $("label").css("max-width", "");

    $.ajax({
        url: '/webhdfs/v1?op=PUBDB_LOADALLMAPDATA',
        async: true,
        dataType: 'json',
        success: function(json) {
            //console.log(json.data);

            for (var p in json.data) {
                for (var q in json.data[p]) {
                    queryS(json.data[p][q]);
                }
            }
            initMap();
        }
    });
})

function queryS(ss) {
    $.each(worlds, function(j, item) {
        if (ss == item.name) {
            var districts = {};
            districts["title"] = ss;
            districts["point"] = item.longitude + "|" + item.latitude;
            districts["isOpen"] = 0;
            districts["icon"] = iocnall;
            markerArr.push(districts);
        }
    });


}

function getCount(arr, rank, ranktype) {
    var obj = {},
        k, arr1 = [];
    for (var i = 0, len = arr.length; i < len; i++) {
        k = arr[i];
        if (obj[k])
            obj[k]++;
        else
            obj[k] = 1;
    }
    //保存结果{el-'元素'，count-出现次数}
    for (var o in obj) {
        arr1.push({ el: o, count: obj[o] });
    }
    //排序（降序）
    arr1.sort(function(n1, n2) {
        return n2.el - n1.el
    });
    //如果ranktype为1，则为升序，反转数组
    if (ranktype === 1) {
        arr1 = arr1.reverse();
    }
    var rank1 = rank || arr1.length;
    return arr1.slice(0, rank1);
}
layui.use('layer', function() {
    var layer = layui.layer;
});
//创建和初始化地图函数：
function initMap() {
    createMap(); //创建地图
    setMapEvent(); //设置地图事件
    addMapControl(); //向地图添加控件
    addMarker(); //向地图中添加marker
}

//创建地图函数：
function createMap() {
    var map = new BMap.Map("allmap", { minZoom: 1, maxZoom: 5 }); //在百度地图容器中创建一个地图
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
    var styleJson = [{
            "featureType": "road",
            "elementType": "all",
            "stylers": {
                "color": "#4c76b0ff",
                "hue": "#cfe2f3",
                "lightness": -21,
                "saturation": 39,
                "visibility": "off"
            }
        },
        {
            "featureType": "green",
            "elementType": "all",
            "stylers": {
                "visibility": "off"
            }
        },
        {
            "featureType": "background",
            "elementType": "all",
            "stylers": {
                "visibility": "on"
            }
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": {
                "color": "#315e9cff"
            }
        }, {
            "featureType": "city",
            "elementType": "all",
            "stylers": {
                "visibility": "off"
            }
        },
        {
            "featureType": "district",
            "elementType": "all",
            "stylers": {
                "visibility": "off"
            }
        },
        {
            "featureType": "town",
            "elementType": "all",
            "stylers": {
                "visibility": "off"
            }
        },
        {
            "featureType": "poilabel",
            "elementType": "all",
            "stylers": {
                "visibility": "off"
            }
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": {
                "visibility": "off"
            }
        },
        {
            "featureType": "manmade",
            "elementType": "all",
            "stylers": {
                "visibility": "off"
            }
        }
    ]
    map.setMapStyle({ styleJson: styleJson });
}

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
        var label = new BMap.Label(json.title, { "offset": new BMap.Size(json.icon.lb - json.icon.x - 7, 26) });
        label.setStyle({
            //borderColor: "#808080",
            color: "rgb(64, 195, 200)",
            width: "200px",
            //cursor: "pointer",
            fontWeight: "bold",
            //maxWidth:"0px",
            border: "none",
            padding: "0px",
            textAlign: "center",
            backgroundColor: "none"
        });
        marker.setLabel(label);
        map.addOverlay(marker);

        (function() {
            var index = i;
            var _iw = createInfoWindow(i);
            var _marker = marker;
            //_marker.openInfoWindow(_iw);
            _marker.addEventListener("click", function() {

                this.openInfoWindow(_iw);
                this.closeInfoWindow(_iw);
                if (!ll) {
                    
                    $("#city").css("display", "none");
                    //setTimeout(init_echearts(0), 1000);
                    
                    init_echearts($("#country").text());
                } else {
                    this.closeInfoWindow(_iw);
                    ll = false;
                    $(".md").animate({width:'57%'},500);//用时1s
                   // $(".md").css({"width":"57%"});
                    $("#return-button").css("display", "inline");
                    $(".ms").css("display", "inline");
                    map.clearOverlays();
                    map.setMaxZoom(8);
                    map.setMinZoom(5);
                    var point = new BMap.Point(_marker.point["lng"], _marker.point["lat"]); //定义一个中心点坐标
                    map.setCenter(point, 18); //设定地图的中心点和坐标并将地图显示在地图容器中
                    $("#lng").text("longtitude:"+_marker.point["lng"]);
                    $("#lat").text("latitude:"+_marker.point["lat"])
                    initCity($("#country").text());
                }

            });
            _marker.addEventListener("mouseover", function() {});
            _marker.addEventListener("mouseout", function() {});
            _iw.addEventListener("open", function() {
                _marker.getLabel().hide();
            })
            _iw.addEventListener("close", function() {
                _marker.getLabel().show();
            })
            label.addEventListener("click", function() {
                if (!!json.isOpen) {
                    label.hide();
                }
            });
        })()
    }
}
//创建InfoWindow
function createInfoWindow(i) {
    var json = markerArr[i];
    var opts = {
        width: 0, // 信息窗口宽度      
        height: 0, // 信息窗口高度     
    }
    /* var iw = new
     BMap.InfoWindow("<b id='iw_poi_title' class='iw_poi_title' style='' title='" + json.title + "'>" + json.title);*/
    //var contentEchaets = $("#mapEcharts");
    //var iw = new BMap.InfoWindow(contentEchaets);
    var sContent = "<div id='country' style='width: 320px;height:180px;display:none;'>" + json.title + "</div><div id='mapEcharts' style='width: 320px;height:180px;display:none;' ></div><div id='city'  style='font-size:14px;'></div>";
    // var sContent = "<div id='country'>" + json.title + "</div><div id='mapEcharts' style='width: 320px;height:180px;display:none;' ></div><div id='city'  style='font-size:14px;'></div>"
    var iw = new BMap.InfoWindow(sContent, opts); // 创建信息窗口对象   
    return iw;
}
//创建一个Icon
function createIcon(json) {
    var icon = new
    BMap.Icon("images/map/loc.png", //http://api.azcity.cn/public/image/localtion.png
        new BMap.Size(json.w, json.h), {
            imageOffset: new BMap.Size(-json.l, -json.t),
            infoWindowOffset: new BMap.Size(json.lb + 5, 1),
            offset: new BMap.Size(json.x, json.h)
        })
    return icon;
}

function init_echearts(name) {
    $("#main").css("display", "none");
    $(".ms").css("display", "inline");
    var data_name = [];
    var data_series = [];
    for (var i in china_map) {
        if (china_map[i]["city"] == name) {
            data_name.push(china_map[i]["type"]);
            data_series.push(parseInt(china_map[i]["rate"]));
        }
    }
    //console.log(data_series);
    $("#main2").css("display", "block");
    var myChart = echarts.init(document.getElementById("main2"));
    myChart.setOption({
        title: {
            text: name,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'

            },
            formatter: '{b}:{c}%'
        },

        grid: {
            show: false,
            height: '60%',
            width: '80%',
            top: '28%',
            left: '17%',

        },
        xAxis: {
            data: data_name
        },
        yAxis: [{
            type: 'value',
            axisLabel: {
                show: true,
                textStyle: {
                    color: '#3398DB',
                    fontSize: '100%',
                },
                interval: 0,
                showMinLabel: true,
                formatter: '{value} %'
            },
            min: 0,
            max: 100,
            splitNumber: 5
        }],
        series: [{
            type: 'bar',
            barWidth: '40%',
            barCateGoryGap:'20%',
            data: data_series
        }]
    });
    myChart.on('click', function(params) {
       
        var strain = [];
        for (var i in china_map) {
            if (china_map[i]["city"] == name && china_map[i]["type"] == params.name) {
                //strain.push(china_map[i]["strain"]);
                strain = china_map[i]["strain"].split(",")
            }
        }
        var sp = "";
        for (var s in strain) {
            sp += "     " + strain[s];
        }
        $("#main_city").html(params.name + ":<br>&emsp;" + sp);
        $("#main_city").css("display", "block");
     });

}

function initCity(city) {

    $("#map_size").text(city + " map");
    l = 0;
    $.ajax({
        url: '/webhdfs/v1?op=PUBDB_LOADCITYMAPDATA&temp=' + city,
        dataType: 'json',
        success: function(json) {
            oldmarkerArr = markerArr;
            markerArr = [];
            $(".panel-body").empty();
            for (var p in json.data.rs) {
                var districts = {};
                districts["title"] = p;
                districts["point"] = json.data.rs[p].longtitude + "|" + json.data.rs[p].latitude;
                districts["isOpen"] = 0;
                districts["icon"] = iocnall;
                markerArr.push(districts);
                $(".panel").css("display", "block");
                var $po = "<a id=" + p + " href='javascript:void(0)' onclick='js_method(this)' style='display:inline;font-size: 13px;margin-right:5px;'>" + p + "</a>";
                $(".panel-body").append($po);
            }
            oldAllData = allData;
            allData = {};
            g = 0;
            
            for (var i in json.data.unCity) {
                g++;
            }
            for (var p in json.data.unCity) {
                getpoi(json.data.unCity[p]);
            }
            addMarker();
            //delete json.data.data["unCity"];
            for (var p in json.data.data) {

            }
            china_map = [];
            china_map = json.data.data;
            //console.log(allData);
        }
    });

}

function getpoi(position1) {
    var address = getCnName(position1.toLowerCase());
    var url = "http://api.map.baidu.com/geocoder/v2/?address=" + address + "&output=json&ak=KZR4R8QTAAAxu67tBy18g3G9hRRx2Ras&callback=?";
    $.ajax({
        async: true,
        url: url,
        dataType: 'json',
        success: function(data) {
            if (data.status == 0) {
                $(".panel").css("display", "block");
                var $po = "<a id=" + position1 + " href='javascript:void(0)' onclick='js_method(this)' style='display:inline;font-size: 13px;'>" + position1 + "</a>";
                $(".panel-body").append($po);
                longtitude = data.result.location.lng;
                latitude = data.result.location.lat;
                var districts = {};
                districts["title"] = position1;
                districts["point"] = longtitude + "|" + latitude;
                districts["isOpen"] = 0;
                districts["icon"] = iocnall;
                markerArr.push(districts);
                addMarker();
                var positionjson = {};
                /*console.log(typeof(longtitude));*/
                positionjson.cityName = position1;
                positionjson.longtitude = longtitude.toString();
                positionjson.latitude = latitude.toString();
                $.ajax({
                    async: true,
                    url: '/webhdfs/v1?op=PUBDB_INSERTCHINACITYLNGANDLAT&temp=' + JSON.stringify(positionjson),
                    dataType: 'json',
                    success: function(json) {}
                });
            } else {
                l++;
                $(".panel").css("display", "block");
                var $po = "<a id=" + position1 + " href='javascript:void(0)' onclick='js_method(this)' style='display:inline;font-size: 13px;'>" + position1 + "</a>";
                $(".panel-body").append($po);
                if (l > 1) {
                    layer.msg(l + " cities were not found," + (g - l) + "cities were found");
                } else {
                    layer.msg("a city were not found," + (g - l) + "cities were found");
                }
            }
        }
    });
}

function getCnName(name) {
    var arr = [];
    arr = station_names.split('@');
    for (var i in arr) {
        var son = arr[i].split('|');
        // console.log(son);
        if (son.length > 1) {
            if (son[3] == name) {
                //$('#content').html("查询结果：" + son[1]);
                return son[1];
            }

        }
    }
}

function js_method(element) {
    $("#main2").css("display", "none");
    name = element.id;
    var data_name = [];
    var data_series = [];
    for (var i in china_map) {
        if (china_map[i]["city"] == name) {
            data_name.push(china_map[i]["type"]);
            data_series.push(parseInt(china_map[i]["rate"]));
        }
    }
    $("#main").css("display", "block");
    var myChart1 = echarts.init(document.getElementById("main"));
    myChart1.setOption({
        title: {
            text: name,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'

            },
            formatter: '{b}:{c}%'
        },

        grid: {
            show: false,
            height: '60%',
            width: '80%',
            top: '28%',
            left: '17%',

        },
        xAxis: {
            data: data_name
        },
        yAxis: [{
            type: 'value',
            axisLabel: {
                show: true,
                textStyle: {
                    color: '#3398DB',
                    fontSize: '100%',
                },
                interval: 0,
                showMinLabel: true,
                formatter: '{value} %'
            },
            min: 0,
            max: 100,
            splitNumber: 5
        }],
        series: [{
            barWidth: '40%',
            type: 'bar',
            data: data_series
        }]
    });
    myChart1.on('click', function(params) {
        var strain = [];
        for (var i in china_map) {
            if (china_map[i]["city"] == name && china_map[i]["type"] == params.name) {
                //strain.push(china_map[i]["strain"]);
                strain = china_map[i]["strain"].split(",")
            }
        }
        var sp = "";
        for (var s in strain) {
            sp += "     " + strain[s];
        }
        $("#main_city").html(params.name + ":<br>&emsp;" + sp);
        $("#main_city").css("display", "block");
    });
}
$("#return-button").click(function() {
    $(".panel").css("display", "none");
    $("#main").css("display", "none");
    $("#main2").css("display", "none");
    $(".ms").css("display", "none");
    $("#main_city").css("display", "none");
    $("#return-button").css("display", "none");
    $("#map_size").text("World map");
   // $(".md").css({"width":"80%"});
     $(".md").animate({width:'80%'},500);
    ll = true;
    map.clearOverlays();
    map.setMaxZoom(5);
    map.setMinZoom(1);
    allData = {};
    markerArr = [];
    allData = oldAllData;
    markerArr = oldmarkerArr;
    addMarker();
});
