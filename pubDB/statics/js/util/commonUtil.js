function getCurrentUser(callback) {
    var url = '/web/getcurrentuser';
    $.ajax({
        url: url,
        type: 'GET',
        success: function(result) {
            if (result.code == 200) {
                callback(result);
            } else if (result.code == 403) {
                layui.use('layer', function() {
                    var $ = layui.jquery,
                        layer = layui.layer;
                    layer.alert("请先登录系统..", { skin: 'layui-layer-molv', closeBtn: 0, anim: 1, icon: 0 },
                        function() {
                            window.parent.location.href = '/gosweb/login.html';
                        });
                });
            }
        }
    });
}

function containKey(json, key) {
    for (var i in json) {
        if (i == key) {
            return true;
        }
    }
    return false;
}

function arrayContain(arr, val) {
    for (var i in arr) {
        if (arr[i] == val) {
            return true;
        }
    }
    return false;
}

function getAjax(async, method, apiUrl, options, dataType, callback, complete, bsFun) {
    apiUrl = encodeURI(apiUrl);
    layui.use('layer', function() {
        var layer = layui.layer,
            $ = layui.jquery;
        var index;
        var xhr = $.ajax({
            async: async,
            type: method,
            url: apiUrl,
            data: options,
            timeout: 5 * 60 * 1000,
            // 设置超时时间
            dataType: dataType,
            contentType: 'application/json',
            beforeSend: function(xhr) {
                if (bsFun && typeof(bsFun) == "function") {
                    bsFun();
                } else {
                    index = layer.load(1); // 数据加载成功之前，使用loading组件 
                }
            },
            success: function(json) {
                if (callback && typeof(callback) == "function") {
                    callback(json);
                }
            },
            error: function(textStatus) {
                console.error(textStatus);
            },
            complete: function(XMLHttpRequest, status) {
                layer.close(index);
                if (complete && typeof(complete) == "function") {
                    complete(xhr, XMLHttpRequest, status);
                }
            }
        })
    });
}

function getAjaxNotLoad(async, method, apiUrl, options, dataType, callback, complete, bsFun) {
    apiUrl = encodeURI(apiUrl);
    layui.use('layer', function() {
        var layer = layui.layer,
            $ = layui.jquery;
        var xhr = $.ajax({
            async: async,
            type: method,
            url: apiUrl,
            data: options,
            timeout: 5 * 60 * 1000,
            // 设置超时时间
            dataType: dataType,
            contentType: 'application/json',
            beforeSend: function(xhr) {
                if (bsFun && typeof(bsFun) == "function") {
                    bsFun();
                }
            },
            success: function(json) {
                if (callback && typeof(callback) == "function") {
                    callback(json);
                }
            },
            error: function(textStatus) {
                console.error(textStatus);
            },
            complete: function(XMLHttpRequest, status) {
                if (complete && typeof(complete) == "function") {
                    complete(xhr, XMLHttpRequest, status);
                }
            }
        })
    });
}

function getFileSize(fileByte) {
    var fileSizeByte = fileByte;
    var fileSizeMsg = "";
    if (fileSizeByte < 1048576) fileSizeMsg = (fileSizeByte / 1024).toFixed(2) + "KB";
    else if (fileSizeByte == 1048576) fileSizeMsg = "1MB";
    else if (fileSizeByte > 1048576 && fileSizeByte < 1073741824) fileSizeMsg = (fileSizeByte / (1024 * 1024)).toFixed(2) + "MB";
    else if (fileSizeByte > 1048576 && fileSizeByte == 1073741824) fileSizeMsg = "1GB";
    else if (fileSizeByte > 1073741824 && fileSizeByte < 1099511627776) fileSizeMsg = (fileSizeByte / (1024 * 1024 * 1024)).toFixed(2) + "GB";
    else fileSizeMsg = "文件超过1TB";
    return fileSizeMsg;
}

//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
}

function getQueryString(name) {
    return getUrlParam(name);
}

//字符串处理
String.prototype.endWith = function(s) {
    if (s == null || s == "" || this.length == 0 || s.length > this.length)
        return false;
    if (this.substring(this.length - s.length) == s)
        return true;
    else
        return false;
    return true;
}
String.prototype.startWith = function(s) {
    if (s == null || s == "" || this.length == 0 || s.length > this.length)
        return false;
    if (this.substr(0, s.length) == s)
        return true;
    else
        return false;
    return true;
}