import { defineComponent, PropType, onMounted } from "vue";
import * as d3 from "d3";

type YItem = {
  data: number[];
  color: string;
  name?: string;
};

interface ChartDataItem {
  name: string;
  data: { x: number[]; y: YItem[] };
  type: string;
  key: string;
  xName: string;
  ySeriesName?: string;
  xSeriesName: string;
}

export default defineComponent({
  name: "ChartSmall",
  props: {
    index: {
      type: Number,
    },
    click: {
      type: Function,
      required: true,
    },
    chartData: {
      type: Object as PropType<ChartDataItem>,
      required: true,
    },
  },

  setup(props) {
    onMounted(() => {
      initSmallChart();
    });
    const initSmallChart = () => {
      const { chartData, index } = props;
      const svg = d3.select(`.chart-small-${index}`);
      const svgWidth = (document.querySelector(
        `.chart-small-${index}`
      ) as HTMLElement).getBoundingClientRect().width;
      const svgHeight = (document.querySelector(
        `.chart-small-${index}`
      ) as HTMLElement).getBoundingClientRect().height;
      const xString = chartData.data.x.map((item) => item.toString());
      const xScale = d3.scalePoint().domain(xString).range([0, svgWidth]);
      chartData.data.y.forEach((item, dataIndex) => {
        const yScale = d3
          .scaleLinear()
          .domain([0, d3.max(item.data) || 0])
          .range([svgHeight, 0]);
        const lines = d3
          .line<string>()
          .x(function (d: string, i) {
            return xScale(d) || 0;
          })
          .y(function (d: string, i: number) {
            return yScale(item.data[i]);
          });
        svg
          .append("g")
          .append("path")
          .datum(xString)
          .attr("d", lines)
          .attr("stroke-width", 1.5)
          .attr("stroke", item.color)
          .attr("fill", "none")
          .attr("class", `my-line-series-${index}-${dataIndex}`);

        if (chartData.type === "area") {
          const area = d3
            .area<string>()
            .x(function (d: string) {
              return xScale(d) || 0;
            })
            .y0(function () {
              return svgHeight;
            })
            .y1(function (d, i) {
              return yScale(item.data[i]);
            });
          svg
            .append("g")
            .append("path")
            .datum(xString)
            .attr("d", area)
            .style("fill", item.color)
            .attr("class", "my-area")
            .attr("opacity", 0.6);
        }
      });
    };
    return () => {
      return (
        <div
          class="chart-small-wrapper pt12 pb6 hand"
          onClick={() => props.click(props.index)}
        >
          <svg class={`chart-small-${props.index}`}></svg>
        </div>
      );
    };
  },
});
