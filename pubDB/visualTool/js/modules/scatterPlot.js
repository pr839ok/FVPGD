/*
    可视化插件 - 散点图模块
    使用说明：
        var config = {
            paramPanels: '#paramPanels',    //参数配置容器（必须）
            svgSelector: '#svgSelector',    //图像生成容器（必须）
            submit:                         //如果表头数据要重新传，可写此方法（非必需），返回表数据
             function (value) {
                console.log(value);
                return [
                    ['1', '2', '3'],['1', '2', '3']
                ];
            }
        }
        //初始化
        var visual = new scatter(config);

     API:
        //生成参数配置栏
        visual.initParamBar();

        //是否导入数据
        visual.initflag

        // 图像类型
        visual.type

        //导入数据
        visual.dataCol([
            ['A', 'B', 'C']
        ]);

 */

;(function (win) {

    "use strict";

    // 全局变量
    var _global = {
        dataCol: [],
        dataValue: [],
        selectIndex: [],
    };

    //配置
    var _config = {
        svgWidth: 600,
        svgHeight: 600,
        svgPadding: {left: 30, right: 60, top: 30, bottom: 30}
    };

    // 构造函数
    var scatter = function (config) {
        if (_tool.checkConfig(config)) {
            _global.svg = visualUtil.initSVGDom(config.svgSelector, _config.svgPadding);
            _config = $.extend({}, _config, config);
            scatter.prototype.type = "scatter";
            scatter.prototype.initflag = false;
        }
    };


    // API方法
    scatter.prototype = {

        //生成参数配置模块
        initParamBar: function () {
            $(_config.paramPanels).empty();
            $(_param.paramPaneldom).appendTo(_config.paramPanels);

            //提交按钮
            visualUtil.init(function (obj) {
                obj.form.on('submit(drawSVG)', function (data) {
                    if (_global.dataCol.length > 0) {
                        var value = {};
                        value.xindex = data.field.xAxis;
                        value.yindex = data.field.yAxis;
                        value.xname = data.field.xname;
                        value.yname = data.field.yname;

                        if (visualUtil.cheakNotNull(value)) {
                            let symbolList = value.yindex.split(',');
                            for (let i = 0; i < symbolList.length; i++){
                                value[_global.dataCol[symbolList[i]]] = data.field[symbolList[i]];
                            }

                            // 数据处理
                            if(_config.submit && typeof _config.submit === "function"){
                                let submitData = _config.submit(_tool.getSubmit(value));
                                for (let i = 0; i < submitData.length; i++) {
                                    for (let j = 0; j < submitData[i].length; j++) {
                                        submitData[i][j] = parseFloat(submitData[i][j]);
                                    }
                                }
                                _tool.setSubmit(submitData, value);
                            }
                            _tool.initSVGValue(value);

                        } else {
                            layer.msg("填写项不能为空", {icon: 2});
                        }
                    } else {
                        layer.msg("请先上传文件", {icon: 2});
                    }
                });
                obj.form.render();
            });
        },

        // 传入数据列
        dataCol: function (data) {
            visualUtil.init(function (obj) {

                visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);

                let dataCombina = visualUtil.getDataCombina(data);

                if (dataCombina.flag) {
                    //更新数据
                    _global.dataCol = dataCombina.dataCol;
                    _global.dataValue = dataCombina.dataValue;
                    _global.selectIndex = [];

                    scatter.prototype.initflag = true;

                    //初始处理
                    $('#x-axis').empty();
                    obj.formSelects.render('select-file');
                    $('#symbolList').empty();
                    $('#chart-title').html('<span style="color: red">数据上传成功，请配置图形参数</span>');

                    //渲染单选框
                    let msg = '';
                    for (let i = 0; i < data[0].length; i++) {
                        msg = msg + '<option value="' + i + '">' + data[0][i] + '</option>';
                    }
                    $(msg).appendTo('#x-axis');
                    obj.form.render();

                    $('#x-axis-name').val('X');
                    $('#y-axis-name').val('Y');
                    _tool.renderformSelects(dataCombina.dataCol, 0, 'select-file', obj.formSelects, _tool.symbolListDetail(), _tool.updateSymbolItem)
                    obj.form.render();

                    //监听x轴，渲染y轴选择
                    obj.form.on('select(xAxis)', function (data) {
                        $('#symbolList').empty();
                        _tool.renderformSelects(dataCombina.dataCol, data.value, 'select-file', obj.formSelects, _tool.symbolListDetail(), _tool.updateSymbolItem);
                        obj.form.render();
                    });

                    //监听y轴选择，选择每列图形
                    obj.formSelects.on('select-file', function (id, vals, val, isAdd, isDisabled) {
                        _tool.updateSymbolItem(val.value, '#symbolList', isAdd, _tool.symbolListDetail());
                        obj.form.render();
                    }, true);
                }
            });
        },

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

        //数据处理
        initSVGValue: function (obj) {
            let col = _global.dataCol,
                value = _global.dataValue;
            let xdata = value[obj.xindex];
            let ydata = [];
            let extentValue = {};
            extentValue.xname = obj.xname;
            extentValue.yname = obj.yname;

            for (let i = 0; i < xdata.length; i++) {
                xdata[i] = parseFloat(xdata[i]);
            }

            var yindex = obj.yindex.split(',');

            for (let i = 0; i < yindex.length; i++) {
                let temp = {};
                temp.name = col[yindex[i]];
                temp.data = value[yindex[i]];
                temp.symbolIndex = obj[col[yindex[i]]];
                for (let j = 0; j < temp.data.length; j++) {
                    temp.data[j] = parseFloat(temp.data[j]);
                }
                ydata.push(temp);
                let extentArray = d3.extent(temp.data);
                if (typeof extentValue.min === "undefined" || extentValue.min > extentArray[0]) {
                    extentValue.min = extentArray[0];
                }
                if (typeof extentValue.max === "undefined" || extentValue.max < extentArray[1]) {
                    extentValue.max = extentArray[1];
                }
            }

            extentValue.xdata = xdata;
            extentValue.ydata = ydata;

            // 绘制图形
            _tool.drawSVGPic(_config, extentValue);
            // 下载按钮
            visualUtil.initDownload(scatter.prototype.type);

            // 图形调整
            visualUtil.resize('.set-svg');
        },
        //绘制SVG
        drawSVGPic: function (config, extentValue) {
            let svgSelector = config.svgSelector;

            _global.svg = visualUtil.initSVGDom(svgSelector, config.svgPadding);

            let svgwidth = _config.svgWidth,
                svgheight = _config.svgHeight,
                padding = _config.svgPadding,
                color = visualParam.color.schemeCategory10;

            let width = svgwidth - padding.left - padding.right;
            let height = svgheight - padding.top - padding.bottom;

            let xdata = extentValue.xdata,
                ydata = extentValue.ydata;

            let g = _global.svg
                .select('g');

            //提示框
            let tooltip = d3.select(".tooltip");

            //比例尺
            let x = visualUtil.setAxis(_global.svg, {
                domain: d3.extent(xdata),
                range: [0, width],
                type: 0,
                axis: 1,
                axisTranslate: [0, height],
                tick: xdata.length,
                text: extentValue.xname,
                textTranslate: [width / 2, 28],
            });
            let y = visualUtil.setAxis(_global.svg,{
                domain: [extentValue.min - 1, extentValue.max + 1],
                range: [height, 0],
                type: 0,
                axis: 0,
                axisTranslate: [0, 0],
                tickSize: -1 * width,
                text: extentValue.yname,
                textTranslate: [0, -10]
            })

            let d = y.axis.select('path').attr('d');
            d = d.substr(0, d.lastIndexOf('H'));
            y.axis.select('path').attr('d', d);

            //线生成器
            var path = d3.line()
                .x(function (d, i) {
                    return x.scale(xdata[i]);
                })
                .y(function (d) {
                    return y.scale(d);
                }).curve(d3.curveCatmullRom.alpha(0.5));

            //数据线点
            let dataPoint = g.append('g')
                .attr('class', 'dataPoint');

            dataPoint.selectAll('g')
                .data(ydata)
                .enter()
                .append('g')
                .each(function (data, index) {
                    let self = d3.select(this);
                    self.attr('class', 'data_' + index);

                    // 线段
                    self.append('path')
                        .attr("stroke", color(index))
                        .attr("fill", 'none')
                        .attr("stroke-width", '2px')
                        .transition()
                        .duration(500)
                        .ease(d3.easeSinOut)
                        .attr('class', 'lineData')
                        .attr('d', path(data.data));

                    // 数据点
                    self.append('g')
                        .attr('class', 'pointArray')
                        .selectAll('path')
                        .data(data.data)
                        .enter()
                        .append('path')
                        .each(function (d, i) {
                            let that = d3.select(this);
                            that.attr('transform', 'translate(' +
                                x.scale(xdata[i]) +
                                ',' +
                                y.scale(d) +
                                ')')
                                .attr('d', d3.symbol().type(visualParam.symbolArray[(ydata[index].symbolIndex % visualParam.symbolArray.length)].value))
                                .attr('fill', color(index))
                                .each(function (data) {
                                    let msg = "data: " + data
                                    visualUtil.toolTipEvent(this,svgSelector,tooltip,msg);
                                })
                        });
                })

            //侧边提示栏
            var identify = _global.svg.append('g')
                .attr('class', 'dataIdentify')
                .attr("transform", "translate(" + (padding.left + width) + "," + padding.top + ")")
            for (let i = 0; i < ydata.length; i++) {
                let identifyItem = identify.append('g')
                    .attr("transform", "translate(" + 0 + "," + (i * 45) + ")")
                    .attr('id', 'symbol_' + i)
                    .attr('class', 'input-group');

                identifyItem.append('g')
                    .append('path')
                    .attr('class','symbol_' + i + ' input-group-text colorpicker-input-addon')
                    .attr('transform', 'translate(30,10)')
                    .attr('d', d3.symbol().type(visualParam.symbolArray[(ydata[i].symbolIndex % visualParam.symbolArray.length)].value))
                    .attr('fill', color(i))

                identifyItem.append('text')
                    .text(ydata[i].name)
                    .attr('transform', 'translate(23,28)')
                    .attr('font-size', '12px');

                $('#symbol_' + i).colorpicker({
                    color: color(i),
                    format: "rgb",
                });
                $('#symbol_' + i).on('colorpickerChange', function (e) {
                    $('.set-svg')
                        .find('.symbol_' + i)
                        .css('fill', e.color.toString());
                    $('.set-svg')
                        .find('.data_' +i + ' > path')
                        .css('stroke', e.color.toString());
                    $('.set-svg')
                        .find('.data_' + i + '> .pointArray > path')
                        .css('fill', e.color.toString());
                });
                $('#symbol_' + i).on('colorpickerShow', function(e){
                    let id = $('.' + e.currentTarget.id).attr('aria-describedby');
                    let targetdiv = $('#' + id);
                    // z-index高于弹层
                    targetdiv.css('z-index', '99999999')
                        //抵消bootstrap 3 版本的样式
                        .css('opacity', '1');
                });
                    
            }

        },

        //添加或删除符号选择项
        updateSymbolItem: function (index, parent, isAdd, updateSymbolItem) {
            if (isAdd) {
                var msg = '<div class="layui-form-item layui-row" style="margin-top: 10px" id="symbolItem_' + index + '">' +
                    '<label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;" title="' + _global.dataCol[index] + '">' + _global.dataCol[index] + ':</label>' +
                    '<div class="layui-input-block">' +
                    '<select id="' + index + '" name="' + index + '" lay-verify="required"></select>' +
                    '</div>' +
                    '</div>';
                $(msg).appendTo(parent);

                $('#' + index).append(updateSymbolItem);
            } else {
                $("#symbolItem_" + index).remove();
            }
        },

        // 图形单选dom
        symbolListDetail: function () {
            let symbolListDetail = '';
            for (let i = 0; i < visualParam.symbolArray.length; i++) {
                symbolListDetail = symbolListDetail + '<option value="' + i + '">' + visualParam.symbolArray[i].name + '</option>';
            }
            return symbolListDetail;
        },

        //处理点击提交按钮后的初始数据
        getSubmit: function(value){
            let data = [];
            data.push(_global.dataCol[parseFloat(value.xindex)]);
            let indexGroup = value.yindex.split(",");
            for (let i = 0; i < indexGroup.length; i++) {
                data.push(_global.dataCol[indexGroup[i]]);
            }
            _global.selectIndex = data;

            return {
                index: _global.selectIndex,
            };
        },

        //点击提交按钮后返回数据处理
        setSubmit: function(data, value){
            _global.dataValue[value.xindex] = data[0];
            let indexGroup = value.yindex.split(",");
            for (let i = 0; i < indexGroup.length; i++) {
                _global.dataValue[indexGroup[i]] = data[i + 1];
            }
        },

        //根据传入的data渲染Y轴
        renderformSelects: function (dataCol, data, filter, formSelects, symbolListDetail, callback) {
            let tempObj = {};
            tempObj.arr = [];
            let temp = [];
            if(typeof data === "string"){
                data = parseFloat(data);
            }
            for (let i = 0; i < dataCol.length; i++) {
                if (data !== i) {
                    tempObj.arr.push({
                        name: dataCol[i],
                        value: i,
                        // selected: 'selected'
                    })
                    temp.push(i);
                }
            }
            formSelects.data(filter, 'local', tempObj);
        },
    }


    // 内部常量
    const _param = {
        // 参数配置dom
        paramPaneldom :
        '<div class="layui-card">\n' +
        '     <div class="layui-card-header" id="chart-title">' +
        '</div>\n' +
        '<div class="layui-card-body">\n' +
        '     <div class="layui-form" style="position: relative;">\n' +
        '          <div class="card-title">参数设置</div>\n' +
        '          <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
        '               <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">x轴:</label>\n' +
        '               <div class="layui-input-block">\n' +
        '                    <select id="x-axis" name="xAxis" lay-verify="required" lay-filter="xAxis"></select>\n' +
        '               </div>\n' +
        '          </div>\n' +
        '          <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
        '               <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">作图行:</label>\n' +
        '               <div class="layui-input-block">\n' +
        '                    <select name="yAxis" id="yAxis" xm-select="select-file" xm-select-show-count="1"></select>\n' +
        '               </div>\n' +
        '          </div>\n' +
        '          <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
        '               <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">X轴名:</label>\n' +
        '               <div class="layui-input-block">\n' +
        '                    <input class="layui-input" autocomplete="off" id="x-axis-name" name="xname" lay-verify="required"/>\n' +
        '               </div>\n' +
        '          </div>\n' +
        '          <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
        '               <label class="layui-form-label layui-elip" style="width: 110px;-webkit-box-sizing: border-box;">Y轴名:</label>\n' +
        '               <div class="layui-input-block">\n' +
        '                    <input class="layui-input" autocomplete="off" id="y-axis-name" name="yname" lay-verify="required"/>\n' +
        '               </div>\n' +
        '          </div>\n' +
        '          <div class="card-title">图形选择</div>\n' +
        '               <div id="symbolList"></div>\n' +
        '               <div class="layui-form-item">\n' +
        '                    <button class="layui-btn" lay-submit lay-filter="drawSVG" style="margin-left: calc(50% - 28px);">生成图像</button>\n' +
        '               </div>\n' +
        '          </div>\n' +
        '     </div>\n' +
        '</div>',


    }



    win.scatter = scatter;
})(window);