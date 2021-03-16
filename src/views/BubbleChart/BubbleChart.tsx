import * as d3 from "d3";
import { defineComponent, onMounted, reactive } from "vue";
import moment from "moment";
import "./BubbleChart.stylus";

type ChartDataState = {
  xData: string[];
  yData1: number[];
  rData1: number[];
  rData2: number[];
  yData2: number[];
};

export default defineComponent({
  name: "BubbleChart",
  setup() {
    const chartDataState = reactive<ChartDataState>({
      xData: [],
      yData1: [],
      rData1: [],
      yData2: [],
      rData2: [],
    });
    onMounted(() => {
      initData();
      drawBubble();
    });
    const initData = () => {
      const dateStart = "2018-12-01";
      const date = [dateStart];
      const yData1 = [20];
      const rData1 = [20];
      const yData2 = [10];
      const rData2 = [10];
      for (let i = 1; i < 31; i++) {
        date.push(moment(dateStart).add(i, "days").format("YYYY-MM-DD"));
        yData1.push(Math.floor(Math.random() * 100) + 1);
        rData1.push(Math.floor(Math.random() * 100) + 1);
        yData2.push(Math.floor(Math.random() * 100) + 1);
        rData2.push(Math.floor(Math.random() * 100) + 1);
      }
      chartDataState.xData = date;
      chartDataState.yData1 = yData1;
      chartDataState.rData1 = rData1;
      chartDataState.yData2 = yData2;
      chartDataState.rData2 = rData2;
    };
    //气泡图构成，坐标轴，圆形元素circle，tooltip div，半径和透明度由数据映射到比例尺生成

    const drawBubble = () => {
      const width = 800;
      const height = 560;
      const padding = 40;
      const svg = d3
        .select(".d3-bubble-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const length = chartDataState.xData.length;
      const tickArr = [];
      const ticks = 3;
      for (let k = 1; k <= length / ticks; k++) {
        tickArr.push(chartDataState.xData[k * ticks - 1]);
      }
      const rScale = d3
        .scaleLinear()
        .domain([0, d3.max(chartDataState.rData1) || 100])
        .range([4, 20]); // 根据rData1生成一个气泡半径的比例尺
      const colorScale = d3
        .scaleLinear()
        .domain([0, d3.max(chartDataState.rData1) || 100])
        .range([0.2, 1]); // 生成透明度比例尺

      const xScale = d3
        .scaleBand()
        .domain(chartDataState.xData)
        .range([0, width - padding * 2]);
      const yScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height - padding * 2, 0]);

      const tooltip = d3
        .select(".d3-bubble-chart")
        .append("div")
        .attr("class", "tooltip fs16 tal pos-a p8")
        .style("opacity", 0);
      const xAxis = d3.axisBottom(xScale).tickValues(tickArr); // 设置横坐标刻度
      const yAxis = d3.axisLeft(yScale);

      svg
        .append("g")
        .call(xAxis)
        .attr("class", "x-axis")
        .attr("transform", `translate(${padding}, ${height - padding})`);
      svg
        .append("g")
        .call(yAxis)
        .attr("class", "y-axis")
        .attr("transform", `translate(${padding}, ${padding})`);
      svg
        .append("g")
        .append("text")
        .text("y值")
        .attr("font-size", "12px")
        .attr("transform", `translate(${padding - 12}, ${padding - 12})`)
        .style("fill", "rgba(0, 0, 0, 0.65)"); // y轴轴名称
      svg
        .append("g")
        .append("text")
        .text("日期")
        .attr("font-size", "12px")
        .attr(
          "transform",
          `translate(${width - padding + 6}, ${height - padding + 6})`
        )
        .style("fill", "rgba(0, 0, 0, 0.65)");

      // 插入legend 系列较多时应该使用data().enter().append('g') 并且手动计算每个g的宽度 再确定间隔

      const gLegend = svg
        .append("g")
        .attr("width", 120)
        .attr("height", 32)
        .attr("transform", `translate(${width / 2 - 120 / 2}, 0)`);
      gLegend
        .append("text")
        .text("杭州")
        .attr("x", 20 + 4)
        .attr("y", 10)
        .style("fill", "rgba(0, 0, 0, 0.65)")
        .attr("font-size", "12px");
      gLegend
        .append("rect")
        .attr("width", 20)
        .attr("height", 12)
        .attr("rx", 4)
        .attr("ry", 4)
        .style("fill", "red");

      gLegend
        .append("text")
        .text("南京")
        .attr("x", 100 + 4)
        .attr("y", 10)
        .style("fill", "rgba(0, 0, 0, 0.65)")
        .attr("font-size", "12px");
      gLegend
        .append("rect")
        .attr("width", 20)
        .attr("height", 12)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("x", 80)
        .style("fill", "green");
      const circleSeries1 = svg
        .selectAll(".my-circle-series1")
        .data(chartDataState.yData1)
        .enter()
        .append("circle")
        .attr("class", "my-circle-series1")
        .attr("cy", function (d) {
          // 圆心的原点y
          return yScale(d) + padding;
        })
        .attr("cx", function (d, i: number) {
          // 圆心的原点x
          return (xScale(chartDataState.xData[i]) || 0) + padding;
        })
        .attr("r", function (d, i) {
          // 设置半径
          return rScale(chartDataState.rData1[i]);
        })
        .style("opacity", function (d, i) {
          // 透明度
          return colorScale(chartDataState.rData1[i]);
        })
        .style("fill", "red")
        .on("mouseover", function (event: any, d: number) {
          const nodes = circleSeries1.nodes();
          const i = nodes.indexOf(this);
          d3.select(this)
            .attr("r", function () {
              return rScale(chartDataState.rData1[i]) + 3;
            })
            .transition()
            .duration(500)
            .ease(d3.easeLinear);
          tooltip.html(`<span>气泡图-系列1</span><br/>
            <span>日期: ${chartDataState.xData[i]}</span><br/>
            <span>纵坐标: ${d}</span><br/>
            <span>半径比例值: ${chartDataState.rData1[i]}</span>`);
          tooltip
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`)
            .style("opacity", "1");
        })
        .on("mouseout", function () {
          const nodes = circleSeries1.nodes();
          const i = nodes.indexOf(this);
          tooltip.style("opacity", 0);
          d3.select(this)
            .attr("r", rScale(chartDataState.rData1[i]))
            .transition()
            .duration(500);
        });

      const circleSeries2 = svg
        .selectAll(".my-circle-series2")
        .data(chartDataState.yData2)
        .enter()
        .append("circle")
        .attr("class", "my-circle-series2")
        .attr("cy", function (d, i) {
          return yScale(d) + padding;
        })
        .attr("cx", function (d, i) {
          return (xScale(chartDataState.xData[i]) || 0) + padding;
        })
        .attr("r", function (d, i) {
          return rScale(chartDataState.rData2[i]);
        })
        .style("opacity", function (d, i) {
          return colorScale(chartDataState.rData2[i]);
        })
        .style("fill", "green")
        .on("mouseover", function (event: any, d: number) {
          const nodes = circleSeries2.nodes();
          const i = nodes.indexOf(this);
          d3.select(this)
            .attr("r", function () {
              return rScale(chartDataState.rData2[i]) + 3;
            })
            .transition()
            .duration(500)
            .ease(d3.easeLinear);
          tooltip.html(`<span>气泡图-系列2</span><br/>
            <span>日期: ${chartDataState.xData[i]}</span><br/>
            <span>纵坐标: ${d}</span><br/>
            <span>半径比例值: ${chartDataState.rData2[i]}</span>`);
          tooltip
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`)
            .style("opacity", "1");
        })
        .on("mouseout", function () {
          const nodes = circleSeries2.nodes();
          const i = nodes.indexOf(this);
          tooltip.style("opacity", 0);
          d3.select(this)
            .attr("r", rScale(chartDataState.rData2[i]))
            .transition()
            .duration(500);
        });
    };
    return () => {
      return <div class="page__bubbleChart d3-bubble-chart pt24"></div>;
    };
  },
});
