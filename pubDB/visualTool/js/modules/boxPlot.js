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
    var boxPlot = function (config) {
        if (_tool.checkConfig(config)) {
            _global.svg = visualUtil.initSVGDom(config.svgSelector, _config.svgPadding);
            _config = $.extend({}, _config, config);
            _tool.init();
            boxPlot.prototype.type = "boxPlot";
            boxPlot.prototype.initflag = false;


        }
    };

    // API方法
    boxPlot.prototype = {
        //生成参数配置模块
        initParamBar: function () {
            $(_config.paramPanels).empty();
            $(_param.paramPaneldom).appendTo(_config.paramPanels);

            // 监听提交按钮
            visualUtil.init(function (obj) {
                obj.form.on('submit(drawSVG)', function (d) {
                    var value = obj.formSelects.value('select-file', 'val');
                    if (value.length > 0) {

                        if(d.field.limit < 0){
                            layer.msg("限制行不能少于0", {icon: 2});
                            return;
                        }

                        _global.svgdata = [];

                        //筛掉少于最少列的数据
                        let filterData = _tool.filterUploadData(_global.uploaddata, d.field.limit);
                        console.log(filterData);
                        let flag = _tool.cheakNotNull(filterData.data);
                        if(flag.status){
                            _tool.promptFailData(filterData.failed);
                        }else{
                            let msg = flag.msg;
                            layer.msg(msg,{icon:2});
                            return;

                        }

                        let maxBound, minBound,
                            firstKey = Object.keys(filterData.data[value[0]]);

                        //计算所有值的最值
                        var tempArray = filterData.data[value[0]][firstKey[0]].sort(visualUtil.numSort);
                        maxBound = tempArray[tempArray.length - 1];
                        minBound = tempArray[0];

                        for (let i = 0; i < value.length; i++) {
                            var data = filterData.data[value[i]];
                            _global.svgdata = _tool.combinData(data, _global.svgdata);

                            var keys = Object.keys(filterData.data[value[i]]);
                            for (let j = 0; j < keys.length; j++) {
                                var array = filterData.data[value[i]][keys[j]].sort(visualUtil.numSort);
                                if (array[array.length - 1] > maxBound) {
                                    maxBound = array[array.length - 1];
                                }
                                if (array[0] < minBound) {
                                    minBound = array[0];
                                }
                            }
                        }

                        let options = {};
                        options.maxBound = maxBound;
                        options.minBound = minBound;
                        options.xname = d.field.xname;
                        options.yname = d.field.yname;

                        // 配置点击生成图形按钮处理
                        if(_config.submit && typeof _config.submit === "function"){
                            _config.submit();
                        }
                        _tool.drawSVGPic(_global.svgdata,options);

                        visualUtil.initDownload(boxPlot.prototype.type);

                        visualUtil.resize('.set-svg');
                    } else {
                        layer.msg('请至少选择一个文件生成图像', {icon: 2, time: 2000});
                        return;
                    }

                })
            })
        },

        // 传入数据列
        dataCol: function (data) {
            visualUtil.init(function (obj) {
                visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);
                let result = _tool.setData(data, _global.uploaddata);

                if (result.flag) {
                    _global.uploaddata = result.uploaddata;
                    boxPlot.prototype.initflag = true;

                    $('#chart-title').html('<span style="color: red">数据上传成功，请配置图形参数</span>');

                    //渲染单选框(选中所有值)
                    var tempObj = {};
                    tempObj.arr = [];
                    var keys = Object.keys(_global.uploaddata);
                    for (let i = 0; i < keys.length; i++) {
                        var temp = {};
                        temp.name = keys[i];
                        temp.value = keys[i];
                        temp.selected = 'selected';     //选中

                        tempObj.arr.push(temp);
                    }
                    obj.formSelects.data('select-file', 'local', tempObj);
                    $('#x-axis-name').val('X');
                    $('#y-axis-name').val('Y');
                    $('#limit').val('10');
                }
            });
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

        // 检查筛选后是否有剩余数据
        cheakNotNull: function(data){
            let value = Object.keys(data);

            for (let i = 0; i < value.length; i++) {
                if (Object.keys(data[value[i]]).length > 0) {
                    return {
                        status: true
                    };
                }
            }
            return {
                status: false,
                msg: '无低于最少列的数据'
            };
        },

        // 传入对象处理
        setData: function (data, uploaddata) {
            let flag = false;

            if (visualUtil.checkData(data)) {

                flag = true;
                var tempObj = {};

                for (let i = 0; i < data[0].length; i++) {
                    tempObj[data[0][i]] = [];
                }
                var keys = Object.keys(tempObj);

                for (let i = 1; i < data.length; i++) {

                    for (let j = 0; j < data[i].length; j++) {
                        // 筛选无效值
                        if(data[i][j] != 9999999){
                            tempObj[keys[j]].push(data[i][j]);
                        }
                    }
                }

                var length = Object.keys(uploaddata).length;
                var msgTitle = "group" + (length + 1);
                uploaddata[msgTitle] = tempObj;

                return {
                    flag: flag,
                    uploaddata: uploaddata
                };

            } else {
                layer.msg('数据有缺失项，请重新上传！', {icon: 2, time: 2000});
                throw new Error("the format of uploadData is not valid!");
            }

        },

        // 拼接数据
        combinData: function (data, svgdata) {
            var keys = new Array();
            for (let i = 0; i < svgdata.length; i++) {
                keys.push(Object.keys(svgdata[i])[0]);
            }
            var newKey = Object.keys(data);

            for (let i = 0; i < newKey.length; i++) {
                // 判断此列在当前数组是否存在
                let index = keys.indexOf(newKey[i]);
                var temp = {};
                temp.data = data[newKey[i]];

                if (index !== -1) {
                    svgdata[[index]][keys[index]].push(temp);
                } else {
                    let tempArr = [];
                    tempArr.push(temp);
                    let tempObj = {};
                    tempObj[newKey[i]] = tempArr;
                    svgdata.push(tempObj);
                }
            }
            return _tool.pretreatData(svgdata);
        },

        // 数据预处理，计算上下四分位、中位数、极值、异常值
        pretreatData: function (data) {
            let keys = [];
            for (let i = 0; i < data.length; i++) {
                keys.push(Object.keys(data[i])[0]);
            }

            for (let i = 0; i < keys.length; i++) {

                for (let j = 0; j < data[i][keys[i]].length; j++) {

                    var dataArray = data[i][keys[i]][j].data;

                    var q1, q2, q3, miniNum, maxiNum, outLier = [];

                    //转换数字
                    for (let k = 0; k < dataArray.length; k++) {
                        dataArray[k] = parseFloat(dataArray[k]);
                    }
                    dataArray.sort(_param.sortNumber);
                    let length = dataArray.length;

                    //中四分位计算
                    // if (length % 2 === 0) {
                    //     let ceil = Math.ceil(length % 2);
                    //     let floor = Math.floor(length % 2)
                    //     q2 = (dataArray[ceil - 1] + dataArray[floor - 1]) / 2;
                    //
                    // } else {
                    //     q2 = dataArray[(length + 1) / 2 - 1];
                    // }

                    //上下四分位计算
                    // let size = (length + 1) * 0.25;
                    // if (Number.isInteger(size)) {
                    //     q1 = dataArray[size - 1];
                    //     q3 = dataArray[size * 3 - 1];
                    // } else {
                    //     let q1floor = Math.floor(size);
                    //     let q1decimal = size % 1;
                    //     q1 = dataArray[q1floor - 1] * (1 - q1decimal) + dataArray[q1floor] * q1decimal;
                    //
                    //     let q3floor = Math.floor(size * 3);
                    //     let q3decimal = (size * 3) % 1;
                    //     q3 = dataArray[q3floor - 1] * (1 - q3decimal) + dataArray[q3floor] * q3decimal;
                    // }

                    // 上中下四分位计算
                    q1 = d3.quantile(dataArray, 0.25);
                    q2 = d3.quantile(dataArray, 0.5);
                    q3 = d3.quantile(dataArray, 0.75);

                    //计算异常值
                    var iqr = q3 - q1;
                    var maxBound = q3 + 1.5 * iqr;
                    var minBound = q1 - 1.5 * iqr;
                    var suitBound = new Array();

                    for (let l = 0; l < dataArray.length; l++) {
                        if (dataArray[l] > maxBound && dataArray[l] < minBound) {
                            outLier.push(dataArray[l]);
                        } else {
                            suitBound.push(dataArray[l]);
                        }
                    }

                    //计算上下边缘值
                    suitBound.sort(_param.sortNumber);
                    miniNum = suitBound[0];
                    maxiNum = suitBound[suitBound.length - 1];

                    //保存

                    data[i][keys[i]][j].q1 = q1;
                    data[i][keys[i]][j].q2 = q2;
                    data[i][keys[i]][j].q3 = q3;
                    data[i][keys[i]][j].miniNum = miniNum;
                    data[i][keys[i]][j].maxiNum = maxiNum;
                    data[i][keys[i]][j].outLier = outLier;
                }
            }

            return data;

        },
        // 绘图
        drawSVGPic: function (data, options) {
            _global.svg = visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);
            let svgSelector = _config.svgSelector;

            let svgwidth = _config.svgWidth;
            let svgheight = _config.svgHeight;
            let padding = _config.svgPadding;
            let color = visualParam.color.schemePastel1;

            let width = svgwidth - padding.left - padding.right;
            let height = svgheight - padding.top - padding.bottom;

            let keys = [];

            for (let i = 0; i < data.length; i++) {
                keys.push(Object.keys(data[i]));
            }

            let xScaleArray = _tool.getXScaleArray(keys, width),
                ordinalWidth = xScaleArray[1] - xScaleArray[0];

            let svg = _global.svg,
                g = svg.select('g');

            //提示框
            let tooltip = d3.select(".tooltip");

            //比例尺
            let x = visualUtil.setAxis(svg, {
                domain: keys,
                range: xScaleArray,
                type: 1,
                axis: 1,
                axisTranslate: [0, height],
                tickSize: -1 * height,
                text: options.xname,
                textTranslate: [width / 2, 28],
            });

            visualUtil.setAxis(svg, {
                domain: keys,
                rangeRound: [0, width],
                type: 2,
                axis: 1,
                axisTranslate: [0, height],
            });

            let y = visualUtil.setAxis(svg, {
                domain: [options.minBound, options.maxBound],
                range: [height, 0],
                axis: 0,
                type: 0,
                axisTranslate: [0, 0],
                tick: 5,
                tickSize: -1 * width,
                text: options.yname,
                textTranslate: [0, -10]
            });

            var path_d = x.axis.select('path').attr('d');
            path_d = path_d.split(',');
            path_d[0] = 'M0';
            x.axis.select('path').attr('d', path_d.join(','));
            x.axis.selectAll('.tick >text')
                .style('display', 'none');

            //数据间隔
            var rectInterval = 20;

            //制作每组数据
            var svgData = g.append('g')
                .attr('class', 'svgData');

            svgData.selectAll('g')
                .attr('class', 'datagroup')
                .data(data)
                .enter()
                .append('g')
                .each(function (d) {
                    var self = d3.select(this);
                    self.attr("transform", 'translate(' + (x.scale(Object.keys(d)) - ordinalWidth) + ',' + 0 + ')');


                    var temp = [];
                    for (let j = 0; j < d[Object.keys(d)].length; j++) {
                        temp.push(j);
                    }
                    //段内比例尺
                    var innerScale = d3.scaleBand()
                        .domain(temp)
                        .range([0, ordinalWidth])

                    var dataItem = self.selectAll('g')
                        .attr('class', 'dataItem')
                        .data(d[Object.keys(d)])
                        .enter()
                        .append('g');

                    dataItem.each(function (d1, i1) {
                        var that = d3.select(this);
                        //四分位矩形
                        that.append('rect')
                            .attr('class', 'rectData')
                            .attr('class', 'rectgroup' + i1)
                            .attr('x', function () {
                                return innerScale(i1) + rectInterval / 2;
                            })
                            .attr('y', function () {
                                return y.scale(d1.q3);
                            })
                            .attr('width', function () {
                                return innerScale.bandwidth() - rectInterval;
                            })
                            .attr('height', function () {
                                return y.scale(d1.q1) - y.scale(d1.q3);
                            })
                            .attr('fill', function () {
                                return color(i1);
                            })

                        //异常值
                        that.each(function () {
                            d3.select(this)
                                .selectAll('circle')
                                .attr('class', 'outLier')
                                .data(d1.outLier)
                                .enter()
                                .append('circle')
                                .attr('cx', function () {
                                    return innerScale(i1) + rectInterval / 2 + innerScale.bandwidth() / 2;
                                })
                                .attr('cy', function (data) {
                                    return y.scale(data)
                                })
                                .attr('r', '2')
                                .each(function (data) {
                                    let msg = "outLier:" + data;
                                    visualUtil.toolTipEvent(this,svgSelector,tooltip,msg);
                                })
                        });

                        //上四分位延长线
                        that.append('path')
                            .attr('class', 'q3data')
                            .attr('d', function () {
                                return "M" + (innerScale(i1) + rectInterval / 2 + (innerScale.bandwidth() - rectInterval) / 2) + "," +
                                    y.scale(d1.maxiNum) + "V" + y.scale(d1.q3);
                            })
                            .attr("stroke", 'rgba(0,0,0,.7)')
                            .attr("stroke-dasharray", '1,1')

                        //下四分位延长线
                        that.append('path')
                            .attr('class', 'q1data')
                            .attr('d', function () {
                                return "M" + (innerScale(i1) + rectInterval / 2 + (innerScale.bandwidth() - rectInterval) / 2) + "," +
                                    y.scale(d1.miniNum) + "V" + y.scale(d1.q1);
                            })
                            .attr("stroke", 'rgba(0,0,0,.7)')
                            .attr("stroke-dasharray", '1,1')

                        //上四分位线
                        that.append('path')
                            .attr('class', 'q3')
                            .attr("d", function () {
                                return "M" + (innerScale(i1) + rectInterval / 2) + ',' +
                                    y.scale(d1.q3) + 'H' + (innerScale(i1) - rectInterval / 2 + innerScale.bandwidth())
                            })
                            .attr("stroke", 'rgba(0,0,0,.7)')
                            .attr("stroke-width", '2')
                            .each(function (data) {
                                let msg = "q3:" + d1.q3
                                visualUtil.toolTipEvent(this,svgSelector,tooltip,msg);
                            })

                        //下四分位线
                        that.append('path')
                            .attr('class', 'q1')
                            .attr("d", function () {
                                return "M" + (innerScale(i1) + rectInterval / 2) + ',' +
                                    y.scale(d1.q1) + 'H' + (innerScale(i1) - rectInterval / 2 + innerScale.bandwidth())
                            })
                            .attr("stroke", 'rgba(0,0,0,.7)')
                            .attr("stroke-width", '2')
                            .each(function (data) {
                                let msg = "q1:" + d1.q1
                                visualUtil.toolTipEvent(this,svgSelector,tooltip,msg);
                            })

                        //最大值点
                        that.append('circle')
                            .attr('class', 'maxiNum')
                            .attr('cx', function () {
                                return innerScale(i1) + rectInterval / 2 + (innerScale.bandwidth() - rectInterval) / 2;
                            })
                            .attr('cy', function () {
                                return y.scale(d1.maxiNum)
                            })
                            .attr('r', '2')
                            .each(function (data) {
                                let msg = "maxiNum:" + d1.maxiNum
                                visualUtil.toolTipEvent(this,svgSelector,tooltip,msg);
                            })

                        //最小值点
                        that.append('circle')
                            .attr('class', 'miniNum')
                            .attr('cx', function () {
                                return innerScale(i1) + rectInterval / 2 + (innerScale.bandwidth() - rectInterval) / 2;
                            })
                            .attr('cy', function () {
                                return y.scale(d1.miniNum)
                            })
                            .attr('r', '2')
                            .each(function (data) {
                                let msg = "miniNum:" + d1.miniNum
                                visualUtil.toolTipEvent(this,svgSelector,tooltip,msg);
                            })

                        // 中位线
                        that.append('path')
                            .attr('class', 'q2')
                            .attr("d", function () {
                                return "M" + (innerScale(i1) + rectInterval / 2) + ',' +
                                    y.scale(d1.q2) + 'H' + (innerScale(i1) - rectInterval / 2 + innerScale.bandwidth())
                            })
                            .attr("stroke", 'rgba(0,0,0,.7)')
                            .attr("stroke-width", '4')
                            .each(function (data) {
                                let msg = "q2:" + d1.q2
                                visualUtil.toolTipEvent(this,svgSelector,tooltip,msg);
                            })

                    })
                })


            //计算最大组
            var maxGroup = 0;
            for (let i = 0; i < data.length; i++) {
                var length = data[i][Object.keys(data[i])].length;

                if (length > maxGroup) {
                    maxGroup = length;
                }
            }
            //侧标识
            var identify = svg.append('g')
                .attr('class', 'dataIdentify')
                .attr("transform", "translate(" + (padding.left + width) + "," + padding.top + ")")


            for (let i = 0; i < maxGroup; i++) {
                var identifyItem = identify.append('g')
                    .attr("transform", "translate(" + 0 + "," + (i * 45) + ")")
                    .attr('id', 'symbol_' + i)
                    .attr('class', 'input-group');

                identifyItem.append('rect')
                    .attr('class', 'symbol_' + i + ' input-group-text colorpicker-input-addon')
                    .attr('x', '15')
                    .attr('y', '10')
                    .attr('width', '30')
                    .attr('height', '20')
                    .attr('fill', function () {
                        return color(i);
                    })
                    .attr('stroke', 'black');

                identifyItem.append('path')
                    .attr('d', 'M15,20 H45')
                    .attr('stroke', 'black');

                identifyItem.append('text')
                    .text("group" + (i + 1))
                    .attr('transform', 'translate(10,45)')
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
                        .find('.rectgroup' + i)
                        .css('fill', e.color.toString());
                });
                $('#symbol_' + i).on('colorpickerShow', function (e) {
                    let id = $('.' + e.currentTarget.id).attr('aria-describedby');
                    let targetdiv = $('#' + id);
                    // z-index高于弹层
                    targetdiv.css('z-index', '99999999')
                    //抵消bootstrap 3 版本的样式
                        .css('opacity', '1');
                });

            }

        },


        //计算x轴比例尺比例
        getXScaleArray: function (data, range) {
            var array = new Array();
            var ticks = range % data.length / 2;
            var bandWidth = range / data.length;
            for (let i = 0; i < data.length; i++) {
                array.push(ticks + (i + 1) * bandWidth);
            }

            return array;
        },


        // 筛选低于限制行的数据
        filterUploadData: function(obj, limit){
            let failedObj = {},
                failedKey = [];

            let data = JSON.parse(JSON.stringify(obj))
            let keys = Object.keys(data);
            for (let i = 0; i < keys.length; i++) {
                let subKeys = Object.keys(data[keys[i]]);
                for (let j = 0; j < subKeys[j]; j++) {
                    if(data[keys[i]][subKeys[j]].length < limit){
                        delete data[keys[i]][subKeys[j]];
                        if(failedKey.indexOf(keys[i]) === -1){
                            failedKey.push(keys[i]);
                            failedObj[keys[i]] = [subKeys[j]];
                        }else{
                            failedObj[keys[i]].push(subKeys[j]);
                        }
                    }
                }
            }

            return {
                data: data,
                failed: failedObj
            }
        },

        // 提示无效数据
        promptFailData: function(data){
            let keys = Object.keys(data),
                msg = '';
            if(keys.length > 0){
                msg = '以下数据低于最少行：';
            }
            else{
                return;
            }
            for (let i = 0; i < keys.length; i++) {
                msg += '\n' + keys[i] + ": ";
                for (let j = 0; j < data[keys[i]].length; j++) {
                    msg +=  data[keys[i]][j] + ';';
                }
            }

            setTimeout(function () {
                layer.msg(msg, {icon: 0});
            }, 1000)
        }
    };


    // 内部常量
    const _param = {
        paramPaneldom:
            '<div class="layui-card">\n' +
            '     <div class="layui-card-header" id="chart-title"></div>\n' +
            '     <div class="layui-card-body">\n' +
            '          <div class="layui-form" style="position: relative;">\n' +
            '               <div class="card-title">参数设置</div>\n' +
            '               <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                    <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">作图文件:</label>\n' +
            '                    <div class="layui-input-block">\n' +
            '                         <select name="select-file" id="select-file" xm-select="select-file" xm-select-show-count="2"></select>\n' +
            '                    </div>\n' +
            '               </div>\n' +
            '               <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                    <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">限制行:</label>\n' +
            '                    <div class="layui-input-block">\n' +
            '                         <input class="layui-input" autocomplete="off" id="limit" name="limit" lay-verify="required"/>\n' +
            '                    </div>\n' +
            '               </div>\n' +
            '               <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                    <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">X轴名:</label>\n' +
            '                    <div class="layui-input-block">\n' +
            '                         <input class="layui-input" autocomplete="off" id="x-axis-name" name="xname" lay-verify="required"/>\n' +
            '                    </div>\n' +
            '               </div>\n' +
            '               <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                    <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">Y轴名:</label>\n' +
            '                    <div class="layui-input-block">\n' +
            '                         <input class="layui-input" autocomplete="off" id="y-axis-name" name="yname" lay-verify="required"/>\n' +
            '                    </div>\n' +
            '               </div>\n' +
            '               <div class="layui-form-item">\n' +
            '                    <button class="layui-btn" lay-submit lay-filter="drawSVG" style="margin-left: calc(50% - 28px);">生成图像</button>\n' +
            '               </div>\n' +
            '          </div>\n' +
            '    </div>\n' +
            '</div>',

        sortNumber: function (a, b) {
            return a - b
        },
    }


    win.boxPlot = boxPlot;

})(window);