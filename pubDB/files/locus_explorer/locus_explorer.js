window.onload = function() {
    layui.use(['form', 'layer', 'element', 'laypage', 'laydate', 'table'], function() {
        form = layui.form;
        // layer = parent.layer === undefined ? layui.layer : parent.layer;
        layer = layui.layer;
        element = layui.element;
        laypage = layui.laypage;
        laydate = layui.laydate;
        table = layui.table;
    });

    function GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
    $locus_div = $("#locus");
    $locus_div.empty();
    var $optionlocus = $('<option selected="selected" value="1">' + GetQueryString("locus") + '</option>');
    $optionlocus.appendTo($locus_div);
    getAjax(true, 'GET', '/fpbdb/SEARCHLOCUSALLNUM?temp=' + GetQueryString("locus") + "," + GetQueryString("library"), null, 'json', function(json) {
        $select_div = $("#allele_ids");
        $select_div.empty();
        for (var i in json.data) {
            var $option = $('<option selected="selected"  value="' + json.data[i] + '">' + json.data[i] + '</option>');
            $option.appendTo($select_div);
        }
    });
    getAjax(true, 'GET', '/fpbdb/SEARCHALLLOCUS?temp=' + GetQueryString("library"), null, 'json', function(json) {
        $select_div = $("#locus");
        $select_div.empty();
        for (var i in json.data) {
            var $option = "";
            if (json.data[i] == GetQueryString("locus")) {
                $option = $('<option selected="selected" style="text-align:center" value="' + json.data[i] + '">' + json.data[i] + '</option>');
            } else {
                $option = $('<option  style="text-align:center" value="' + json.data[i] + '">' + json.data[i] + '</option>');
            }
            $option.appendTo($select_div);
        }
    });

    $("#submit_allele_ids").bind('click', function() {
        $("#color").css("display", "none");

        var gene_num = "";
        $("#allele_ids option:selected").each(function() {
            gene_num += $(this).text() + ",";
        });
        //console.log(gene_num);
        var tempdata = {};
        tempdata.gene_num = gene_num.substring(0, gene_num.length - 1);
        tempdata.locus = $("#locus option:selected").val();
        tempdata.library = GetQueryString("library");
        var loadIndex1;
        var loadIndex2;
        getAjax(true, 'POST', '/fpbdb/SEARCHALLGENEPERCENT', JSON.stringify(tempdata), 'json', function(json) {
            layer.close(loadIndex1);
            $("#color").css("display", "block");
            var alldata = json.data;
            // for (var i in json.data) {
            //console.log(json.data[i].index, json.data[i].seq, json.data[i].perA, json.data[i].perC, json.data[i].perG, json.data[i].perT, json.data[i].per_);
            //getchart(json.data[i].index, json.data[i].seq, json.data[i].perA, json.data[i].perC, json.data[i].perG, json.data[i].perT, json.data[i].per_);

            // }
            var n = gene_num.split(",").sort();
            getAjax(true, 'GET', '/fpbdb/SEARCHLOCUSSEQ?temp=' + "abc" + "." + $("#locus option:selected").val() + "." + n[1] + "." + GetQueryString("library"), null, 'json', function(json) {
                getchart(alldata, json.data);
            });
            table.render({
                elem: '#filelist',
                initSort: {
                    field: 'index' //排序字段，对应 cols 设定的各字段名
                        ,
                    type: 'asc' //排序方式  asc: 升序、desc: 降序、null: 默认排序
                },
                cols: [
                    [{ field: 'index', title: 'Position', align: 'center', sort: true, rowspan: 2, width: '15%' },
                        { field: 'Nucleotide', title: 'Nucleotide', align: 'center', sort: true, colspan: 10, width: '85%' }
                    ],
                    [
                        { field: 'A', title: 'A', align: 'center', sort: true },
                        { field: 'C', title: 'C', align: 'center', sort: true },
                        { field: 'G', title: 'G', align: 'center', sort: true },
                        { field: 'T', title: 'T', align: 'center', sort: true },
                        { field: '_', title: '-', align: 'center', sort: true },
                        { field: 'perA', title: '%A', align: 'center', sort: true },
                        { field: 'perC', title: '%C', align: 'center', sort: true },
                        { field: 'perG', title: '%G', align: 'center', sort: true },
                        { field: 'perT', title: '%T', align: 'center', sort: true },
                        { field: 'per_', title: '%-', align: 'center', sort: true }
                    ]
                ],
                data: json.data,
                page: true,
            });
        });
    })
    $("#locus").change(function() {
        $("#locus option:selected").each(function() {
            getAjax(true, 'GET', '/fpbdb/SEARCHLOCUSALLNUM?temp=' + $(this).text() + "," + GetQueryString("library"), null, 'json', function(json) {
                $select_div = $("#allele_ids");
                $select_div.empty();
                for (var i in json.data) {
                    var $option = $('<option selected="selected" value="1">' + json.data[i] + '</option>');
                    $option.appendTo($select_div);
                }
            });
        });
    });

    function getchart(op, seq) {
        op = $.extend([], op);
        seq = seq.replace(/\s+/g, "");
        var position = [];
        var seqArr = [];
        var per = [];
        var ins = [];
        var Aarr = [];
        var Tarr = [];
        var Garr = [];
        var Carr = [];
        var _arr = [];
        for (var lpa = 0; lpa < 4; lpa++) {
            ins.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
            seqArr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
            Aarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
            Tarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
            Garr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
            Carr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
            _arr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
        }
        // Aarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Aarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Aarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Aarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Tarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Tarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Tarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Tarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Garr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Garr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Garr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Garr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Carr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Carr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Carr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // Carr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // _arr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // _arr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // _arr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        // _arr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>");
        var strI = "";
        var strS = "";
        var strA = "";
        var strC = "";
        var strG = "";
        var strT = "";
        var str_ = "";
        var n = 1;
        var $text_div = $('#resultRequence');
        $text_div.empty();
        var b = 0;
        var $text = $('');
        for (var i = 0; i < seq.length; i++) {
            var S = seq.slice(n * i, n * (i + 1));
            if (S != null) {
                S = "<div style='display:inline-block;background-color: #000000;color:white;padding-right:0.8px;width:8px;'>" + S + "</div>";
            }
            if (((i + 1) % 10) == 0 || ((i + 1) % 100) == 1) {
                //ins.push(i + 1);
                num = i + 1;
                var strNum = "";
                var repNum = num;
                for (var v = repNum.toString().length; v >= 1; v--) {
                    var uNum = Math.pow(10, v);
                    var vn = v - 1;
                    var cNum = Math.pow(10, vn);
                    strNum += "<div style='display:inline-block;color:black;padding-right:0.8px;width:8px;'>" + parseInt((num % uNum) / cNum) + "</div>";
                }
                for (var v = repNum.toString().length; v > 1; v--) {
                    console.log(1);
                    ins.pop();
                }
                ins.push(strNum);
            } else {
                ins.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
            }

            seqArr.push(S);
            Aarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
            Tarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
            Garr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
            Carr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
            _arr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
            var booA = false;
            var booT = false;
            var booC = false;
            var booG = false;
            var boo_ = false;
            if (((i + 1) % 100) == 0 || i == seq.length - 1) {
                //console.log(ins);
                for (var j in ins) {

                    // if (b == 0 && j == 97) {
                    //     continue;
                    // }
                    // if (j < 2 && b >= 1) {
                    //     continue;
                    // }
                    // if (j % 10 == 6 && b >= 1) {
                    //     continue;
                    // }
                    // if (j == 94 && b == 9) {
                    //     continue;
                    // }
                    // if (j < 3 && b >= 10) {
                    //     continue;
                    // }
                    // if (j % 10 == 7 && b >= 10) {
                    //     continue;
                    //}
                    strI = strI + ins[j];
                }

                for (var t in seqArr) {
                    //console.log(t );
                    for (var l in op) {
                        if (((t - 3) + b * 100) == parseInt(op[l].index)) {
                            //console.log(((t - 3) + b * 100) );
                            var bk = "";
                            var bkA = true;
                            var bkG = true;
                            var bkC = true;
                            var bkT = true;
                            var bk_ = "";
                            var perArr = [];
                            perArr = [op[l].perA, op[l].perG, op[l].perC, op[l].perT];
                            var sqp = [];
                            var sortArr = perArr.sort().reverse();
                            sqp = [seqArr, Aarr, Carr, Garr];
                            // console.log(sortArr);
                            var det = -1;
                            for (var der = 0; der < sortArr.length; der++) {
                                //console.log(seqArr);
                                bk = getcolor(sortArr[der]);
                                if (sortArr[der] == op[l].perA && sortArr[der] != 0 && bkA) {
                                    det++;
                                    bkA = false;
                                    sqp[det][t] = "<div style='width:8px;display:inline-block;background-color:" + bk + ";color:white;padding-right:0.8px;'>A</div>";
                                } else if (sortArr[der] == op[l].perC && sortArr[der] != 0 && bkC) {
                                    det++;
                                    bkC = false;
                                    sqp[det][t] = "<div style='width:8px;display:inline-block;background-color:" + bk + ";color:white;padding-right:0.8px;'>C</div>";
                                } else if (sortArr[der] == op[l].perG && sortArr[der] != 0 && bkG) {
                                    det++;
                                    bkG = false;
                                    sqp[det][t] = "<div style='width:8px;display:inline-block;background-color:" + bk + ";color:white;padding-right:0.8px;'>G</div>";
                                } else if (sortArr[der] == op[l].perT && sortArr[der] != 0 && bkT) {
                                    det++;
                                    bkT = false;
                                    sqp[det][t] = "<div style='width:8px;display:inline-block;background-color:" + bk + ";color:white;padding-right:0.8px;'>T</div>";
                                }

                                /*if (der==2 && sortArr[der] == op[l].perA && sortArr[der] != 0) {
                                    Aarr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>A</div>";
                                } else if (der==2 && sortArr[der] == op[l].perC && sortArr[der] != 0) {
                                    Aarr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>C</div>";
                                } else if (der==2 && sortArr[der] == op[l].perG && sortArr[der] != 0) {
                                    Aarr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>G</div>";
                                } else if (der==2 && sortArr[der] == op[l].perT && sortArr[der] != 0) {
                                    Aarr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>T</div>";
                                }
                                if (der==1 && sortArr[der] == op[l].perA && sortArr[der] != 0) {
                                    Garr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>A</div>";
                                } else if (der==1 && sortArr[der] == op[l].perC && sortArr[der] != 0) {
                                    Garr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>C</div>";
                                } else if (der==1 && sortArr[der] == op[l].perG && sortArr[der] != 0) {
                                    Garr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>G</div>";
                                } else if (der==1 && sortArr[der] == op[l].perT && sortArr[der] != 0) {
                                    Garr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>T</div>";
                                }
                                if (der==0 && sortArr[der] == op[l].perA && sortArr[der] != 0) {
                                    Carr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>A</div>";
                                } else if (der==0 && sortArr[der] == op[l].perC && sortArr[der] != 0) {
                                    Carr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>C</div>";
                                } else if (der==0 && sortArr[der] == op[l].perG && sortArr[der] != 0) {
                                    Carr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>G</div>";
                                } else if (der==0 && sortArr[der] == op[l].perT && sortArr[der] != 0) {
                                    Carr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>T</div>";
                                }*/

                            }
                            Garr = sqp[3];
                            Carr = sqp[2];
                            Aarr = sqp[1];
                            seqArr = sqp[0];
                            Tarr = [];
                            delete op[l];
                        }
                    }

                }
                // console.log(seqArr[t], Aarr[t]);


                /*if (parseInt(op[l].perA) != 0) {
                    //booA = true;
                    bkA = getcolor(op[l].perA);
                    Aarr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>A</div>";
                }
                if (parseInt(op[l].perG) != 0) {
                    //booG = true;
                    bkG = getcolor(op[l].perG);
                    Garr[t] = "<div style='display:inline;background-color:" + bkG + ";color:white;padding-right:0.8px;'>G</div>";
                }
                if (parseInt(op[l].perC) != 0) {
                    //booC = true;
                    bkC = getcolor(op[l].perC);
                    Carr[t] = "<div style='display:inline;background-color:" + bkC + ";color:white;padding-right:0.8px;'>C</div>";
                }
                if (parseInt(op[l].perT) != 0) {
                    //booT = true;
                    bkT = getcolor(op[l].perT);
                    Tarr[t] = "<div style='display:inline;background-color:" + bkT + ";color:white;padding-right:0.8px;'>T</div>";
                }
                if (parseInt(op[l].per_) != 0) {
                    //boo_ = true;
                    bk_ = getcolor(op[l].per_);
                    _arr[t] = "<div style='display:inline;background-color:" + bk_ + ";color:white;padding-right:0.8px;'>_</div>";
                }
                if (parseInt(op[l].per_) != 0) {
                    bk_ = getcolor(op[l].per_);
                    seqArr[t] = "<div style='display:inline;background-color:" + bk_ + ";color:white;padding-right:0.8px;'>.</div>";
                    _arr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>";
                            
                    //_arr[t] = "<div style='display:inline;background-color:" + bk_ + ";color:white;padding-right:0.8px;'>_</div>";
                }else if (seqArr[t].slice(seqArr[t].length - 7, seqArr[t].length - 6) == "A") {
                    seqArr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>A</div>";
                    Aarr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>";
                }else if (seqArr[t].slice(seqArr[t].length - 7, seqArr[t].length - 6) == "G") {
                    seqArr[t] = "<div style='display:inline;background-color:" + bkG + ";color:white;padding-right:0.8px;'>G</div>";
                    Garr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>";
                }else if (seqArr[t].slice(seqArr[t].length - 7, seqArr[t].length - 6) == "C") {
                    seqArr[t] = "<div style='display:inline;background-color:" + bkC + ";color:white;padding-right:0.8px;'>C</div>";
                    Carr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>";
                }else if (seqArr[t].slice(seqArr[t].length - 7, seqArr[t].length - 6) == "T") {
                    seqArr[t] = "<div style='display:inline;background-color:" + bkT + ";color:white;padding-right:0.8px;'>T</div>";
                    Tarr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>";
                }else if (seqArr[t].slice(seqArr[t].length - 7, seqArr[t].length - 6) == ".") {
                    console.log(t);
                    seqArr[t] = "<div style='display:inline;background-color:" + bk_ + ";color:white;padding-right:0.8px;'>_</div>";
                    _arr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>";
                }*/


                for (var t in seqArr) {
                    strS = strS + seqArr[t];
                }

                /* for (var t in Aarr) {
                     var tempArr = [];
                     if (Aarr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Aarr[t] != "&nbsp;") {
                         tempArr.push(Aarr[t]);
                         Aarr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>"
                     }
                     if (Garr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Garr[t] != "&nbsp;") {
                         tempArr.push(Garr[t]);
                         Garr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>"
                     }
                     if (Carr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Carr[t] != "&nbsp;") {
                         tempArr.push(Carr[t]);
                         Carr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>"
                     }
                     if (Tarr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Tarr[t] != "&nbsp;") {
                         tempArr.push(Tarr[t]);
                         Tarr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>"
                     }
                     // if (_arr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && _arr[t] != "&nbsp;") {
                     //     tempArr.push(_arr[t]);
                     //     _arr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>"
                     // }
                     if (tempArr.length == 1) {
                         Aarr[t] = tempArr[0];
                     }
                     if (tempArr.length == 2) {
                         Aarr[t] = tempArr[0];
                         Carr[t] = tempArr[1];
                     }
                     if (tempArr.length == 3) {
                         Aarr[t] = tempArr[0];
                         Carr[t] = tempArr[1];
                         Garr[t] = tempArr[2];
                     }
                     if (tempArr.length == 4) {
                         Aarr[t] = tempArr[0];
                         Carr[t] = tempArr[1];
                         Garr[t] = tempArr[2];
                         Tarr[t] = tempArr[3];
                     }
                     // if (tempArr.length == 5) {
                     //     Aarr[t] = tempArr[0];
                     //     Carr[t] = tempArr[1];
                     //     Garr[t] = tempArr[2];
                     //     Tarr[t] = tempArr[3];
                     //     _arr[t] = tempArr[4];
                     // }
                     //   console.log(tempArr);
                 }*/

                for (var t in Aarr) {
                    if (Aarr[t] != "<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>" && Aarr[t] != "<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>") {
                        booA = true;
                    }
                    strA = strA + Aarr[t];
                }
                for (var t in Garr) {
                    if (Garr[t] != "<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>" && Aarr[t] != "<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>") {
                        booG = true;
                    }
                    strG = strG + Garr[t];
                }
                for (var t in Carr) {
                    if (Carr[t] != "<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>" && Aarr[t] != "<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>") {
                        booC = true;
                    }
                    strC = strC + Carr[t];
                }
                for (var t in Tarr) {
                    if (Tarr[t] != "<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>" && Aarr[t] != "<div style='display:inline-block;color:white;padding-right:0.8px;width:7.1px;'>&nbsp;</div>") {
                        booT = true;
                    }
                    strT = strT + Tarr[t];
                }
                // for (var t in _arr) {
                //     if (_arr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Aarr[t] != "&nbsp;") {
                //         boo_ = true;
                //     }
                //     str_ = str_ + _arr[t];
                // }
                $text = "";
                var ACGT = "";
                if (booA) {
                    ACGT += strA + "<br/>";
                }
                if (booG) {
                    ACGT += strG + "<br/>";
                }
                if (booC) {
                    ACGT += strC + "<br/>";
                }
                if (booT) {
                    ACGT += strT + "<br/>";
                }
                // if (boo_) {
                //     ACGT += str_ + "<br/>";
                // }
                $text = $('<div style="font-size: 14px;"><pre>' + strI + "<br/>" + strS + "<br/>" + ACGT + '<pre></div>');
                // console.log($text);
                $text.appendTo($text_div);
                seqArr = [];
                ins = [];
                var Aarr = [];
                var Tarr = [];
                var Garr = [];
                var Carr = [];
                var _arr = [];
                for (var lpa = 0; lpa < 4; lpa++) {
                    ins.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
                    seqArr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
                    Aarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
                    Tarr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
                    Garr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
                    Carr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
                    _arr.push("<div style='display:inline-block;color:white;padding-right:0.8px;width:8px;'>&nbsp;</div>");
                }
                strI = "";
                strS = "";
                strA = "";
                strC = "";
                strG = "";
                strT = "";
                str_ = "";
                b++;
            }




        }
        /*
                for (var j in ins) {

                    if (b == 0 && j == 97) {
                        continue;
                    }
                    if (j < 2 && b >= 1) {
                        continue;
                    }
                    if (j % 10 == 6 && b >= 1) {
                        continue;
                    }
                    if (j == 94 && b == 9) {
                        continue;
                    }
                    if (j < 3 && b >= 10) {
                        continue;
                    }
                    if (j % 10 == 7 && b >= 10) {
                        continue;
                    }
                    strI = strI + ins[j];
                }
                var booA = false;
                var booT = false;
                var booC = false;
                var booG = false;
                var boo_ = false;

                for (var t in seqArr) {
                    for (var l in op) {
                          if (((t - 3) + b * 100) == parseInt(op[l].index)) {
                            // console.log(t)
                            var bkA = "";
                            var bkG = "";
                            var bkC = "";
                            var bkT = "";
                            var bk_ = "";
                            if (parseInt(op[l].perA) != 0) {
                                bkA = getcolor(op[l].perA);
                                Aarr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>A</div>";
                            }
                            if (parseInt(op[l].perG) != 0) {
                                bkG = getcolor(op[l].perG);
                                Garr[t] = "<div style='display:inline;background-color:" + bkG + ";color:white;padding-right:0.8px;'>G</div>";
                            }
                            if (parseInt(op[l].perC) != 0) {
                                bkC = getcolor(op[l].perC);
                                Carr[t] = "<div style='display:inline;background-color:" + bkC + ";color:white;padding-right:0.8px;'>C</div>";
                            }
                            if (parseInt(op[l].perT) != 0) {
                                bkT = getcolor(op[l].perT);
                                Tarr[t] = "<div style='display:inline;background-color:" + bkT + ";color:white;padding-right:0.8px;'>T</div>";
                            }
                            if (parseInt(op[l].per_) != 0) {
                                bk_ = getcolor(op[l].per_);
                                _arr[t] = "<div style='display:inline;background-color:" + bk_ + ";color:white;padding-right:0.8px;'>_</div>";
                            }
                            if (seqArr[t].slice(seqArr[t].length - 7, seqArr[t].length - 6) == "A") {
                                seqArr[t] = "<div style='display:inline;background-color:" + bkA + ";color:white;padding-right:0.8px;'>A</div>";
                                Aarr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>";
                            }
                            if (seqArr[t].slice(seqArr[t].length - 7, seqArr[t].length - 6) == "G") {
                                seqArr[t] = "<div style='display:inline;background-color:" + bkG + ";color:white;padding-right:0.8px;'>G</div>";
                                Garr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>";
                            }
                            if (seqArr[t].slice(seqArr[t].length - 7, seqArr[t].length - 6) == "C") {
                                seqArr[t] = "<div style='display:inline;background-color:" + bkC + ";color:white;padding-right:0.8px;'>C</div>";
                                Carr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>";
                            }
                            if (seqArr[t].slice(seqArr[t].length - 7, seqArr[t].length - 6) == "T") {
                                seqArr[t] = "<div style='display:inline;background-color:" + bkT + ";color:white;padding-right:0.8px;'>T</div>";
                                Tarr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>";
                            }
                            if (seqArr[t].slice(seqArr[t].length - 7, seqArr[t].length - 6) == "_") {
                                seqArr[t] = "<div style='display:inline;background-color:" + bk_ + ";color:white;padding-right:0.8px;'>_</div>";
                                _arr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>";
                            }
                            delete op[l];
                        }

                    }

                }
                for (var t in seqArr) {
                    strS = strS + seqArr[t];
                }
                console.log(Aarr);
                for (var t in Aarr) {
                    var tempArr = [];
                    if (Aarr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Aarr[t] != "&nbsp;") {
                        tempArr.push(Aarr[t]);
                        Aarr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>"
                    }
                    if (Garr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Garr[t] != "&nbsp;") {
                        tempArr.push(Garr[t]);
                        Garr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>"
                    }
                    if (Carr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Carr[t] != "&nbsp;") {
                        tempArr.push(Carr[t]);
                        Carr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>"
                    }
                    if (Tarr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Tarr[t] != "&nbsp;") {
                        tempArr.push(Tarr[t]);
                        Tarr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>"
                    }
                    if (_arr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && _arr[t] != "&nbsp;") {
                        tempArr.push(_arr[t]);
                        _arr[t] = "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>"
                    }
                    if (tempArr.length == 1) {
                        Aarr[t] = tempArr[0];
                    }
                    if (tempArr.length == 2) {
                        Aarr[t] = tempArr[0];
                        Carr[t] = tempArr[1];
                    }
                    if (tempArr.length == 3) {
                        Aarr[t] = tempArr[0];
                        Carr[t] = tempArr[1];
                        Garr[t] = tempArr[2];
                    }
                    if (tempArr.length == 4) {
                        Aarr[t] = tempArr[0];
                        Carr[t] = tempArr[1];
                        Garr[t] = tempArr[2];
                        Tarr[t] = tempArr[3];
                    }
                    if (tempArr.length == 5) {
                        Aarr[t] = tempArr[0];
                        Carr[t] = tempArr[1];
                        Garr[t] = tempArr[2];
                        Tarr[t] = tempArr[3];
                        _arr[t] = tempArr[4];
                    }
                    console.log(tempArr);
                }



                for (var t in Aarr) {
                    if (Aarr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Aarr[t] != "&nbsp;") {
                        booA = true;
                    }
                    strA = strA + Aarr[t];
                }
                for (var t in Garr) {
                    if (Garr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Aarr[t] != "&nbsp;") {
                        booG = true;
                    }
                    strG = strG + Garr[t];
                }
                for (var t in Carr) {
                    if (Carr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Aarr[t] != "&nbsp;") {
                        booC = true;
                    }
                    strC = strC + Carr[t];
                }
                for (var t in Tarr) {
                    if (Tarr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Aarr[t] != "&nbsp;") {
                        booT = true;
                    }
                    strT = strT + Tarr[t];
                }
                for (var t in _arr) {
                    if (_arr[t] != "<div style='display:inline;color:white;padding-right:0.8px;'>&nbsp;</div>" && Aarr[t] != "&nbsp;") {
                        boo_ = true;
                    }
                    str_ = str_ + _arr[t];
                }
                $text = "";
                var ACGT = "";
                if (booA) {
                    ACGT += strA + "<br/>";
                }
                if (booG) {
                    ACGT += strG + "<br/>";
                }
                if (booC) {
                    ACGT += strC + "<br/>";
                }
                if (booT) {
                    ACGT += strT + "<br/>";
                }
                if (boo_) {
                    ACGT += str_ + "<br/>";
                }
                $text = $('<div><pre>' + strI + "<br/>" + strS + "<br/>" + ACGT + '<pre></div>');
                $text.appendTo($text_div);*/

    }

    function isNull(str) {
        str = str.replace(/&nbsp;/gi, '');
        var rp = "<div style='display:inline;color:white;padding-right:0.8px;'></div>";
        str = str.replace(/rp/gi, '');



        if (str.length == 0) {
            return false;
        }
        return true;
    }

    function getcolor(A) {
        A = parseFloat(A);
        if (A > 90 && A <= 100) {
            return "#000000";
        }
        if (A > 80 && A <= 90) {
            return "#006600";
        }
        if (A > 70 && A <= 80) {
            return "#339900";
        }
        if (A > 60 && A <= 70) {
            return "#66cc00";
        }
        if (A > 50 && A <= 60) {
            return "#33ffff";
        }
        if (A > 40 && A <= 50) {
            return "#3399ff";
        }
        if (A > 30 && A <= 40) {
            return "#0066cc";
        }
        if (A > 20 && A <= 30) {
            return "#9900cc";
        }
        if (A > 10 && A <= 20) {
            return "#cc66ff";
        }
        if (A > 0 && A <= 10) {
            return "#ff99ff";
        }
    }
};