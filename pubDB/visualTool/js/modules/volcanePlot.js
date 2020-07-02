;(function (win) {

    "use strict";

    // 全局变量
    var _global = {
        dataCol: [],
        dataValue: [],
    };

    //配置
    var _config = {
        svgWidth: 600,
        svgHeight: 600,
        svgPadding: {left: 30, right: 60, top: 30, bottom: 30}
    };

    // 构造函数
    var volcanePlot = function (config) {
        if (_tool.checkConfig(config)) {
            _global.svg = visualUtil.initSVGDom(config.svgSelector, _config.svgPadding);
            _config = $.extend({}, _config, config);
            volcanePlot.prototype.type = "volcanePlot";
            volcanePlot.prototype.initflag = false;
        }
    }

    // API方法
    volcanePlot.prototype = {
        //生成参数配置模块
        initParamBar: function () {
            visualUtil.init(function (obj) {

                $(_config.paramPanels).empty();
                $(_param.paramPaneldom).appendTo(_config.paramPanels);
                obj.form.render();

                //提交按钮
                obj.form.on('submit(drawSVG)', function () {
                    if(volcanePlot.prototype.initflag){
                        let checkResult = _tool.checkParam();
                        if (checkResult.flag) {
                            var param = {};
                            param.xAxis = $('#x-axis').val();
                            param.yAxis = $('#y-axis').val();
                            param.idAxis = $('#id-axis').val();
                            param.xName = $('#x-name').val();
                            param.yName = $('#y-name').val();
                            param.xSize = $('#x-size').val();
                            param.ySize = $('#y-size').val();
                            param.xMax = $('#x-max').val();
                            param.yMax = $('#y-max').val();
                            param.specilId = obj.formSelects.value('specil-id', 'val');

                            let returnData = _tool.initSVGSelectData(_global.dataCol, _global.dataValue, param);

                            _tool.drawSVGPic(returnData.value, returnData.param, returnData.specialValue);

                            visualUtil.initDownload(volcanePlot.prototype.type)

                            visualUtil.resize('.set-svg');

                        }else{
                            layer.msg(checkResult.msg,{icon:2});
                        }
                    }else{
                        layer.msg('请先上传数据', {icon:2})
                    }

                });
            });
        },

        // 传入数据列
        dataCol: function (data) {
            let returnData = visualUtil.getDataCombina(data);

            if (returnData.flag) {
                volcanePlot.prototype.initflag = true;

                _tool.setParamBar(returnData.dataCol, returnData.dataValue);

                _global.dataCol = returnData.dataCol;
                _global.dataValue = returnData.dataValue;
            }else{
                layer.msg('数据有缺失项，请重新上传！', {icon: 2, time: 2000});
                volcanePlot.prototype.initflag = false;
                throw new Error("the format of uploadData is not valid!");
            }
        }

    }

    // 内部方法
    var _tool = {
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

        // 初始化全局变量
        initGlobalData: function(){
            _global.dataCol = [];
            _global.dataValue = []
        },

        // 设置参数栏
        setParamBar: function (dataCol, dataValue) {

            // 1. 配置列选择
            _tool.initParamDom();
            visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);

            var msg = '';
            for (let i = 0; i < dataCol.length; i++) {
                msg = msg + '<option value="' + i + '">' + dataCol[i] + '</option>';
            }
            $(msg).appendTo('#x-axis');
            $(msg).appendTo('#y-axis');
            $(msg).appendTo('#id-axis');

            form.render();

            //3.监听ID列，配置标记ID选项
            visualUtil.init(function (obj) {
                obj.form.on('select(get-id-axis)', function (data) {

                    var value = data.value;
                    if (value !== '') {
                        var index = layer.load(1);

                        var tempObj = new Object();
                        var tempArray = new Array();
                        for (let i = 0; i < dataValue[value].length; i++) {
                            var temp = new Object();
                            temp.name = dataValue[value][i];
                            temp.value = i;
                            tempArray.push(temp);
                        }
                        tempObj.arr = tempArray;

                        obj.formSelects.data('specil-id', 'local', tempObj);

                        layer.close(index);
                    } else {
                        obj.formSelects.render('specil-id');
                    }
                });
            })

        },

        checkParam: function () {
            let flag = true,
                msg = '';
            if (!flag && $('#x-axis').val() === $('#y-axis').val()) {
                flag = false;
                msg = 'X轴与Y轴不能相同'
            }
            if (!flag && $('#x-axis').val() === $('#id-axis').val()) {
                flag = false;
                msg = 'X轴与ID列不能相同';
            }
            if (!flag && $('#y-axis').val() === $('#id-axis').val()) {
                flag = false;
                msg = 'Y轴与ID列不能相同';
            }

            if (!flag && $('#x-size').val() < 0 || $('#y-size').val() < 0) {
                flag = false;
                msg = '请输入大于0的阙值';
            }
            if (!flag && $('#x-max').val() < 0 || $('#y-max').val() < 0) {
                flag = false;
                msg = '请输入大于0的最大值';
            }

            if (!flag && $('#x-size').val() > $('#x-max').val() || $('#y-size').val() > $('#y-max').val()) {
                flag =  false;
                msg = '阙值无法超过最大值';
            }
            return {
                flag: flag,
                msg: msg
            };
        },

        // 初始化参数框
        initParamDom: function () {
            $('#svg-box').empty();
            _global.dataCol = [];
            _global.dataValue = [];
            $('#x-axis').empty();
            $('<option value="">请选择X轴所在列</option>').appendTo('#x-axis');

            $('#y-axis').empty();
            $('<option value="">请选择Y轴所在列</option>').appendTo('#y-axis');

            $('#id-axis').empty();
            $('<option value="">请选择ID值所在列</option>').appendTo('#id-axis');

            $('#specil-id').empty();

            $('#chart-title').html('<span style="color: red">数据上传成功，请配置图形参数</span>');

            $('#x-name').val('log2(FC)');
            $('#y-name').val('-log10(p-value)');
            $('#x-size').val('1.5');
            $('#y-size').val('0.05');
            $('#x-max').val('4');
            $('#y-max').val('30');
        },

        //根据index选取横坐标与纵坐标数据
        initSVGSelectData: function (dataCol, dataValue, param) {

            var value = [];
            var specialValue = [];
            var formValue = param.specilId;

            for (let i = 0; i < dataValue[0].length; i++) {

                var temp = new Object();
                var tempObj = new Object();
                tempObj.x = dataValue[param.xAxis][i];
                tempObj.y = dataValue[param.yAxis][i];

                temp.point = tempObj;
                temp.name = dataValue[param.idAxis][i];

                if (formValue.indexOf(i) !== -1) {
                    specialValue.push(temp);
                } else {
                    value.push(temp);
                }
            }
            return {
                value: value,
                param: param,
                specialValue: specialValue
            };
        },

        //绘制图片
        drawSVGPic: function (value, param, specialValue) {
            _global.svg = visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);
            let svgSelector = _config.svgSelector;

            let svgwidth = _config.svgWidth;
            let svgheight = _config.svgHeight;
            let padding = _config.svgPadding;
            let color = visualParam.color.ordinalFour;

            let width = svgwidth - padding.left - padding.right;
            let height = svgheight - padding.top - padding.bottom;

            let xboundary = param.xSize;
            let yboundary = visualUtil.toLog10(param.ySize);
            let pointradius = 1;        //数据点半径
            let xborder = param.xMax;
            let yborder = param.yMax;

            let svg = _global.svg,
                g = svg.select('g');

            //提示框
            let tooltip = d3.select(".tooltip");

            //坐标比例尺
            let x = visualUtil.setAxis(svg, {
                domain: [-1 * xborder, xborder],
                range: [0, width],
                type: 0,
                axis: 1,
                axisTranslate: [0, height],
                text: param.xName,
                textTranslate: [width / 2, 28],
            });
            let y = visualUtil.setAxis(svg, {
                domain: [0, yborder],
                range: [height, 0],
                type: 0,
                axis: 0,
                axisTranslate: [0, 0],
                text: param.yName,
                textTranslate: [0, -10]
            });


            //基准线
            var boundaryLine = g.append('g')
                .attr('class', 'boundary-line');

            boundaryLine.append('line')
                .attr('x1', x.scale(-1 * xboundary))
                .attr('y1', height)
                .attr('x2', x.scale(-1 * xboundary))
                .attr('y2', 0);

            boundaryLine.append('line')
                .attr('x1', x.scale(xboundary))
                .attr('y1', height)
                .attr('x2', x.scale(xboundary))
                .attr('y2', 0);

            boundaryLine.append('line')
                .attr('x1', 0)
                .attr('y1', y.scale(yboundary))
                .attr('x2', width)
                .attr('y2', y.scale(yboundary));

            $(".boundary-line > line").css({
                "stroke": "#8C468C",
                "stroke-dasharray": "1,1"
            })

            //数据点
            let circles = g.append('g')
                .attr('class', 'point')
                .selectAll('circle')
                .data(value)
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                    return x.scale(d.point.x);
                })
                .attr('cy', function (d) {
                    return y.scale(visualUtil.toLog10(d.point.y));
                })
                .attr('r', pointradius)
                .each(function (d) {
                    visualUtil.toolTipEvent(this, svgSelector, tooltip, d.name + " [" + d.point.x + "," + d.point.y + "]");
                })

            circles.each(function (d) {
                var that = d3.select(this);
                var x = d.point.x;
                var y = visualUtil.toLog10(d.point.y);

                if (x < 0) {
                    if (x < (-1 * xboundary) && y > yboundary) {
                        that.attr('class', 'point-down')
                            .attr('fill', color(0));
                    } else {
                        that.attr('class', 'point-nodiff')
                            .attr('fill', color(2));
                    }
                } else {
                    if (x > xboundary && y > yboundary) {
                        that.attr('class', 'point-up')
                            .attr('fill', color(1));
                    } else {
                        that.attr('class', 'point-nodiff')
                            .attr('fill', color(2));
                    }
                }
            });

            //标记ID放至顶层
            g.append('g')
                .attr('class', 'special-point')
                .selectAll('circle')
                .data(specialValue)
                .enter()
                .append('circle')
                .attr('class', 'point-special')
                .attr('fill', color(3))
                .attr('cx', function (d) {
                    return x.scale(d.point.x);
                })
                .attr('cy', function (d) {
                    return y.scale(visualUtil.toLog10(d.point.y));
                })
                .attr('r', pointradius)
                .each(function (d) {
                    visualUtil.toolTipEvent(this, svgSelector, tooltip, d.name + " [" + d.point.x + "," + d.point.y + "]");
                })

            // 侧边栏
            var identify = _global.svg.append('g')
                .attr('class', 'dataIdentify')
                .attr("transform", "translate(" + (padding.left + width) + "," + padding.top + ")"),
                col = ['down','up','nodiff','special'];

            for (let i = 0; i < col.length; i++) {
                let identifyItem = identify.append('g')
                    .attr("transform", "translate(" + 0 + "," + (i * 45) + ")")
                    .attr('id', 'symbol_' + col[i])
                    .attr('class', 'input-group');

                identifyItem.append('g')
                    .append('path')
                    .attr('class', 'symbol_' + i + ' input-group-text colorpicker-input-addon')
                    .attr('transform', 'translate(30,10)')
                    .attr('d', d3.symbol().type(d3.symbolCircle))
                    .attr('fill', color(i))

                identifyItem.append('text')
                    .text(col[i])
                    .attr('transform', 'translate(23,28)')
                    .attr('font-size', '12px');

                //初始化颜色
                var tempObj = $('#symbol_' + col[i]);

                var mycolor = color(i);

                tempObj.colorpicker({
                    color: mycolor,
                    format: "rgb",
                });

                //颜色变化渲染
                tempObj.on('colorpickerChange', function (e) {
                    $('.set-svg').find('.symbol_' + col[i] + '>path').each(function () {
                        $(this).attr('fill', e.color.toString());
                    })

                    $('.set-svg').find('circle.point-' + col[i]).each(function () {
                        $(this).attr('fill', e.color.toString());
                    })
                })
            }

        },
    };

    // 内部常量
    const _param = {
        // 参数配置dom
        paramPaneldom:
            '<div class="layui-card">\n' +
            '<div class="layui-card-header" id="chart-title"></div>\n' +
            '<div class="layui-card-body">\n' +
            '     <div class="layui-form" style="position: relative;">\n' +
            '          <div class="card-title">列选择</div>\n' +
            '          <div class="layui-form-item" style="margin-top: 10px">\n' +
            '               <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">X轴:</label>\n' +
            '               <div class="layui-input-inline" style="width: 300px;">\n' +
            '                    <select id="x-axis" name="x-axis" lay-verify="required">\n' +
            '                         <option value="">请选择X轴所在列</option>\n' +
            '                    </select>\n' +
            '               </div>\n' +
            '          </div>\n' +
            '          <div class="layui-form-item">\n' +
            '               <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">Pvalue值:</label>\n' +
            '               <div class="layui-input-inline" style="width: 300px;">\n' +
            '                    <select id="y-axis" name="y-axis" lay-verify="required">\n' +
            '                          <option value="">请选择Y轴所在列</option>\n' +
            '                    </select>\n' +
            '               </div>\n' +
            '          </div>\n' +
            '          <div class="layui-form-item">\n' +
            '               <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">ID列:</label>\n' +
            '               <div class="layui-input-inline" style="width: 300px;">\n' +
            '                    <select id="id-axis" name="id-axis"  lay-filter="get-id-axis" lay-verify="required">\n' +
            '                         <option value="">请选择ID值所在列</option>\n' +
            '                    </select>\n' +
            '               </div>\n' +
            '          </div>\n' +
            '          <div class="card-title">参数设置</div>\n' +
            '          <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '               <div class="layui-col-md6 layui-col-lg6">\n' +
            '                   <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">X轴阙值:</label>\n' +
            '                   <div class="layui-input-block">\n' +
            '                       <input class="layui-input" autocomplete="off" id="x-size" lay-verify="required|number"/>\n' +
            '                   </div>\n' +
            '                </div>\n' +
            '                <div class="layui-col-md6 layui-col-lg6">\n' +
            '                     <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">Y轴阙值:</label>\n' +
            '                     <div class="layui-input-block">\n' +
            '                          <input class="layui-input" autocomplete="off" id="y-size" lay-verify="required|number"/>\n' +
            '                     </div>\n' +
            '                </div>\n' +
            '           </div>\n' +
            '           <div class="layui-form-item layui-row">\n' +
            '               <div class="layui-col-md6 layui-col-lg6">\n' +
            '                    <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">Xmax:</label>\n' +
            '                    <div class="layui-input-block">\n' +
            '                         <input class="layui-input" autocomplete="off" id="x-max" lay-verify="required|number"/>\n' +
            '                    </div>\n' +
            '               </div>\n' +
            '               <div class="layui-col-md6 layui-col-lg6">\n' +
            '                    <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">Ymax:</label>\n' +
            '                    <div class="layui-input-block">\n' +
            '                         <input class="layui-input" autocomplete="off" id="y-max" lay-verify="required|number"/>\n' +
            '                    </div>\n' +
            '               </div>\n' +
            '          </div>\n' +
            '          <div class="card-title">轴设置</div>\n' +
            '          <div class="layui-form-item" style="margin-top: 10px">\n' +
            '               <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">X轴名:</label>\n' +
            '               <div class="layui-input-inline" style="width: 300px;">\n' +
            '                    <input class="layui-input" autocomplete="off" id="x-name" lay-verify="required"/>\n' +
            '               </div>\n' +
            '          </div>\n' +
            '          <div class="layui-form-item">\n' +
            '               <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">Y轴名:</label>\n' +
            '                <div class="layui-input-inline" style="width: 300px;">\n' +
            '                     <input class="layui-input" autocomplete="off" id="y-name" lay-verify="required"/>\n' +
            '                </div>\n' +
            '          </div>\n' +
            '          <div class="layui-form-item">\n' +
            '               <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">标记ID:</label>\n' +
            '               <div class="layui-input-inline" style="width: 300px;">\n' +
            '                    <select name="specil-id" id="specil-id" xm-select="specil-id" xm-select-search="" xm-select-show-count="1"></select>\n' +
            '               </div>\n' +
            '          </div>\n' +
            '          <div class="layui-form-item">\n' +
            '               <button class="layui-btn" lay-submit lay-filter="drawSVG" style="margin-left: calc(50% - 28px);">生成图像</button>\n' +
            '          </div>\n' +
            '     </div>\n' +
            '  </div>\n' +
            '</div>',
    }

    win.volcanePlot = volcanePlot;

})(window);