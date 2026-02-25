"use client";

import Chart from "chart.js/auto";
import { useEffect, useRef } from "react";

const LineChartDashboard = () => {
  const lineChartRef = useRef(null);
  useEffect(() => {
    const ctx = lineChartRef?.current;
    if (ctx) {
      const myChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: [
            "Jan",
            "Feb",
            "Marc",
            "April",
            "May",
            "Jun",
            "July",
            "Agust",
            "Sept",
            "Oct",
            "Now",
            "Dec",
          ],
          datasets: [
            {
              label: "#",
              data: [
                148, 100, 205, 110, 165, 145, 180, 156, 148, 220, 180, 245,
              ],
              tension: 0.4,
              backgroundColor: "#5F2DED",
              borderColor: "#5F2DED",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              min: 0,
              max: 300,
              ticks: {
                stepSize: 50,
              },
            },
          },
        },
      });
    }
  }, []);
  return (
    <div className="w-full md:w-65%">
      <div className="md:px-5 py-10px md:py-0">
        <div className="mb-6 pb-5 border-b-2 border-borderColor dark:border-borderColor-dark flex justify-between items-center gap-2">
          <h2 className="text-2xl font-bold text-blackColor dark:text-blackColor-dark">
            Dashboard
          </h2>
          <div className="bg-whiteColor rounded-md relative">
            <select className="bg-transparent text-darkBlue w-42.5 px-3 py-6px focus:outline-none block appearance-none leading-1.5 relative z-20 focus:shadow-select border border-borderColor6 rounded-md">
              <option defaultValue="HTML">HTML</option>
              <option defaultValue="CSS">CSS</option>
              <option defaultValue="Javascript">Javascript</option>
              <option defaultValue="PHP">PHP</option>
              <option defaultValue="WordPress">WordPress</option>
            </select>
            <i className="icofont-simple-down absolute top-1/2 right-3 -translate-y-1/2 block text-lg z-10"></i>
          </div>
        </div>
        <canvas id="lineChart" ref={lineChartRef}></canvas>
      </div>
    </div>
  );
};

export default LineChartDashboard;
