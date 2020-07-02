$(function () {
    "use strict"

    var current_user = null;
    var bsuperadmin = false;

    init();

    // getCurrentUser();

    // function getCurrentUser() {
    //     var url = '/webhdfs/v1?op=getcurrentuser';
    //     $.ajax({
    //         url: url,
    //         type: 'GET',
    //         success: function(result) {
    //             if (result != "false") {
    //                 var result = JSON.parse(result);
    //                 init();
                    
    //             }
    //         },
    //         error: function(xhr, error, statusText) {
    //             if (statusText == 'Authentication required') {
    //                 layui.use('layer', function() {
    //                     var $ = layui.jquery,
    //                         layer = layui.layer;
    //                     layer.alert("请先登录系统..", {
    //                             skin: 'layui-layer-molv',
    //                             closeBtn: 0,
    //                             anim: 1,
    //                             icon: 0
    //                         },
    //                         function() {
    //                             window.parent.location.href = '../login.html';
    //                         });
    //                 });
    //             }
    //         }
    //     });
    // }

    function init() {
        getCurrentUser(function(result) {
            var data = result.data;
            current_user = data.username;
            bsuperadmin = data.bsuperadmin;
            initDom();
            resizeDom();
        });
    }

    function initDom() {
        var toolList = $('#toolList');
        toolList.empty();
        for (let i = 0; i < visualConfig.length; i++) {

            var msg = '<div class="layui-col-md4 layui-col-lg3 layui-col-sm4 tool-item" id="'+ visualConfig[i].id +'">' +
                '<div class="shadow">' +
                '<div class="img-box">' +
                '<img src="'+ visualConfig[i].icon +'"/>' +
                '</div>' +
                '<div class="tool-title-box">' +
                '<div class="tooltitle">'+ visualConfig[i].title +'</div>' +
                '<div class="tooldetail">'+ visualConfig[i].detail +'</div>' +
                '</div>' +
                '</div>' +
                '</div>';

            $(msg).appendTo(toolList);
            // var tooltitle = $('#'+ visualConfig[i].id).find('.tooltitle');

            $('#' + visualConfig[i].id).off('click').on('click',function () {
                window.location.href = 'visualTool.html?visualType=' + visualConfig[i].id;
            });
        }
    }

    // 配合动态设设置小工具栏宽高比为11：10
    function resizeDom() {
        let width = $('.tool-item:first-child').width();
        let height = width / 11 * 10;
        console.log(width)
        $('.tool-item').each(function () {
            // 超出部分拉伸图形补充
            let img = $(this).find('.img-box');
            img.height(parseInt(parseFloat(height) - 86.4) + 'px');
        })
    }
})