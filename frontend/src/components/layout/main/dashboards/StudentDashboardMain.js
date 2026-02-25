import AdminFeedbacks from "@/components/sections/sub-section/dashboards/AdminFeedbacks";
import CounterStudent from "@/components/sections/sub-section/dashboards/CounterStudent";
import React from "react";

const StudentDashboardMain = () => {
  return (
    <>
      <CounterStudent />
      <AdminFeedbacks />
    </>
  );
};

export default StudentDashboardMain;
