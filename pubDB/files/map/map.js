var myChart;
var allData = {};
var oldAllData = {};
var iocnall = { w: 36, h: 36, l: 0, t: 0, x: 6, lb: 5 };
var worldData = [];
var l = 0;
var g = 0;
var ll = true;
var china_map = [];
var ff = true;
//标注点数组
var markerArr = [
    /*{ title: "Guangzhou ", point: "113.306524|23.146951", isOpen: 0, icon:iocnall  },
        { title: "Shanghai ", point: "120.631007|31.308762", isOpen: 0, icon: iocnall },
        { title: "Beijing ", point: "116.440983|39.90074", isOpen: 0, icon: iocnall },*/
];
var oldmarkerArr = [];
var subtips = 0;

var curCityStrain = null;
var curCitySample = [];

$(function() {
    $("label").css("max-width", "");
    getAjax(true, 'GET', '/fpbdb/GETALLCOUNTRY?temp=' + getUrlParam("library"), null, 'json', function(json) {
        for (var p in json.data) {
            for (var q in json.data[p]) {
                queryS(json.data[p][q]);
            }
        }
        initMap();
    });
    $("#return-button").hover(function() {
        openMsg();
    }, function() {
        layer.close(subtips);
    });

    function openMsg() {
        subtips = layer.tips("<span style='color:black'>Back to world map</span>", '#return-button', { tips: [2, 'white'], time: 30000 });
    }

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

var curCountry;

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
                    var city = $("#country").text();
                    init_echearts(city, true, 0.2);
                } else {
                    this.closeInfoWindow(_iw);
                    ll = false;
                    $(".md").animate({ width: '57%' }, 500); //用时1s
                    // $(".md").css({"width":"57%"});
                    $("#return-button").css("display", "inline");
                    $(".ms").css("display", "inline");
                    map.clearOverlays();
                    map.setMaxZoom(8);
                    map.setMinZoom(5);
                    var point = new BMap.Point(_marker.point["lng"], _marker.point["lat"]); //定义一个中心点坐标
                    map.setCenter(point, 18); //设定地图的中心点和坐标并将地图显示在地图容器中
                    $("#lng").text("longtitude:" + _marker.point["lng"]);
                    $("#lat").text("latitude:" + _marker.point["lat"]);
                    curCountry = $("#country").text();
                    initCity(curCountry);
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

function getSamplingInfo(country, city) {
    var url = '/fpbdb/getsamplinginfo?country=' + country + "&location=" + city + "&library=" + getUrlParam("library");
    getAjax(true, 'GET', url, null, 'json', function(json) {
        if (json.code == 200) {
            curCitySample = json.data;
            var data = statisticsSampleData(json.data, "source");
            var sampleids = "";
            for (var type in data) {
                sampleids += data[type].psampleids;
            }
            sampleids = sampleids.length > 0 ? sampleids.substring(0, sampleids.length - 1) : sampleids;
            curCityStrain = null;
            getStrain(country, city, sampleids, function(data) {
                curCityStrain = data;
            });
            $('#contamination-content').empty();
            $('#samplebar-div').empty();
            $('#strain-div').empty();
            var negativeSum = 0;
            var positiveSum = 0;
            var $total = $('<div class="layui-col-md6" id="total-con" style="width:40%;height:250px;"></div>');
            $total.appendTo($('#contamination-content'));
            for (var i in data) {
                var $div = $('<div class="layui-col-md3" style="width:30%;height:250px;"></div>');
                $div.appendTo($('#contamination-content'));
                negativeSum += parseInt(data[i].negative_num);
                positiveSum += parseInt(data[i].positive_num);
                initSampleContaminationChar($div, i, data[i].negative_num, data[i].positive_num, function(title, tparams) {
                    let data = statisticsSampleData(curCitySample, "detail_of_source", "source", title);
                    $('#samplebar-div').empty();
                    $('#strain-div').empty();
                    var $divbar = $('<div id="sample-bar" style="width:100%;height:200px; margin-top:20px; margin-right:20px;"></div>');
                    $divbar.appendTo($('#samplebar-div'));
                    showBar($divbar, data, title, function(params, cdata) {
                        if (params.seriesName == "Positive") {
                            if (curCityStrain != null) {
                                showStrain(curCityStrain, cdata[params.name].psampleids.split(","), params.name);
                            }
                        } else {
                            $('#strain-div').empty();
                        }
                    });
                });
            }
            $('#sample-bar').addClass("layui-hide");
            initSampleContaminationChar($total, 'Total', negativeSum, positiveSum, function(title, tparams) {
                let data = statisticsSampleData(curCitySample, "source");
                $('#samplebar-div').empty();
                $('#strain-div').empty();
                var $divbar = $('<div id="sample-bar" style="width:100%;height:200px; margin-top:20px; margin-right:20px;"></div>');
                $divbar.appendTo($('#samplebar-div'));
                showBar($divbar, data, title, function(params, cdata) {
                    if (params.seriesName == "Positive") {
                        if (curCityStrain != null) {
                            showStrain(curCityStrain, cdata[params.name].psampleids.split(","), params.name);
                        }
                    } else {
                        $('#strain-div').empty();
                    }
                });
            });
        } else {
            layer.msg(json.msg, { icon: 2 });
        }
    });
}

function statisticsSampleData(data, column, wcolumn, val) {
    var result = {};
    for (var i in data) {
        if (wcolumn && data[i][wcolumn] != val) {
            continue;
        }
        var vv = data[i][column];
        if (!containKey(result, vv)) {
            result[vv] = {};
            result[vv].negative_num = 0;
            result[vv].positive_num = 0;
            result[vv].psampleids = "";
        }
        if (data[i].sample_type == 'Positive') {
            result[vv].positive_num++;
            result[vv].psampleids += data[i].collection_id + ",";
        } else if (data[i].sample_type == 'Negative') {
            result[vv].negative_num++;
        }
    }
    return result;
}

function getSamplingDataSeriesData(negative, positive) {
    var seriesData = [];
    var sd1 = {};
    sd1.name = 'Positive';
    sd1.value = positive;
    seriesData.push(sd1);
    var sd2 = {};
    sd2.name = 'Negative';
    sd2.value = negative;
    seriesData.push(sd2);
    return seriesData;
}

function initSampleContaminationChar(ele, title, negative, positive, clickfun) {
    var legendData = [];
    legendData.push('Positive');
    legendData.push('Negative');
    var seriesData = getSamplingDataSeriesData(negative, positive);
    var chartInstance = echarts.init(ele[0]);
    var fsize = title.length>7?12:18;
    var ssize = title.length>7?10:12;
    var option = {
        title: {
            text: title,
            subtext: "Positive:" + positive + ",Negative:" + negative,
            x: 'center',
            textStyle:{fontSize:fsize},
            subtextStyle:{fontSize:ssize}
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            x: 'center',
            y: 'bottom',
            data: []
        },
        series: [{
            name: 'Sample',
            type: 'pie',
            radius: '70%',
            center: ['50%', '50%'],
            roseType: 'radius',
            data: [],
            label: {
                formatter: "{d}%",
                position: "inner"
            },
        }]
    };

    option.legend.data = legendData;
    option.series[0].data = seriesData;

    chartInstance.setOption(option);
    chartInstance.off('click');
    chartInstance.on('click', function(params) {
        clickfun(title, params);
    });
}

function getStrain(country, city, ids, callback) {
    var temp = {};
    // temp.Country = country;
    // temp.Location = city;
    temp.sampleids = ids;
    var url = '/fpbdb/getstrainphdata?library=' + getUrlParam("library");
    getAjax(true, 'POST', url, JSON.stringify(temp), 'json', function(json) {
        if (json.code == 200) {
            callback(json.data);
        } else {
            layer.msg(json.msg, { icon: 2 });
        }
    });
}

function showBar(ele, data, title, barclick) {
    let bartInstance = echarts.init(ele[0]);
    var dataset = {};
    dataset.dimensions = ['source', 'Positive', 'Negative'];
    dataset.source = [];
    var sampleids = "";
    for (var type in data) {
        var obj = { source: type, 'Positive': data[type].positive_num, 'Negative': data[type].negative_num };
        dataset.source.push(obj);
        sampleids += data[type].psampleids;
    }
    sampleids = sampleids.length > 0 ? sampleids.substring(0, sampleids, length - 1) : sampleids;
    bartInstance.setOption({
        title: {
            text: title
        },
        legend: {right:5},
        tooltip: {},
        dataset: dataset,
        xAxis: { type: 'category' },
        yAxis: {
            minInterval: 1
        },
        series: [
            { type: 'bar' },
            { type: 'bar' }
        ]
    });
    bartInstance.on('click', function(params) {
        barclick(params, data);
    });
}

function showStrain(data, ids, title) {
    data = uniq(data);
    $('#strain-div').empty();
    var sp = "";
    for (var i in data) {
        if (arrayContain(ids, data[i]["Collection ID"])) {
            var d = data[i].sequenced.toUpperCase();
            if (d == 'YES') {
                sp += "<label style='width:70px;text-align:center;'><a style='display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;' target='_blank' href='sequence_detailed.html?library=" + getUrlParam('library') + "&strain=" + data[i].Strain + "' class='layui-table-link'>" + data[i].Strain + "</a></label>";
            } else {
                sp += "<label style='width:70px;text-align:center;'><a style='display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:gray;' target='_blank'  class='layui-table-link'>" + data[i].Strain + "</a></label>";
            }
        }
    }
    if (sp != "") {
        $('#strain-div').html(title + ":<br>" + sp);
    }
}

function init_echearts(name, big_chart_flag, rate_title) {
    $('#sample-detail-div').removeClass("layui-hide");
    $('#curcity').text(name);
    getSamplingInfo(curCountry, name);
    return;
    var rate_title_per = rate_title * 100 + "%";
    $("#main").css("display", "none");
    $(".ms").css("display", "inline");
    $("#main_city").empty();
    $("#main_city").css("display", "none");
    var data_name = [];
    var data_series = [];
    var data_Rate = [];
    for (var i in china_map) {
        if (china_map[i]["city"] == name) {
            data_name.push(china_map[i]["type"]);
            data_Rate.push(china_map[i]["strain"].split(",").length);
            //data_series.push(parseInt(china_map[i]["rate"]));
        }
    }
    var sum = 0;
    for (var j in data_Rate) {
        sum += data_Rate[j];
    }
    for (var j in data_Rate) {
        // data_series.push(data_Rate[j]/sum*100);
        data_series.push(data_Rate[j]);
    }
    $("#main2").css("display", "block");
    var myChart = echarts.init(document.getElementById("main2"));

    if (big_chart_flag) {
        var tools = {
            myTool1: {
                show: true,
                title: 'View the big picture',
                icon: 'image://images/map/search.png',
                onclick: function() {
                    ff = false;
                    $("#main2").css({ "height": "550px", "width": "770px" });
                    $("#main_city").css({ "width": "770px" });
                    init_echearts(name, false, 0.1);
                    layer.open({
                        type: 1,
                        title: '',
                        area: ['770px', '650px'],
                        anim: 5,
                        content: $('.mr'),
                        cancel: function() {
                            $("#main2").css({ "height": "200px", "width": "100%" });
                            $("#main_city").css({ "width": "100%" });
                            init_echearts(name, true, 0.2);
                        },
                        end: function() {
                            $("#main2").css({ "height": "200px", "width": "100%" });
                            $("#main_city").css({ "width": "100%" });
                            init_echearts(name, true, 0.2);
                        }

                    });
                }
            },
            dataView: {},
            saveAsImage: {
                pixelRatio: 2
            }
        };
    } else {
        var tools = {};
    }

    myChart.setOption({
        title: {
            text: name,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'

            },
            formatter: function(datas) {
                let res = datas[0].name;
                let val;
                let length = datas.length;
                let i = 0
                for (; i < length; i++) {
                    val = datas[i].value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                    res += '<span style="display:inline;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:' + datas[i].color + ';"></span>' + '：' + val + '<br/>'
                }
                return res;
            }
        },
        toolbox: {
            // y: 'bottom',
            feature: tools,
        },

        grid: {
            show: false,
            height: '60%',
            width: '80%',
            top: rate_title_per,
            left: '15%',

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
                formatter: '{value} '
            },
            min: 0,
            max: 10,
            splitNumber: 5
        }],
        series: [{
            type: 'bar',
            barWidth: '40%',
            // barCateGoryGap:'20%',
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
        strain = uniq(strain);
        for (var s in strain) {
            sp += "<label style='width:70px;text-align:center;'><a style='display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;' target='_blank' href='sequence_detailed.html?library=" + getUrlParam('library') + "&strain=" + strain[s] + "' class='layui-table-link'>" + strain[s] + "</a></label>";
        }
        $("#main_city").html(params.name + ":<br>&emsp;" + sp);
        $("#main_city").css("display", "block");
    });

}

function uniq(array) {
    var data = [];
    var strains = [];
    for (var i in array) {
        if (!containKey(strains, array[i].Strain)) {
            data.push(array[i]);
        }
    }
    return data;
}

function initCity(city) {

    $("#map_size").text(city + " map");
    l = 0;
    var loadindex = layer.load(1, {
        shade: [0.1, '#fff'] //0.1透明度的白色背景
    });
    getAjax(true, 'GET', '/fpbdb/LOADCITYMAPDATA?library=' + getUrlParam("library") + "&country=" + city, null, 'json', function(json) {
        oldmarkerArr = markerArr;
        markerArr = [];
        $(".panel-body").empty();
        $(".un-panel-body").empty();
        $(".AF").empty();
        $(".GL").empty();
        $(".MR").empty();
        $(".SZ").empty();
        $(".UF").empty();
        $(".panel").css("display", "block");
        g = 0;
        for (var p in json.data.rs) {
            var districts = {};
            districts["title"] = p;
            districts["point"] = json.data.rs[p].longtitude + "|" + json.data.rs[p].latitude;
            districts["isOpen"] = 0;
            districts["icon"] = iocnall;
            markerArr.push(districts);
            addCity(p);
            g++;
            // $(".panel-body").append($po);
        }
        oldAllData = allData;
        allData = {};
        g += json.data.unCity.length;
        recursionGetPointMap(json.data.unCity, 0, function() {
            addMarker();
        });
        //delete json.data.data["unCity"];
        china_map = [];
        china_map = json.data.data;
        $('#return-button').removeClass('layui-btn-disabled').removeAttr('disabled', "true");
        layer.close(loadindex);
    });
}

function addCity(p) {
    var $po = "<label style='width:85px;'><a id=" + p + " href='javascript:void(0)' onclick='init_echearts(this.id,true,0.2)' style='display:inline;font-size: 13px;margin-right:5px;'>" + p + "</a></label>";
    if (p.substr(0, 1) == "A" || p.substr(0, 1) == "B" || p.substr(0, 1) == "C" || p.substr(0, 1) == "D" || p.substr(0, 1) == "E" || p.substr(0, 1) == "F") {
        $(".AF").append($po);
    }
    if (p.substr(0, 1) == "G" || p.substr(0, 1) == "H" || p.substr(0, 1) == "I" || p.substr(0, 1) == "J" || p.substr(0, 1) == "K" || p.substr(0, 1) == "L") {
        $(".GL").append($po);
    }
    if (p.substr(0, 1) == "M" || p.substr(0, 1) == "N" || p.substr(0, 1) == "O" || p.substr(0, 1) == "P" || p.substr(0, 1) == "Q" || p.substr(0, 1) == "R") {
        $(".MR").append($po);
    }
    if (p.substr(0, 1) == "S" || p.substr(0, 1) == "T" || p.substr(0, 1) == "U" || p.substr(0, 1) == "V" || p.substr(0, 1) == "W" || p.substr(0, 1) == "X" || p.substr(0, 1) == "Y" || p.substr(0, 1) == "Z") {
        $(".SZ").append($po);
    }
}

function recursionGetPointMap(cityNames, i, callback) {
    if (i >= cityNames.length) {
        callback();
    } else {
        getPointMap(cityNames[i], function(poi) {
            if (poi && poi != null) {
                var districts = {};
                districts["title"] = cityNames[i];
                districts["point"] = poi.point.lng + "|" + poi.point.lat;
                districts["isOpen"] = 0;
                districts["icon"] = iocnall;
                markerArr.push(districts);
                addCity(cityNames[i]);
            } else {
                var $po = "<label style='width:85px;'><a id=" + cityNames[i] + " href='javascript:void(0)' onclick='init_echearts(this.id,true,0.2)' style='display:inline;font-size: 13px;margin-right: 5px;'>" + cityNames[i] + "</a><label>";
                $(".UF").append($po);
            }
            recursionGetPointMap(cityNames, i + 1, callback);
        })
    }
}

function getPointMap(cityName, callback) {
    var lat = "";
    var lng = "";
    var map = new BMap.Map("container");
    var local = new BMap.LocalSearch(cityName, { renderOptions: { map: map } });
    local.setSearchCompleteCallback(function(results) {
        var poi = results.getPoi(0);
        callback(poi);
    });
    local.search(cityName);
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
                var $po = "<a id=" + position1 + " href='javascript:void(0)' onclick='init_echearts(this.id,true,0.2)' style='display:inline;font-size: 13px;'>" + position1 + "</a>";
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
                positionjson.cityName = position1;
                positionjson.longtitude = longtitude.toString();
                positionjson.latitude = latitude.toString();
                // getAjax(true, 'GET', '/fpbdb/INSERTCHINACITYLNGANDLAT?temp=' + JSON.stringify(positionjson), null, 'json', function(json) {

                // });
            } else {
                l++;
                $(".panel").css("display", "block");
                var $po = "<label style='width:85px;'><a id=" + position1 + " href='javascript:void(0)' onclick='init_echearts(this.id,true,0.2)' style='display:inline;font-size: 13px;margin-right: 5px;'>" + position1 + "</a><label>";
                $(".UF").append($po);
                // $(".un-panel-body").append($po);
                // if (l > 1) {
                //     layer.msg(l + " cities were not found," + (g - l) + "cities were found");
                // } else {
                //     layer.msg("a city were not found," + (g - l) + "cities were found");
                // }
            }
        }
    });
}

function getCnName(name) {
    var arr = [];
    arr = station_names.split('@');
    for (var i in arr) {
        var son = arr[i].split('|');
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
            // data_series.push(parseInt(china_map[i]["rate"]));
            data_series.push(7)
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
            //barWidth: '10%',
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
    layer.close(subtips);
    ll = true;
    map.clearOverlays();
    map.setMaxZoom(5);
    map.setMinZoom(1);
    allData = {};
    markerArr = [];
    allData = oldAllData;
    markerArr = oldmarkerArr;
    addMarker();
    //$(".md").animate({width:'100%'},600);
    $(".md").animate({ width: '100%', height: '600px' }, 500);
    //$("#allmap").animate({height:'600px',width:'100%'},500);
    $(".md").addClass("layui-col-md7");
    $(".ms").addClass("layui-col-md5");
    $(".mr").removeClass("layui-col-md7");
    $(".ml").removeClass("layui-col-md5");
    $("#main2").css({ "height": "200px", "width": "100%" });
    $(".panel").css("display", "none");
    $("#main").css("display", "none");
    $("#main2").css("display", "none");
    $(".ms").css("display", "none");
    $("#main_city").css("display", "none");
    $("#return-button").css("display", "none");
    $("#map_size").text("World map");
    // $(".md").css({"width":"80%"});
    $('#return-button').addClass('layui-btn-disabled').attr('disabled', "true");
    $('#contamination-content').empty();
    $('#strain-div').empty();
    $('#samplebar-div').empty();
    $('#sample-detail-div').addClass("layui-hide");

});

function getUrlParam(name) { //a标签跳转获取参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
}