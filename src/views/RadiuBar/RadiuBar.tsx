import { defineComponent, onMounted } from "vue";
import * as d3 from "d3";

export default defineComponent({
  name: "RadiuBar",
  setup() {
    onMounted(() => {
      draw();
    });
    // 主要是使用radialLine() 绘制 曲线， 角度均匀变化，半径成比例增长
    // 确定柱状图位置，可以先算出整体path 的长度，在通过每个柱状图比例尺所在的长度确定x, y, 最后再确定旋转角度
    const draw = () => {
      const svg = d3
        .select(".page__radiuBar")
        .append("svg")
        .attr("width", 800)
        .attr("height", 600);
      // .attr('transform', 'translate(400, 300)')
      const radius = d3.scaleLinear().domain([0, 2.5]).range([40, 260]);
      const points = d3.range(0, 2.5 + 0.001, 2.5 / 1000);
      const data: [number, number][] = points.map((item: number) => {
        return [item, radius(item)];
      });

      const spiral = d3
        .lineRadial()
        .curve(d3.curveCardinal)
        .angle((d, i) => 3 * Math.PI * data[i][0])
        .radius((d, i) => data[i][1]);

      const path = svg
        .append("path")
        .attr("transform", "translate(400, 300)")
        .attr("d", spiral(data) || "")
        .style("stroke", "steelblue")
        .style("fill", "none")
        .style("opacity", 0);

      const spiralLength =
        !path.empty() && (path.node() as any).getTotalLength();
      const N = 365;
      const bandWidth = spiralLength / N;

      const someData = [];

      for (let i = 0; i < N; i++) {
        const current = new Date();
        current.setDate(current.getDate() + i);
        someData.push({
          date: current,
          value: Math.random(),
          group: current.getMonth(),
          x: 0,
          y: 0,
          a: 0,
        });
      }

      const timeScale = d3
        .scaleTime()
        .domain(
          d3.extent(someData, (d) => d.date.getTime()) as [number, number]
        )
        .range([0, spiralLength]);
      const valueScale = d3
        .scaleLinear()
        .domain([0, d3.max(someData, (d) => d.value) as number])
        .range([0, 40]);

      svg
        .append("g")
        .selectAll(".rect")
        .data(someData)
        .enter()
        .append("rect")
        .attr("x", (d) => {
          const linePer = timeScale(d.date);
          const position = (path.node() as any).getPointAtLength(linePer);
          d.x = position.x;
          d.y = position.y;
          d.a = (Math.atan2(position.y, position.x) * 180) / Math.PI - 90;
          return d.x + 400;
        })
        .attr("y", (d) => d.y + 300)
        .attr("width", bandWidth)
        .attr("stroke", "none")
        .attr("fill", (d, i) => {
          const interpolate = d3.interpolate("#FFE839", "#FE6B69");
          return interpolate(i / someData.length);
        })
        .attr("transform", (d) => `rotate(${d.a}, ${d.x + 400}, ${d.y + 300})`)
        .transition()
        .duration(3000 / someData.length)
        .delay((d, i) => (i * 3000) / someData.length)
        .attr("height", (d) => valueScale(d.value));
    };

    return () => {
      return <div class="page__radiuBar p24"></div>;
    };
  },
});
