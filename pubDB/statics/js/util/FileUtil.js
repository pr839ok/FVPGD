//需要模块layui
function downFile(url, method, fileName) {
    var xhr = new XMLHttpRequest();
    var loadIndex;
    loadIndex = layer.msg('导出中', {
        icon: 16,
        shade: 0.01
    });
    xhr.open(method, url, true);
    xhr.responseType = "blob";
    xhr.onload = function() {
        if (this.status == 200) {
            var blob = this.response;
            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = function(e) {
                var a = document.createElement('a');
                a.download = fileName;
                a.href = e.target.result;
                $('body').append(a);
                a.click();
                $(a).remove;
                layer.close(loadIndex);
            }
        }
    }
    xhr.send();
}

function downloadFile(url, name) {
    var $a = $('<a href="' + url + '" download="' + name + '">aaa</a>');
    $a.appendTo($('body'));
    $a[0].click();
    $a.remove();
}

//文件类型，后缀，url
function exportFile(type, ext, url) {
    var name = getExportFileName(type, ext);
    downloadFile(url, name);
}

function getFormatDate(date) {
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

function getExportFileName(type, ext) {
    var str = getFormatDate(new Date());
    var name = str;
    switch (type) {
        case 'pubdb_search':
            name += "_strain_data" + ext;
            break;
        case 'file_client':
            name = "GosFileManager" + ext;
            break;
        case 'file_client_zip':
            name = "GosFileManager" + ext;
            break;
        case 'sample_data':
            name += "_送样数据" + ext;
            break;
        case 'sample_templet':
            name += "_送样信息上传模板" + ext;
            break;
        case 'gene_fill_data':
            name += "_基因型填充数据" + ext;
            break;
        case 'snp_data':
            name += "_snp数据" + ext;
            break;
        case 'breeding_data':
            name += "_基因组育种值数据" + ext;
            break;
        case 'snp_extract':
            name += '_特定位点基因型数据' + ext;
            break;
        case 'ph_data':
            name += "_表型数据" + ext;
            break;
        case 'ph_data_upload_templet':
            name += "_表型数据上传模板" + ext;
            break;
        case 'ph_templet_data':
            name += "_表型模板字段信息" + ext;
            break;
        case 'ph_templet_upload_templet':
            name += "_表型字段上传模板" + ext;
            break;
        case 'match_plan_export':
            name += "_选配结果" + ext;
            break;
        case 'chipdata_templet':
            name += "_芯片信息上传模板" + ext;
            break
        case 'novdb_parser_data_export':
            name += "_解析数据" + ext;
            break;
        default:
            name += ext;
    }
    return name;
}

function getFileAjax(async, method, apiUrl, options, dataType, callback, complete) {
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
            timeout: 5*60*1000, // 设置超时时间
            dataType: dataType,
            contentType: 'application/json',
            beforeSend: function(xhr) {
                loadIndex = layer.msg('正在生成数据', {
                    icon: 16,
                    shade: 0.01
                });
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
                layer.close(loadIndex);
                if (complete && typeof(complete) == "function") {
                    complete(xhr, XMLHttpRequest, status);
                }
            }
        })
    });
}