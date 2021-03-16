import { defineComponent, onMounted, reactive } from "vue";
import * as d3 from "d3";
import "./BarChart.stylus";

export default defineComponent({
  name: "BarChart",
  setup() {
    const barState = reactive<{
      width: number;
      height: number;
      xAxis: string[];
      data: number[];
    }>({
      width: 0,
      height: 0,
      xAxis: [],
      data: [],
    });
    onMounted(() => {
      initBarChartData();
      draw();
    });
    const initBarChartData = () => {
      barState.width = 800;
      barState.height = 600;
      barState.xAxis = [
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
        "星期日",
      ];
      barState.data = [24, 46, 78, 94, 91, 46, 90];
    };
    const draw = () => {
      const svg = d3
        .select(".d3-bar-chart")
        .append("svg")
        .attr("width", barState.width)
        .attr("height", barState.height);
      const rectWidth = 4;
      const chartHeight = 300;
      const linear = d3.scaleLinear().domain([0, 100]).range([250, 0]);
      const band = d3
        .scaleBand()
        .domain(barState.xAxis)
        .range([0, barState.width - 40 * 2]);
      const xAxis = d3.axisBottom(band);
      const yAxis = d3.axisLeft(linear).ticks(5);
      const tooltip = d3
        .select(".d3-bar-chart")
        .append("div")
        .attr("class", "tooltip fs16 pos-a p8 tal")
        .style("opacity", "0");
      svg
        .append("g")
        .call(yAxis)
        .attr("class", "y-axis")
        .attr("transform", `translate(40, ${chartHeight - 250})`);
      svg
        .append("g")
        .call(xAxis)
        .attr("class", "x-axis")
        .attr("transform", `translate(40, ${chartHeight})`);
      svg
        .selectAll(".y-axis .tick")
        .append("line")
        .attr("class", function (d, i: number) {
          return i === 0 ? "dotted-axis" : "dotted-grid";
        })
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("x2", 720);
      svg
        .selectAll(".x-axis .tick")
        .append("line")
        .attr("class", function () {
          return "dotted-grid";
        })
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", -250); // 相对于tick 的终点，往上y值是负数
      const rects = svg
        .selectAll("rect")
        .data(barState.data)
        .enter()
        .append("rect")
        .attr("x", (d: number, i: number) => {
          return 40 + (band(barState.xAxis[i]) || 0) + rectWidth / 2;
        })
        .attr("y", (d: number) => {
          return linear(d) + 50;
        })
        .attr("height", (d) => {
          return 250 - linear(d);
        })
        .attr("width", band.bandwidth() - rectWidth)
        .attr("fill", "rgb(238, 0, 34)")
        .attr("opacity", "0.4")
        .on("mouseover", function (event: any, d: number) {
          const e = rects.nodes();
          const i = e.indexOf(this);
          tooltip.transition().duration(200);
          tooltip.html(
            `<span>${barState.xAxis[i]}</span><br/><span>${d}</span>`
          );
          tooltip
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`)
            .style("opacity", "1");
        })
        .on("mouseout", function () {
          tooltip.style("opacity", "0");
        });
    };
    return () => {
      return (
        <div class="page__barChart">
          <div class="d3-bar-chart"></div>
        </div>
      );
    };
  },
});
