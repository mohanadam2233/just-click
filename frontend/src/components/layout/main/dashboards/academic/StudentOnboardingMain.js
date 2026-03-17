"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import {
  studentOnboardingColumns,
  studentOnboardingTableData,
} from "@/lib/mockAcademicData";
import { useRouter } from "next/navigation";

const StudentOnboardingMain = () => {
  const router = useRouter();

  return (
    <AcademicTable
      title="Student Onboarding Queue"
      columns={studentOnboardingColumns}
      data={studentOnboardingTableData}
      addNewLabel={null}
      onAddNew={null}
      onRowClick={(row) =>
        router.push(`/admin/dashboards/admin-students/onboarding/${row.id}`)
      }
    />
  );
};

export default StudentOnboardingMain;
