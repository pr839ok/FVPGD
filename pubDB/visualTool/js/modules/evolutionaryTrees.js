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
        svgPadding: {left: 30, right: 60, top: 30, bottom: 30},
        bgPic: 'images/R_tree_plot.png'
    };

    // 构造函数
    var evolutionaryTrees = function (config) {
        if (_tool.checkConfig(config)) {
            _global.svg = visualUtil.initSVGDom(config.svgSelector, _config.svgPadding);
            _config = $.extend({}, _config, config);
            _tool.init();
            evolutionaryTrees.prototype.type = "evolutionaryTrees";
            evolutionaryTrees.prototype.initflag = false;

        }
    };

    // API方法
    evolutionaryTrees.prototype = {
        //生成参数配置模块
        initParamBar: function () {
            $(_config.paramPanels).empty();
            $(_param.paramPaneldom).appendTo(_config.paramPanels);

        },

        // 传入数据列
        dataCol: function (data) {
            visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);

            let uploadData = _tool.setData(data);
            if(uploadData.flag){
                evolutionaryTrees.prototype.initflag = true;
                $('#chart-title').html('<span style="color: red">数据上传成功</span>');

                _tool.drawSVGPic(uploadData.data);

                visualUtil.initDownload(evolutionaryTrees.prototype.type);

                visualUtil.resize('.set-svg');
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

        // 传入数据处理
        setData(data){

            var template = [];
            // if (visualUtil.checkData(data)) {

            // }else {
            //     layer.msg('数据有缺失项，请重新上传！', {icon: 2, time: 2000});
            //     throw new Error("the format of uploadData is not valid!");
            // }

            
                for(var i=1; i < data.length; i++){

                    if(data[i].join('').length == 0){
                        continue;
                    }

                    template.push({
                        name: data[i][0],
                        angle: data[i][1],
                        type: data[i][2]
                    })
                }

                return {
                    flag: true,
                    data: template
                }
        },

        //图像绘制
        drawSVGPic: function(data){
            _global.svg = visualUtil.initSVGDom(_config.svgSelector, _config.svgPadding);

            let svg = _global.svg,
                g = svg.select('g');
            //提示框
            let tooltip = d3.select(".tooltip");
            let svgSelector = _config.svgSelector;
            //背景图片
            g.append('g')
                .attr('class', 'bg-pic')
                .append('image')
                .attr('xlink:href', '/fpbdb/download'+_config.bgPic+"?temp=0")
                .attr('x', '50')
                .attr('y', '50')
                .attr('width', '800')
                .attr('height', '800')

            var dataContainer = g.append('g')
                .attr('class', 'data-test')
                .attr('transform', 'translate(450,450)');

            //绘制数据点
            dataContainer.selectAll('path')
            .data(data)
            .enter()
            .append('path')
            .attr('d',function(d){
                let x = _tool.getPointX(d.angle);
                let y = _tool.getPointY(d.angle);

                return 'M' + x + "," + y +" H" + (x + 10);

            })
            .attr("stroke", 'rgba(0,0,0,.7)')
            .attr("stroke-width", '2')
            .attr("transform", function(d){
                return "rotate("+ (360 - d.angle) + "," + _tool.getPointX(d.angle) + ","+ _tool.getPointY(d.angle) +")";
            })
            .each(function(d){
                // let msg = "<div>ID: "+ d.id +"</div>";
                let msg = "<div>NAME: "+ d.name +"</div>"
                visualUtil.toolTipEvent(this,svgSelector,tooltip,msg);

                if(d.type == null || typeof d.type === "undefined"){
                    d3.select(this).attr("stroke", "red");
                    $(this).off('click').on('click', function(){
                        $('#ID-value').text(d.name);
                    })
                }else{
                    $(this).off('click').on('click', function(){
                        window.open('/gosweb/pubDB/sequence_detailed.html?library='+d.type+'&strain='+d.name);
                        $('#ID-value').text(d.name);
                    })
                }

            })
        },

        getPointX: function(angle){
            return 330 * Math.cos(Math.PI * angle / 180.0);
        },

        getPointY: function(angle){
            return -1 * 330 * Math.sin(Math.PI * angle / 180.0);
        }


    };


    // 内部常量
    const _param = {
        paramPaneldom:
            '<div class="layui-card">\n' +
            '     <div class="layui-card-header" id="chart-title"></div>\n' +
            '     <div class="layui-card-body">\n' +
            '          <div class="layui-form" style="position: relative;">\n' +
            '               <div class="layui-form-item layui-row" style="margin-top: 10px">\n' +
            '                    <label class="layui-form-label" style="width: 110px;-webkit-box-sizing: border-box;">名称:</label>\n' +
            '                    <div class="layui-input-block">\n' +
            '                         <label id="ID-value" class="layui-form-label"></label>\n' +
            '                    </div>\n' +
            '               </div>\n' +
            '          </div>\n' +
            '    </div>\n' +
            '</div>',

        sortNumber: function (a, b) {
            return a - b
        },
    }


    win.evolutionaryTrees = evolutionaryTrees;

})(window);