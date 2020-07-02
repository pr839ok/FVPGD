// 加载formSelects插件
(function () {
    layui.config({
        base: '/gosweb/plugins/layui-formSelects-master/src/' //此处路径请自行处理, 可以使用绝对路径
    }).extend({
        formSelects: 'formSelects-v4'
    });
})();
//util
var visualUtil = {
    //获取layui初始化
    init: function (callback) {

        var obj = {};
        layui.use(['element', 'table', 'form', 'formSelects'], function () {
            obj.element = layui.element;
            obj.table = layui.table;
            obj.form = layui.form;
            obj.formSelects = layui.formSelects;

            if (callback && typeof callback === 'function') {
                callback(obj);
            }
        });
    },

    //检查数据——检查是否有缺漏的数据
    checkData: function (data) {
        var mainLength = data[0].length;

        for (var i = 1; i < data.length; i++) {
            if (data[i].length !== mainLength) {
                layer.closeAll();
                layer.msg("请传入正确格式的数据！", {icon: 2});
                throw new Error("data is invalid!");
            }
        }
        return true;
    },

    //检查传入对象子属性非空
    cheakNotNull: function (data) {
        let value = Object.keys(data);

        for (let i = 0; i < value.length; i++) {
            if (data[value[i]] === undefined || data[value[i]] === "") {
                return false;
            }
        }
        return true;
    },

    // 分离表头与数据
    getDataCombina: function (data) {
        let dataCol = [],
            dataValue = [],
            flag = false;

        if (visualUtil.checkData(data)) {
            flag = true;
            //获取表头
            for (let i = 0; i < data[0].length; i++) {
                dataCol.push(data[0][i]);
                dataValue.push([]);
            }
            //获取数据
            for (let i = 1; i < data.length; i++) {
                for (let j = 0; j < dataCol.length; j++) {
                    dataValue[j].push(data[i][j]);
                }
            }
        }

        return {
            dataCol: dataCol,
            dataValue: dataValue,
            flag: flag
        };
    },


    // 初始化svg dom
    initSVGDom: function (svgSelector, padding) {

        $(svgSelector).empty();
        var svg = d3.select(svgSelector)
            .append('svg')
            .attr('class', 'set-svg')
            .attr('width', '100%')
            .attr('height', '100%');

        // options.svg = svg;

        svg.append('g')
            .attr('class', 'axisgroup')
            .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

        //提示框
        d3.select(svgSelector).append("div")
            .attr("class", "tooltip");

        return svg;
    },

    //坐标轴
    // domain: ,        定义域
    // range: ,         值域
    // rangeRound ,     四舍五入的值域
    // axis: 0,         坐标轴方向： 0 - 左；1- 下； 2 - 右； 3 - 上
    // axisTranslate: [0, height],  坐标轴偏移量
    // text: ,          坐标标题
    // textTranslate: , 坐标标题偏移
    // type: 0,         尺度类型： 0 - 线性比例尺; 1 - 序数比例尺； 2 - 区域比例尺
    // tick: false,     是否出现刻度
    // tickSize: false, 是否延长线
    setAxis: function (svg, obj) {
        let scale, axis;

        if (obj === null || typeof obj === "undefined") {
            throw new Error("obj does not exist!");
        }

        if (typeof obj.type === "undefined") {
            throw new Error("type does not exist!");
        }
        if (typeof obj.axis === "undefined" || obj.axis < 0 || obj.axis > 3) {
            throw new Error("axis does not exist!");
        }

        if (obj.type === 0) {
            scale = d3.scaleLinear().clamp(true);
        } else if (obj.type === 1) {
            scale = d3.scaleOrdinal();
        } else if (obj.type === 2) {
            scale = d3.scaleBand();
        } else {
            throw new Error("error scaleType!");
        }

        if(typeof obj.paddingOuter !== "undefined"){
            scale.paddingOuter(obj.paddingOuter);
        }

        if (obj.axis === 0) {
            axis = d3.axisLeft();
        } else if (obj.axis === 1) {
            axis = d3.axisBottom();
        } else if (obj.axis === 2) {
            axis = d3.axisRight();
        } else if (obj.axis === 3) {
            axis = d3.axisTop();
        } else {
            throw new Error("error axisType!");
        }

        if (typeof obj.range !== "undefined") {
            scale.domain(obj.domain)
                .range(obj.range);
        } else if (typeof obj.rangeRound !== "undefined") {
            scale.domain(obj.domain)
                .rangeRound(obj.rangeRound);
        }

        axis.scale(scale);

        if (obj.tick !== false && typeof obj.tick !== "undefined") {
            axis.ticks(obj.tick);
        }
        if (obj.tickSize !== false && typeof obj.tickSize !== "undefined") {
            axis.tickSize(obj.tickSize);
        }

        let g = svg
            .select('.axisgroup')
            .append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + obj.axisTranslate[0] + ',' + obj.axisTranslate[1] + ')')
            .call(axis);

        if (typeof obj.text !== "undefined") {
            g.append('text')           //  x轴文字描述
                .text(obj.text)
                .attr('stroke', '#808080')
                .attr('transform', 'translate(' + obj.textTranslate[0] + ', ' + obj.textTranslate[1] + ')');
        }

        return {
            scale: scale,
            axis: g
        };
    },

    //自定义数组 .sort()比较，使用于数字
    numSort: function (a, b) {
        return a - b;
    },

    //求以2为底的对数
    toLog2: function (data) {
        return Math.log2(data);
    },

    //求以10为底的负对数
    toLog10: function (data) {
        return -1 * Math.log10(data);
    },

    // svg边界溢出处理
    resize: function (selector) {
        let origin = document.querySelector(selector).getBBox();

        $(selector)
            .attr('viewBox', origin.x.toFixed(2) + ' ' + origin.y.toFixed(2) + ' ' + origin.width.toFixed(2) + ' ' + origin.height.toFixed(2));
    },

    //图形提示框鼠标事件
    toolTipEvent: function (e, svgSelector, tooltip, msg) {
        d3.select(e).on('mouseover', function (data) {
            tooltip.transition().duration(400).style("opacity", .9).style("z-index","99999");
            tooltip.html(msg);
            })
            .on('mousemove', function () {
                tooltip.style("left", (d3.event.pageX - $(svgSelector).offset().left) + "px")
                    .style("top", (d3.event.pageY - 28 - $(svgSelector).offset().top) + "px");
            })
            .on('mouseout', function () {
                tooltip.transition().duration(400).style("opacity", 0).style("z-index","-1");
                d3.select(this).transition("tooltip").duration(400);
            })
    },
    // 下载按钮
    initDownload: function (type) {
        var buttonmsg = '<button id="downloadSVG" class="layui-btn layui-btn-xs layui-btn-primary" style="position: absolute;right: 10px;top: 10px" title="下载"><i class="layui-icon" style="margin-right: 0">&#xe601;</i></button>';
        $('#svg-box').prepend(buttonmsg);

        $('#downloadSVG').off('click').on('click', function () {
            var svgimg = $('#svg-box svg')[0];

            var config = {
                backgroundColor: '#fff',
                encoderType: 'image/jpeg',
                encoderOptions: 1
            }

            // 检查svg元素偏移量
            if (svgimg.hasAttribute('viewBox')) {
                let view = svgimg.getAttribute('viewBox');
                view = view.split(' ');
                let left = view[0],
                    top = view[1];

                config.left = left;
                config.top = top;
            }
            saveSvgAsPng(svgimg, type + ".jpg", config);
        })
    },
    //更新联动渲染
    initFormRendering: function (id,diff,value, filter){

        $(id).empty();

        var msg = ''

        for (let i = 0; i < value.length; i++) {
            msg = msg + '<option value="'+ i +'">' + value[i] + '</option>';
        }
        $(msg).appendTo(id);
        visualUtil.initDiff(diff,value,0);

        visualUtil.init(function (obj) {
            obj.form.on('select(' + filter +')',function (data) {
                visualUtil.initDiff(diff,value,data.value);
            });

            obj.form.render();
        })
    },

    // 子联动渲染
    initDiff: function (diff,data,value){
        $(diff).empty();

        var msg = ''

        for (let i = 0; i < data.length; i++) {
            if(i != value){
                msg = msg + '<option value="'+ i +'">' + data[i] + '</option>';
            }
        }
        $(msg).appendTo(diff);

        visualUtil.init(function (obj) {
            obj.form.render();
        })
    },};


// 常量
const visualParam = {
    // d3内置图形
    symbolArray: [
        {value: d3.symbolCircle, name: '圆圈'},
        {value: d3.symbolCross, name: '加号'},
        {value: d3.symbolDiamond, name: '菱形'},
        {value: d3.symbolSquare, name: '方形'},
        {value: d3.symbolStar, name: '五角星'},
        {value: d3.symbolTriangle, name: '三角形'},
        {value: d3.symbolWye, name: 'Y型'}
    ],

    //颜色列表
    color: {
        schemeCategory10: d3.scaleOrdinal(d3.schemeCategory10),
        schemePastel1: d3.scaleOrdinal(d3.schemePastel1),
        ordinalFour: d3.scaleOrdinal().domain([0, 1, 2, 3]).range(['green', 'red', 'black', 'purple']),
        ordinalThree: d3.scaleOrdinal([0,1,2],['red','green','black']),
    },


};
