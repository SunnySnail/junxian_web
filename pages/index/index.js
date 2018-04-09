//index.js
//获取应用实例
const app = getApp()
const charts = require('../../utils/wcharts.js');
var sorted60List = [];
var sorted120List = [];
var sorted250List = [];
var nowIndexList = [];
var itemHeight = 0;
var systemSize;

Page({
    data: {
        array: ['年线(250日均线)', '半年线(120日均线)', '季度线(60日均线)'],
        dateArray: ['250', '120', '60'],
        value: 0,
        updateTime: 0,
        indexInfo: null,
        indexesList: null,
        chosenClass: '',
        indexNum: 0,
        scrollTop: 0,
        itemHeight: 0,
        hidden: true
    },
    onLoad: function(options) {
        this.setData({
            from: options.from || 'aniu'
        })
        if (wx.createCanvasContext){
            this.fetchList();
        }else{
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
        }
    },
    canvasIdErrorCallback: function (e) {
        console.error(e.detail.errMsg)
    },
    touchHandler: function(e) {
        charts.showToolTip(e);
    },
    onReady: function (e) {
        // 使用 wx.createContext 获取绘图上下文 context
    },
    onShow: function() {
    },
    // 获取设备的高宽
    getSystemSize: function() {
        try {
            var res = wx.getSystemInfoSync();
            return {
                w: res.windowWidth,
                h: res.windowHeight
            }
        }catch(err) {
            console.log(err);
        }
    },
    bindPickerChange: function(e) {
        var self = this;
        var value = e.detail.value;
        var list = [];
        switch(+value) {
            case 0:
                nowIndexList = sorted250List;
                break;
            case 1:
                nowIndexList = sorted120List;
                break;
            case 2:
                nowIndexList = sorted60List;
                break;
        }

        list = self.processListData(nowIndexList);
        self.setData({
            value: value,
            indexesList: list
        });
        this.setCharts();

        this.navToFund();
    },
    processListData: function(list) {
        return list.map(function(item) {
            return {
                diff_250: item.diff_250,
                diff_120: item.diff_120,
                diff_60: item.diff_60,
                indexfullname: item.indexfullname
            }
        })
    },
    setCharts: function() {
        var self = this;
        var indexInfo = self.data.indexInfo;
        var value = +self.data.value;
        var context = wx.createCanvasContext('charts');
        // var systemSize = self.data.systemSize;
        var xDataList = indexInfo.alldates;
        var y2DataList = indexInfo.allindex;
        var maxIndex = indexInfo.max_index;
        var minIndex = indexInfo.min_index;
        var indexName = indexInfo.indexfullname;
        var box1Color = '';
        var box2Color = '';
        var tipsBoxes = [];
        var box1 = {
            width: 68,
            height: 20,
            fontColor: '#ffffff'
        };
        var box2 = {
            height: 20
        };
        var diffAvangeStr = '';

        switch(value) {
            case 0:
                var maxAvange = indexInfo.ma_max_250;
                var minAvange = indexInfo.ma_min_250;
                var y1DataList = indexInfo.allma_250;
                var diffAvange = indexInfo.diff_250;
                var action = indexInfo.action_250;
                var avangeName = '250日均线';
                break;
            case 1:
                var maxAvange = indexInfo.ma_max_120;
                var minAvange = indexInfo.ma_min_120;
                var y1DataList = indexInfo.allma_120;
                var diffAvange = indexInfo.diff_120;
                var action = indexInfo.action_120;
                var avangeName = '120日均线';
                break;
            case 2:
                var maxAvange = indexInfo.ma_max_60;
                var minAvange = indexInfo.ma_min_60;
                var y1DataList = indexInfo.allma_60;
                var diffAvange = indexInfo.diff_60;
                var action = indexInfo.action_60;
                var avangeName = '60日均线';
                break;
        }

        if(diffAvange <= 20) {
            box1Color = '#63C091';
            box2Color = '#e1f2ea';
        }else{
            box1Color = '#E45E6C';
            box2Color = '#f9dfe2';
        }

        if(diffAvange > 0) {
            diffAvangeStr = '+'+diffAvange;
        }else{
            diffAvangeStr = diffAvange;
        }

        box1.backgroundColor = box1Color;
        box1.tipsContent = '偏移'+diffAvangeStr+'%';

        box2.backgroundColor = box2Color;
        box2.tipsContent = action;
        box2.width = self.countWidth(box2.tipsContent);
        box2.fontColor = box1Color;
        tipsBoxes.push(box1);

        if(value == 0) {
            tipsBoxes.push(box2);
        }

        var maxYArisData = Math.max(maxAvange, maxIndex)*1.2;
        var minYArisData = Math.min(minAvange, minIndex);

        charts.init(context, {
            series: [
                {
                    xArisData: {
                        data: (function() {
                            let _data = [];
                            let len = xDataList.length;
                            for(var i=len-1; i>=0; i--) {
                                _data.push({
                                    value: xDataList[i]
                                })
                            }


                            return _data;
                        })()
                    },
                    yArisData: {
                        data: (function() {
                            let _data = [];
                            let len = y1DataList.length;
                            for(var i=len-1; i>=0; i--) {
                                if(!y1DataList[i]) {
                                    y1DataList[i] = y1DataList[i+1];
                                }
                                _data.push({
                                    value: y1DataList[i]
                                })
                            }
                            return _data;
                        })()
                    },
                    type: 'lineDash',
                    color: '#999999',
                    name: avangeName
                },
                {
                    xArisData: {
                        data: (function() {
                            let _data = [];
                            let len = xDataList.length;
                            for(var i=len-1; i>=0; i--) {
                                _data.push({
                                    value: xDataList[i]
                                })
                            }

                            return _data;
                        })()
                    },
                    yArisData: {
                        data: (function() {
                            let _data = [];
                            let len = y2DataList.length;
                            for(var i=len-1; i>=0; i--) {
                                if(!y2DataList[i]) {
                                    y2DataList[i] = y2DataList[i+1];
                                }
                                _data.push({
                                    value: y2DataList[i]
                                })
                            }

                            return _data;
                        })(),
                    },
                    type: 'line',
                    color: '#999999',
                    name: indexName,
                    drawPoint: {
                        point: (function(){
                            let pointsIndex = [];
                            let index = 249;
                            pointsIndex.push(index);
                            return pointsIndex;
                        })(),
                        pointColor: box1Color
                    },
                    tipsBoxes: tipsBoxes
                }
            ],
            minYArisData: minYArisData,
            maxYArisData: maxYArisData,
            width: systemSize.w*0.9,
            height: systemSize.w * 0.4
        });
    },
    countWidth: function(con) {
        return (12 * con.length > 60 ? 60 : 12 * con.length);
    },
    fetchList: function() {
        var url = "https://m.aniu.com.cn/superfund/ma_share/";
        var self = this;

        wx.request({
            url: url,
            header: {
                'content-type': 'application/json',
            },
            success: function(res) {
                systemSize = self.getSystemSize();
                itemHeight = systemSize.w*0.14;
                nowIndexList = res.data.sorted_250;
                var list = self.processListData(nowIndexList);
                self.setData({
                    updateTime: res.data.updatetime,
                    indexesList: list,
                    indexInfo: res.data.start_data
                })

                self.setCharts();
                self.navToFund();
                self.setOtherList(res.data);
            }
        })
    },
    setOtherList: function(data) {
        sorted60List = data.sorted_60;
        sorted120List = data.sorted_120;
        sorted250List = data.sorted_250;
    },
    setNowIndexInfo: function() {
        var self = this;
        var len = self.data.indexesList.length;
        for(var i=0; i<len; i++) {
            var j = i>0?i-1:i;
            if(self.data.indexesList[i].indexfullname == '上证综合指数') {
                self.setData({
                    indexInfo: self.data.indexesList[i],
                    scrollTop: self.data.itemHeight*j
                });
                break;
            }
        }

    },
    choseIndex: function(e) {
        var index = e.target.dataset.fund;
        var self = this;
        this.setData({
            indexInfo: nowIndexList[index]
        });

        self.setCharts();
    },
    navToFund: function() {
        var self = this;
        var indexInfo = self.data.indexInfo;
        var indexesList = self.data.indexesList;
        // var itemHeight = self.data.itemHeight;
        var i = 0;
        var len = indexesList.length;

        for(var j=0; j<len; j++) {
            if(indexesList[j].indexfullname == indexInfo.indexfullname) {
                i = j>0?j-1:j;
                break;

            }
        }

        var top = itemHeight * i;

        self.setData({
            scrollTop: top
        })
    },
    bindNavToIndex: function() {
        this.navToFund();
    },
    onShareAppMessage: function(res) {
        if(res.from == 'button') {
            console.log(res.target);
        }

        return {
            title: '均线小程序',
            path: 'pages/index/index'
        }
    },
    bindtouch: function() {
        return;
    },
    onShareAppMessage: function(res) {
        if(res.from == 'button') {
            console.log(res.target);
        }

        return {
            title: '逢低买入 逢高卖出',
            path: 'pages/index/index'
        }
    },
    gotoKefu: function(){
        this.setData({
            hidden: false
        })
    },
    hideKefu: function() {
        this.setData({
            hidden: true
        })
    }
})