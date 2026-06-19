"use client";

import Preloader from "@/components/shared/others/Preloader";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import {
  useBulkApproveStudents,
  useBulkResendStudentApprovalEmails,
  useOnboardingList,
} from "@/features/people/hooks";
import { useRouter } from "next/navigation";
import useNotify from "@/hooks/useNotify";

const onboardingColumns = [
  { key: "full_name", label: "Full Name", width: "flex-1", bold: true },
  { key: "email", label: "Email", width: "flex-1" },
  { key: "student_id", label: "Student ID", width: "w-32" },
];

const OnboardingMain = () => {
  const router = useRouter();
  const notify = useNotify();

  const { data, isLoading, isError, refetch, isFetching } = useOnboardingList({ limit: 20, page: 1 });
  const bulkApproveMutation = useBulkApproveStudents();
  const bulkResendApprovalMutation = useBulkResendStudentApprovalEmails();

  if (isLoading) {
    return <Preloader />;
  }

  if (isError) {
    return <div className="p-10 text-center text-red-500">Failed to load onboarding queue.</div>;
  }

  const handleBulkApprove = (selectedIds) => {
    const userIds = selectedIds.filter(Boolean);

    if (userIds.length > 0) {
      if (confirm(`Are you sure you want to approve ${userIds.length} student(s)?`)) {
        bulkApproveMutation.mutate({ userIds }, {
          onSuccess: () => notify.success("Student(s) approved successfully"),
          onError: (err) => notify.error(err?.message || "Failed to approve student(s)")
        });
      }
    }
  };

  const handleBulkResendApprovalEmail = (selectedIds) => {
    const userIds = selectedIds.filter(Boolean);

    if (userIds.length > 0 && confirm(`Are you sure you want to resend approval emails for ${userIds.length} student(s)?`)) {
      bulkResendApprovalMutation.mutate(
        { userIds, sendNow: true },
        {
          onSuccess: () => notify.success("Approval emails resent successfully"),
          onError: (err) => notify.error(err?.message || "Failed to resend approval emails"),
        },
      );
    }
  };

  const actions = [
    { label: "Approve Students", action: "approve", onClick: handleBulkApprove },
    { label: "Resend Approval Email", action: "resend", onClick: handleBulkResendApprovalEmail },
  ];

  const rawData = data?.data?.data || data?.data || [];
  const tableData = rawData.map(item => ({
    ...item,
    id: item.user_id,
    full_name: item.full_name || "—",
    email: item.email || "—",
    student_id: item.student_id || "—",
  }));

  return (
    <AcademicTable
      title="Onboarding Queue"
      columns={onboardingColumns}
      data={tableData}
      addNewLabel={null}
      onAddNew={null}
      onRowClick={(row) => router.push(`/admin/dashboards/admin-people/onboarding/${row.user_id}`)}
      actions={actions}
      onRefresh={refetch}
      isRefreshing={isFetching}
    />
  );
};

export default OnboardingMain;
