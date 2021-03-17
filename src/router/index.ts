import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: () =>
      import(/* webpackChunkName: 'about' */ "../views/FormPage"),
  },
  {
    path: "/vue3/formPage",
    name: "FormPage",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: 'about' */ "../views/FormPage"),
  },
  {
    path: "/vue3/barChart",
    name: "BarChart",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import("../views/BarChart/BarChart"),
  },
  {
    path: "/vue3/bubbleChart",
    name: "BubbleChart",
    component: () => import("../views/BubbleChart/BubbleChart"),
  },
  {
    path: "/vue3/pieChart",
    name: "PieChart",
    component: () => import("../views/PieChart/PieChart"),
  },
  {
    path: "/vue3/radiuBar",
    name: "RadiuBar",
    component: () => import("../views/RadiuBar/RadiuBar"),
  },
  {
    path: "/vue3/rotateChart",
    name: "RotateChart",
    component: () => import("../views/RotateChart/RotateChart"),
  },
  {
    path: "/vue3/slider",
    name: "SliderChart",
    component: () => import("../views/SliderChart/Slider"),
  },
  // {
  //   path: "/vue3/mapChart",
  //   name: "MapChart",
  //   component: () => import("../views/MapChart/MapChart"),
  // },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
