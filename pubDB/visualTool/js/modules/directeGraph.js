;(function (joint, win) {

    "use strict";

    // 全局变量
    var _global = {};

    //配置
    var _config = {};

    // 构造函数入口
    function DirectGraph(config){
        // 检查选择器
        if(!config.svgSelector || $(config.svgSelector).length === 0){
            throw new Error("DirectGraph selector param is invalid!");
        }
        _config = $.extend({}, _config, config);

        DirectGraph.prototype.type = "directGraph";
        DirectGraph.prototype.initflag = false;
    }

    // API方法
    DirectGraph.prototype = {
        //生成参数配置模块
        initParamBar: function () {
            $(_config.svgSelector)
                .css('border','1px solid lightgray')
                .css('overflow-x', 'auto')
                .css('min-width', '100%');

            // 控制容器
            $(_param.templateDom).insertBefore('body');
            $(_param.layoutDom).appendTo(_config.svgSelector);

            // 绘图容器
            $('<div id="layout-view"></div>').appendTo(_config.svgSelector);
            $('#layout-view')
                .css('background-color', '#fff')
                .css('min-width', '100%');

            _global.LinkControls = joint.mvc.View.extend({

                // 渲染参数
                highlighter: {
                    name: 'stroke',
                    options: {
                        attrs: {
                            'stroke': 'lightcoral',
                            'stroke-width': 4
                        }
                    }
                },

                events: {
                    change: 'updateLink',
                    input: 'updateLink'
                },

                init: function() {
                    this.highlight();
                    this.updateControls();
                },

                updateLink: function() {
                    this.options.cellView.model.set(this.getModelAttributes(), { layout: true });
                },

                // 设置初始值
                updateControls: function() {

                    var link = this.options.cellView.model;

                    this.$('#labelpos').val(link.get('labelPosition'));
                    this.$('#labeloffset').val(link.get('labelOffset'));
                    this.$('#minlen').val(link.get('minLen'));
                    this.$('#weight').val(link.get('weight'));
                },

                // 获取参数值
                getModelAttributes: function() {
                    return {
                        minLen: parseInt(this.$('#minlen').val(), 10),
                        weight: parseInt(this.$('#weight').val(), 10),
                        labelPosition: this.$('#labelpos').val(),
                        labelOffset: parseInt(this.$('#labeloffset').val(), 10)
                    };
                },

                // 取消渲染
                onRemove: function() {
                    this.unhighlight();
                },

                // 渲染矩形
                highlight: function() {
                    this.options.cellView.highlight('rect', { highlighter: this.highlighter });
                },

                // 取消渲染矩形
                unhighlight: function() {
                    this.options.cellView.unhighlight('rect', { highlighter: this.highlighter });
                }

            }, {

                create: function(linkView) {
                    this.remove();
                    this.instance = new this({
                        el: this.template.cloneNode(true),
                        cellView: linkView
                    });
                    this.instance.$el.insertAfter('#layout-controls');
                },

                remove: function() {
                    if (this.instance) {
                        this.instance.remove();
                        this.instance = null;
                    }
                },

                refresh: function() {
                    if (this.instance) {
                        this.instance.unhighlight();
                        this.instance.highlight();
                    }
                },

                instance: null,

                template: document.getElementById('link-controls-template').content.querySelector('.controls')

            });

            // 布局控制器
            _global.LayoutControls = joint.mvc.View.extend({

                // 事件监听，输入或修改时重新布局
                events: {
                    change: 'layout',
                    input: 'layout'
                },

                // 选项
                options: {
                    padding: 50
                },


                // 初始化入口
                init: function() {

                    var options = this.options;
                    if (options.adjacencyList) {
                        options.cells = this.buildGraphFromAdjacencyList(options.adjacencyList);
                    }

                    // 监听纸张模型，每次变换时重新布局
                    this.listenTo(options.paper.model, 'change', function(cell, opt) {
                        if (opt.layout) {
                            this.layout();
                        }
                    });
                },

                // 布局函数
                layout: function() {

                    var paper = this.options.paper;
                    var graph = paper.model;
                    var cells = this.options.cells;

                    joint.layout.DirectedGraph.layout(cells, this.getLayoutOptions());

                    // 支持0结点
                    if (graph.getCells().length === 0) {
                        graph.resetCells(cells);
                    }

                    paper.fitToContent({
                        padding: this.options.padding,
                        allowNewOrigin: 'any'
                    });

                    this.trigger('layout');
                },

                // 获得布局属性
                getLayoutOptions: function() {
                    return {
                        setVertices: true,
                        setLabels: true,
                        ranker: this.$('#ranker').val(),
                        rankDir: this.$('#rankdir').val(),
                        rankSep: parseInt(this.$('#ranksep').val(), 10),
                        edgeSep: parseInt(this.$('#edgesep').val(), 10),
                        nodeSep: parseInt(this.$('#nodesep').val(), 10)
                    };
                },

                // 绘制图形
                buildGraphFromAdjacencyList: function(adjacencyList) {

                    var elements = [];
                    var links = [];

                    Object.keys(adjacencyList).forEach(function(parentLabel) {
                        // 添加结点
                        elements.push(
                            new _tool.Shape({ id: parentLabel }).setText(parentLabel)
                        );
                        // 根据线段类型添加线段
                        adjacencyList[parentLabel].forEach(function(childLabel) {
                            if(childLabel.type == 1){
                                links.push(
                                    new _tool.promote().connect(parentLabel, childLabel.name)
                                );
                            }else if(childLabel.type == 2){
                                links.push(
                                    new _tool.inhibition().connect(parentLabel, childLabel.name)
                                );
                            };

                        });
                    });

                    return elements.concat(links);
                }

            });
            _config.viewSelector = '#layout-view';
        },

        // 传入数据列
        dataCol: function (data) {

            let combinaData = _tool.getDataCombina(data);
            if(combinaData.flag){

                DirectGraph.prototype.initflag = true;
                _tool.draw(combinaData.data);

                visualUtil.initDownload(DirectGraph.prototype.type);
                // visualUtil.resize('svg');

            }else{
                layer.msg('数据有缺失项，请重新上传！', {icon: 2, time: 2000});
                DirectGraph.prototype.initflag = false;
                throw new Error("the format of uploadData is not valid!");
            }

        }
    }

    //内部方法
    var _tool = {
        // 图形
        Shape: joint.dia.Element.define('demo.Shape', {
            size: {
                width: 100,
                height: 50
            },
            attrs: {
                body: {
                    refWidth: '100%',
                    refHeight: '100%',
                    fill: 'ivory',
                    stroke: 'gray',
                    strokeWidth: 2,
                    rx: 10,
                    ry: 10
                },
                label: {
                    refX: '50%',
                    refY: '50%',
                    yAlignment: 'middle',
                    xAlignment: 'middle',
                    fontSize: 15
                }
            },
            z: 1
        }, {
            markup: [{
                tagName: 'rect',
                selector: 'body'
            }, {
                tagName: 'text',
                selector: 'label'
            }],

            //设置结点文字
            setText: function(text) {
                return this.attr('label/text', text || '');
            }
        }),

        // 定义促进型连接线
        promote: joint.dia.Link.define('link.promote', {
            attrs: {
                line: {
                    connection: true,
                    stroke: 'gray',
                    strokeWidth: 2,
                    pointerEvents: 'none',
                    targetMarker: {
                        type: 'path',
                        fill: 'gray',
                        stroke: 'none',
                        d: 'M 10 -10 0 0 10 10 z'
                    }
                }
            },
            connector: {
                name: 'rounded'
            },
            z: -1,
            weight: 1,
            minLen: 1,
        }, {
            markup: [{
                tagName: 'path',
                selector: 'line',
                attributes: {
                    'fill': 'none'
                }
            }],

            // 设置连接对象
            connect: function(sourceId, targetId) {
                return this.set({
                    source: { id: sourceId },
                    target: { id: targetId }
                });
            },
        }),

        // 定义抑制型连接线
        inhibition: joint.dia.Link.define('link.inhibition', {
            attrs: {
                line: {
                    connection: true,
                    stroke: 'gray',
                    strokeWidth: 2,
                    strokeDasharray: '1,1',
                    pointerEvents: 'none',
                    targetMarker: {
                        'type': 'rect',
                        'width': 5,
                        'height': 20,
                        'y': -10,
                        'stroke': 'none'
                    }
                }
            },
            connector: {
                name: 'rounded'
            },
            z: -1,
            weight: 1,
            minLen: 1,
        }, {
            markup: [{
                tagName: 'path',
                selector: 'line',
                attributes: {
                    'fill': 'none'
                }
            }],

            connect: function(sourceId, targetId) {
                return this.set({
                    source: { id: sourceId },
                    target: { id: targetId , connectionPoint:
                            {
                                name:'boundary',
                                args:{
                                    offset:3,
                                    stroke:true
                                }
                            }}
                });
            },
        }),

        resetAll: function (paper) {

            paper.drawBackground({
                color: 'white'
            })

            var elements = paper.model.getElements();
            for (var i = 0, ii = elements.length; i < ii; i++) {
                var currentElement = elements[i];
                currentElement.attr('body/stroke', 'gray');
            }

            var links = paper.model.getLinks();
            for (var j = 0, jj = links.length; j < jj; j++) {
                var currentLink = links[j];
                currentLink.attr('line/stroke', 'gray');
            }
        },

        getDataCombina: function(value){
            let flag = true;
            var data = {};
            if(_tool.checkData(value)){
                var nodes = new Array();


                for (let i = 1; i < value.length; i++) {

                    //获取所有结点
                    if(nodes.indexOf(value[i][0]) === -1){
                        nodes.push(value[i][0]);
                        data[value[i][0]] = new Array();
                    }

                    if(nodes.indexOf(value[i][1]) === -1){
                        nodes.push(value[i][1]);
                        data[value[i][1]] = new Array();
                    }

                    // 拼接数据
                    let temp = {
                        name: value[i][1],
                        type: value[i][2]
                    }

                    data[value[i][0]].push(temp);
                }
            }
            return {
                flag: flag,
                data: data
            };
        },

        // 检查数据是否齐全
        checkData: function (data){
            var mainLength = data[0].length;

            for (var i = 1; i < data.length; i++) {
                if(data[i].length !== mainLength){
                    return false;
                }
            }
            return true;
        },

        // 绘图
        draw: function(data){
            $('#layout-view').empty();

            // 画纸
            let paper = new joint.dia.Paper({
                el: $(_config.viewSelector),
                interactive: function(cellView) {
                    return cellView.model.isElement();
                }
            });
            paper.on({
                //结点双击交互
                'element:pointerdblclick': function (elementView) {
                    _tool.resetAll(elementView.paper);

                    var currentElement = elementView.model;
                    currentElement.attr('body/stroke', 'orange');
                },
                // 空白处双击交互
                'blank:pointerdblclick': function () {
                    _tool.resetAll(paper);
                },
            })

            // 新建布局控制器
            var controls = new _global.LayoutControls({
                el: document.getElementById('layout-controls'),
                adjacencyList: data,
                paper: paper
            }).on({'layout': _global.LinkControls.refresh}, _global.LinkControls);

            controls.layout();
        }
    }


    // 常量
    const _param = {
        templateDom:
            '<template id="link-controls-template">\n' +
            '    <div id="link-controls" class="controls">\n' +
            '        <label for="labelpos">LabelPos:</label>\n' +
            '        <select id="labelpos">\n' +
            '            <option value="c">c</option>\n' +
            '            <option value="r">r</option>\n' +
            '            <option value="l">l</option>\n' +
            '        </select>\n' +
            '        <label for="minlen">MinLen:</label>\n' +
            '        <input id="minlen" type="range" min="1" max="5" value="1"/>\n' +
            '        <label for="weight">Weight:</label>\n' +
            '        <input id="weight" type="range" min="1" max="10" value="1"/>\n' +
            '        <label for="labeloffset">LabelOffset:</label>\n' +
            '        <input id="labeloffset" type="range" min="1" max="10" value="10"/>\n' +
            '    </div>\n' +
            '</template>',
        layoutDom:
            '<div id="layout-controls" class="controls" style="border-bottom: 1px solid lightgray; padding: 10px;">\n' +
            '    <div>\n' +
            '        <label for="ranker">排序规则:</label>\n' +
            '        <select id="ranker">\n' +
            '            <option value="network-simplex" selected>network-simplex</option>\n' +
            '            <option value="tight-tree">tight-tree</option>\n' +
            '            <option value="longest-path">longer-path</option>\n' +
            '        </select>\n' +
            '        <label for="rankdir">布局方向:</label>\n' +
            '        <select id="rankdir">\n' +
            '            <option value="TB">自顶向下</option>\n' +
            '            <option value="BT">自底向上</option>\n' +
            '            <option value="RL" selected>自右向左</option>\n' +
            '            <option value="LR">自左向右</option>\n' +
            '        </select>\n' +
            '    </div>\n' +
            '    <div style="margin-top: 10px">\n' +
            '        <label for="ranksep">上下间隔:</label>\n' +
            '        <input id="ranksep" type="range" min="1" max="100" value="50"/>\n' +
            '        <label for="edgesep">连线间隔:</label>\n' +
            '        <input id="edgesep" type="range" min="1" max="100" value="50"/>\n' +
            '        <label for="nodesep">结点间隔:</label>\n' +
            '        <input id="nodesep" type="range" min="1" max="100" value="50"/>\n' +
            '    </div>\n' +
            '</div>',

    }

    win.directedGraph = DirectGraph;

})(joint,window);