"use client";

import Preloader from "@/components/shared/others/Preloader";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { useOnboardingList, useApproveStudent, useBulkApproveStudents, useResendOutbox } from "@/features/people/hooks";
import { useRouter } from "next/navigation";
import useNotify from "@/hooks/useNotify";

const onboardingColumns = [
  { key: "full_name", label: "Full Name", width: "flex-1", bold: true },
  { key: "user_type", label: "User Type", width: "w-32" },
  { key: "email", label: "Email", width: "flex-1" },
  { key: "status", label: "Status", width: "w-44" },
];

const OnboardingMain = () => {
  const router = useRouter();
  const notify = useNotify();

  const { data, isLoading, isError } = useOnboardingList({ limit: 20 });
  const bulkApproveMutation = useBulkApproveStudents();
  const resendMutation = useResendOutbox();

  if (isLoading) {
    return <Preloader />;
  }

  if (isError) {
    return <div className="p-10 text-center text-red-500">Failed to load onboarding queue.</div>;
  }

  const handleBulkApprove = (selectedIds) => {
    // For bulk approve, we need user.id instead of outbox.id
    // But selectedIds comes from table rows which have row.id = outbox.id
    // We can map them from the rawData here
    const rawData = data?.data?.data || data?.data || [];
    const selectedRows = rawData.filter(r => selectedIds.includes(r.id));
    const userIds = selectedRows.map(r => r.user?.id).filter(Boolean);

    if (userIds.length > 0) {
      if (confirm(`Are you sure you want to approve ${userIds.length} users?`)) {
        bulkApproveMutation.mutate(userIds, {
          onSuccess: () => notify.success("Users approved successfully"),
          onError: (err) => notify.error(err?.message || "Failed to approve users")
        });
      }
    }
  };

  const handleBulkResendEmail = (selectedIds) => {
    // Outbox resend expects outbox_id
    if (confirm(`Are you sure you want to resend emails for ${selectedIds.length} users?`)) {
        let count = 0;
        selectedIds.forEach((id) => {
            resendMutation.mutate(id, {
                onSuccess: () => {
                    count++;
                    if (count === selectedIds.length) {
                        notify.success("Emails resent successfully");
                    }
                },
                onError: (err) => {
                    notify.error(err?.message || "Failed to resend an email");
                }
            });
        });
    }
  };

  const actions = [
    { label: "Approve Students", action: "approve", onClick: handleBulkApprove },
    { label: "Resend Email", action: "resend", onClick: handleBulkResendEmail },
  ];

  const rawData = data?.data?.data || data?.data || [];
  const tableData = rawData.map(item => ({
    ...item,
    full_name: item.profile_preview?.full_name || "—",
    user_type: item.user?.user_type || "—",
    email: item.user?.email || "—",
    status: item.progress?.email_verified ? (item.progress?.awaiting_admin ? "Awaiting admin" : "Verified") : "Pending email",
  }));

  return (
    <AcademicTable
      title="Onboarding Queue"
      columns={onboardingColumns}
      data={tableData}
      addNewLabel={null}
      onAddNew={null}
      onRowClick={(row) => router.push(`/admin/dashboards/admin-people/onboarding/${row.id}`)}
      actions={actions}
    />
  );
};

export default OnboardingMain;
