import { defineComponent, onMounted } from "vue";
import * as d3 from "d3";
import geoJson from './china'

export default defineComponent({
  name: "MapChart",
  setup() {
    const point = [
      {
        name: "北京市",
        coordinate: [116.4990419643, 39.9434548045],
        color: "#FF8E4A",
        number: 1000,
      },
      {
        name: "上海市",
        coordinate: [121.4737919321, 31.2304324029],
        color: "#46bee9",
        number: 1000,
      },
      {
        name: "广州市",
        coordinate: [113.2643446427, 23.1290765766],
        color: "#a6c84c",
        number: 900,
      },
      {
        name: "成都市",
        coordinate: [104.0647735044, 30.5702183724],
        color: "#9900ff",
        number: 800,
      },
      {
        name: "拉萨市",
        coordinate: [91.1144530801, 29.644113516],
        color: "#00f7ff",
        number: 200,
      },
    ];
    onMounted(() => {
      init();
    });
    let gHideLine: any = null;
    let gCurLine: any = null;
    let pointBJ: any = null;
    let projection: any = null;
    const culControlPoint = (
      start: [number, number],
      end: [number, number],
      curveness: number
    ) => {
      const centroid = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
      const cpX = centroid[0] + (end[1] - start[1]) * curveness;
      const cpY = centroid[1] + (end[0] - start[0]) * curveness;
      return [cpX, cpY];
    };
    const init = () => {
      const width = 800;
      const height = 600;
      const svg = d3
        .select(".map-chart")
        .attr("width", width)
        .attr("height", height);
      let mapData = [];
      const scale = d3.scaleLinear().domain([200, 1000]).range([0, 5]);
      projection = d3.geoMercator(); // 设置投影函数
      const path: any = d3.geoPath().projection(projection);
      const gMap = svg
        .append("g")
        .attr("class", "map")
        .attr("stroke", "#bfc3c7")
        .attr("stroke-width", 1);
      mapData = geoJson.features;
      projection.fitSize([width, height], geoJson);
      gMap
        .selectAll("path")
        .data(mapData)
        .enter()
        .append("path")
        .attr("d", path)
        .style("cursor", "pointer")
        .attr("fill", "#414545")
        .on("mouseover", function () {
          d3.select(this).attr("fill", "#FF8E4A");
        })
        .on("mouseout", function () {
          d3.select(this).attr("fill", "#414545");
        });
      pointBJ = projection([point[0].coordinate[0], point[0].coordinate[1]]);
      gCurLine = svg.append("g").attr("class", "cur-line");
      gHideLine = svg.append("g").attr("class", "hide-line");

      const defs = svg.append("defs");

      const radialGradient = defs
        .append("radialGradient")
        .attr("id", "grad")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");

      radialGradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#fff")
        .attr("stop-opacity", 1);
      radialGradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#fff")
        .attr("stop-opacity", 0);

      point.forEach((item, index) => {
        const pointX = projection(item.coordinate);
        createWave(item.color, scale(item.number), pointX);
        if (item.name !== "北京市") {
          const ctx = d3.path();
          const controlX = culControlPoint(pointBJ, pointX, 0.2)[0];
          const controlY = culControlPoint(pointBJ, pointX, 0.2)[1];
          ctx.moveTo(pointBJ[0], pointBJ[1]);
          ctx.quadraticCurveTo(
            culControlPoint(pointBJ, pointX, 0.2)[0],
            culControlPoint(pointBJ, pointX, 0.2)[1],
            pointX[0],
            pointX[1]
          );

          const totalD = ctx.toString();

          let lineLength: any = "";
          let hidePath: any = "";

          const circle = defs
            .append("mask")
            .attr("id", `mask-${index}`)
            .append("circle")
            .attr("class", "circle-mask")
            .attr("r", 50)
            .attr("fill", "url(#grad)");

          gHideLine
            .append("path")
            .attr("class", `hide-path-${index}`)
            .attr("fill", "none")
            .attr("stroke-width", 0)
            .attr("d", totalD)
            .attr("stroke", function (d: any, i: number, n: any) {
              lineLength = d3.select(n[i]).node().getTotalLength();
              hidePath = d3.select(n[i]);
              return "none";
            });

          gCurLine
            .append("path")
            .attr("class", `cur-path-${index}`)
            .attr("stroke", "#00ffef")
            .attr("fill", "none")
            .attr("stroke-width", 3)
            .attr("d", totalD)
            .attr("mask", `url(#mask-${index})`)
            .transition()
            .duration(700)
            .delay(300 * index)
            .attrTween("d", function () {
              // newPath.attr('d', `M${pointBJ[0]}, ${pointBJ[1]} Q${controlX}, ${controlY} ${pointX[0]}, ${pointX[1]}`)
              return function (t: number) {
                const pNewEnd = hidePath
                  .node()
                  .getPointAtLength(t * lineLength); // 计算路径上某个长度的点
                // console.log(pNewEnd.x, pNewEnd.y)
                const newControlX = (1 - t) * pointBJ[0] + t * controlX;
                const newControlY = (1 - t) * pointBJ[1] + t * controlY;

                const context = d3.path();

                // 二次贝塞尔 这些线条绘制不要在外部定义d3.path(),否则会重叠,在attrTween 函数内重新定义一个context, 或者直接用svg path M Q 命令
                context.moveTo(pointBJ[0], pointBJ[1]);
                context.quadraticCurveTo(
                  newControlX,
                  newControlY,
                  pNewEnd.x,
                  pNewEnd.y
                );
                circle.attr("cx", pNewEnd.x);
                circle.attr("cy", pNewEnd.y);
                // return `M${pointBJ[0]}, ${pointBJ[1]} Q${newControlX}, ${newControlY} ${pNewEnd.x}, ${pNewEnd.y}`
                return context.toString();
              };
            });
        }
      });
      setInterval(() => {
        maskUpdate();
      }, 1000);
    };
    const createWave = (color: string, r: number, d: number[]) => {
      const svg = d3.select(".map-chart");
      const circleG = svg.append("g").attr("class", "g-circle");
      circleG.attr("transform", `translate(${d[0]}, ${d[1]})`);
      const circleIn = circleG
        .append("circle")
        .attr("r", 3 + r)
        .attr("cx", 0)
        .attr("cy", 0)
        .style("fill", color);
      circleIn
        .append("animate")
        .attr("attributeName", "r")
        .attr("values", `${3 + r};${4 + r};${3 + r}`)
        .attr("dur", "2s")
        .attr("keyTimes", "0;0.5;1")
        .attr("repeatCount", "indefinite");
      const circleMiddle = circleG
        .append("circle")
        .attr("r", 4 + r)
        .style("fill", "none")
        .attr("stroke", color)
        .attr("cx", 0)
        .attr("cy", 0);
      circleMiddle
        .append("animate")
        .attr("attributeName", "r")
        .attr("from", 4 + r)
        .attr("to", 6 + r)
        .attr("dur", "2s")
        .attr("repeatCount", "indefinite");
      circleMiddle
        .append("animate")
        .attr("attributeName", "opacity")
        .attr("from", 0)
        .attr("to", 1)
        .attr("dur", "2s")
        .attr("repeatCount", "indefinite");
      const circleOut = circleG
        .append("circle")
        .attr("r", 6 + r)
        .style("fill", "none")
        .attr("stroke", color)
        .attr("cx", 0)
        .attr("cy", 0);
      circleOut
        .append("animate")
        .attr("attributeName", "r")
        .attr("from", 6 + r)
        .attr("to", 8 + r)
        .attr("dur", "2s")
        .attr("repeatCount", "indefinite");
      circleOut
        .append("animate")
        .attr("attributeName", "opacity")
        .attr("from", 1)
        .attr("to", 0)
        .attr("dur", "2s")
        .attr("repeatCount", "indefinite");
    };

    const maskUpdate = () => {
      point.forEach((item, index) => {
        const pointX = projection(item.coordinate);
        const path = gCurLine.select(`.cur-path-${index}`);
        path.attr("d", "");

        const circle = d3
          .select(`#mask-${index} circle`)
          .attr("cx", pointBJ[0])
          .attr("cy", pointBJ[1]);

        if (item.name !== "北京市") {
          const ctx = d3.path();
          const controlX = culControlPoint(pointBJ, pointX, 0.2)[0];
          const controlY = culControlPoint(pointBJ, pointX, 0.2)[1];
          ctx.moveTo(pointBJ[0], pointBJ[1]);
          ctx.quadraticCurveTo(
            culControlPoint(pointBJ, pointX, 0.2)[0],
            culControlPoint(pointBJ, pointX, 0.2)[1],
            pointX[0],
            pointX[1]
          );

          const totalD = ctx.toString();

          const hidePath = d3.select(`.hide-path-${index}`);
          const lineLength = (hidePath.node() as any).getTotalLength();

          path
            .transition()
            .duration(700)
            .delay(300 * index)
            .attrTween("d", function () {
              // newPath.attr('d', `M${pointBJ[0]}, ${pointBJ[1]} Q${controlX}, ${controlY} ${pointX[0]}, ${pointX[1]}`)
              return function (t: number) {
                const pNewEnd = (hidePath.node() as any).getPointAtLength(
                  t * lineLength
                ); // 计算路径上某个长度的点
                // console.log(pNewEnd.x, pNewEnd.y)
                const newControlX = (1 - t) * pointBJ[0] + t * controlX;
                const newControlY = (1 - t) * pointBJ[1] + t * controlY;

                const context = d3.path();

                // 二次贝塞尔 这些线条绘制不要在外部定义d3.path(),否则会重叠,在attrTween 函数内重新定义一个context, 或者直接用svg path M Q 命令
                context.moveTo(pointBJ[0], pointBJ[1]);
                context.quadraticCurveTo(
                  newControlX,
                  newControlY,
                  pNewEnd.x,
                  pNewEnd.y
                );
                circle.attr("cx", pNewEnd.x);
                circle.attr("cy", pNewEnd.y);
                // return `M${pointBJ[0]}, ${pointBJ[1]} Q${newControlX}, ${newControlY} ${pNewEnd.x}, ${pNewEnd.y}`
                return context.toString();
              };
            });
        }
      });
    };

    return () => {
      return (
        <div class="page-map-chart p24">
          <svg class="map-chart"></svg>
        </div>
      );
    };
  },
});
