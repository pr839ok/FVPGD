var myChart;
var allData = {};
var oldAllData = {};
var iocnall = { w: 36, h: 36, l: 0, t: 0, x: 6, lb: 5 };
var worldData = [];
var l=0;
var g=0;
var ll=true;
//标注点数组
var markerArr = [
    /*{ title: "Guangzhou ", point: "113.306524|23.146951", isOpen: 0, icon:iocnall  },
        { title: "Shanghai ", point: "120.631007|31.308762", isOpen: 0, icon: iocnall },
        { title: "Beijing ", point: "116.440983|39.90074", isOpen: 0, icon: iocnall },*/
];
var oldmarkerArr=[];
$(function() {


    $.ajax({
        url: '/webhdfs/v1?op=PUBDB_LOADMAPDATA',
        async: true,
        dataType: 'json',
        success: function(json) {
            //console.log(json.data);
            if (json.code == 200) {
                for (var p in json.data) {
                    var newAllData = [];
                    var newarr = getCount(json.data[p], null, 1);
                    queryS(p);
                    //console.log(newarr,p);
                    for (var q in newarr) {
                        var b = {};
                        b = { "value": newarr[q].count, "name": newarr[q].el };
                        newAllData.push(b);
                    }
                    //console.log(newAllData);
                    allData[p] = newAllData;
                    
                }

            }
            initMap();
            //console.log(districts);
        }
    });
    //setTimeout(initMap, 0000);
})

function queryS(ss) {
        // console.log(ss);
        $.each(worlds, function(j, item) {
            if (ss == item.name) {
                var districts = {};
                // console.log(item.latitude);
                //跳出each循环
                //districts[ss] = { "lat": item.latitude, "lng": item.longitude };
                //console.log(districts);
                districts["title"] = ss;
                districts["point"] = item.longitude + "|" + item.latitude;
                districts["isOpen"] = 0;
                districts["icon"] = iocnall;
                markerArr.push(districts);
                
               // return item;
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
        var label = new BMap.Label(json.title, { "offset": new BMap.Size(json.icon.lb - json.icon.x-87 , 26) });
        label.setStyle({
            //borderColor: "#808080",
            color: "rgb(64, 195, 200)",
            width:"200px",
            //cursor: "pointer",
            fontWeight: "bold",
            //maxWidth:"0px",
            border:"none",
            padding:"0px",
            textAlign: "center",
            backgroundColor:"none"
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
                var allDataEchearts = allData[$("#country").text()];
                if(!ll){
                    $("#city").css("display", "none");
                }
                setTimeout(init_echearts(allDataEchearts), 1000);
                $("#city").click(function() {
                    ll=false;
                    $("#return-button").css("display", "inline");
                    map.clearOverlays();
                    map.setMaxZoom(8);
                    map.setMinZoom(5);
                    
                    initCity($("#country").text());

                })
            });
            _marker.addEventListener("mouseover", function() {
                /*this.openInfoWindow(_iw);
                $("#city").css("display", "none");
                var allDataEchearts = allData[$("#country").text()];
                setTimeout(init_echearts(allDataEchearts), 1000);*/
            });
            _marker.addEventListener("mouseout", function() {
                //this.closeInfoWindow(_iw);
            });
            _iw.addEventListener("open", function() {
                _marker.getLabel().hide();
            })
            _iw.addEventListener("close", function() {
                _marker.getLabel().show();
            })
            label.addEventListener("click", function() {
                
                if (!!json.isOpen) {
                    label.hide();
                    //_marker.openInfoWindow(_iw);
                }
            });
        })()
    }
}
//创建InfoWindow
function createInfoWindow(i) {
    var json = markerArr[i];
    var opts = {
        width: 300, // 信息窗口宽度      
        height: 240, // 信息窗口高度     
    }
    /* var iw = new
     BMap.InfoWindow("<b id='iw_poi_title' class='iw_poi_title' style='' title='" + json.title + "'>" + json.title);*/
    //var contentEchaets = $("#mapEcharts");
    //var iw = new BMap.InfoWindow(contentEchaets);
     
    var sContent = "<div id='country'>" + json.title + "</div><div id='mapEcharts' style='width: 300px;height:200px' ></div><a id='city' style='font-size:11px;cursor:pointer'>" + ">>>Click here to see the distribution of strains in the city" + "</a>"
    var iw = new BMap.InfoWindow(sContent, opts); // 创建信息窗口对象   
    
    return iw;
}
//创建一个Icon
function createIcon(json) {
    var icon = new
    BMap.Icon("images/map/loc.png",//http://api.azcity.cn/public/image/localtion.png
        new BMap.Size(json.w, json.h), {
            imageOffset: new BMap.Size(-json.l, -json.t),
            infoWindowOffset: new BMap.Size(json.lb + 5, 1),
            offset: new BMap.Size(json.x, json.h)
        })
    return icon;
}

function init_echearts(allDataEchearts) {
    //console.log(allDataEchearts);
    var legendArr = [];
    for (var p in allDataEchearts) {
        ///console.log(allDataEchearts[p].name);
        legendArr.push(allDataEchearts[p].name);
    }
    if (myChart != null && myChart != "" && myChart != undefined) {
        myChart.dispose();
    }
    myChart = echarts.init(document.getElementById('mapEcharts'));
    option = {
        title: {
            /*text: '某站点用户访问来源',
            subtext: '纯属虚构',*/
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{b} : {c} ({d}%)",
            extraCssText: 'fontSize:12px;',
            position: function(p) { //其中p为当前鼠标的位置
                return [p[0] - 100, p[1] - 10];
            }
        },
        legend: {
            type: 'scroll',
            orient: 'vertical',
            left: 'right',
            data: legendArr,
            itemWidth: 10, // 图例图形宽度
            itemHeight: 7,
            textStyle: { fontSize: 10 }
        },
        series: [{
            //name: '访问来源',
            type: 'pie',
            radius: '65%',
            center: ['40%', '60%'],
            data: allDataEchearts,
            label: { //饼图图形上的文本标签
                normal: {
                    textStyle: {
                        fontSize: 12 //文字的字体大小
                    },


                }
            },
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                },
                normal: {
                    label: {
                        show: false //隐藏标示文字
                    },
                    labelLine: {
                        show: false //隐藏标示线
                    }
                }
            }
        }]
    };
    myChart.setOption(option, true);
}

function initCity(city) {
    l=0;
    $.ajax({
        url: '/webhdfs/v1?op=PUBDB_LOADCHINAMAPDATA&temp=' + $("#country").text(),
        dataType: 'json',
        async: false,
        success: function(json) {
            //console.log(json.data);
            oldmarkerArr=markerArr;
            markerArr = [];
            for (var p in json.data.rs) {
                var districts = {};
                districts["title"] = p;
                districts["point"] = json.data.rs[p][0].longtitude + "|" + json.data.rs[p][0].latitude;
                districts["isOpen"] = 0;
                districts["icon"] = iocnall;
                markerArr.push(districts);
            }
            oldAllData=allData;
            allData = {};
            g=0;
            $(".panel-body").empty();
            for (var i in json.data.data) {
                g++;
            }
            for (var p in json.data.data["unCity"]) {
                getpoi(json.data.data["unCity"][p]);
            }
            addMarker();
            //delete json.data.data["unCity"];
            for (var p in json.data.data) {
                var newarrCity = getCount(json.data.data[p], null, 1);
                var newAllData = [];
                for (var q in newarrCity) {
                    var b = {};
                    b = { "value": newarrCity[q].count, "name": newarrCity[q].el };
                    newAllData.push(b);
                }
                allData[p] = newAllData;
            }
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
                //console.log(position1);
                $(".panel").css("display", "block");
                var $po = "<a id=" + position1 + " href='javascript:void(0)' onclick='js_method(this)'' style='display:inline;margin:0px 5px;'>" + position1 + "</a>";
                $(".panel-body").append($po);
                if(l>1){
                    layer.msg(l+" cities were not found,"+(g-1-l)+"cities were found");
                }else{
                    layer.msg("a city were not found,"+(g-1-l)+"cities were found");
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
    //console.log(element.id);
    var djsonarr = allData[element.id];
    var legendArr = [];
    for (var p in djsonarr) {
        //console.log(djsonarr[p].name);
        legendArr.push(djsonarr[p].name);
    }
    if (myChart != null && myChart != "" && myChart != undefined) {
        myChart.dispose();
    }
    $("#main").css("display", "block");
    var myChart = echarts.init(document.getElementById('main'));
    option = {
        title: {
            text: element.id,
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            data:legendArr,
            orient: 'vertical',
            x: 'left'
        },
        series: [{
            name: element.id,
            type: 'pie',
            radius: '65%',
            avoidLabelOverlap: false,
            label: {
                normal: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    show: false,
                    textStyle: {
                        fontSize: '30',
                        fontWeight: 'bold'
                    }
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: djsonarr
        }]
    };
    myChart.setOption(option, true);
}
$("#return-button").click(function() {
    $(".panel").css("display","none");
    $("#main").css("display","none");
    $("#return-button").css("display","none");
    ll=true;
    map.clearOverlays();
    map.setMaxZoom(5);
    map.setMinZoom(1);
    allData = {};
    markerArr = [];   
    allData=oldAllData;
    markerArr=oldmarkerArr;
    addMarker();
})