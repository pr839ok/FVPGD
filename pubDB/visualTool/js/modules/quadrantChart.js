;(function (win) {

    "use strict";

    // 全局变量
    var _global = {
        transcriptomeDat: null,
        proteomeData: null,
        idMarchData: null,
        uploadFlag: [],
    };

    //配置
    var _config = {
        svgWidth: 600,
        svgHeight: 600,
        svgPadding: {left: 30, right: 60, top: 30, bottom: 30}
    };

    // 构造函数
    var quadrantChart = function (config) {
        if (_tool.checkConfig(config)) {
            _global.svg = visualUtil.initSVGDom(config.svgSelector, _config.svgPadding);
            _config = $.extend({}, _config, config);
            _tool.init();
            quadrantChart.prototype.type = "quadrantChart";
            quadrantChart.prototype.initflag = false;
        }
    };

    // API方法
    quadrantChart.prototype = {
        //生成参数配置模块
        initParamBar: function () {
            visualUtil.init(function (obj) {
                $(_config.paramPanels).empty();
                $(_param.paramPaneldom).appendTo(_config.paramPanels);
                _tool.initSetCard();
                obj.form.render();

                //监听单选框
                form.on('radio(isMatch)',function (data) {
                    var value = data.value;

                    if(value === 'yes'){
                        $('#marchFileBox').css('display','block');
                    }else if(value === 'no'){
                        $('#marchFileBox').css('display','none');
                    }
                });

                //监听提交按钮
                form.on('submit(drawSVG)',function (data) {

                    let uploadStatus = _tool.checkUploadStatus(_global.uploadFlag);

                    if(uploadStatus.flag){
                        let value =_tool.initSVGSelectData(data.field, _global.proteomeData, _global.transcriptomeData, _global.idMarchData);

                        _tool.drawSVGPic(value)

                        _tool.setSVGForm(value.data);

                        visualUtil.initDownload(quadrantChart.prototype.type)

                        visualUtil.resize('.set-svg');
                    }else{
                        layer.msg(uploadStatus.msg, {icon: 2});
                    }
                });
            })
        },

        // 传入数据列
        dataCol: function (data, type) {
            let checkResult = _tool.checkData(data, type);
            $('#chart-title').empty()
            if(checkResult.flag){
                $('#chart-title').html('<span style="color: red">数据上传成功，请配置图形参数</span>');
                //初始处理
                if(type == 0){

                    if(_global.uploadFlag.indexOf(0) === -1){
                        _global.uploadFlag.push(0);
                    }

                    _global.transcriptomeData = data;

                    visualUtil.initFormRendering('#configuration-id','#configuration-diff', data[0], 'configurationID');

                    $('#configuration-depreciation').val('2');

                }else if(type == 1){

                    if(_global.uploadFlag.indexOf(1) === -1){
                        _global.uploadFlag.push(1)
                    }

                    _global.proteomeData = data;

                    visualUtil.initFormRendering('#proteome-id', '#proteome-diff', data[0], 'proteomeID');

                    $('#proteome-depreciation').val('1.2');

                }else if(type == 2){

                    _global.idMarchData = data;

                    visualUtil.initFormRendering('#configuration-id-num', '#proteome-id-num', data[0], 'configurationIDnum');

                    visualUtil.init(function (obj) {
                        obj. form.val('quadrantChart', {
                            "isMatch": "是"
                        });
                    })

                    $('#marchFileBox').css('display','block');
                }
            }else{
                layer.msg(checkResult.msg, {icon: 2});
            }
        }
    }

    // 内部方法
    var _tool = {
        //对象初始化处理
        init: function () {
            _global.transcriptomeDat = null;
            _global.proteomeData = null;
            _global.idMarchData = null;
            _global.uploadFlag = [];
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

        // 渲染表格
        initSetCard: function (data) {
            if(!data){
                data = new Array();
            }

            visualUtil.init(function (obj) {
                obj.table.render({
                    elem: '#set-data',
                    height: 312,
                    page: true,
                    data: data,
                    cols: [[
                        {field: 'id', title: 'id', sort: true},
                        {field: 'x', title: 'mrna_log2fc'},
                        {field: 'y', title: 'pep_log2fc'},
                        {field: 'quadrant', title: 'part'}]]
                });
            })
        },

        // 检查数据
        checkData: function(data, type){
            let mainLength = data[0].length,
                flag = true,
                msg = '';

            for (var i = 1; i < data.length; i++) {
                if (data[i].length !== mainLength) {
                    flag = false;
                    msg = '请传入正确格式的数据';
                }
            }

            if([0,1,2].indexOf(type) === -1){
                flag = false;
                msg = '请传入正确的点击类型';
            }

            layer.closeAll();

            return {
                flag: flag,
                msg: msg
            };
        },

        //检查上传文件状态
        checkUploadStatus: function(uploadFlag){
            let flag = true,
                msg = '';

            if(uploadFlag.indexOf(0) == -1){
                flag = false;
                msg = '请先上传转录组表达量文件';
            }else if(uploadFlag.indexOf(1) == -1){
                flag = false;
                msg = '请先上传蛋白组表达量文件';
            }

            return {
                flag: flag,
                msg: msg
            }

        },

        // 获取参数栏值
        initSVGSelectData: function (data, proteomeData, transcriptomeData, idMarchData) {
            var value = new Object();
            value.configurationDepreciation = data.configurationDepreciation;
            value.configurationDiff = data.configurationDiff;
            value.configurationID = data.configurationID;
            value.isMatch = data.isMatch;
            value.proteomeDepreciation = data.proteomeDepreciation;
            value.proteomeDiff = data.proteomeDiff;
            value.proteomeID = data.proteomeID;

            value.configurationIDnum = data.configurationIDnum;
            value.proteomeIDnum = data.proteomeIDnum;

            value.data = new Array();

            var flag = value.isMatch;
            var transcriptomeMax,transcriptomeMin,proteomeMax,proteomeMin;

            var transcriptomeArray = new Object();
            transcriptomeArray.id = new Array();
            transcriptomeArray.data = new Array();

            var proteomeArray = new Object();
            proteomeArray.id = new Array();
            proteomeArray.data = new Array();

            var xboundary = visualUtil.toLog2(parseFloat(value.proteomeDepreciation));
            var yboundary = visualUtil.toLog2(parseFloat(value.configurationDepreciation));


            for (let i = 1; i < transcriptomeData.length; i++) {
                transcriptomeArray.id.push(transcriptomeData[i][value.configurationID]);
                transcriptomeArray.data.push(parseFloat(transcriptomeData[i][value.configurationDiff]));
            }

            for (let i = 1; i < proteomeData.length; i++) {
                proteomeArray.id.push(proteomeData[i][value.proteomeID]);
                proteomeArray.data.push(parseFloat(proteomeData[i][value.proteomeDiff]));
            }

            if(flag === 'yes'){

                for (let i = 1; i < idMarchData.length; i++) {
                    let configurationIDnum = idMarchData[value.configurationIDnum];
                    let proteomeIDnum = idMarchData[value.proteomeIDnum];
                    let configurationIndex = transcriptomeArray.id.indexOf(configurationIDnum);
                    let proteomeIndex = proteomeArray.id.indexOf(proteomeIDnum);

                    if(configurationIndex != -1 && proteomeIndex != -1){
                        var temp = new Object();
                        temp.id = transcriptomeArray.id[configurationIndex];
                        temp.x = proteomeArray.data[proteomeIndex];
                        temp.y = transcriptomeArray.data[configurationIndex];

                        if(!proteomeMin || temp.x < proteomeMin){
                            proteomeMin = temp.x;
                        }
                        if(!proteomeMax || temp.x > proteomeMax){
                            proteomeMax = temp.x;
                        }
                        if(!transcriptomeMin || temp.y < transcriptomeMin){
                            transcriptomeMin = temp.y;
                        }
                        if(!transcriptomeMax || temp.y > transcriptomeMax){
                            transcriptomeMax = temp.y;
                        }

                        //计算各点象限
                        if(temp.x < (-1 * xboundary) && temp.y > yboundary){
                            temp.quadrantIndex = 1;
                        }else if(temp.x >= (-1 * xboundary) && temp.x <= xboundary && temp.y > yboundary){
                            temp.quadrantIndex = 2;
                        }else if(temp.x > xboundary && temp.y > yboundary){
                            temp.quadrantIndex = 3;
                        }else if(temp.x < (-1 * xboundary) && temp.y >= (-1 * yboundary) && temp.y <= yboundary){
                            temp.quadrantIndex = 4;
                        }else if(temp.x >= (-1 * xboundary) && temp.x <= xboundary && temp.y >= (-1 * yboundary) && temp.y <= yboundary){
                            temp.quadrantIndex = 5;
                        }else if(temp.x > xboundary && temp.y >= (-1 * yboundary) && temp.y <= yboundary){
                            temp.quadrantIndex = 6;
                        }else if(temp.x < (-1 * xboundary) && temp.y < (-1 * yboundary)){
                            temp.quadrantIndex = 7;
                        }else if(temp.x >= (-1 * xboundary) && temp.x <= xboundary && temp.y < (-1 * yboundary)){
                            temp.quadrantIndex = 8;
                        }else if(temp.x > xboundary && temp.y < (-1 * yboundary)){
                            temp.quadrantIndex = 9;
                        }

                        value.data.push(temp);
                    }
                }

            }else if(flag === 'no'){
                for (let i = 0; i < transcriptomeArray.id.length; i++) {
                    if(proteomeArray.id.indexOf(transcriptomeArray.id[i]) != -1){
                        var index = proteomeArray.id.indexOf(transcriptomeArray.id[i]);
                        var temp = new Object();
                        temp.id = transcriptomeArray.id[i];
                        temp.x = proteomeArray.data[index];
                        temp.y = transcriptomeArray.data[i];

                        //计算X轴、Y轴最值
                        if(!proteomeMin || temp.x < proteomeMin){
                            proteomeMin = temp.x;
                        }
                        if(!proteomeMax || temp.x > proteomeMax){
                            proteomeMax = temp.x;
                        }
                        if(!transcriptomeMin || temp.y < transcriptomeMin){
                            transcriptomeMin = temp.y;
                        }
                        if(!transcriptomeMax || temp.y > transcriptomeMax){
                            transcriptomeMax = temp.y;
                        }

                        //计算各点象限
                        if(temp.x < (-1 * xboundary) && temp.y > yboundary){
                            temp.quadrantIndex = 1;
                        }else if(temp.x >= (-1 * xboundary) && temp.x <= xboundary && temp.y > yboundary){
                            temp.quadrantIndex = 2;
                        }else if(temp.x > xboundary && temp.y > yboundary){
                            temp.quadrantIndex = 3;
                        }else if(temp.x < (-1 * xboundary) && temp.y >= (-1 * yboundary) && temp.y <= yboundary){
                            temp.quadrantIndex = 4;
                        }else if(temp.x >= (-1 * xboundary) && temp.x <= xboundary && temp.y >= (-1 * yboundary) && temp.y <= yboundary){
                            temp.quadrantIndex = 5;
                        }else if(temp.x > xboundary && temp.y >= (-1 * yboundary) && temp.y <= yboundary){
                            temp.quadrantIndex = 6;
                        }else if(temp.x < (-1 * xboundary) && temp.y < (-1 * yboundary)){
                            temp.quadrantIndex = 7;
                        }else if(temp.x >= (-1 * xboundary) && temp.x <= xboundary && temp.y < (-1 * yboundary)){
                            temp.quadrantIndex = 8;
                        }else if(temp.x > xboundary && temp.y < (-1 * yboundary)){
                            temp.quadrantIndex = 9;
                        }

                        value.data.push(temp);
                    }
                }
            }

            value.proteomeMin = proteomeMin;
            value.proteomeMax = proteomeMax;
            value.transcriptomeMin = transcriptomeMin;
            value.transcriptomeMax = transcriptomeMax;

            return value;
        },

        // 设置表格数据
        setSVGForm: function (value) {
            //更新表格
            var tempData = new Array();
            for (let j = 0; j < value.length; j++) {
                tempData.push({
                    id: value[j].id,
                    x: value[j].x,
                    y: value[j].y,
                    quadrant: value[j].quadrantIndex
                });
            }

            _tool.initSetCard(tempData)
        },

        // 绘图
        drawSVGPic: function (value) {
            _global.svg = visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);
            let svgSelector = _config.svgSelector;

            let svgwidth = _config.svgWidth;
            let svgheight = _config.svgHeight;
            let padding = _config.svgPadding;
            let color = visualParam.color.schemeCategory10;

            let width = svgwidth - padding.left - padding.right;
            let height = svgheight - padding.top - padding.bottom;

            let svg = _global.svg,
                g = svg.select('g');

            //提示框
            let tooltip = d3.select(".tooltip");

            //比例尺
            let x = visualUtil.setAxis(svg, {
                domain: [value.proteomeMin, value.proteomeMax],
                range: [0, width],
                type: 0,
                axis: 1,
                axisTranslate: [0, height],
                text: "log2 ratio of protein",
                textTranslate: [width / 2, 28],
            });

            let y = visualUtil.setAxis(svg, {
                domain: [value.transcriptomeMin, value.transcriptomeMax],
                range: [height, 0],
                type: 0,
                axis: 0,
                axisTranslate: [0, 0],
                text: "log2 ratio of transcript",
                textTranslate: [0, -10]
            })

            //基准线
            var boundaryLine =  g.append('g')
                .attr('class','boundary-line');

            boundaryLine.append('line')
                .attr('x1', x.scale(-1 * visualUtil.toLog2(parseFloat(value.proteomeDepreciation))))
                .attr('y1', height)
                .attr('x2', x.scale(-1 * visualUtil.toLog2(parseFloat(value.proteomeDepreciation))))
                .attr('y2', 0);

            boundaryLine.append('line')
                .attr('x1', x.scale(visualUtil.toLog2(parseFloat(value.proteomeDepreciation))))
                .attr('y1', height)
                .attr('x2', x.scale(visualUtil.toLog2(parseFloat(value.proteomeDepreciation))))
                .attr('y2', 0);

            boundaryLine.append('line')
                .attr('x1', 0)
                .attr('y1', y.scale(visualUtil.toLog2(parseFloat(value.configurationDepreciation))))
                .attr('x2', width)
                .attr('y2', y.scale(visualUtil.toLog2(parseFloat(value.configurationDepreciation))));

            boundaryLine.append('line')
                .attr('x1', 0)
                .attr('y1', y.scale(-1 * visualUtil.toLog2(parseFloat(value.configurationDepreciation))))
                .attr('x2', width)
                .attr('y2', y.scale(-1 * visualUtil.toLog2(parseFloat(value.configurationDepreciation))));

            $(".boundary-line > line").css({
                "stroke": "#8C468C",
                "stroke-dasharray": "1,1"
            });

            //数据点
            var dataArea = g.append('g')
                .attr('class','data-area');

            dataArea.selectAll('circle')
                .attr('class', 'data-circle')
                .data(value.data)
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                    return x.scale(d.x);
                })
                .attr('cy',function (d) {
                    return y.scale(d.y);
                })
                .attr('r', 2)
                //添加象限信息
                .each(function (d) {
                    let self = d3.select(this),
                        msg = "( " + d.x + ", " + d.y + ")";

                    visualUtil.toolTipEvent(this,svgSelector,tooltip,msg);

                    self.classed('quadrant-' + d.quadrantIndex, true);

                    let colorIndex = _tool.getColorIndex(d.quadrantIndex);
                    self.attr('fill', color(colorIndex));
                })

            // //初始化象限颜色
            // d3.selectAll('.quadrant-5')
            //     .attr('fill',color(0));
            // d3.selectAll('.quadrant-3,.quadrant-7')
            //     .attr('fill',color(1));
            // d3.selectAll('.quadrant-1,.quadrant-2,.quadrant-4')
            //     .attr('fill',color(2));
            // d3.selectAll('.quadrant-6,.quadrant-8,.quadrant-9')
            //     .attr('fill',color(3));

            //侧标识
            var identify = svg.append('g')
                .attr('class', 'dataIdentify')
                .attr("transform", "translate(" + (padding.left + width) + "," + (padding.top + 50) + ")")

            for (let i = 1; i < 10; i++) {
                var selfColor = color(_tool.getColorIndex(i));

                var identifyItem = identify.append('g')
                    .attr("transform", "translate(" + ((i - 1) % 3 * 50) + "," + (parseInt((i - 1)/3) * 35) + ")")
                    .attr('id', 'symbol_' + i)
                    .attr('class', 'input-group');

                identifyItem.append('rect')
                    .attr('class', 'symbol_' + i + ' input-group-text colorpicker-input-addon')
                    .attr('x', '15')
                    .attr('y', '10')
                    .attr('width', '20')
                    .attr('height', '10')
                    .attr('fill', selfColor)
                    .attr('stroke', 'black');

                identifyItem.append('text')
                    .text("第" + i + "象限")
                    .attr('transform', 'translate(25,35)')
                    .attr("text-anchor", "middle")
                    .attr('fill', "currentColor")
                    .attr('font-size', '12px');

                //初始化颜色
                var tempObj = $('#symbol_' + i);

                tempObj.colorpicker({
                    color: selfColor,
                    format: "rgb",
                });

                //颜色变化渲染
                tempObj.on('colorpickerChange', function (e) {
                    $('.set-svg')
                        .find('.quadrant-' + i)
                        .css('fill', e.color.toString());
                    $('.set-svg')
                        .find('.symbol_' + i)
                        .css('fill', e.color.toString());
                });
            }
        },
        // 计算象限颜色
        getColorIndex: function (value) {
            for (let i = 0; i < _param.colorSet.length; i++) {
                if(_param.colorSet[i].indexOf(parseInt(value)) !== -1){
                    return i;
                }
            }
            return null;
        }
    };

    // 内部常量
    const _param = {
        paramPaneldom:
            '<div class="layui-card">\n' +
            '    <div class="layui-card-header" id="chart-title"></div>\n' +
            '    <div class="layui-card-body">\n' +
            '        <div class="layui-form" id="configuration" lay-filter="quadrantChart" style="position: relative;">\n' +
            '            <div class="card-title">转录组表达量配置</div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">ID所在列:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <select id="configuration-id" name="configurationID" lay-verify="required" lay-filter="configurationID"></select>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">差异倍数:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <select id="configuration-diff" name="configurationDiff" lay-verify="required"></select>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">阙值:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <input class="layui-input" autocomplete="off" id="configuration-depreciation" name="configurationDepreciation" lay-verify="required"/>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="card-title">蛋白组表达量配置</div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">ID所在列:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <select id="proteome-id" name="proteomeID" lay-verify="required" lay-filter="proteomeID"></select>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">差异倍数:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <select id="proteome-diff" name="proteomeDiff" lay-verify="required"></select>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">阙值:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <input class="layui-input" autocomplete="off" id="proteome-depreciation" name="proteomeDepreciation" lay-verify="required"/>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="card-title">ID匹配配置</div>\n' +
            '            <div class="layui-form-item layui-row" style="margin-top: 10px" id="isMatch">\n' +
            '                <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">启用ID匹配:</label>\n' +
            '                <div class="layui-input-block">\n' +
            '                    <input type="radio" name="isMatch" value="yes" title="是" lay-verify="required" lay-filter="isMatch">\n' +
            '                    <input type="radio" name="isMatch" value="no" title="否" lay-verify="required" checked lay-filter="isMatch">\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div id="marchFileBox" style="display: none;">\n' +
            '                <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                    <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">转录组ID:</label>\n' +
            '                    <div class="layui-input-block">\n' +
            '                        <select id="configuration-id-num" name="configurationIDnum" lay-verify="required" lay-filter="configurationIDnum"></select>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                    <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">蛋白组ID:</label>\n' +
            '                    <div class="layui-input-block">\n' +
            '                        <select id="proteome-id-num" name="proteomeIDnum" lay-verify="required" lay-filter="proteomeIDnum"></select>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="layui-form-item">\n' +
            '                <button class="layui-btn" lay-submit lay-filter="drawSVG" style="margin-left: calc(50% - 28px);">生成图像</button>\n' +
            '            </div>\n' +
            '            <div class="layui-form" style="position: relative;">\n' +
            '                <div class="card-title">集合元素</div>\n' +
            '            </div>\n' +
            '        <div>\n' +
            '        <table id="set-data" lay-filter="set-data" lay-size="sm"></table>\n' +
            '    </div>\n' +
            '</div>',
        colorSet: [
            [5],
            [3, 7],
            [1, 2, 4],
            [6, 8, 9]
        ]
    }

    win.quadrantChart = quadrantChart;

})(window);