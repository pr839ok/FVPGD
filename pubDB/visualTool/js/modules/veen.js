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
        svgHeight: 500,
        svgPadding: {left: 30, right: 60, top: 30, bottom: 30}
    };

    // 构造函数
    var veen = function (config) {
        if (_tool.checkConfig(config)) {
            _global.svg = visualUtil.initSVGDom(config.svgSelector, _config.svgPadding);
            _config = $.extend({}, _config, config);
            veen.prototype.type = "veen";
        }
    };

    // API方法
    veen.prototype = {
        //生成参数配置模块
        initParamBar: function () {

            // 左侧参数栏DOM层
            $(_config.paramPanels).empty();
            $(_param.paramPaneldom).appendTo(_config.paramPanels);
            _tool.initSetCard();
        },

        // 传入数据列
        dataCol: function (data) {
            if (_tool.checkData(data)) {

                _tool.setParamBar();

                let combinaData = _tool.getCombinaData(data, _global.dataCol);
                _global.dataCol = combinaData.dataCol;
                // 计算全排列
                let visualData = _tool.getFullyArranged(combinaData);

                // 绘图
                _tool.drawSVGPic(visualData, _global.dataCol);

                // 下载
                visualUtil.initDownload(veen.prototype.type)

                // svg布局调整
                visualUtil.resize('.set-svg');

            } else {
                layer.msg('数据有缺失项，请重新上传！', {icon: 2, time: 2000});
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

        // 设置参数栏
        setParamBar: function () {
            visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);
            _tool.initSetCard()
            _global.dataCol = new Array();
        },

        // 检查传入数据是否合法
        checkData: function (data) {
            var mainLength = data[0].length;

            for (let i = 1; i < data.length; i++) {
                if (data[i].length !== mainLength) {
                    return false;
                }
            }
            return true;
        },

        // 分解表头与表列，对表头进行隐射处理
        getCombinaData: function (data, dataCol) {
            var newData = new Array();

            //对列名进行映射处理，支持列名提供多字符
            var dataMapping = new Array();

            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i].length; j++) {
                    if (i === 0) {
                        dataCol.push(data[i][j]);
                        dataMapping.push(new Array(j, data[i][j]));
                        let tempObj = new Object();
                        tempObj.sets = dataMapping[j][0].toString();
                        tempObj.data = new Array();
                        newData.push(tempObj);
                    } else {
                        newData[j].data.push(data[i][j]);
                    }
                }
            }

            return {
                dataMapping: dataMapping,
                combinaData: newData,
                dataCol: dataCol
            }
        },

        // 计算全排列并调整格式
        getFullyArranged: function (combinaData) {
            var arrayTitle = new Array();
            // 计算全排列
            arrayTitle = _tool.getArrayTitle(combinaData.combinaData, 0, arrayTitle);

            //格式调整
            for (let i = 0; i < arrayTitle.length; i++) {
                arrayTitle[i].sets = arrayTitle[i].sets.split('');

                //表头反映射
                for (let j = 0; j < arrayTitle[i].sets.length; j++) {
                    for (let k = 0; k < combinaData.dataMapping.length; k++) {
                        if (arrayTitle[i].sets[j] == combinaData.dataMapping[k][0]) {
                            arrayTitle[i].sets[j] = combinaData.dataMapping[k][1];
                        }
                    }
                }

                arrayTitle[i].size = _tool.getArraySize(combinaData.dataCol.length, arrayTitle[i].sets.length);
            }

            return arrayTitle;
        },

        // 递归计算全排列
        getArrayTitle: function (data, index, group) {
            var need_apply = new Array();
            var need_apply_obj = new Object();
            need_apply_obj.sets = data[index].sets;
            need_apply_obj.data = data[index].data;
            need_apply.push(need_apply_obj);
            for (var i = 0; i < group.length; i++) {
                var tempObj = new Object();
                tempObj.sets = group[i].sets + data[index].sets;
                //计算交集
                tempObj.data = _tool.getInterSection(group[i].data, data[index].data);
                //交集去重
                for (let j = 0; j < tempObj.data.length; j++) {
                    group[i].data.splice(group[i].data.indexOf(tempObj.data[j]), 1);
                    data[index].data.splice(data[index].data.indexOf(tempObj.data[j]), 1);
                }
                need_apply.push(tempObj);
            }
            group.push.apply(group, need_apply);

            if (index + 1 >= data.length) {
                return group;
            } else {
                return _tool.getArrayTitle(data, index + 1, group);
            }
        },

        // 计算两个集合的合集
        getInterSection: function (a, b) {
            //计算交集
            var interSection = a.filter(function (v) {
                return b.indexOf(v) > -1;
            })

            return interSection;
        },

        getArraySize: function (colSize, arraySize) {
            if (colSize === 2) {
                if (arraySize === 1) {
                    return 16;
                } else if (arraySize === 2) {
                    return 8;
                }
            } else if (colSize === 3) {
                if (arraySize === 1) {
                    return 16;
                } else if (arraySize === 2) {
                    return 4;
                } else if (arraySize === 3) {
                    return 2;
                }
            } else if (colSize === 4) {
                if (arraySize === 1) {
                    return 32;
                } else if (arraySize === 2) {
                    return 16;
                } else if (arraySize === 3) {
                    return 8;
                } else if (arraySize === 4) {
                    return 2;
                }
            }
        },

        // 绘图
        drawSVGPic: function (dataset, dataCol) {
            var transition = _param.transition(dataCol.length);

            var point = _param.point(dataCol.length);

            var color = visualParam.color.schemeCategory10;
            _global.svg = visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);
            let svgSelector = _config.svgSelector;

            let svgwidth = _config.svgWidth,
                svgheight = _config.svgHeight,
                padding = _config.svgPadding;

            let width = svgwidth - padding.left - padding.right;
            let height = svgheight - padding.top - padding.bottom;

            let svg = _global.svg,
                bigg = svg.select('g');

            //提示框
            let tooltip = d3.select(".tooltip");

            var g = bigg.selectAll('.g')
                .data(dataset)
                .enter()
                .append('g')
                .each(function (d) {
                    var obj = d3.select(this);
                    obj.attr('data-venn-sets', d.sets.join('_'));
                    if (d.sets.length > 1) {
                        obj.attr('class', 'venn-area venn-intersection');
                    } else {
                        obj.attr('class', 'venn-area venn-circle');
                    }
                })

            //添加图形
            svg.selectAll('g.venn-circle')
                .each(function (d, i) {
                    if(dataCol.length > 3){
                        d3.select(this)
                            .append('ellipse')
                            .attr('opacity', '0.25')
                            .attr('cx', transition[i].cx)
                            .attr('cy', transition[i].cy)
                            .attr('rx', transition[i].rx)
                            .attr('ry', transition[i].ry)
                            .style('fill', color(i))
                            .attr('transform', 'rotate(' + transition[i].rotate + ',' + transition[i].cx + ',' + transition[i].cy + ')');
                    }else{
                        d3.select(this)
                            .append('circle')
                            .attr('opacity', '0.25')
                            .attr('cx', transition[i].cx)
                            .attr('cy', transition[i].cy)
                            .attr('r', transition[i].r)
                            .style('fill', color(i))
                    }

                });

            //添加文字
            var dot = g.append('text')
                .attr('class', 'label')
                .each(function (d, i) {
                    var that = d3.select(this);
                    that.attr('transform', 'translate(' + point[i].rx + ',' + point[i].ry + ')')
                        .text(function () {
                            if (d.sets.length === 1) {
                                return d.data.length + '(' + d.sets.join('') + ')';
                            } else {
                                return d.data.length;
                            }
                        })
                        .attr('fill', function () {
                            if (d.sets.length === 1) {
                                return color(point[i].text);
                            }
                        })
                        .on("click", function (d) {
                            _tool.chartClickFunc(d, dataCol);
                        });

                    let msg = d.data.toString().split(',').join('、')
                    visualUtil.toolTipEvent(this,svgSelector,tooltip,msg);
                });

            //侧边提示栏
            var identify = _global.svg.append('g')
                .attr('class', 'dataIdentify')
                .attr("transform", "translate(" + (padding.left + width) + "," + (padding.top + 100) + ")")
            
            $.each(dataCol,function (index, element) {
                var identifyItem = identify.append('g')
                    .attr("transform", "translate(" + 0 + "," + (index * 45) + ")")
                    .attr('id', 'symbol_' + element)
                    .attr('class', 'input-group');

                identifyItem.append('circle')
                    .attr('class','symbol_' + element + ' input-group-text colorpicker-input-addon')
                    .attr('cx','30')
                    .attr('cy','10')
                    .attr('r','3')
                    .attr('fill',color(index));

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
                    $('.set-svg')
                        .find('g[data-venn-sets='+ element +']')
                        .children('circle')
                        .css('fill',e.color.toString());
                    $('.set-svg')
                        .find('g[data-venn-sets='+ element +']')
                        .children('text')
                        .css('fill',e.color.toString());
                    $('.set-svg')
                        .find('g[data-venn-sets='+ element +']')
                        .children('ellipse')
                        .css('fill',e.color.toString());

                })
            })
        },

        // 单击图形交互事件
        chartClickFunc: function (d, dataCol) {

            var temp = new Array();
            for (let i = 0; i < dataCol.length; i++) {
                if (d.sets.indexOf(dataCol[i]) !== -1) {
                    temp.push(1);
                } else {
                    temp.push(0);
                }
            }
            $('#chart-logical-number').text(temp.join(''));
            $('#chart-size').text(d.data.length);
            $('#chart-title').text(d.sets.join('、'));

            //更新表格
            var tempData = new Array();
            for (let j = 0; j < d.data.length; j++) {
                tempData.push({name: d.data[j]});
            }
            _tool.initSetCard(tempData);
        },

        //渲染表格
        initSetCard: function (data) {
            if (!data) {
                data = new Array();
            }

            visualUtil.init(function (obj) {
                obj.table.render({
                    elem: '#set-data',
                    height: 312,
                    page: true,
                    data: data,
                    cols: [[
                        {field: 'name', title: '详细项', sort: true,}]]
                });
            })
        },


    };

    // 内部常量
    const _param = {
        // 参数配置dom
        paramPaneldom:
            '<div class="layui-card">\n' +
            '    <div class="layui-card-header" id="chart-title"></div>\n' +
            '    <div class="layui-card-body">\n' +
            '        <div class="layui-form" style="position: relative;">\n' +
            '            <div class="card-title">集合简介</div>\n' +
            '        </div>\n' +
            '        <div style="margin-top: 10px">\n' +
            '            <dlv class="layui-form-item">\n' +
            '                <label class="layui-form-label" style="width: 120px;box-sizing: content-box;">Logical Number:</label>\n' +
            '                <div class="layui-input-block">' +
            '                   <label class="layui-form-label" id="chart-logical-number"></label>\n' +
            '                </div>' +
            '            </dlv>\n' +
            '            <dlv class="layui-form-item">\n' +
            '                <label class="layui-form-label" style="width: 120px;box-sizing: content-box;">Number:</label>\n' +
            '                <div class="layui-input-block">' +
            '                    <label class="layui-form-label" id="chart-size"></label>\n' +
            '                </div>' +
            '            </dlv>\n' +
            '        </div>\n' +
            '        <div class="layui-form" style="position: relative;">\n' +
            '            <div class="card-title">集合元素</div>\n' +
            '        </div>\n' +
            '     <div>\n' +
            '     <table id="set-data" lay-filter="set-data" lay-size="sm"></table>\n' +
            '</div>',

        // 图形参数
        transition: function (length) {
            if (length === 4) {
                return [
                    {cx: 300, cy: 170, rx: 80, ry: 140, rotate: 310},
                    {cx: 300, cy: 170, rx: 80, ry: 140, rotate: 50},
                    {cx: 250, cy: 210, rx: 80, ry: 140, rotate: 310},
                    {cx: 350, cy: 210, rx: 80, ry: 140, rotate: 50}
                ]
            }else if(length === 2){
                return [
                    {cx: 230, cy: 180, r: 100},
                    {cx: 370, cy: 180, r: 100}
                ]
            }else if(length === 3){
                return [
                    {cx: 234.8, cy: 231.3, r: 103.6},
                    {cx: 365.1, cy: 231.3, r: 103.6},
                    {cx: 300, cy: 118.6, r: 103.6}
                ]
            }
        },

        // 数据点位置
        point: function (length) {
            if (length === 4) {
                return [
                    {rx: 210, ry: 90, text: 0},
                    {rx: 340, ry: 90, text: 1},
                    {rx: 290, ry: 120},
                    {rx: 140, ry: 180, text: 2},
                    {rx: 200, ry: 140},
                    {rx: 200, ry: 230},
                    {rx: 230, ry: 180},
                    {rx: 410, ry: 180, text: 3},
                    {rx: 380, ry: 230},
                    {rx: 380, ry: 140},
                    {rx: 360, ry: 180},
                    {rx: 290, ry: 300},
                    {rx: 340, ry: 270},
                    {rx: 250, ry: 270},
                    {rx: 290, ry: 210},
                ]
            }else if(length === 2){
                return [
                    {rx: 230, ry: 180, text: 0},
                    {rx: 370, ry: 180, text: 1},
                    {rx: 300, ry: 180}
                ]
            }else if(length === 3){
                return [
                    {rx: 199, ry: 251, text: 0},
                    {rx: 400, ry: 251, text: 1},
                    {rx: 300, ry: 256},
                    {rx: 299, ry: 78, text: 2},
                    {rx: 245, ry: 162},
                    {rx: 354, ry: 162},
                    {rx: 300, ry: 193},
                ]
            }
        }
    };

    win.veen = veen;
})(window);