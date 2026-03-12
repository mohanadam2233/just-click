"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { coursesData, coursesColumns, departmentsData } from "@/lib/mockAcademicData";
import { useDropdown } from "@/hooks/dropdown/useDropdown";
import { useMemo } from "react";

const CoursesMain = () => {
  // Setup dropdown for the "Department" column filter
  const deptDD = useDropdown({
    cacheKey: "departments-filter",
    enabled: true,
    limit: 10,
    mockOptions: departmentsData.map(d => ({
      label: d.name,
      value: d.name, // using name as value since the table filter runs against row[col.key] (which is the department name string here)
      meta: { code: d.id },
    }))
  });

  // Inject the filterDropdown prop into the specific column
  const enrichedColumns = useMemo(() => {
    return coursesColumns.map(col => {
      if (col.key === "department") {
        return {
          ...col,
          filterDropdown: deptDD,
        };
      }
      return col;
    });
  }, [deptDD]);

  return (
    <AcademicTable
      title="Courses"
      subtitle="Manage all courses across departments"
      columns={enrichedColumns}
      data={coursesData}
      addNewLabel="Add Course"
      onAddNew={() => alert("Add Course clicked")}
    />
  );
};

export default CoursesMain;
