import { defineComponent, onMounted, ref } from "vue";
import * as d3 from "d3";

export default defineComponent({
  name: "RotateChart",
  setup() {
    onMounted(() => {
      initData();
      draw();
    });
    const data = ref<[number, number][]>([]);
    const initData = () => {
      for (let i = 0; i < 10; i++) {
        data.value.push([Math.ceil(Math.random() * 24), Math.random()]);
      }
    };
    const draw = () => {
      const svg = d3
        .select(".polar-chart")
        .attr("width", 600)
        .attr("height", 600);
      const maxRadius = 240;
      const rScale = d3.scaleLinear().domain([0, 1]).range([0, maxRadius]);
      const radius = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
      svg
        .selectAll(".radius-path")
        .data(radius)
        .enter()
        .append("g")
        .attr("transform", "translate(300, 300)")
        .attr("class", "radius-path")
        .attr("fill", "none")
        .style("stroke", "steelblue")
        .style("stroke-dasharray", 4)
        .append("path")
        .attr("d", function (d: any) {
          const arc = d3
            .arc()
            .innerRadius(0)
            .outerRadius(rScale(d))
            .startAngle(0)
            .endAngle(Math.PI * 2);
          return arc(d);
        });
      const interpolate = d3.interpolate("lightblue", "blue");
      const circles = svg
        .selectAll("circle")
        .data(data.value)
        .enter()
        .append("circle")
        .attr("class", "animate-circle")
        // .attr('cx', 300)
        // .attr('cy', function (d, i) {
        //   return 300 - rScale(d[1])
        // })
        .attr("r", 8)
        .style("fill", function (d) {
          return interpolate(d[1]);
        });
      svg
        .append("g")
        .selectAll(".circle-path")
        .data(data.value)
        .enter()
        .append("path")
        .attr("fill", "none")
        .style("stroke", "green")
        .attr("d", function (d) {
          const path = d3.path();
          path.arc(300, 300, rScale(d[1]), 0, Math.PI * 2);
          return path.toString();
        })
        .attr("id", function (d, i) {
          return `circle-path-${i}`;
        });
      circles
        .append("animateMotion")
        .attr("repeatCount", "indefinite")
        .attr("dur", function (d) {
          return `${d[1] * 10}s`;
        })
        .attr("path", function (d) {
          const path = d3.path();
          path.arc(300, 300, rScale(d[1]), 0, Math.PI * 2);
          return path.toString();
        });
    };
    return () => {
      return (
        <div class="page-polar-chart p24">
          <svg class="polar-chart"></svg>
        </div>
      );
    };
  },
});
