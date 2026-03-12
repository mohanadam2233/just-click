"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { departmentsData, departmentsColumns } from "@/lib/mockAcademicData";

const DepartmentsMain = () => {
  return (
    <AcademicTable
      title="Departments"
      subtitle="Manage all university departments"
      columns={departmentsColumns}
      data={departmentsData}
      addNewLabel="Add Department"
      onAddNew={() => alert("Add Department clicked")}
    />
  );
};

export default DepartmentsMain;
