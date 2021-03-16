import {
  defineComponent,
  PropType,
  onMounted,
  ref,
  reactive,
  watch,
} from "vue";
import * as d3 from "d3";

type YItem = {
  data: number[];
  color: string;
  name?: string;
};

interface Option {
  name: string;
  data: { x: number[]; y: YItem[] };
  type: string;
  key: string;
  xName: string;
  ySeriesName: string;
  xSeriesName: string;
}

export default defineComponent({
  name: "ChartMain",
  props: {
    option: {
      type: Object as PropType<Option>,
      required: true,
    },
  },
  setup(props) {
    onMounted(() => {
      initSlider();
      initChart();
    });
    watch(
      () => props.option,
      () => {
        (document.querySelector(".my-chart") as HTMLElement).innerHTML = "";
        (document.querySelector(".my-slider") as HTMLElement).innerHTML = "";
        clear();
        initSlider();
        initChart();
      }
    );
    const sliderState = reactive({
      startX: 0,
      endX: 0,
      svgWidth: 0,
      sliderWidth: 0,
      padding: 40,
      paddingRight: 60,
      tooltipPad: 10,
    });
    const circleState = reactive<{ circlesArr: any[] }>({
      circlesArr: [],
    });
    const yScaleRef = ref<any>(null);
    const dataSourceY = ref<number[][]>([]);
    const tooltipRef = ref<any>(null);
    const rectOverRef = ref<any>(null);
    const xStringRef = ref<string[]>([]);
    const clear = () => {
      yScaleRef.value = undefined;
      dataSourceY.value = [];
      circleState.circlesArr = [];
    };
    const initSlider = () => {
      const sliderStart = d3
        .select(".my-slider")
        .append("g")
        .attr("class", "start-slider");
      sliderStart
        .append("line")
        .attr("class", "slider-block")
        .attr("y1", 0)
        .attr("y2", 32);
      sliderStart
        .append("rect")
        .attr("width", 12)
        .attr("height", 16)
        .attr("y", 8)
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("x", -6)
        .style("fill", "#108ee9")
        .style("stroke", "none");
      const svgWidth = (document.querySelector(
        ".my-chart"
      ) as Element).getBoundingClientRect().width;
      const sliderWidth =
        svgWidth - sliderState.padding - sliderState.paddingRight;
      const sliderEnd = d3
        .select(".my-slider")
        .append("g")
        .attr("class", "end-slider");
      sliderEnd
        .append("line")
        .attr("class", "slider-block")
        .attr("y1", 0)
        .attr("y2", 32)
        .attr("x1", sliderWidth)
        .attr("x2", sliderWidth);
      sliderEnd
        .append("rect")
        .attr("width", 12)
        .attr("height", 16)
        .attr("y", 8)
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("x", sliderWidth - 6)
        .style("fill", "#108ee9")
        .attr("stroke", "none");

      sliderState.startX = 0;
      sliderState.endX = sliderWidth;
      sliderState.sliderWidth = sliderWidth;
      sliderState.svgWidth = svgWidth;

      // 左侧滑块
      const dragStart = sliderStart.call(
        d3
          .drag<SVGGElement, unknown>()
          .on("start.interrupt", function () {
            sliderStart.interrupt();
          })
          .on("start drag", function (event) {
            let x = 0;
            if (event.x > 0 && event.x < sliderState.endX) {
              x = event.x;
            } else if (event.x > sliderState.endX) {
              x = sliderState.endX;
            }
            sliderState.startX = x;
            sliderStart.attr("transform", `translate(${x}, 0)`);
            updateChart();
          })
      );
      // 右侧滑块
      const dragEnd = sliderEnd.call(
        d3
          .drag<SVGGElement, unknown>()
          .on("start.interrupt", function () {
            sliderEnd.interrupt();
          })
          .on("start drag", function (event) {
            let endX = sliderWidth;
            if (event.x > sliderWidth) {
              endX = sliderWidth;
            } else if (event.x < sliderState.startX) {
              endX = sliderState.startX;
            } else {
              endX = event.x;
            }
            sliderState.endX = endX;

            sliderEnd.attr("transform", `translate(${endX - sliderWidth}, 0)`);
            updateChart();
            // sliderState.updateChart(type)
          })
      );
      const { option } = props;
      const xString = option.data.x.map((item) => item.toString());
      xStringRef.value = xString;
      const svg = d3.select(".my-slider");
      const svgHeight = (document.querySelector(
        ".my-slider"
      ) as Element).getBoundingClientRect().height;
      const xScale = d3.scalePoint().domain(xString).range([0, sliderWidth]);
      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(option.data.y[0].data) || 0])
        .range([svgHeight, 0]);
      const lines = d3
        .line<string>()
        .x(function (d: string) {
          return xScale(d) || 0;
        })
        .y(function (d: string, i: number) {
          return yScale(option.data.y[0].data[i]);
        });
      svg
        .append("g")
        .append("path")
        .datum(xString)
        .attr("d", lines)
        .attr("stroke-width", 1)
        .attr("stroke", "#aaaaaa")
        .style("opacity", 0.4)
        .attr("fill", "none")
        .attr("class", "my-slider-chart");
    };
    const initChart = () => {
      const { option } = props;
      const padding = 40;
      const paddingRight = 60;
      const svg = d3.select(".my-chart");
      const dataList = option.data;
      const xString = dataList.x.map((item) => item.toString());
      // dataList.x.unshift(0)
      // const dataSourceX = dataList.x.slice(1)

      const result = tickNumber(10, xString);
      const xScale = d3
        .scalePoint()
        .domain(xString)
        .range([
          0,
          sliderState.svgWidth - sliderState.padding - sliderState.paddingRight,
        ]);
      const xAxis = d3.axisBottom(xScale).tickValues(result.tick);

      const xTicks: any = svg
        .append("g")
        .attr("class", "x-axis")
        .call(xAxis)
        .attr("transform", `translate(${padding}, ${420 - padding})`);

      xTicks
        .selectAll(".tick text")
        .attr("transform", "rotate(-45, 0 32) translate(0, 8)")
        .text(function (d: string) {
          return Number(d).toFixed(5);
        });

      xTicks
        .selectAll(".tick")
        .append("line")
        .attr("class", "dotted-grid")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", padding * 2 - 420);

      // 获取所有系列的最大值
      let max = 0;
      dataList.y.forEach((item: YItem) => {
        const d3Max = d3.max(item.data) || 0;
        max = max > d3Max ? max : d3Max;
        dataSourceY.value.push(item.data);
      });
      const tooltip = d3.select(".my-tooltip").empty()
        ? d3
            .select(".chart-main")
            .append("div")
            .attr("class", "my-tooltip")
            .style("opacity", 0)
        : d3.select(".my-tooltip");

      tooltipRef.value = tooltip;
      const yScale = d3
        .scaleLinear()
        .domain([0, max <= 1 ? maxFormat(max) : max])
        .range([420 - padding * 2, 0]);
      const yAxis = d3.axisLeft(yScale);

      yScaleRef.value = yScale;
      const yTicks = svg
        .append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .attr("transform", `translate(${padding}, ${padding})`);
      yTicks
        .selectAll(".tick")
        .append("line")
        .attr("class", "dotted-grid")
        .attr("x1", 0)
        .attr("x2", sliderState.svgWidth - padding - paddingRight)
        .attr("y1", 0)
        .attr("y2", 0);

      const text = svg
        .append("text")
        .text(option.ySeriesName)
        .attr("class", "axis-name")
        .attr("transform", `translate(${padding - 20}, ${padding - 15})`);
      const textX = svg
        .append("text")
        .text(option.xSeriesName)
        .attr("class", "axis-name")
        .attr(
          "transform",
          `translate(${sliderState.svgWidth - paddingRight + 5}, ${
            420 - sliderState.padding
          })`
        );

      dataList.y.forEach((item, index) => {
        const lines = d3
          .line<number>()
          .x(function (d, i) {
            return (xScale(xStringRef.value[i]) || 0) + padding;
          })
          .y(function (d, i) {
            return yScale(d) + padding;
          });
        // line 都需要绘制

        svg
          .append("g")
          .append("path")
          .datum(item.data)
          .attr("d", lines)
          .transition()
          .duration(1000)
          .attr("class", `my-line-path-series-${index}`)
          .attr("stroke-width", 2)
          .attr("stroke", item.color)
          .attr("fill", "none");
        // 如果是区域图
        if (option.type === "area") {
          const areas = d3
            .area<number>()
            .x(function (d, i) {
              return (xScale(xStringRef.value[i]) || 0) + padding;
            })
            .y0(function (d, i) {
              return 420 - padding;
            })
            .y1(function (d, i) {
              return yScale(d) + padding;
            });
          svg
            .append("g")
            .append("path")
            .datum(item.data)
            .attr("d", areas)
            .attr("class", "my-area-path")
            .style("fill", item.color)
            .style("opacity", 0.6);
        } else {
          // 折线图 插入圆
          const circles = svg
            .selectAll(`.my-circle-series${index}`)
            .data(xStringRef.value)
            .enter()
            .append("circle")
            .attr("class", `my-circle-series${index}`)
            .attr("cx", function (d, i) {
              return (xScale(d) || 0) + padding;
            })
            .attr("cy", function (d, i) {
              return yScale(dataSourceY.value[index][i]) + padding;
            })
            .attr("r", 2)
            .style("fill", "white")
            .attr("stroke", item.color)
            .style("opacity", function (d, i) {
              let opacity = 0;
              const circle = d3.select(this);
              result.index.forEach((it) => {
                if (it === i) {
                  circle.attr("is-initial-show", "y");
                  opacity = 1;
                }
              });
              return opacity;
            });
          circleState.circlesArr.push(circles.nodes());
        }
      });
      // this.createRectOverlay(dataList.x, me.dataSourceY, xScale)

      const rectOver = svg
        .append("rect")
        .attr(
          "width",
          sliderState.svgWidth - sliderState.padding - sliderState.paddingRight
        )
        .attr("height", 420 - sliderState.padding * 2)
        .attr("x", sliderState.padding)
        .attr("y", sliderState.padding)
        .attr("opacity", 0)
        .on("mouseenter", function () {
          tooltip.style("opacity", 1);
          svg.selectAll(".hover-line").style("opacity", 1);
        })
        .on("mouseleave", function (event) {
          // 判断移动的目标元素是svg
          if (event.toElement.nodeName && event.toElement.nodeName === "svg") {
            tooltip.style("opacity", 0);
            svg.selectAll(".hover-line").style("opacity", 0);
            svg
              .selectAll("circle")
              .attr("r", 2)
              .style("opacity", function () {
                return d3.select(this).attr("is-initial-show") === "y" ? 1 : 0;
              });
          }
        });
      rectOverRef.value = rectOver;
      rectOverRef.value.on("mousemove", function (event: any) {
        calPosition(event, xStringRef.value, dataSourceY.value, xScale);
      });
    };
    const tickNumber = (number: number, arr: string[]) => {
      const result: { tick: string[]; index: number[] } = {
        tick: [],
        index: [],
      };
      if (number >= arr.length) {
        result.tick = arr;
      } else {
        for (let i = 1; i <= number; i++) {
          const numberIndex = Math.floor(i * (arr.length / number)) - 1;
          result.tick.push(arr[numberIndex]);
          result.index.push(numberIndex);
        }
      }
      return result;
    };
    const maxFormat = (number: number) => {
      let result = 0;
      if (number <= 1) {
        result = Math.ceil(number * 10) / 10;
      }
      return result;
    };
    const updateChart = () => {
      circleState.circlesArr = [];
      const { option } = props;
      const dataList = option.data;
      const svg = d3.select(".my-chart");
      const percentStart =
        sliderState.startX === 0
          ? 0
          : sliderState.startX / sliderState.sliderWidth;
      const percentEnd = sliderState.endX / sliderState.sliderWidth;
      const startIndex =
        percentStart === 0
          ? 1
          : Math.ceil(percentStart * (dataList.x.length - 1));
      const endIndex = Math.ceil(percentEnd * (dataList.x.length - 1));
      const newDataX = dataList.x.slice(startIndex - 1, endIndex);
      const newDataXString = newDataX.map((item) => item.toString());
      const newDataY: number[][] = [];
      const newTick = tickNumber(10, newDataXString);
      const xScale = d3
        .scalePoint()
        .domain(newDataXString)
        .range([
          0,
          sliderState.svgWidth - sliderState.padding - sliderState.paddingRight,
        ]);
      const xAxis = d3.axisBottom(xScale).tickValues(newTick.tick);
      svg.selectAll(".x-axis g").remove();
      const xTicks: any = (svg.select(".x-axis") as any).call(xAxis);

      dataList.y.forEach((item) => {
        newDataY.push(item.data.slice(startIndex - 1, endIndex));
      });
      svg.selectAll(".overlay-rect").remove();

      dataList.y.forEach((item, index) => {
        const lines = d3
          .line<string>()
          .x(function (d: string, i) {
            return (xScale(d) || 0) + sliderState.padding;
          })
          .y(function (d, i) {
            return yScaleRef.value(newDataY[index][i]) + sliderState.padding;
          });

        svg
          .select(`.my-line-path-series-${index}`)
          .datum(newDataXString)
          .attr("d", lines)
          .attr("stroke-width", 2)
          .attr("stroke", item.color)
          .attr("fill", "none");
        if (option.type === "area") {
          const area = d3
            .area<number>()
            .x(function (d, i) {
              return (xScale(newDataXString[i]) || 0) + sliderState.padding;
            })
            .y0(function (d, i) {
              return 420 - sliderState.padding;
            })
            .y1(function (d, i) {
              return yScaleRef.value(d) + sliderState.padding;
            });

          svg
            .select(".my-area-path")
            .datum(newDataY[index])
            .attr("d", area)
            .attr("fill", item.color)
            .style("opacity", 0.6);
        } else {
          if (newDataX.length > 0 && newDataY[index].length > 0) {
            const circles = svg
              .selectAll(`.my-circle-series${index}`)
              .attr("is-initial-show", "")
              .style("opacity", 0)
              .data(newDataXString)
              .style("opacity", function (d, i) {
                let opacity = 0;
                if (newTick.index && newTick.index.length > 0) {
                  const circle = d3.select(this);
                  newTick.index.forEach((it) => {
                    if (it === i && xScale(d)) {
                      circle.attr("is-initial-show", "y");
                      opacity = 1;
                    }
                  });
                }
                return opacity;
              })
              .attr("cx", function (d: string) {
                const cx = (xScale(d) || 0) + sliderState.padding;
                return cx;
              })
              .attr("cy", function (d: string, i: number) {
                // xScale(d) 会出现undefined
                const cy = xScale(d)
                  ? yScaleRef.value(newDataY[index][i]) + sliderState.padding
                  : 0;
                return cy;
              })
              .attr("r", 2)
              .style("fill", "white")
              .attr("stroke", item.color);
            circleState.circlesArr.push(circles.nodes());
          }
        }
      });

      rectOverRef.value.on("mousemove", null);
      rectOverRef.value.on("mousemove", function (event: any) {
        calPosition(event, newDataXString, newDataY, xScale);
      });
      xTicks
        .selectAll(".tick text")
        .attr("transform", "rotate(-45, 0 32) translate(0, 8)")
        .text(function (d: string) {
          return Number(d).toFixed(5);
        });
    };
    const calPosition = (
      event: any,
      newDataX: string[],
      newDataY: number[][],
      xScale: any
    ) => {
      const { option } = props;
      const dataList = option.data;
      const index = Math.floor(
        (event.layerX - sliderState.padding + xScale.step() / 2) / xScale.step()
      );

      const svg = d3.select(".my-chart");
      svg
        .selectAll("circle")
        .attr("r", 2)
        .style("opacity", function () {
          return d3.select(this).attr("is-initial-show") === "y" ? 1 : 0;
        });
      let tooltipHtml = "";
      const hoverLine = svg.selectAll(".hover-line").empty()
        ? svg
            .append("line")
            .attr("class", "hover-line")
            .attr("x1", xScale(newDataX[index]) + sliderState.padding)
            .attr("x2", xScale(newDataX[index]) + sliderState.padding)
            .attr("y1", 420 - sliderState.padding)
            .attr("y2", sliderState.padding)
            .style("opacity", 1)
        : svg
            .select(".hover-line")
            .attr("x1", xScale(newDataX[index]) + sliderState.padding)
            .attr("x2", xScale(newDataX[index]) + sliderState.padding)
            .attr("y1", 420 - sliderState.padding)
            .attr("y2", sliderState.padding);

      if (option.type === "area") {
        newDataY.forEach((item, itemIndex) => {
          tooltipHtml = `${tooltipHtml}
              <span>${dataList.y[itemIndex].name}: ${newDataY[itemIndex][index]}</span><br/>`;
        });
        tooltipHtml = `${tooltipHtml}
              <span>${option.xName}: ${newDataX[index]}</span>`;
        tooltipRef.value.html(tooltipHtml);
      } else {
        circleState.circlesArr.forEach((item, itemIndex) => {
          d3.select(item[index]).style("opacity", 1);
          d3.select(item[index])
            .attr("r", 8)
            .transition()
            .duration(100)
            .ease(d3.easePolyOut)
            .attr("r", 6)
            .transition()
            .duration(100)
            .ease(d3.easeLinear);
          tooltipHtml = `${tooltipHtml}
              <span>${dataList.y[itemIndex].name}: ${newDataY[itemIndex][index]}</span><br/>`;
        });
        tooltipHtml = `${tooltipHtml}
              <span>${option.xName}: ${newDataX[index]}</span>`;
        tooltipRef.value.html(tooltipHtml);
      }
      const x =
        sliderState.svgWidth - event.layerX - sliderState.tooltipPad < 240
          ? event.layerX - sliderState.tooltipPad - 240
          : event.layerX + sliderState.tooltipPad; // tooltip 宽度 240
      // const x = this.svgWidth - event.layerX - sliderState.padding - this.tooltipPad < 240 ? event.layerX - sliderState.padding - this.tooltipPad - 240 : event.layerX - sliderState.padding + this.tooltipPad // tooltip 宽度 240
      tooltipRef.value
        .style("left", `${x}px`)
        .style("top", `${event.layerY}px`);
    };
    return () => {
      return (
        <div class="chart-wrapper">
          <div class="chart-main">
            <svg class="my-chart"></svg>
          </div>
          <div class="pl20 pr20" style={{ paddingRight: 60 }}>
            <svg class="my-slider"></svg>
          </div>
        </div>
      );
    };
  },
});
