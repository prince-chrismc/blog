// import React from 'react';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import { Line } from 'react-chartjs-2';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );


import BrowserOnly from '@docusaurus/BrowserOnly';

export default LineChart = () => {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => {
const root = document.documentElement;
const get = (elt, key) => getComputedStyle(elt).getPropertyValue(key);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: get(root, '--ifm-font-color-base'),
      },
    },
    title: {
      display: true,
      color: get(root, '--ifm-font-color-base'),
      text: 'Chart.js Line Chart',
    },
    subtitle: {
      display: true,
      text: 'Custom Chart Subtitle',
      color: get(root, '--ifm-font-color-base'),
    },
  },
    scales: {
      x: {
        color: get(root, '--ifm-font-color-base'),
        //backgroundColor: get(root, '--ifm-font-color-base'),
        border: {
          color: get(root, '--ifm-font-color-base'),
          //backgroundColor: get(root, '--ifm-font-color-base'),
        },
        grid: {
          color: get(root, '--ifm-table-border-color'),
        },
        ticks: {
          color: get(root, '--ifm-font-color-base'),
        },
    },
      y: {
        color: get(root, '--ifm-font-color-base'),
        //backgroundColor: get(root, '--ifm-font-color-base'),
        suggestedMin: 15,
        suggestedMax: 50,
        border: {
          color: get(root, '--ifm-font-color-base'),
          //backgroundColor: get(root, '--ifm-font-color-base'),
        },
        grid: {
          color: get(root, '--ifm-table-border-color'),
        },
        ticks: {
          color: get(root, '--ifm-font-color-base'),
        },
    }
  },
};

const labels = ['2021', '2022', '2023', '2024'];

const data = {
  labels,
  datasets: [
    {
      label: 'Major Pain',
      data: [48, 47, 47, 45],
      borderColor: get(root, '--color-secondary-500'),
      backgroundColor: get(root, '--color-secondary-700'),
      hoverBackgroundColor: get(root, '--color-secondary-300'),
    },
    {
      label: 'Minor Pain',
      data: [35, 34, 35, 36],
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
  tension: 0.5,
};
       const Line = require('react-chartjs-2').Line;
       return <Line options={options} data={data} />;
      }}
    </BrowserOnly>
  );
};