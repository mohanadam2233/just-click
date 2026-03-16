"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { useDropdown } from "@/hooks/dropdown/useDropdown";
import {
  coursesColumns,
  coursesTableData,
  departmentsData,
} from "@/lib/mockAcademicData";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const CoursesMain = () => {
  const router = useRouter();

  const deptDD = useDropdown({
    cacheKey: "courses-departments-filter",
    enabled: true,
    limit: 10,
    mockOptions: departmentsData.map((d) => ({
      label: d.name,
      value: d.name,
      meta: { code: d.code },
    })),
  });

  const enrichedColumns = useMemo(() => {
    return coursesColumns.map((col) => {
      if (col.key === "department_name") {
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
      columns={enrichedColumns}
      data={coursesTableData}
      addNewLabel="Add Course"
      onAddNew={() =>
        router.push("/admin/dashboards/admin-academic/courses/create")
      }
      onRowClick={(row) =>
        router.push(`/admin/dashboards/admin-academic/courses/${row.id}`)
      }
    />
  );
};

export default CoursesMain;
