"use client";

import Preloader from "@/components/shared/others/Preloader";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import {
  useApproveStudent,
  useOnboardingDetail,
  useResendStudentApprovalEmail,
} from "@/features/people/hooks";
import useNotify from "@/hooks/useNotify";
import { useMemo } from "react";

const OnboardingDetailMain = ({ id }) => {
  const notify = useNotify();
  const { data: response, isLoading, isError } = useOnboardingDetail(id);
  const approveMutation = useApproveStudent();
  const resendApprovalMutation = useResendStudentApprovalEmail();
  
  const onboardingData = useMemo(() => {
    return response?.data?.data ?? response?.data ?? null;
  }, [response]);

  const formFields = useMemo(() => [
    {
      name: "full_name",
      label: "Full Name",
      type: "text",
      layout: "half",
      readOnly: true,
    },
    {
      name: "student_id",
      label: "Student ID",
      type: "text",
      layout: "half",
      readOnly: true,
    },
    {
      name: "username",
      label: "Username",
      type: "text",
      layout: "half",
      readOnly: true,
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      layout: "half",
      readOnly: true,
    },
    {
      name: "department",
      label: "Department",
      type: "text",
      layout: "half",
      readOnly: true,
    },
    {
      name: "faculty",
      label: "Faculty",
      type: "text",
      layout: "half",
      readOnly: true,
    },
    {
      name: "status",
      label: "Status",
      type: "text",
      layout: "half",
      readOnly: true,
    },
    {
      name: "email_verified",
      label: "Email Verified",
      type: "text",
      layout: "half",
      readOnly: true,
    },
    {
      name: "created_at",
      label: "Registered At",
      type: "text",
      layout: "half",
      readOnly: true,
    },
    {
      name: "approved_at",
      label: "Approved At",
      type: "text",
      layout: "half",
      readOnly: true,
    },
  ], []);

  const values = useMemo(() => {
    if (!onboardingData) return {};
    return {
      full_name: onboardingData.full_name || "",
      student_id: onboardingData.student_id || "",
      username: onboardingData.username || "",
      email: onboardingData.email || "",
      department: onboardingData.academic?.department?.name || "",
      faculty: onboardingData.academic?.faculty?.name || "",
      status: onboardingData.status || "",
      email_verified: onboardingData.email_verified ? "Yes" : "No",
      created_at: onboardingData.created_at || "",
      approved_at: onboardingData.account?.approved_at || "",
    };
  }, [onboardingData]);

  const userId = onboardingData?.user_id || Number(id);

  const handleApprove = () => {
    if (!userId) return;

    approveMutation.mutate(
      { userId },
      {
        onSuccess: () => notify.success("Student approved successfully"),
        onError: (err) => notify.error(err?.message || "Failed to approve student"),
      },
    );
  };

  const handleResendApprovalEmail = () => {
    if (!userId) return;

    resendApprovalMutation.mutate(
      { userId, sendNow: true },
      {
        onSuccess: () => notify.success("Approval email resent successfully"),
        onError: (err) => notify.error(err?.message || "Failed to resend approval email"),
      },
    );
  };

  const headerActions = (
    <>
      <button
        type="button"
        onClick={handleResendApprovalEmail}
        disabled={resendApprovalMutation.isPending}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-700"
      >
        {resendApprovalMutation.isPending ? "Resending..." : "Resend Approval Email"}
      </button>

      {onboardingData?.can_approve ? (
        <button
          type="button"
          onClick={handleApprove}
          disabled={approveMutation.isPending}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-700"
        >
          {approveMutation.isPending ? "Approving..." : "Approve Student"}
        </button>
      ) : null}
    </>
  );

  if (isLoading || !onboardingData) {
    return <Preloader />;
  }

  if (isError) {
    return <div className="p-10 flex items-center justify-center text-red-500">Failed to load onboarding details.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <FrappeForm
        title={`Onboarding: ${onboardingData.full_name || onboardingData.email}`}
        status={values.status}
        fields={formFields}
        values={values}
        errors={{}}
        onChange={() => {}}
        onSave={() => notify.warning("Editing is not implemented yet.")}
        isSaving={false}
        menuOptions={[]}
        headerActions={headerActions}
      />
    </div>
  );
};

export default OnboardingDetailMain;
