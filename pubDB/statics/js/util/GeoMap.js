/*
    开发者：bxh
    使用场景：生成一个地图插件（点、线、区域）
    插件需求：jquery.js
    参数说明：请查看下面config注释
    使用方法：
        var mapInstance = new GeoMap(config);
        mapInstance.init();
*/

var GeoMap = (function() {
    "use strict";
    var config = {
        elem: null, //html元素
        backgroundColor: '#080a20', //背景颜色
        map: {
            map: 'china', //地图
            areaColor: '#132937', //区域颜色
            borderColor: '#0692a4', //边界颜色
            emphasisAreaColor: '#0b1c2d', //区域高亮颜色
            scale: true, //可否缩放
            move: true //可否移动
        },
        tooltip: true,
        titleText: '地图标题', //标题
        titleSubtext: '字标题', //子标题
        titleColor: '#aaa',
        titleSubColor: '#aaa',
        node: null, //显示节点[{ name: "地点名", value: "" }]，value用于控制节点显示大小
        line: null, //连线，[{ from: "地点名1", to: "地点名2" }]
        nodeStyle: {
            color: '#ffa022', //节点颜色
            minSize: 5, //节点显示的最小大小
            maxSize: 30, //节点显示的最大大小
            normalLabelShow: true, //节点lable是否显示
            emphasisLabelShow: true //高亮节点lable是否显示
        },
        colorArea: { //区域染色
            node: null, //节点[{ name: "地点名", value: "" }]，value用于控制颜色深浅
            minValue: 0, //最小染色值
            maxValue: 200, //最大染色值
            colorInRange: ['#00467F', '#A5CC82'], //色彩范围，可以n种颜色
            text: ['高', '低'], //色彩栏标签
            textColor: '#7B93A7', //色彩栏标签文字颜色
            show: true, //series是否显示染色
            showbar: true,
            nameMap: null //自定义名称映射 {'实际地图中的名称':'data中的名称'}
        },
        geoCoordMap: _getChinaCoordMap(), //节点经纬度 {"地点名": ["经", "纬"]}
        nodeOnclick: null, //节点点击事件callback
        areaOnclick: null, //区域点击事件callback
    }

    var GeoMapFun = function(_config) {
        var that = this;
        that.config = $.extend({}, config, _config);
        if (!that.config.elem) {
            throw new Error('GeoMap config elem param is invalid.');
        }
    }

    GeoMapFun.prototype.init = function() {
        var that = this;
        var series = _constructSeries(that.config, that.config.node, that.config.line, that.config.geoCoordMap);
        var option = {
            backgroundColor: that.config.backgroundColor,
            title: {
                text: that.config.titleText,
                subtext: that.config.titleSubtext,
                left: 'left',
                textStyle: {
                    color: that.config.titleColor
                },
                subtextStyle: {
                    color: that.config.titleSubColor
                }
            },
            tooltip: {
                show: that.config.tooltip,
                formatter: function(params) {
                    if (params.name && params.data) {
                        return params.name + '：' + params.data['value'];
                    } else {
                        return '';
                    }
                },
            },
            geo: {
                map: that.config.map.map,
                label: {
                    emphasis: {
                        show: true,
                        color: '#fff'
                    }
                },
                roam: _isRoam(that.config.map.scale, that.config.map.move),
                itemStyle: {
                    normal: {
                        areaColor: that.config.map.areaColor,
                        borderColor: that.config.map.borderColor
                    },
                    emphasis: {
                        areaColor: that.config.map.emphasisAreaColor
                    }
                }
            },
            series: series
        };
        if (that.config.colorArea && that.config.colorArea.show) {
            option["visualMap"] = {
                text: that.config.colorArea.text,
                showLabel: true,
                show: that.config.colorArea.showbar,
                seriesIndex: [0],
                min: that.config.colorArea.minValue,
                max: that.config.colorArea.maxValue,
                calculable: true,
                inRange: {
                    color: that.config.colorArea.colorInRange
                },
                textStyle: {
                    color: that.config.colorArea.textColor
                },
                left: 'left',
                top: 'bottom',
            }
        }
        _initMap(that.config, option, that);
    }

    GeoMapFun.prototype.render = function(newConfig) {
        var that = this;
        if (newConfig) {
            that.oldConfig = $.extend({}, that.config);
            that.config = $.extend(true, {}, that.config, newConfig);
            //数据覆盖不合并
            if (newConfig.line) {
                that.config.line = newConfig.line;
            }
            if (newConfig.colorArea && newConfig.colorArea.node) {
                that.config.colorArea.node = newConfig.colorArea.node;
            }
            if (newConfig.node) {
                that.config.node = newConfig.node;
            }
        }
        this.init();
    }

    function _initMap(config, option, that) {
        if (!config.map.map) {
            throw new Error('GeoMap config map param is invalid.');
        }
        var mapJs = _getCountryMapJs(config.map.map) || _getChinaProvinceMapJs(config.map.map);
        if (mapJs) {
            $.getScript('statics/js/util/map/' + mapJs.js, function() {
                option.geo.map = mapJs.key;
                config.map.map = mapJs.key;
                if (that.chartInstance != null) {
                    that.chartInstance.clear();
                    that.chartInstance.dispose();
                }
                that.chartInstance = _initChartInstance(option, config);
            });
        } else {
            throw new Error('GeoMap config map param is invalid.');
        }
    }

    function _initChartInstance(option, config) {
        var myChart = echarts.init($(config.elem)[0]);
        myChart.off('click');
        myChart.on('click', function(params) {
            if ((params.componentType && params.componentType === "geo") ||
                (params.componentSubType && params.componentSubType === "map")) {
                if (config.areaOnclick && typeof(config.areaOnclick) === "function") {
                    config.areaOnclick(params);
                }
            } else if (params.componentType && params.componentType === "series" &&
                params.componentSubType && params.componentSubType === "effectScatter") {
                if (config.nodeOnclick && typeof(config.nodeOnclick) === "function") {
                    config.nodeOnclick(params.data);
                }
            }
        });
        // console.log(JSON.stringify(option));
        myChart.setOption(option);
        return myChart;
    }

    function _constructSeries(config, node, line, geoCoordMap) {
        return [].concat(_getMapSeries(config, config.colorArea.node), __getNodeSeries(config, node, geoCoordMap),
            __getLineSeries(config, line, geoCoordMap));
    }

    function __getNodeSeries(config, node, geoCoordMap) {
        if (!node || !node.length || node.length <= 0) return [];
        var sortedNode = $.extend([], node).sort(function(item1, item2) {
            return item1.value > item2.value;
        });
        var minValue = sortedNode[0].value;
        var maxValue = sortedNode[sortedNode.length - 1].value;
        return [{
            name: 'nodeSeries',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 2,
            rippleEffect: {
                brushType: 'stroke'
            },
            label: {
                normal: {
                    show: config.nodeStyle.normalLabelShow,
                    position: 'right',
                    formatter: '{b}'
                },
                emphasis: {
                    show: config.nodeStyle.emphasisLabelShow,
                    position: 'right',
                    formatter: '{b}'
                }
            },
            symbolSize: function(val) {
                return config.nodeStyle.minSize == config.nodeStyle.maxSize ? config.nodeStyle.maxSize :
                    (config.nodeStyle.minSize + (val[2] - minValue) / (maxValue - minValue) *
                        (config.nodeStyle.maxSize - config.nodeStyle.minSize));
            },
            itemStyle: {
                normal: {
                    color: config.nodeStyle.color
                }
            },
            data: node.filter(function(dataItem) {
                return geoCoordMap[dataItem.name];
            }).map(function(dataItem) {
                return {
                    name: dataItem.name,
                    value: geoCoordMap[dataItem.name].concat([dataItem.value])
                };
            }),
        }];
    }

    function __getLineSeries(config, line, geoCoordMap) {
        if (!line || !line.length || line.length <= 0) return [];
        var PLANE_PATH = 'path://M.6,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705';
        return [{
            name: 'lineSeries1',
            type: 'lines',
            zlevel: 1,
            effect: {
                show: true,
                period: 6,
                trailLength: 0.7,
                color: '#fff',
                symbolSize: 3
            },
            lineStyle: {
                normal: {
                    color: config.nodeStyle.color,
                    width: 0,
                    curveness: 0.2
                }
            },
            data: _convertData(line, geoCoordMap)
        }, {
            name: 'lineSeries2',
            type: 'lines',
            zlevel: 2,
            effect: {
                show: true,
                period: 6,
                trailLength: 0,
                symbol: PLANE_PATH,
                symbolSize: 15
            },
            lineStyle: {
                normal: {
                    color: config.nodeStyle.color,
                    width: 1,
                    opacity: 0.4,
                    curveness: 0.2
                }
            },
            data: _convertData(line, geoCoordMap)
        }];
    }

    function _getMapSeries(config, node) {
        if (!node || !node.length || node.length <= 0) return [];
        var series = [{
            type: 'map',
            map: config.map.map,
            geoIndex: 0,
            label: {
                show: true,
                position: 'right',
                formatter: '{b}'
            },
            roam: _isRoam(config.map.scale, config.map.move),
            itemStyle: {
                normal: {
                    areaColor: config.map.areaColor,
                    borderColor: config.map.borderColor
                },
                emphasis: {
                    areaColor: config.map.emphasisAreaColor
                }
            },
            animation: false,
            data: node
        }];
        if (config.colorArea.nameMap) {
            series[0].nameMap = config.colorArea.nameMap
        }
        return series;
    }

    function _convertData(lineArray, geoCoordMap) {
        var res = [];
        for (var i = 0; i < lineArray.length; i++) {
            var aline = lineArray[i];
            var fromCoord = geoCoordMap[aline.from];
            var toCoord = geoCoordMap[aline.to];
            if (fromCoord && toCoord) {
                res.push([{
                    coord: fromCoord
                }, {
                    coord: toCoord
                }]);
            }
        }
        return res;
    };

    function _isRoam(scale, move) {
        return scale ? (move ? true : 'scale') : (move ? 'move' : false);
    }

    function _getCountryMapJs(key) {
        if (!key) return undefined;
        return {
            "china": { key: "china", js: "china.js" },
            "中国": { key: "china", js: "china.js" },
            "world": { key: "world", js: "world.js" },
            "世界": { key: "world", js: "world.js" },
        } [key.toLocaleLowerCase()];
    }

    function _getChinaProvinceMapJs(key) {
        if (!key) return undefined;
        return {
            "anhui": { key: "安徽", js: "province/anhui.js" },
            "安徽": { key: "安徽", js: "province/anhui.js" },
            "aomen": { key: "澳门", js: "province/aomen.js" },
            "澳门": { key: "澳门", js: "province/aomen.js" },
            "beijing": { key: "北京", js: "province/beijing.js" },
            "北京": { key: "北京", js: "province/beijing.js" },
            "chongqing": { key: "重庆", js: "province/chongqing.js" },
            "重庆": { key: "重庆", js: "province/chongqing.js" },
            "fujian": { key: "福建", js: "province/fujian.js" },
            "福建": { key: "福建", js: "province/fujian.js" },
            "gansu": { key: "甘肃", js: "province/gansu.js" },
            "甘肃": { key: "甘肃", js: "province/gansu.js" },
            "guangdong": { key: "广东", js: "province/guangdong.js" },
            "广东": { key: "广东", js: "province/guangdong.js" },
            "guangxi": { key: "广西", js: "province/guangxi.js" },
            "广西": { key: "广西", js: "province/guangxi.js" },
            "guizhou": { key: "贵州", js: "province/guizhou.js" },
            "贵州": { key: "贵州", js: "province/guizhou.js" },
            "hainan": { key: "海南", js: "province/hainan.js" },
            "海南": { key: "海南", js: "province/hainan.js" },
            "hebei": { key: "河北", js: "province/hebei.js" },
            "河北": { key: "河北", js: "province/hebei.js" },
            "heilongjiang": { key: "黑龙江", js: "province/heilongjiang.js" },
            "黑龙江": { key: "黑龙江", js: "province/heilongjiang.js" },
            "henan": { key: "河南", js: "province/henan.js" },
            "河南": { key: "河南", js: "province/henan.js" },
            "hubei": { key: "湖北", js: "province/hubei.js" },
            "湖北": { key: "湖北", js: "province/hubei.js" },
            "hunan": { key: "湖南", js: "province/hunan.js" },
            "湖南": { key: "湖南", js: "province/hunan.js" },
            "jiangsu": { key: "江苏", js: "province/jiangsu.js" },
            "江苏": { key: "江苏", js: "province/jiangsu.js" },
            "jiangxi": { key: "江西", js: "province/jiangxi.js" },
            "江西": { key: "江西", js: "province/jiangxi.js" },
            "jilin": { key: "吉林", js: "province/jilin.js" },
            "吉林": { key: "吉林", js: "province/jilin.js" },
            "liaoning": { key: "辽宁", js: "province/liaoning.js" },
            "辽宁": { key: "辽宁", js: "province/liaoning.js" },
            "neimenggu": { key: "内蒙古", js: "province/neimenggu.js" },
            "内蒙古": { key: "内蒙古", js: "province/neimenggu.js" },
            "ningxia": { key: "宁夏", js: "province/ningxia.js" },
            "宁夏": { key: "宁夏", js: "province/ningxia.js" },
            "qinghai": { key: "青海", js: "province/qinghai.js" },
            "青海": { key: "青海", js: "province/qinghai.js" },
            "shandong": { key: "山东", js: "province/shandong.js" },
            "山东": { key: "山东", js: "province/shandong.js" },
            "shanghai": { key: "上海", js: "province/shanghai.js" },
            "上海": { key: "上海", js: "province/shanghai.js" },
            "shanxi": { key: "山西", js: "province/shanxi.js" },
            "山西": { key: "山西", js: "province/shanxi.js" },
            "shanxi1": { key: "陕西", js: "province/shanxi1.js" },
            "陕西": { key: "陕西", js: "province/shanxi1.js" },
            "sichuan": { key: "四川", js: "province/sichuan.js" },
            "四川": { key: "四川", js: "province/sichuan.js" },
            "taiwan": { key: "台湾", js: "province/taiwan.js" },
            "台湾": { key: "台湾", js: "province/taiwan.js" },
            "tianjin": { key: "天津", js: "province/tianjin.js" },
            "天津": { key: "天津", js: "province/tianjin.js" },
            "xianggang": { key: "香港", js: "province/xianggang.js" },
            "香港": { key: "香港", js: "province/xianggang.js" },
            "xinjiang": { key: "新疆", js: "province/xinjiang.js" },
            "新疆": { key: "新疆", js: "province/xinjiang.js" },
            "xizang": { key: "西藏", js: "province/xizang.js" },
            "西藏": { key: "西藏", js: "province/xizang.js" },
            "yunnan": { key: "云南", js: "province/yunnan.js" },
            "云南": { key: "云南", js: "province/yunnan.js" },
            "zhejiang": { key: "浙江", js: "province/zhejiang.js" },
            "浙江": { key: "浙江", js: "province/zhejiang.js" },
        } [key.toLocaleLowerCase()];
    }

    function _getChinaCoordMap() {
        return {
            "北京": [116.395645, 39.929986],
            "上海": [121.487899, 31.249162],
            "天津": [117.210813, 39.14393],
            "重庆": [106.530635, 29.544606],
            "安徽": [117.216005, 31.859252],
            "合肥": [117.282699, 31.866942],
            "安庆": [117.058739, 30.537898],
            "蚌埠": [117.35708, 32.929499],
            "亳州": [115.787928, 33.871211],
            "巢湖": [117.88049, 31.608733],
            "池州": [117.494477, 30.660019],
            "滁州": [118.32457, 32.317351],
            "阜阳": [115.820932, 32.901211],
            "淮北": [116.791447, 33.960023],
            "淮南": [117.018639, 32.642812],
            "黄山": [118.29357, 29.734435],
            "六安": [116.505253, 31.755558],
            "马鞍山": [118.515882, 31.688528],
            "宿州": [116.988692, 33.636772],
            "铜陵": [117.819429, 30.94093],
            "芜湖": [118.384108, 31.36602],
            "宣城": [118.752096, 30.951642],
            "福建": [117.984943, 26.050118],
            "福州": [119.330221, 26.047125],
            "龙岩": [117.017997, 25.078685],
            "南平": [118.181883, 26.643626],
            "宁德": [119.542082, 26.656527],
            "莆田": [119.077731, 25.44845],
            "泉州": [118.600362, 24.901652],
            "三明": [117.642194, 26.270835],
            "厦门": [118.103886, 24.489231],
            "漳州": [117.676205, 24.517065],
            "甘肃": [102.457625, 38.103267],
            "兰州": [103.823305, 36.064226],
            "白银": [104.171241, 36.546682],
            "定西": [104.626638, 35.586056],
            "甘南": [102.917442, 34.992211],
            "嘉峪关": [98.281635, 39.802397],
            "金昌": [102.208126, 38.516072],
            "酒泉": [98.508415, 39.741474],
            "临夏": [103.215249, 35.598514],
            "陇南": [104.934573, 33.39448],
            "平凉": [106.688911, 35.55011],
            "庆阳": [107.644227, 35.726801],
            "天水": [105.736932, 34.584319],
            "武威": [102.640147, 37.933172],
            "张掖": [100.459892, 38.93932],
            "广东": [113.394818, 23.408004],
            "广州": [113.30765, 23.120049],
            "潮州": [116.630076, 23.661812],
            "东莞": [113.763434, 23.043024],
            "佛山": [113.134026, 23.035095],
            "河源": [114.713721, 23.757251],
            "惠州": [114.410658, 23.11354],
            "江门": [113.078125, 22.575117],
            "揭阳": [116.379501, 23.547999],
            "茂名": [110.931245, 21.668226],
            "梅州": [116.126403, 24.304571],
            "清远": [113.040773, 23.698469],
            "汕头": [116.72865, 23.383908],
            "汕尾": [115.372924, 22.778731],
            "韶关": [113.594461, 24.80296],
            "深圳": [114.025974, 22.546054],
            "阳江": [111.97701, 21.871517],
            "云浮": [112.050946, 22.937976],
            "湛江": [110.365067, 21.257463],
            "肇庆": [112.479653, 23.078663],
            "中山": [113.42206, 22.545178],
            "珠海": [113.562447, 22.256915],
            "东沙群岛": [117.309186, 19.083978],
            "广西": [108.924274, 23.552255],
            "南宁": [108.297234, 22.806493],
            "百色": [106.631821, 23.901512],
            "北海": [109.122628, 21.472718],
            "崇左": [107.357322, 22.415455],
            "防城港": [108.351791, 21.617398],
            "桂林": [110.26092, 25.262901],
            "贵港": [109.613708, 23.103373],
            "河池": [108.069948, 24.699521],
            "贺州": [111.552594, 24.411054],
            "来宾": [109.231817, 23.741166],
            "柳州": [109.422402, 24.329053],
            "钦州": [108.638798, 21.97335],
            "梧州": [111.305472, 23.485395],
            "玉林": [110.151676, 22.643974],
            "贵州": [106.734996, 26.902826],
            "贵阳": [106.709177, 26.629907],
            "安顺": [105.92827, 26.228595],
            "毕节": [105.300492, 27.302612],
            "六盘水": [104.852087, 26.591866],
            "铜仁": [109.196161, 27.726271],
            "遵义": [106.93126, 27.699961],
            "黔西南": [104.900558, 25.095148],
            "黔东南": [107.985353, 26.583992],
            "黔南": [107.523205, 26.264536],
            "海南": [100.624066, 36.284364],
            "海口": [110.330802, 20.022071],
            "白沙": [109.358586, 19.216056],
            "保亭": [109.656113, 18.597592],
            "昌江": [109.0113, 19.222483],
            "儋州": [109.413973, 19.571153],
            "澄迈": [109.996736, 19.693135],
            "东方": [108.85101, 18.998161],
            "定安": [110.32009, 19.490991],
            "琼海": [110.414359, 19.21483],
            "琼中": [109.861849, 19.039771],
            "乐东": [109.062698, 18.658614],
            "临高": [109.724101, 19.805922],
            "陵水": [109.948661, 18.575985],
            "三亚": [109.522771, 18.257776],
            "屯昌": [110.063364, 19.347749],
            "万宁": [110.292505, 18.839886],
            "文昌": [110.780909, 19.750947],
            "五指山": [109.51775, 18.831306],
            "三沙": [112.342491, 16.843901],
            "西沙群岛": [111.79977, 16.219423],
            "南沙群岛": [114.736439, 10.370353],
            "河北": [115.661434, 38.61384],
            "石家庄": [114.522082, 38.048958],
            "保定": [115.49481, 38.886565],
            "沧州": [116.863806, 38.297615],
            "承德": [117.933822, 40.992521],
            "邯郸": [114.482694, 36.609308],
            "衡水": [115.686229, 37.746929],
            "廊坊": [116.703602, 39.518611],
            "秦皇岛": [119.604368, 39.945462],
            "唐山": [118.183451, 39.650531],
            "邢台": [114.520487, 37.069531],
            "张家口": [114.893782, 40.811188],
            "河南": [113.486804, 34.157184],
            "济源": [112.609183, 35.073092],
            "郑州": [113.649644, 34.75661],
            "安阳": [114.351807, 36.110267],
            "鹤壁": [114.29777, 35.755426],
            "焦作": [113.211836, 35.234608],
            "开封": [114.351642, 34.801854],
            "洛阳": [112.447525, 34.657368],
            "漯河": [114.046061, 33.576279],
            "南阳": [112.542842, 33.01142],
            "平顶山": [113.300849, 33.745301],
            "濮阳": [115.026627, 35.753298],
            "三门峡": [111.181262, 34.78332],
            "商丘": [115.641886, 34.438589],
            "新乡": [113.91269, 35.307258],
            "信阳": [114.085491, 32.128582],
            "许昌": [113.835312, 34.02674],
            "周口": [114.654102, 33.623741],
            "驻马店": [114.049154, 32.983158],
            "黑龙江": [128.047414, 47.356592],
            "哈尔滨": [126.657717, 45.773225],
            "大庆": [125.02184, 46.596709],
            "大兴安岭": [124.196104, 51.991789],
            "鹤岗": [130.292472, 47.338666],
            "黑河": [127.50083, 50.25069],
            "鸡西": [130.941767, 45.32154],
            "佳木斯": [130.284735, 46.81378],
            "牡丹江": [129.608035, 44.588521],
            "七台河": [131.019048, 45.775005],
            "齐齐哈尔": [123.987289, 47.3477],
            "双鸭山": [131.171402, 46.655102],
            "绥化": [126.989095, 46.646064],
            "伊春": [128.910766, 47.734685],
            "湖北": [112.410562, 31.209316],
            "武汉": [114.3162, 30.581084],
            "鄂州": [114.895594, 30.384439],
            "恩施": [109.517433, 30.308978],
            "黄冈": [114.906618, 30.446109],
            "黄石": [115.050683, 30.216127],
            "荆门": [112.21733, 31.042611],
            "荆州": [112.241866, 30.332591],
            "潜江": [112.768768, 30.343116],
            "神农架": [110.487231, 31.595768],
            "十堰": [110.801229, 32.636994],
            "随州": [113.379358, 31.717858],
            "天门": [113.12623, 30.649047],
            "仙桃": [113.387448, 30.293966],
            "咸宁": [114.300061, 29.880657],
            "襄阳": [112.176326, 32.094934],
            "孝感": [113.935734, 30.927955],
            "宜昌": [111.310981, 30.732758],
            "湖南": [111.720664, 27.695864],
            "长沙": [112.979353, 28.213478],
            "常德": [111.653718, 29.012149],
            "郴州": [113.037704, 25.782264],
            "衡阳": [112.583819, 26.898164],
            "怀化": [109.986959, 27.557483],
            "娄底": [111.996396, 27.741073],
            "邵阳": [111.461525, 27.236811],
            "湘潭": [112.935556, 27.835095],
            "湘西": [109.745746, 28.317951],
            "益阳": [112.366547, 28.588088],
            "永州": [111.614648, 26.435972],
            "岳阳": [113.146196, 29.378007],
            "张家界": [110.48162, 29.124889],
            "株洲": [113.131695, 27.827433],
            "江苏": [119.368489, 33.013797],
            "南京": [118.778074, 32.057236],
            "常州": [119.981861, 31.771397],
            "淮安": [119.030186, 33.606513],
            "连云港": [119.173872, 34.601549],
            "南通": [120.873801, 32.014665],
            "苏州": [120.619907, 31.317987],
            "宿迁": [118.296893, 33.95205],
            "泰州": [119.919606, 32.476053],
            "无锡": [120.305456, 31.570037],
            "徐州": [117.188107, 34.271553],
            "盐城": [120.148872, 33.379862],
            "扬州": [119.427778, 32.408505],
            "镇江": [119.455835, 32.204409],
            "江西": [115.676082, 27.757258],
            "南昌": [115.893528, 28.689578],
            "抚州": [116.360919, 27.954545],
            "赣州": [114.935909, 25.845296],
            "吉安": [114.992039, 27.113848],
            "景德镇": [117.186523, 29.303563],
            "九江": [115.999848, 29.71964],
            "萍乡": [113.859917, 27.639544],
            "上饶": [117.955464, 28.457623],
            "新余": [114.947117, 27.822322],
            "宜春": [114.400039, 27.81113],
            "鹰潭": [117.03545, 28.24131],
            "吉林": [126.564544, 43.871988],
            "长春": [125.313642, 43.898338],
            "白城": [122.840777, 45.621086],
            "白山": [126.435798, 41.945859],
            "辽源": [125.133686, 42.923303],
            "四平": [124.391382, 43.175525],
            "松原": [124.832995, 45.136049],
            "通化": [125.94265, 41.736397],
            "延边": [129.485902, 42.896414],
            "辽宁": [122.753592, 41.6216],
            "沈阳": [123.432791, 41.808645],
            "鞍山": [123.007763, 41.118744],
            "本溪": [123.778062, 41.325838],
            "朝阳": [120.446163, 41.571828],
            "大连": [121.593478, 38.94871],
            "丹东": [124.338543, 40.129023],
            "抚顺": [123.92982, 41.877304],
            "阜新": [121.660822, 42.01925],
            "葫芦岛": [120.860758, 40.74303],
            "锦州": [121.147749, 41.130879],
            "辽阳": [123.172451, 41.273339],
            "盘锦": [122.073228, 41.141248],
            "铁岭": [123.85485, 42.299757],
            "营口": [122.233391, 40.668651],
            "内蒙古": [114.415868, 43.468238],
            "呼和浩特": [111.660351, 40.828319],
            "阿拉善": [105.695683, 38.843075],
            "包头": [109.846239, 40.647119],
            "巴彦淖尔": [107.423807, 40.76918],
            "赤峰": [118.930761, 42.297112],
            "鄂尔多斯": [109.993706, 39.81649],
            "呼伦贝尔": [119.760822, 49.201636],
            "通辽": [122.260363, 43.633756],
            "乌海": [106.831999, 39.683177],
            "乌兰察布": [113.112846, 41.022363],
            "锡林郭勒": [116.02734, 43.939705],
            "兴安盟": [122.048167, 46.083757],
            "宁夏": [106.155481, 37.321323],
            "银川": [106.206479, 38.502621],
            "固原": [106.285268, 36.021523],
            "石嘴山": [106.379337, 39.020223],
            "吴忠": [106.208254, 37.993561],
            "中卫": [105.196754, 37.521124],
            "青海": [96.202544, 35.499761],
            "西宁": [101.767921, 36.640739],
            "果洛": [100.223723, 34.480485],
            "海东": [102.085207, 36.51761],
            "海北": [100.879802, 36.960654],
            "海西": [97.342625, 37.373799],
            "黄南": [102.0076, 35.522852],
            "玉树": [97.013316, 33.00624],
            "山东": [118.527663, 36.09929],
            "济南": [117.024967, 36.682785],
            "滨州": [117.968292, 37.405314],
            "东营": [118.583926, 37.487121],
            "德州": [116.328161, 37.460826],
            "菏泽": [115.46336, 35.26244],
            "济宁": [116.600798, 35.402122],
            "莱芜": [117.684667, 36.233654],
            "聊城": [115.986869, 36.455829],
            "临沂": [118.340768, 35.072409],
            "青岛": [120.384428, 36.105215],
            "日照": [119.50718, 35.420225],
            "泰安": [117.089415, 36.188078],
            "威海": [122.093958, 37.528787],
            "潍坊": [119.142634, 36.716115],
            "烟台": [121.309555, 37.536562],
            "枣庄": [117.279305, 34.807883],
            "淄博": [118.059134, 36.804685],
            "山西": [112.515496, 37.866566],
            "太原": [112.550864, 37.890277],
            "长治": [113.120292, 36.201664],
            "大同": [113.290509, 40.113744],
            "晋城": [112.867333, 35.499834],
            "晋中": [112.738514, 37.693362],
            "临汾": [111.538788, 36.099745],
            "吕梁": [111.143157, 37.527316],
            "朔州": [112.479928, 39.337672],
            "忻州": [112.727939, 38.461031],
            "阳泉": [113.569238, 37.869529],
            "运城": [111.006854, 35.038859],
            "陕西": [109.503789, 35.860026],
            "西安": [108.953098, 34.2778],
            "安康": [109.038045, 32.70437],
            "宝鸡": [107.170645, 34.364081],
            "汉中": [107.045478, 33.081569],
            "商洛": [109.934208, 33.873907],
            "铜川": [108.968067, 34.908368],
            "渭南": [109.483933, 34.502358],
            "咸阳": [108.707509, 34.345373],
            "延安": [109.50051, 36.60332],
            "榆林": [109.745926, 38.279439],
            "四川": [102.89916, 30.367481],
            "成都": [104.067923, 30.679943],
            "阿坝": [102.228565, 31.905763],
            "巴中": [106.757916, 31.869189],
            "达州": [107.494973, 31.214199],
            "德阳": [104.402398, 31.13114],
            "甘孜": [101.969232, 30.055144],
            "广安": [106.63572, 30.463984],
            "广元": [105.819687, 32.44104],
            "乐山": [103.760824, 29.600958],
            "凉山": [102.259591, 27.892393],
            "泸州": [105.44397, 28.89593],
            "南充": [106.105554, 30.800965],
            "眉山": [103.84143, 30.061115],
            "绵阳": [104.705519, 31.504701],
            "内江": [105.073056, 29.599462],
            "攀枝花": [101.722423, 26.587571],
            "遂宁": [105.564888, 30.557491],
            "雅安": [103.009356, 29.999716],
            "宜宾": [104.633019, 28.769675],
            "资阳": [104.63593, 30.132191],
            "自贡": [104.776071, 29.359157],
            "西藏": [89.137982, 31.367315],
            "拉萨": [91.111891, 29.662557],
            "阿里": [81.107669, 30.404557],
            "昌都": [97.185582, 31.140576],
            "林芝": [94.349985, 29.666941],
            "那曲": [92.067018, 31.48068],
            "日喀则": [88.891486, 29.269023],
            "山南": [91.750644, 29.229027],
            "新疆": [85.614899, 42.127001],
            "乌鲁木齐": [87.564988, 43.84038],
            "阿拉尔": [81.291737, 40.61568],
            "阿克苏": [80.269846, 41.171731],
            "阿勒泰": [88.137915, 47.839744],
            "巴音郭楞": [86.121688, 41.771362],
            "博尔塔拉": [82.052436, 44.913651],
            "昌吉": [87.296038, 44.007058],
            "哈密": [93.528355, 42.858596],
            "和田": [79.930239, 37.116774],
            "喀什": [75.992973, 39.470627],
            "克拉玛依": [84.88118, 45.594331],
            "克孜勒苏": [76.137564, 39.750346],
            "石河子": [86.041865, 44.308259],
            "塔城": [82.974881, 46.758684],
            "图木舒克": [79.198155, 39.889223],
            "吐鲁番": [89.181595, 42.96047],
            "五家渠": [87.565449, 44.368899],
            "伊犁": [81.297854, 43.922248],
            "云南": [101.592952, 24.864213],
            "昆明": [102.714601, 25.049153],
            "保山": [99.177996, 25.120489],
            "楚雄": [101.529382, 25.066356],
            "大理": [100.223675, 25.5969],
            "德宏": [98.589434, 24.44124],
            "迪庆": [99.713682, 27.831029],
            "红河": [103.384065, 23.367718],
            "丽江": [100.229628, 26.875351],
            "临沧": [100.092613, 23.887806],
            "怒江": [98.859932, 25.860677],
            "普洱": [100.980058, 22.788778],
            "曲靖": [103.782539, 25.520758],
            "昭通": [103.725021, 27.340633],
            "文山": [104.089112, 23.401781],
            "西双版纳": [100.803038, 22.009433],
            "玉溪": [102.545068, 24.370447],
            "浙江": [119.957202, 29.159494],
            "杭州": [120.219375, 30.259244],
            "湖州": [120.137243, 30.877925],
            "嘉兴": [120.760428, 30.773992],
            "金华": [119.652576, 29.102899],
            "丽水": [119.929576, 28.4563],
            "宁波": [121.579006, 29.885259],
            "衢州": [118.875842, 28.95691],
            "绍兴": [120.592467, 30.002365],
            "台州": [121.440613, 28.668283],
            "温州": [120.690635, 28.002838],
            "舟山": [122.169872, 30.03601],
            "香港": [114.186124, 22.293586],
            "澳门": [113.557519, 22.204118],
            "台湾": [120.961454, 23.80406],
            "台北": [121.489971, 25.094466]
        };
    }

    return GeoMapFun;
})();