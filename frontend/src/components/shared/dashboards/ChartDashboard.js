import React from "react";
import PieChartDashboard from "./PieChartDashboard";
import LineChartDashboard from "./LineChartDashboard";

const ChartDashboard = () => {
  return (
    <div className="py-10 px-5 mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
      <div className="flex flex-wrap">
        {/* linechart */}
        <LineChartDashboard />
        {/* piechart */}
        <PieChartDashboard />
      </div>
    </div>
  );
};

export default ChartDashboard;
