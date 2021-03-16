import * as d3 from "d3";
import { reactive, onMounted, defineComponent } from "vue";

export default defineComponent({
  name: "PieChart",
  setup() {
    const pieDataState = reactive<{ data: number[]; roseData: number[] }>({
      data: [],
      roseData: [],
    });
    const initPieData = () => {
      pieDataState.data = [10, 20, 30, 40, 70, 200];
      pieDataState.roseData = [20, 40, 10, 80, 30, 50, 20];
    };
    const drawPie = () => {
      const width = 600;
      const height = 400;

      const svg = d3
        .select(".pie-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
      const pie = d3.pie();
      const pieData = pie(pieDataState.data);
      const outerRadius = 150;
      const innerRadius = 80;

      const arc: any = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
      const arcOver = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius + 10);

      const arcs = svg
        .selectAll("g")
        .data(pieData)
        .enter()
        .append("g")
        .style("cursor", "pointer")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);
      arcs
        .append("path")
        .attr("fill", "none")
        .attr("d", arc)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attrTween("d", function (d) {
          const i = d3.interpolate(d.startAngle, d.endAngle);
          return function (t) {
            d.endAngle = i(t);
            return arc(d);
          };
        })
        .attr("fill", function (d, i) {
          return d3.schemeSet3[i];
        });

      //   svg
      //     .append("g")
      //     .attr("transform", "translate(300, 200)")
      //     .selectAll("polyline")
      //     .data(pieData)
      //     .enter()
      //     .append("polyline")
      //     .attr("points", function (d: any) {
      //       const pos = arc.centroid(d);
      //       pos[0] = outerRadius * (midAngle(d) < Math.PI ? 1 : -1);
      //       return `${arc
      //         .centroid(d)
      //         .join(",")} ${arcOver.centroid(d).join(",")} ${pos.join(",")}`;
      //       //   return [arc.centroid(d), arcOver.centroid(d), pos];
      //     });
    };
    const drawRosePie = () => {
      const width = 600;
      const height = 400;
      const padding = 40;
      const svg = d3
        .select(".rose-pie-wrapper")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
      const outerRadius = 160;
      const innerRadius = 0;
      const pie = d3.pie();
      const pieData = pie(pieDataState.roseData);

      const scale = d3
        .scaleLinear()
        .domain([
          d3.min(pieDataState.roseData) || 0,
          d3.max(pieDataState.roseData) || 0,
        ])
        .range([outerRadius / 2, outerRadius / 1.2]);
      const arc: any = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
      svg
        .selectAll(".arc")
        .data(pieData)
        .enter()
        .append("path")
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
        .style("fill", function (d, i) {
          return d3.schemeSet2[i];
        })
        .attr("d", "")
        .transition()
        .duration(200)
        .ease(d3.easeLinear)
        .delay(function (d, i) {
          return d.index * 200;
        })
        .attrTween("d", function (d) {
          const i = d3.interpolate(d.startAngle, d.endAngle);
          return function (t) {
            d.endAngle = i(t);
            return arc(d);
          };
        });
    };
    const midAngle = (data: any) => {
      return data.startAngle + (data.endAngle - data.startAngle) / 2;
    };
    onMounted(() => {
      initPieData();
      drawPie();
      drawRosePie();
    });
    return () => {
      return (
        <div class="page__pieChart">
          <div class="pie-chart"></div>
          <div class="rose-pie-wrapper"></div>
        </div>
      );
    };
  },
});
