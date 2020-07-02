;(function (win) {

    "use strict";

    // 全局变量
    var _global = {
        svgdata: [],
        uploaddata: {},
        selectIndex: [],
    };

    //配置
    var _config = {
        svgWidth: 600,
        svgHeight: 600,
        svgPadding: {left: 30, right: 60, top: 30, bottom: 30}
    };

    // 构造函数
    var bubbleChart = function (config) {
        if (_tool.checkConfig(config)) {
            _global.svg = visualUtil.initSVGDom(config.svgSelector, _config.svgPadding);
            _config = $.extend({}, _config, config);
            _tool.init();
            bubbleChart.prototype.type = "bubbleChart";
            bubbleChart.prototype.initflag = false;
        }
    };

    // API方法
    bubbleChart.prototype = {
        //生成参数配置模块
        initParamBar: function () {

            // 监听提交按钮
            visualUtil.init(function (obj) {

                $(_config.paramPanels).empty();
                $(_param.paramPaneldom).appendTo(_config.paramPanels);
                obj.form.render();

                obj.form.on('submit(drawSVG)', function (d) {
                    if(bubbleChart.prototype.initflag){
                        let data = _tool.initSVGSelectData(_global.dataCol, _global.dataValue, d.field.color_scale_type);

                        _tool.drawSVGPic(data);

                        visualUtil.initDownload(bubbleChart.prototype.type)

                        visualUtil.resize('.set-svg');
                    }else{
                        layer.msg('请先上传数据', {icon:2})
                    }
                });
            });
        },

        // 传入数据列
        dataCol: function (data) {
            let combinaData = visualUtil.getDataCombina(data);

            if(combinaData.flag){
                bubbleChart.prototype.initflag = true;

                _tool.setParamBar();

                _global.dataCol = combinaData.dataCol;
                _global.dataValue = combinaData.dataValue;

            }else{
                layer.msg('数据有缺失项，请重新上传！', {icon: 2, time: 2000});
                bubbleChart.prototype.initflag = false;
                throw new Error("the format of uploadData is not valid!");
            }
        }


    };

    // 内部方法
    var _tool = {
        //对象初始化处理
        init: function () {
            _global.svgdata = [];
            _global.uploaddata = {};
            _global.selectIndex = [];
        },
        // 检查变量合法
        checkConfig: function (config) {

            if (typeof config === "undefined") {
                throw new Error("scatterPlot config do not exit");
            }
            if (typeof config.paramPanels === "undefined" || $(config.paramPanels).length === 0) {
                throw new Error("scatterPlot paramPanels do not exit");
            }
            if (typeof config.svgSelector === "undefined" || $(config.svgSelector).length === 0) {
                throw new Error("scatterPlot svgSelector do not exit");
            }

            return true;
        },

        //设置参数配置
        setParamBar: function () {

            _tool.initParamDom();
            visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);


        },

        // 初始化参数栏
        initParamDom: function () {
            $('#chart-title').empty();
            $('#svg-box').empty();
            $('#chart-title').html('<span style="color: red">数据上传成功，请配置图形参数</span>');

            _global.dataCol = [];
            _global.dataValue = [];

            $('#size').val('20');
        },

        // 初始化图形数据
        initSVGSelectData: function (col, value, type) {
            var length = $('#size').val();
            if(length > value[0].length){
                layer.msg("作图行不能超过文件最大行!",{icon:2, time: 2000});
                return false;
            }else{
                var ydata = [];
                var xdata = [];
                var size = [];
                var colorSize = [];

                for (let i = 0; i < length; i++) {
                    ydata.push(value[0][i]);
                    size.push(value[1][i]);
                    xdata.push(value[1][i] / value[2][i]);

                    // 若数据低于0.000000001， 则取0.000000001
                    colorSize.push(value[3][i] > 0.000000001? value[3][i] : 0.000000001);
                }

                let data = {};
                data.ydata = ydata;
                data.xdata = xdata;
                data.size = size;
                data.colorSize = colorSize;
                data.type = type;

                return data;
            }
        },

        // 绘图
        drawSVGPic: function (data) {
            _global.svg = visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);
            let svgSelector = _config.svgSelector;

            let svgwidth = _config.svgWidth;
            let svgheight = _config.svgHeight;
            let padding = _config.svgPadding;

            let width = svgwidth - padding.left - padding.right;
            let height = svgheight - padding.top - padding.bottom;

            let svg = _global.svg,
                g = svg.select('g');

            //提示框
            let tooltip = d3.select(".tooltip");

            // 比例尺
            let x = visualUtil.setAxis(svg, {
                domain: [d3.min(data.xdata)-0.05, d3.max(data.xdata)+ 0.05],
                range: [0, width],
                axis: 1,
                type: 0,
                tick: 4,
                tickSize: -1 * height,
                axisTranslate: [0, height],
                text: "RichFactor",
                textTranslate: [width / 2, 28],
            });

            let y = visualUtil.setAxis(svg, {
                domain: data.ydata,
                rangeRound: [height, 0],
                type: 2,
                axis: 0,
                tickSize: -1 * width,
                paddingOuter: 0.5,
                axisTranslate: [0, 0],
                text: "Pathway",
                textTranslate: [0, -10]
            })

            let sizeScale = d3.scaleLinear()
                .domain([d3.min(data.size), d3.max(data.size)])
                .range([3,8]);

            let colorScale = _param.colorScaleType(data.type).colorScale;

            //数据点
            g.append('g')
                .attr('class','point')
                .selectAll('circle')
                .data(data.xdata)
                .enter()
                .append('circle')
                .attr('cx',function (d,i) {
                    return x.scale(d);
                })
                .attr('cy',function (d,i) {
                    return y.scale(data.ydata[i]) + y.scale.bandwidth() / 2;
                })
                .attr('r',function (d,i) {
                    return sizeScale(data.size[i]);
                })
                .attr('fill',function (d,i) {
                    return colorScale(data.colorSize[i]);
                })
                .on('mouseover', function (d, i) {
                    tooltip.transition().duration(400).style("opacity", .9);
                    tooltip.style("left", (d3.event.pageX - $(svgSelector).offset().left) + "px")
                        .style("top", (d3.event.pageY - 28 - $(svgSelector).offset().top) + "px");
                    tooltip.html("<div>richfactor:"+data.ydata[i]+"</div><div> Pvalue:" + data.colorSize[i] + "</div><div> 第二列:" + data.size[i] + "</div>");
                    y.axis.selectAll('g.tick > text')
                        .filter(function (data, index ) {
                        return index === i;
                    }).style('stroke','rgba(0,0,0,.7)');
                })
                .on('mousemove', function () {
                    tooltip.style("left", (d3.event.pageX - $(svgSelector).offset().left) + "px")
                        .style("top", (d3.event.pageY - 28 - $(svgSelector).offset().top) + "px");
                })
                .on('mouseout', function (d, i) {
                    tooltip.transition().duration(400).style("opacity", 0)
                        .style("left","auto").style("top","auto");
                    d3.select(this).transition("tooltip").duration(400);
                    y.axis.selectAll('g.tick > text')
                        .filter(function (data, index ) {
                            return index === i;
                        }).style('stroke','rgba(0,0,0,.3)');
                })

            //侧标识
            let identify = svg.append('g')
                .attr("transform", "translate(" + (padding.left + width) + "," + (padding.top + 50) + ")");

            // 气泡大小标志
            let identifyNum = identify.append('g');
            identifyNum.append('text')
                .attr("transform", "translate(10, 0)")
                .text('GeneNumber')
                .attr('font-size', '15px');
            $.each([25, 50, 75], function (index, element) {
                var identifyItem = identifyNum.append('g')
                    .attr("transform", "translate(" + 0 + "," + (index * 45) + ")")
                    .attr('class', 'input-group');

                identifyItem.append('circle')
                    .attr('cx','30')
                    .attr('cy','10')
                    .attr('r',sizeScale(element))

                identifyItem.append('text')
                    .text(element)
                    .attr('transform','translate(23,28)')
                    .attr('font-size','12px');
            });

            // 颜色深浅标志
            let identifyColor = identify.append('g')
                .attr("transform", "translate(10, 200)");
            identifyColor.append('text')
                .text('Pvalue')
                .attr('font-size', '15px');

            let linearGradient = identifyColor.append('defs')
                .append('linearGradient')
                .attr('id', 'gradirntColor')
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '0%')
                .attr('y2', '100%');

            linearGradient.append('stop')
                .attr('offset', '0%')
                .style('stop-color', 'green')
                .style('stop-opacity', '1');
            linearGradient.append('stop')
                .attr('offset', '100%')
                .style('stop-color', 'red')
                .style('stop-opacity', '1');

            let gradientScale = _param.colorScaleType(data.type).colorLineScale
            let identifyColorGroup = identifyColor.append('g')
                .attr('class', 'identifyColorGroup')
                .attr('transform','translate(0,30)')

            identifyColorGroup.append('rect')
                .attr('fill', 'url(#gradirntColor)')
                .attr('x', '10')
                .attr('y', '20')
                .attr('width', '30')
                .attr('height', '150');
            $.each(_param.colorScaleType(data.type).data, function (index, element) {
                identifyColorGroup.append('line')
                    .attr('x1', '10')
                    .attr('y1', gradientScale(element))
                    .attr('x2', '40')
                    .attr('y2', gradientScale(element))
                    .attr('stroke', 'white');

                identifyColorGroup.append('text')
                    .text(element)
                    .attr('transform','translate(50,'+ gradientScale(element) + ')')
                    .attr('font-size','12px');
            })
        },
    };

    // 内部常量
    const _param = {
        paramPaneldom:
            '<div class="layui-card">\n' +
            '    <div class="layui-card-header" id="chart-title"></div>\n' +
            '    <div class="layui-card-body">\n' +
            '        <div class="layui-form" style="position: relative;">\n' +
            '            <div class="card-title">参数设置</div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">作图行:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <input class="layui-input" autocomplete="off" id="size" lay-verify="required|number"/>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">颜色参数:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <select name="color_scale_type" lay-verify="required">\n' +
            '                         <option value="0">0.01</option>' +
            '                         <option value="1" selected>0.05</option>' +
            '                    </select>' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item">\n' +
            '                <button class="layui-btn" lay-submit lay-filter="drawSVG" style="margin-left: calc(50% - 28px);">生成图像</button>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '    </div>\n' +
            '</div>',
        colorScaleType: function (type) {
            let colorScale = d3.scaleSequential().interpolator(d3.interpolateRdYlGn),
                colorLineScale = d3.scaleLinear().range([170, 20]),
                data = [];
            if(type == 0){
                colorScale.domain([0.001, 0.02]);
                colorLineScale.domain([0.001, 0.02]);
                data = [0.005, 0.01, 0.015];
            }else if(type == 1){
                colorScale.domain([0.02, 0.09]);
                colorLineScale.domain([0.02, 0.09]);
                data = [0.025, 0.05, 0.075];
            }

            return {
                colorScale: colorScale,
                colorLineScale: colorLineScale,
                data: data
            }
        }
    }

    win.bubbleChart = bubbleChart;

})(window);