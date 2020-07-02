(function() {
    "use strict";

    var mapInstance = null;
    var mapType = "country";
    var layer;
    var curCountry;
    var curCitySample = [];
    var curCityStrain = null;
    var subtips = 0;
    var layer;
    var worldnode = [];

    layui.use('layer', function() {
        layer = layui.layer;
        initMap();
        initBtn();
    });

    function initMap() {
        initWorldMap();
    }

    function initWorldMap() {
        getAjax(true, 'GET', '/fpbdb/getAllCountry?temp=' + getUrlParam("library"), null, 'json', function(json) {
            var node = [];
            if (json.code === 0) {
                let data = json.data;
                for (let i = 0; i < data.length; i++) {
                    node.push({ name: data[i]["country"], value: 50, type: "country" });
                }
            }
            mapType = "country";
            initGeoMap("world", node, getWorldGeoCoordMap());
        });
    }

    function initBtn() {
        $("#return-button").hover(function() {
            openMsg();
        }, function() {
            layer.close(subtips);
        });

        function openMsg() {
            subtips = layer.tips("<span style='color:black'>Back to world map</span>", '#return-button', { tips: [2, 'white'], time: 30000 });
        }
        $("#return-button").unbind('click').bind('click', function() {
            layer.close(subtips);
            $(".md").animate({ width: '100%', height: '600px' }, 500, "swing", function() {
                initWorldMap();
            });
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
            $('#contamination-content').empty();
            $('#strain-div').empty();
            $('#samplebar-div').empty();
            $('#sample-detail-div').addClass("layui-hide");
        });
    }

    function getWorldGeoCoordMap() {
        var geoCoordMap = [];
        let add = worldnode.length == 0;
        let i = 0;
        $.each(worlds, function(j, item) {
            geoCoordMap[item.name] = [item.longitude, item.latitude];
            if (add) {
                worldnode.push({ name: item.name, value: i });
                i++;
                i = i > 3 ? 0 : i;
            }
        });
        return geoCoordMap;
    }

    function initCountryMap(country) {
        getAjax(true, 'GET', '/fpbdb/LOADCITYMAPDATA?library=' + getUrlParam("library") + "&country=" + country, null, 'json', function(json) {
            var node = [];
            var geoCoordMap = {};
            initCountry2CityInfoPanel();
            for (var p in json.data.rs) {
                node.push({ name: p, value: 50, type: "city" });
                geoCoordMap[p] = [json.data.rs[p].longtitude, json.data.rs[p].latitude];
                var $po = $("<label style='width:85px;'><a id=" + p + " href='javascript:void(0)'  style='display:inline;font-size: 13px;margin-right:5px;'>" + p + "</a></label>");
                $po.find("a").off('click').on('click', function() {
                    init_echearts(this.id, true, 0.2);
                });
                var charCode = p.substr(0, 1).toUpperCase().charCodeAt();
                if (charCode >= "A".charCodeAt() && charCode <= "F".charCodeAt()) {
                    $(".AF").append($po);
                } else if (charCode >= "G".charCodeAt() && charCode <= "L".charCodeAt()) {
                    $(".GL").append($po);
                } else if (charCode >= "M".charCodeAt() && charCode <= "R".charCodeAt()) {
                    $(".MR").append($po);
                } else if (charCode >= "S".charCodeAt() && charCode <= "Z".charCodeAt()) {
                    $(".SZ").append($po);
                }
            }
            mapType = "city";
            $(".md").animate({ width: '57%' }, 500, "swing", function() {
                initGeoMap(country, node, geoCoordMap);
            });
        });
    }

    function initCountry2CityInfoPanel() {
        $("#return-button").css("display", "inline");
        $(".ms").css("display", "inline");
        // $(".panel-body").empty();
        // $(".un-panel-body").empty();
        $(".AF").empty();
        $(".GL").empty();
        $(".MR").empty();
        $(".SZ").empty();
        $(".UF").empty();
        $(".panel").css("display", "block");
    }

    function initGeoMap(map, node, geoCoordMap) {
        var colornode = map == 'world' ? getWorldNode() : (map == 'China' ? getProvinceNode() : []);
        var areac = map == 'world'?'#eeeeee':'#d3d3d3';
        var nshow = map == 'world';
        if (mapInstance != null) {
            mapInstance.render({ map: { map: map,areaColor: areac }, node: node,nodeStyle:{normalLabelShow:nshow}, geoCoordMap: geoCoordMap, colorArea: { node: colornode,colorInRange: [areac] } });
            return;
        }
        var config = {
            elem: '#map',
            backgroundColor: '#ffffff',
            map: {
                map: map,
                areaColor: areac,
                borderColor: '#3B5077',
                emphasisAreaColor: '#2B91B7',
                scale: true,
                move: true
            },
            tooltip:false,
            titleText: 'Map',
            titleColor: '#aaa',
            titleSubtext: 'Virus distribution map',
            titleSubColor: '#aaa',
            node: node,
            nodeStyle: {
                color: '#00467F',
                minSize: 9,
                maxSize: 9,
                normalLabelShow:nshow,
                emphasisLabelShow:true
            },
            line: null,
            colorArea: {
                node: colornode,
                minValue: 0,
                maxValue: 3,
                colorInRange: [areac],
                text: ['高', '低'],
                textColor: '#7B93A7',
                show: true,
                showbar:false
            },
            // colorArea: {
            //     show: false
            // },
            geoCoordMap: geoCoordMap,
            nodeOnclick: function(data) {
                if (mapType === "country") {
                    curCountry = data.name;
                    $("#map_size").text(data.name + " map");
                    $("#lng").text("longtitude:" + data.value[0]);
                    $("#lat").text("latitude:" + data.value[1]);
                    initCountryMap(data.name);
                } else {
                    init_echearts(data.name, true, 0.2);
                }
            },
            areaOnclick: function(data) {
                // console.log(data);
                // if (mapType === "country") {
                //     initCountryMap(data);
                // }
                // mapInstance.render({ map: { map: data } });
            }
        }
        mapInstance = new GeoMap(config);
        mapInstance.init();
    }

    function init_echearts(name, big_chart_flag, rate_title) {
        $('#sample-detail-div').removeClass("layui-hide");
        $('#curcity').text(name);
        getSamplingInfo(curCountry, name);
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

    function getStrain(country, city, ids, callback) {
        var temp = {};
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
            legend: {},
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

    function initSampleContaminationChar(ele, title, negative, positive, clickfun) {
        var legendData = [];
        legendData.push('Positive');
        legendData.push('Negative');
        var seriesData = getSamplingDataSeriesData(negative, positive);
        var chartInstance = echarts.init(ele[0]);
        var option = {
            title: {
                text: title,
                subtext: "Positive:" + positive + ",Negative:" + negative,
                x: 'center'
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

    function getWorldNode() {
        return worldnode;
    }

    function getProvinceNode() {
        return [
            { name: '天津', value: 0 },
            { name: '北京', value: 1 },
            { name: '上海', value: 2 },
            {
                name: '重庆',
                value: 3
            },
            {
                name: '河北',
                value: 0
            },
            {
                name: '河南',
                value: 1
            },
            {
                name: '云南',
                value: 2
            },
            {
                name: '辽宁',
                value: 3
            },
            {
                name: '黑龙江',
                value: 0
            },
            {
                name: '湖南',
                value: 1
            },
            {
                name: '安徽',
                value: 2
            },
            {
                name: '山东',
                value: 3
            },
            {
                name: '新疆',
                value: 0
            },
            {
                name: '江苏',
                value: 1
            },
            {
                name: '浙江',
                value: 2
            },
            {
                name: '江西',
                value: 3
            },
            {
                name: '湖北',
                value: 0
            },
            {
                name: '广西',
                value: 1
            },
            {
                name: '甘肃',
                value: 2
            },
            {
                name: '山西',
                value: 3
            },
            {
                name: '内蒙古',
                value: 0
            },
            {
                name: '陕西',
                value: 1
            },
            {
                name: '吉林',
                value: 2
            },
            {
                name: '福建',
                value: 3
            },
            {
                name: '贵州',
                value: 0
            },
            {
                name: '广东',
                value: 1
            },
            {
                name: '青海',
                value: 2
            },
            {
                name: '西藏',
                value: 3
            },
            {
                name: '四川',
                value: 0
            },
            {
                name: '宁夏',
                value: 1
            },
            {
                name: '海南',
                value: 2
            },
            {
                name: '台湾',
                value: 3
            },
            {
                name: '香港',
                value: 0
            },
            {
                name: '澳门',
                value: 1
            }
        ]
    };

})();