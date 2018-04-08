var Charts = (function() {
    // context
    let context;
    // 总数据
    let series = [];
    // 横坐标的数据
    let xArisData = [];
    // 纵坐标数据
    let yArisData = [];
    // 绘画类型
    let type;
    // canvas width
    let width = 0;
    // canvas height
    let height = 0;
    // Y轴的最大值
    let maxYArisData = 0;
    // x轴的点集合
    let xPoints = [0];
    // x轴每线段的长度
    let xDotLen = 0;
    // Y轴每线段的长度
    let yDotLen = 0;
    // 第一次触摸
    let firstTouch = true;
    // 上一次的点位置
    let lastIndex = 0;
    // 竖线宽度
    let verticalLineWidth = 1;
    // 点的数量
    let dotNum = 0;
    //
    let minYArisData = 0;
    let yInterval = 0;
    let maxOffset = 0;

    /**
     * 初始化获取context
     * @param {[JSON]} json [description ]
     * @return {[]}
     */
    function init(_context, option) {
        context = _context;
        maxYArisData = option.maxYArisData;
        minYArisData = option.minYArisData;
        series = option.series;
        width = option.width;
        height = option.height;
        yInterval = option.yInterval;
        maxOffset = 15*series.length;

        dotNum = option.series[0].xArisData.data.length;
        xDotLen = (width / (dotNum-1)).toFixed(4);
        yDotLen = (height / (maxYArisData-minYArisData)).toFixed(4);

        drawCharts();

    }

    /**
     * 设置options
     * @param {[JSON]} json [description ]
     * @return {[]}
     */
    function setOption(option) {
        return {
            xArisData: option.xArisData.data,
            yArisData: option.yArisData.data,
            type: option.type,
            color: option.color,
            name: option.name,
            drawPoint: option.drawPoint && option.drawPoint.point || [],
            pointColor: option.drawPoint && option.drawPoint.pointColor,
            tipsBoxes: option.tipsBoxes || [{
                width: 100,
                height: 40,
                backgroundColor: 'blue',
                fontColor: '#ffffff'
            }]
        }
    }

    /**
     * 绘画图表
     * @param {[JSON]} json [description ]
     * @return {[]}
     */
    function drawCharts(drawOption) {

        // 绘制提示框
        if(drawOption && drawOption.type == 'drawToolTip') {
            context.save();
            drawToolTip(drawOption.seriesData, drawOption.index*xDotLen);
            context.restore();
        }

        series.forEach(function(item, itemIndex) {
            let option = setOption(item);
            // 标注的偏移量
            let offset = 15 * (itemIndex+1);
            if(option.type) {
                switch(option.type) {
                    case 'line':
                        context.setLineDash([5,0]);
                        drawLine(option);
                        drawRemark(offset, option.name);
                        break;
                    case 'lineDash':
                        context.setLineDash([2,2]);
                        drawLine(option);
                        drawRemark(offset, option.name);
                        break;
                    default:
                        console.log('没有传入类型');
                }
            }
            if(option.drawPoint.length > 0) {
                option.drawPoint.forEach(function(point) {
                    let x = xPoints[point];
                    let y = height-maxOffset-((option.yArisData[point].value-minYArisData)*yDotLen).toFixed(4);
                    let pointData = {
                        x: x,
                        y: option.yArisData[point].value
                    }

                    drawPoint(x,y,option.pointColor);
                    drawTipBox(x,y,pointData,option.tipsBoxes);
                })
            }
        });
        context.setLineJoin('round');
        context.draw();
    }
    /**
     * 绘画标注
     * @param {Number} offset 标注的偏移量
     * @param {Stirng} name 标注名称
     * @return {[]}
     */
    function drawRemark(offset, name) {
        context.beginPath();
        context.setFillStyle('#999999');
        context.moveTo(0, offset);
        context.lineTo(20, offset);
        context.setFontSize(10);
        context.fillText(name, 25, offset);
        context.stroke();
    }

    /**
     * 设置基本的线条属性
     * @param {[JSON]} json [description ]
     * @return {[]}
     */
    function setLineStyle(option) {
        context.setStrokeStyle(option.color);
        context.setLineWidth(verticalLineWidth);
    }

    /**
     * 绘画实线线条
     * @param {[JSON]} json [description ]
     * @return {[]}
     */
    function drawLine(option) {
        setLineStyle(option);
        context.beginPath();
        context.moveTo(0, height-maxOffset-(option.yArisData[0].value-minYArisData) * yDotLen);
        for(let i=1; i<dotNum; i++) {
            let x = (xDotLen * i).toFixed(4);
            let y = ((option.yArisData[i].value-minYArisData)*yDotLen).toFixed(4);
            if(xPoints.length < dotNum) {
                xPoints.push(x);
            }
            context.lineTo(x, height-maxOffset-y);
        }
        context.stroke();

    }


    /**
     * touch出现提示框
     * @param {[JSON]} json [description ]
     * @return {[]}
     */
    function showToolTip(e) {
        let touches = e.touches && e.touches.length ? e.touches : e.changedTouches;
        let point = {
            x: touches[0].x,
            y: touches[0].y
        }
        let index = getCurrentIndex(point, xPoints);
        let seriesData = getSeriesItem(series, index);
        drawCharts({
            type: 'drawToolTip',
            index: index,
            seriesData: seriesData
        });
    }

    /**
     * 绘制提示框
     * @param {[JSON]} json [description ]
     * @return {[]}
     */
    function drawToolTip(seriesData, index) {
        drawVerticalLine(index);
    }

    /**
     * 绘制触摸点竖线
     * @param {[JSON]} json [description ]
     * @return {[]}
     */
    function drawVerticalLine(index) {
        context.setStrokeStyle("#999999");
        context.setLineWidth(verticalLineWidth);
        context.setLineDash([5,0]);
        context.moveTo(index, 0);
        context.lineTo(index, height);
        context.stroke();
    }

    /**
     * 绘制特定的点
     * @param {[JSON]} json [description ]
     * @return {[]}
     */
    function drawPoint(x, y, color) {
        context.beginPath();
        context.moveTo(x,y);
        context.setFillStyle(color);
        context.arc(x, y, 3, 0, 2 * Math.PI);
        context.fill();
    }

    /**
     * 绘制框
     * @param {[JSON]} json [description ]
     * @return {[]}
     */
    function drawTipBox(x, y, pointData, tipsBoxes) {
        let lastWidth = 0;
        tipsBoxes.forEach(function(item, index) {
            if(index == 0) {
                drawTriangle(x,y,item.backgroundColor);
            }
            let _x = x - 12 - item.width - lastWidth;
            let _y = y - 10;
            lastWidth = item.width + lastWidth;
            context.beginPath();
            context.setFillStyle(item.backgroundColor);
            context.setGlobalAlpha(0.9);
            context.fillRect(_x,_y,item.width,item.height);

            context.beginPath();
            context.setFontSize(10);
            context.setGlobalAlpha(1);
            context.setFillStyle(item.fontColor);
            context.fillText(item.tipsContent, _x+4, _y+13);
        })
    }

    /**
     * 绘制三角形
     * @param {[JSON]} json [description ]
     * @return {[]}
     */
    function drawTriangle(x,y,color) {
        context.beginPath();
        context.setFillStyle(color);
        context.setGlobalAlpha(0.9);
        context.moveTo(x-6, y);
        context.lineTo(x-13, y-5);
        context.lineTo(x-13, y+5);
        context.closePath();
        context.fill();
    }


    /**
     * 获取当前touch的点接近的数据
     * @param {[JSON]} json [description ]
     * @return {[]}
     */
    function getCurrentIndex(point, xPoints) {
        let currentIndex = -1;
        let halfDotLen = (xDotLen/2).toFixed(4);
        let currentItem = xPoints.forEach(function(item, index) {
            if(currentIndex<0 && point.x <= item) {
                if(item - point.x > halfDotLen) {
                    currentIndex = index - 1;
                }else{
                    currentIndex = index;
                }
            }
        });

        return currentIndex;
    }

    /**
     * 获取触摸点对应的数据
     * @param {[JSON]} json [description ]
     * @return {[]}
     */
    function getSeriesItem(series, index) {
        let seriesData = [];
        if(series.length > 0 && index != -1) {
            series.forEach(function(seriesItem) {
                let xData = seriesItem.xArisData.data;
                let yData = seriesItem.yArisData.data;
                seriesData.push({
                    x: xData[index].value,
                    y: yData[index].value,
                    type: seriesItem.type
                })
            })
        }

        return seriesData;
    }

    return {
        init: init,
        showToolTip: showToolTip
    }

})();


module.exports = Charts;