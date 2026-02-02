"use client";

import Chart from "chart.js/auto";
import { useEffect, useRef } from "react";

const PieChartDashboard = () => {
  const pieChartRef = useRef(null);

  useEffect(() => {
    const ctx = pieChartRef?.current;
    if (ctx) {
      const myChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Direct", "Referal", "Organic"],
          datasets: [
            {
              label: "#",
              data: [40, 28, 32],
            },
          ],
        },
        options: {
          cutout: "75%",
          plugins: {
            legend: {
              position: "left",
            },
          },
          elements: {
            arc: {
              backgroundColor: "#5F2DED",
              hoverBackgroundColor: "#5F2DED",
            },
          },
        },
      });
    }
  }, []);
  return (
    <div className="w-full md:w-35%">
      <div className="md:px-5 py-10px md:py-0">
        <div className="mb-6 pb-5 border-b-2 border-borderColor dark:border-borderColor-dark flex justify-between items-center gap-2">
          <h2 className="text-2xl font-bold text-blackColor dark:text-blackColor-dark">
            Traffic
          </h2>
          <div className="bg-whiteColor rounded-md relative">
            <select className="bg-transparent text-darkBlue w-42.5 px-3 py-6px focus:outline-none block appearance-none leading-1.5 relative z-20 focus:shadow-select border border-borderColor6 rounded-md">
              <option defaultValue="Today">Today</option>
              <option defaultValue="Weekly">Weekly</option>
              <option defaultValue="Monthly">Monthly</option>
              <option defaultValue="Yearly">Yearly</option>
            </select>
            <i className="icofont-simple-down absolute top-1/2 right-3 -translate-y-1/2 block text-lg z-10"></i>
          </div>
        </div>
        <canvas id="pieChart" ref={pieChartRef}></canvas>
      </div>
    </div>
  );
};

export default PieChartDashboard;
