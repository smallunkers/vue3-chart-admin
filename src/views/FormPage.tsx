import { defineComponent, reactive, onMounted, ref, Ref } from "vue";
import BaseSearchForm from "@/components/BaseSearchForm";
import {
  Table as ATable,
  message as AMessage,
  Button as AButton,
} from "ant-design-vue";
import data from "../data/tableList";
import { ColumnProps } from "ant-design-vue/es/table/interface";
import moment from "moment";

type Key = ColumnProps["key"];
type BtnKey = "search" | "add" | "reset" | "export";
type BtnType = "default" | "link" | "dashed" | "primary" | "ghost" | "danger";

type Pagination = {
  current: number;
  pageSize: number;
  total: number;
  showTotal: (total: number) => string;
};

interface ApiTableListItem {
  id: number;
  bizLine?: string | number;
  userId?: number;
  employeeName?: string;
  imNickName?: string;
  imRemarks?: string;
  issueType?: number;
  imSatisfaction?: string;
  created?: number;
  currHandler?: string;
  endTime?: number;
  result?: number;
  content: string;
  status: number;
  wtEndTime: number;
  wtCurrHandler: string;
  wtTitle?: number;
}

interface TableListItem extends ApiTableListItem {
  key?: number;
  createdDesc?: string;
  wtEndTimeDesc?: string;
  endTimeDesc?: string;
}

export default defineComponent({
  name: "FormPage",
  components: {
    BaseSearchForm,
  },
  setup() {
    const columns = [
      {
        dataIndex: "id",
        title: "质检单号",
        key: "id",
        width: 75,
      },
      {
        dataIndex: "status",
        title: "质检状态",
        key: "status",
        slots: { customRender: "status" },
        width: 75,
      },
      {
        dataIndex: "wtTitle",
        title: "工单id",
        key: "wtTitle",
        width: 70,
      },
      {
        dataIndex: "wtEndTimeDesc",
        title: "工单完结时间",
        key: "wtEndTimeDesc",
        width: 150,
      },
      {
        dataIndex: "issueType",
        title: "工单类型",
        key: "issueType",
        slots: { customRender: "issueType" },
        width: 80,
      },
      {
        dataIndex: "wtTitle",
        title: "线索id",
        key: "wtTitle",
        slots: { customRender: "wtTitle" },
        width: 80,
      },
      {
        dataIndex: "employeeName",
        title: "工单创建人",
        key: "employeeName",
        width: 90,
      },
      {
        dataIndex: "content",
        title: "工单内容",
        key: "content",
        width: 150,
      },
      {
        dataIndex: "wtCurrHandler",
        title: "当前处理人",
        key: "wtCurrHandler",
        width: 90,
      },
      {
        dataIndex: "currHandler",
        title: "质检处理人",
        key: "currHandler",
        width: 90,
      },
      {
        dataIndex: "endTimeDesc",
        title: "质检完成时间",
        key: "endTimeDesc",
        width: 150,
      },
      {
        dataIndex: "result",
        title: "质检结果",
        key: "result",
        slots: { customRender: "result" },
        width: 100,
      },
      {
        title: "操作",
        key: "action",
        slots: { customRender: "action" },
        fixed: "right",
        width: 160,
      },
    ];
    let dataList: TableListItem[] = reactive([]);
    const loading: Ref<boolean> = ref(false);
    const setTimerToGetData = (
      params: Record<string, any>
    ): Promise<{ total: number; dataList: ApiTableListItem[] }> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const dataList = data.dataList.slice(
            (params.current - 1) * 10,
            params.current * 10
          );
          resolve({
            total: data.total,
            dataList,
          });
        }, 500);
      });
    };
    const getDataList = async (params?: Record<string, any>) => {
      try {
        loading.value = true;
        const { dataList: tableList, total } = await setTimerToGetData(
          params
            ? Object.assign({}, params, {
                current: paginationState.current,
                pageSize: paginationState.pageSize,
              })
            : {
                current: paginationState.current,
                pageSize: paginationState.pageSize,
              }
        );
        paginationState.total = total;
        dataList = tableList.map((item) => {
          return {
            ...item,
            key: item.id,
            imNickName: item.imNickName || "-",
            imRemarks: item.imRemarks || "-",
            currHandler: item.currHandler || "-",
            wtEndTimeDesc: item.wtEndTime
              ? moment(item.wtEndTime * 1000).format("YYYY-MM-DD HH:mm:ss")
              : "-",
            endTimeDesc: item.endTime
              ? moment(item.endTime * 1000).format("YYYY-MM-DD HH:mm:ss")
              : "-",
          };
        });
      } catch (err) {
        AMessage.error(err.message);
      } finally {
        loading.value = false;
      }
    };
    const resetSearch = (params: Record<string, unknown>) => {
      console.log(params);
    };
    const exportTable = (params: Record<string, unknown>) => {
      console.log(params);
    };
    const selectedRowKeysState = reactive<{ selectedRowKeys: Key[] }>({
      selectedRowKeys: [],
    });
    let dataMap: Record<string, any> = reactive({});
    const paginationState = reactive({
      pageSize: 10,
      current: 1,
      total: 0,
      showTotal: (total: number): string => `共${total}条数据`,
    });
    const searchForm = reactive({
      list: [
        {
          compName: "BaseInput",
          label: "质检单号",
          prop: "qualityId",
          width: 180,
        },
        { compName: "BaseInput", label: "申诉id", prop: "id", width: 180 },
        {
          compName: "BaseSelect",
          label: "质检类型",
          extra: {},
          prop: "qualityType",
          width: 180,
          placeholder: "请选择质检类型",
          allowClear: true,
          defaultValue: "",
        },
        {
          compName: "BaseSelect",
          label: "业务线",
          extra: {},
          prop: "imBizLineList",
          width: 220,
          placeholder: "请选择业务线",
          allowClear: true,
          compProps: { mode: "multiple" },
          defaultValue: [],
        },
        {
          compName: "BaseTimeRange",
          label: "申诉处理时间",
          prop: "appealHandlerStartTime,appealHandlerEndTime",
          placeholder: ["开始时间", "结束时间"],
        },
        {
          compName: "BaseTreeSelect",
          label: "申诉原因",
          prop: "appealId",
          extra: [],
          width: 220,
          placeholder: "请选择申诉原因",
          allowClear: true,
        },
        {
          compName: "BaseSelect",
          label: "申诉状态",
          prop: "appealStatus",
          extra: {},
          width: 180,
          placeholder: "请选择申诉状态",
          allowClear: true,
        },
        {
          compName: "BaseTimeRange",
          label: "质检时间",
          prop: "qualityHandleStartTime,qualityHandleEndTime",
          placeholder: ["开始时间", "结束时间"],
        },
        {
          compName: "BaseInput",
          label: "申诉处理人",
          prop: "appealer",
        },
        {
          compName: "BaseInput",
          label: "质检人",
          prop: "qualityHandler",
        },
        {
          compName: "BaseTimeRange",
          label: "申诉发起时间",
          prop: "appealStartTime,appealEndTime",
          placeholder: ["开始时间", "结束时间"],
        },
        {
          compName: "handles",
          prop: "",
          handles: [
            {
              btn: "search" as BtnKey,
              text: "搜索",
              type: "primary" as BtnType,
              click: getDataList,
            },
            {
              btn: "reset" as BtnKey,
              text: "重置",
              type: "default" as BtnType,
              click: resetSearch,
            },
            {
              btn: "export" as BtnKey,
              text: "导出",
              type: "default" as BtnType,
              click: exportTable,
            },
          ],
        },
      ],
    });
    onMounted(() => {
      setExtra();
      getDataList();
    });
    const rowSelectionChange = (keys: Key[]) => {
      selectedRowKeysState.selectedRowKeys = keys;
    };
    const tableChange = (pagination: Pagination) => {
      paginationState.current = pagination.current;
      if (pagination.pageSize !== paginationState.pageSize) {
        paginationState.pageSize = pagination.pageSize;
        paginationState.current = 1;
      }
      getDataList();
    };
    const setExtra = () => {
      searchForm.list.forEach((item) => {
        if (item.compName === "BaseSelect") {
          item.extra = { 0: "参数1", 1: "参数2", 2: "参数3", 4: "参数4" };
          dataMap = { 0: "参数1", 1: "参数2", 2: "参数3", 4: "参数4" };
        } else if (item.compName === "BaseTreeSelect") {
          item.extra = [
            {
              label: "参数1",
              value: 1000,
              children: [
                {
                  label: "参数1-1",
                  value: 1001,
                },
                {
                  label: "参数1-2",
                  value: 1002,
                },
              ],
            },
          ];
        }
      });
    };
    const renderSlots = {
      status: ({ text }: any) => <span>{dataMap[text]}</span>,
      issueType: ({ text }: any) => <span>{dataMap[text]}</span>,
      result: ({ text }: any) => <span>{dataMap[text]}</span>,
      action: ({ record }: any) => (
        <AButton type="primary" size="small">
          操作1
        </AButton>
      ),
    };
    return () => {
      return (
        <div class="page__formPage m12 p12 bg-w">
          <BaseSearchForm searchMap={searchForm}></BaseSearchForm>
          <ATable
            bordered
            rowSelection={{
              onChange: rowSelectionChange,
              selectedRowKeys: selectedRowKeysState.selectedRowKeys,
            }}
            rowKey="id"
            scroll={{ x: 1600 }}
            loading={loading.value}
            dataSource={dataList}
            pagination={paginationState}
            onChange={tableChange}
            size="small"
            columns={columns}
            class="mt24"
            v-slots={renderSlots}
          ></ATable>
        </div>
      );
    };
  },
});
