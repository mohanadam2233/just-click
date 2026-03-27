"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import useNotify from "@/hooks/useNotify";
import {
  studentOnboardingColumns,
  studentOnboardingTableData,
} from "@/lib/mockAcademicData";
import { useRouter } from "next/navigation";

const StudentOnboardingMain = () => {
  const router = useRouter();
  const notify = useNotify();

  const handleBulkDelete = (rows) => {
    notify.success(`${rows.length} student record(s) deleted`);
  };

  const handleBulkApprove = (rows) => {
    notify.success(`${rows.length} student(s) approved`);
  };

  const handleBulkResendApproval = (rows) => {
    notify.success(`Approval email resent for ${rows.length} student(s)`);
  };

  return (
    <AcademicTable
      title="Student Onboarding Queue"
      columns={studentOnboardingColumns}
      data={studentOnboardingTableData}
      addNewLabel={null}
      onAddNew={null}
      actions={[
        {
          label: "Delete",
          onClick: handleBulkDelete,
        },
        {
          label: "Approve Student",
          onClick: handleBulkApprove,
        },
        {
          label: "Resend Approval Email",
          onClick: handleBulkResendApproval,
        },
      ]}
      onRowClick={(row) =>
        router.push(`/admin/dashboards/admin-students/onboarding/${row.id}`)
      }
    />
  );
};

export default StudentOnboardingMain;
