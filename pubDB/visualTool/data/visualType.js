var visualType = {
    scatter: {
        script: "js/modules/scatterPlot.js",        //js文件路径(相对于html页面)
        title: "散点图",                           //网页标题
        io: {
            // 测试文件
            demoFile: [
                {href: "demoFile/scatter/散点图例子.txt", name: "scatter.txt", title: 'txt文件'},
                {href: "demoFile/scatter/散点图例子.xlsx", name: "scatter.xlsx", title: 'excel文件'}
            ]
        },

    },
    evolutionaryTrees: {
        script: "js/modules/evolutionaryTrees.js",
        title: "进化树图",
        io: {
            demoFile: [
                {href: "demoFile/evolutionaryTrees/circular_para.txt", name: "evolutionaryTrees.txt", title: 'txt文件'},
            ]
        }
    },
    boxPlot: {
        script: "js/modules/boxPlot.js",
        title: "箱线图",
        io: {
            demoFile: [
                {href: "demoFile/boxPlot/箱线图例子1.txt", name: "boxPlot1.txt", title: 'txt文件1'},
                {href: "demoFile/boxPlot/箱线图例子1.xlsx", name: "boxPlot1.xlsx", title: 'excel文件1'},
                {href: "demoFile/boxPlot/箱线图例子2.txt", name: "boxPlot2.txt", title: 'txt文件2'},
                {href: "demoFile/boxPlot/箱线图例子2.xlsx", name: "boxPlot2.xlsx", title: 'excel文件2'}
            ]
        }
    },
    volcanePlot: {
        script: "js/modules/volcanePlot.js",
        title: "火山图",
        io: {
            demoFile: [
                {href: "demoFile/volcanePlot/火山图例子.txt", name: "volcanePlot.txt", title: 'txt文件'},
                {href: "demoFile/volcanePlot/火山图例子.xlsx", name: "volcanePlot.xlsx", title: 'excel文件'}
            ]
        },
    },
    MAPlot: {
        script: "js/modules/MAPlot.js",
        title: "MA图",
        io: {
            demoFile: [
                {href: "demoFile/MAPlot/MA图例子.txt", name: "MAPlot.txt", title: 'txt文件'},
                {href: "demoFile/MAPlot/MA图例子.xlsx", name: "MAPlot.xlsx", title: 'excel文件'}
            ]
        },
    },
    bubbleChart: {
        script: "js/modules/bubbleChart.js",
        title: "高级气泡图",
        io: {
            demoFile: [
                {href: "demoFile/bubbleChart/高级气泡图例子.txt", name: "bubbleChart.txt", title: 'txt文件'},
                {href: "demoFile/bubbleChart/高级气泡图例子.xlsx", name: "bubbleChart.xlsx", title: 'excel文件'}
            ]
        },
    },
    quadrantChart: {
        script: "js/modules/quadrantChart.js",
        title: "九象限图",
        io: {
            demoFile: [
                {href: "demoFile/quadrantChart/转录组表达总表.txt", name: "Transcriptome.txt", title: '转录组txt文件'},
                {href: "demoFile/quadrantChart/转录组表达总表.xlsx", name: "Transcriptome.xlsx", title: '转录组excel文件'},
                {href: "demoFile/quadrantChart/蛋白组表达总表.txt", name: "Proteome.txt", title: '蛋白组txt文件'},
                {href: "demoFile/quadrantChart/蛋白组表达总表.xlsx", name: "Proteome.xlsx", title: '蛋白组excel文件'}
            ]
        },
    },
    veen: {
        script: "js/modules/veen.js",
        title: "韦恩图",
        io: {
            demoFile: [
                {href: "demoFile/veen/韦恩图例子.txt", name: "veen.txt", title: 'txt文件'},
                {href: "demoFile/veen/韦恩图例子.xlsx", name: "veen.xlsx", title: 'excel文件'}
            ]
        },
    },
    directedGraph: {
        script: "js/modules/directeGraph.js",
        title: "网络有向图",
        io: {
            demoFile: [
                {href: "demoFile/directedGraph/有向网络图例子.txt", name: "directedGraph.txt", title: 'txt文件'},
                {href: "demoFile/directedGraph/有向网络图例子.xlsx", name: "directedGraph.xlsx", title: 'excel文件'}
            ]
        },
    },
};
// 抽取所有变量共同部分
(function (value) {
    let keys = Object.keys(value);
    for (let i = 0; i < keys.length; i++) {
        let obj = value[keys[i]];
        obj.config = {
            paramPanels: '#set-content',
            svgSelector: '#svg-box',
        };
        obj.io.selector = '#io-box';
        obj.io.textarea = true;

        // 配置按钮-九象限图需要三个上传按钮，其他图一个上传按钮
        if(keys[i] !== "quadrantChart"){

            obj.io.btnContainer = [{
                btnId: 'upload-data',
                btnName: "",
                success: function (module, data) {
                    module.dataCol(data);
                }
            }];

        }else{
            obj.io.btnContainer =[{
                btnId: 'upload-transcriptome',
                btnName: "转录组表达量",
                success: function (module, data) {
                    module.dataCol(data, 0);
                }
            },{
                btnId: 'upload-proteome',
                btnName: "蛋白组表达量",
                success: function (module, data) {
                    module.dataCol(data, 1);
                }
            },{
                btnId: 'upload-id-march',
                btnName: "ID匹配文件",
                success: function (module, data) {
                    module.dataCol(data, 2);
                }
            }];
        }
    }
})(visualType);