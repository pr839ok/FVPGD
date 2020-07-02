;(function (win) {

    "use strict";

    // 全局变量
    var _global = {
        svgdata: [],
        uploaddata: {},
    };

    //配置
    var _config = {
        svgWidth: 600,
        svgHeight: 600,
        svgPadding: {left: 30, right: 60, top: 30, bottom: 30}
    };

    // 构造函数
    var MAPlot = function (config) {
        if (_tool.checkConfig(config)) {
            _global.svg = visualUtil.initSVGDom(config.svgSelector, _config.svgPadding);
            _config = $.extend({}, _config, config);
            _tool.init();
            MAPlot.prototype.type = "MAPlot";
            MAPlot.prototype.initflag = false;
        }
    };

    MAPlot.prototype = {
        //生成参数配置模块
        initParamBar: function () {

            visualUtil.init(function (obj) {

                $(_config.paramPanels).empty();
                $(_param.paramPaneldom).appendTo(_config.paramPanels);
                obj.form.render();

                //提交按钮
                obj.form.on('submit(drawSVG)', function (value) {

                    if(MAPlot.prototype.initflag){

                        let data = _tool.initSVGSelectData(value, _global.dataValue);

                        _tool.drawSVGPic(data);

                        visualUtil.initDownload(MAPlot.prototype.type)

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

                MAPlot.prototype.initflag = true;

                _tool.setParamBar(combinaData.dataCol);

                _global.dataCol = combinaData.dataCol;
                _global.dataValue = combinaData.dataValue;
            }else{
                layer.msg('数据有缺失项，请重新上传！', {icon: 2, time: 2000});
                MAPlot.prototype.initflag = false;
                throw new Error("the format of uploadData is not valid!");
            }

        }
    }

    // 内部方法
    var _tool = {
        //对象初始化处理
        init: function () {
            _global.svgdata = [];
            _global.uploaddata = {};
            _global.selectIndex = [];
            _global.selectlFlag = false;
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

        // 设置参数栏
        setParamBar: function (dataCol) {
            _tool.initParamDom();
            visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);


            visualUtil.initFormRendering('#r-value', '#g-value', dataCol, 'rValue');

            let msg = ''

            for (let i = 0; i < dataCol.length; i++) {
                msg = msg + '<option value="'+ i +'">' + dataCol[i] + '</option>';
            }
            $(msg).appendTo('#p-value');

            visualUtil.init(function (obj) {
                obj.form.render();
            })

        },

        // 重置参数栏
        initParamDom: function () {
            //初始处理
            $('#r-value').empty();
            $('#g-value').empty();
            $('#p-value').empty();

            $('#p').val('0.05');
            $('#diff').val('2');

            $('#x-axis-name').val('A');
            $('#y-axis-name').val('M');

            _global.dataCol = [];
            _global.dataValue = [];

            $('#chart-title').html('<span style="color: red">数据上传成功，请配置图形参数</span>');
        },


        // 计算SVG图像数据
        initSVGSelectData: function (value, dataValue) {
            let data = {};
            let p = parseFloat(value.field.p),
                diff = visualUtil.toLog2(parseFloat(value.field.diff));

            let xmin, xmax, ymin, ymax;

            data.xname = value.field.xname;
            data.yname = value.field.yname;

            data.data = [];
            for (let i = 0; i < dataValue[0].length; i++) {
                let temp = new Array();

                let g = dataValue[parseInt(value.field.gValue)][i];
                let p_value = dataValue[parseInt(value.field.pValue)][i];
                let r = dataValue[parseInt(value.field.rValue)][i];

                //计算X值、Y值
                temp.m = visualUtil.toLog2(g / r);
                temp.a = visualUtil.toLog2(r * g) / 2;


                //计算类型
                if(temp.m > diff && p_value < p){
                    temp.size = 0;
                }else if(temp.m < -1 * diff && p_value < p){
                    temp.size = 1;
                }else{
                    temp.size = 2;
                }

                // 计算X轴Y轴最值
                if(!xmin || xmin > temp.a){
                    xmin = temp.a;
                }
                if(!xmax || xmax < temp.a){
                    xmax = temp.a;
                }
                if(!ymin || ymin > temp.m){
                    ymin = temp.m;
                }
                if(!ymax || ymax < temp.m){
                    ymax = temp.m;
                }

                data.data.push(temp);
            }

            data.xmin = xmin;
            data.xmax = xmax;
            data.ymin = ymin;
            data.ymax = ymax;

            return data;
        },

        // 绘制图形
        drawSVGPic: function (value) {
            _global.svg = visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);
            let svgSelector = _config.svgSelector;

            let svgwidth = _config.svgWidth;
            let svgheight = _config.svgHeight;
            let padding = _config.svgPadding;
            let color = visualParam.color.ordinalThree;

            let width = svgwidth - padding.left - padding.right;
            let height = svgheight - padding.top - padding.bottom;

            let svg = _global.svg,
                g = svg.select('g');

            //提示框
            let tooltip = d3.select(".tooltip");


            let x = visualUtil.setAxis(svg, {
                domain:[Math.floor(value.xmin), Math.ceil(value.xmax)],
                range: [0, width],
                type: 0,
                axis: 1,
                axisTranslate: [0, height],
                text: value.xname,
                textTranslate: [width / 2, 28],
            });
            let y = visualUtil.setAxis(svg,{
                domain: [Math.floor(value.ymin), Math.ceil(value.ymax)],
                range: [height, 0],
                axis: 0,
                type: 0,
                axisTranslate: [0, 0],
                text: value.yname,
                textTranslate: [0, -10]
            });

            //基准线
            var boundaryLine =  g.append('g')
                .attr('class','boundary-line');

            boundaryLine.append('line')
                .attr('x1', 0)
                .attr('y1', y.scale(0))
                .attr('x2', width)
                .attr('y2', y.scale(0));

            $(".boundary-line > line").css({
                "stroke": "#8C468C",
                "stroke-dasharray": "1,1"
            });

            // 数据点
            var dataArea = g.append('g')
                .attr('class','data-area');

            dataArea.selectAll('circle')
                .attr('class', 'data-circle')
                .data(value.data)
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                    return x.scale(d.a);
                })
                .attr('cy',function (d) {
                    return y.scale(d.m);
                })
                .attr('r', 2)
                //颜色
                .each(function (d) {
                    let self = d3.select(this);
                    let classname;
                    if(d.size == 0){
                        classname = 'data-up';
                    }else if(d.size == 1){
                        classname = 'data-down';
                    }else if(d.size == 2){
                        classname = 'data-no';
                    }

                    self.attr('class',classname)
                        .attr('fill', color(d.size));
                });

            // 侧边栏
            var identify = svg.append('g')
                .attr('class','dataIdentify')
                .attr("transform", "translate(" + (padding.left + width) + "," + padding.top + ")");
            $.each(['up', 'down', 'no'], function (index, element) {
                var identifyItem = identify.append('g')
                    .attr("transform", "translate(" + 0 + "," + (index * 45) + ")")
                    .attr('id', 'symbol_' + element)
                    .attr('class', 'input-group');

                identifyItem.append('circle')
                    .attr('class','symbol_' + element + ' input-group-text colorpicker-input-addon')
                    .attr('cx','30')
                    .attr('cy','10')
                    .attr('r','3')
                    .attr('fill',color(index))

                identifyItem.append('text')
                    .text(element)
                    .attr('transform','translate(23,28)')
                    .attr('font-size','12px');

                //初始化颜色
                var tempObj = $('#symbol_' + element);

                var mycolor = color(index);

                tempObj.colorpicker({
                    color: mycolor,
                    format: "rgb",
                });

                //颜色变化渲染
                tempObj.on('colorpickerChange', function (e) {
                    $('.set-svg').find('.symbol_' + element).each(function () {
                        $(this).attr('fill', e.color.toString());
                    })

                    $('.set-svg').find('.data-' + element).each(function () {
                        $(this).attr('fill', e.color.toString());
                    })
                })
            })
        },
    }

    // 内部常量
    const _param = {
        paramPaneldom:
            '<div class="layui-card">\n' +
            '    <div class="layui-card-header" id="chart-title"></div>\n' +
            '    <div class="layui-card-body">\n' +
            '        <div class="layui-form" style="position: relative;">\n' +
            '            <div class="card-title">参数设置</div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">R值:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <select id="r-value" name="rValue" lay-verify="required" lay-filter="rValue"></select>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">G值:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <select id="g-value" name="gValue" lay-verify="required" lay-filter="gValue"></select>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">P-value:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <select id="p-value" name="pValue" lay-verify="required"></select>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">差异倍数:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <input class="layui-input" autocomplete="off" id="diff" name="diff" lay-verify="required"/>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">P值:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <input class="layui-input" autocomplete="off" id="p" name="p" lay-verify="required"/>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">x轴名:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <input class="layui-input" autocomplete="off" id="x-axis-name" name="xname" lay-verify="required"/>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">y轴名:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <input class="layui-input" autocomplete="off" id="y-axis-name" name="yname" lay-verify="required"/>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item">\n' +
            '                <button class="layui-btn" lay-submit lay-filter="drawSVG" style="margin-left: calc(50% - 28px);">生成图像</button>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '    </div>\n' +
            '</div>'
    }

    win.MAPlot = MAPlot;

})(window)