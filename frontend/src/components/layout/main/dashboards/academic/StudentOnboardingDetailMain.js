"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import useNotify from "@/hooks/useNotify";
import { studentOnboardingDetailsData } from "@/lib/mockAcademicData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const TRACKED_FIELDS = [
  "verification_email_status",
  "verification_email_tries",
  "verification_email_last_error",
  "approval_email_status",
  "approval_email_tries",
  "approval_email_last_error",
];

const onboardingSchema = z.object({
  verification_email_status: z.string().optional(),
  approval_email_status: z.string().optional(),
});

function normalizeOnboardingToForm(item) {
  return {
    full_name: item?.full_name || "",
    email: item?.email || "",
    username: item?.username || "",
    status: item?.status || "pending_email",
    email_verified_at: item?.email_verified_at || "",
    created_at: item?.created_at || "",
    verification_email_status: item?.verification_email_status || "pending",
    verification_email_tries: item?.verification_email_tries ?? 0,
    verification_email_last_error: item?.verification_email_last_error || "",
    approval_email_status: item?.approval_email_status || "pending",
    approval_email_tries: item?.approval_email_tries ?? 0,
    approval_email_last_error: item?.approval_email_last_error || "",
  };
}

function getChangedFields(initialValues, currentValues) {
  const changed = {};

  TRACKED_FIELDS.forEach((key) => {
    if (initialValues?.[key] !== currentValues?.[key]) {
      changed[key] = currentValues[key];
    }
  });

  return changed;
}

async function getOnboardingStudentById(id) {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const found = studentOnboardingDetailsData.find(
    (item) => String(item.id) === String(id),
  );
  if (!found) throw new Error("Student onboarding record not found");
  return found;
}

async function updateOnboardingStudentById(id, payload) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { id, ...payload };
}

const statusOptions = [
  {
    label: "Pending Email Verification",
    value: "pending_email",
    meta: { code: "PENDING_EMAIL" },
  },
  {
    label: "Pending Approval",
    value: "pending_approval",
    meta: { code: "PENDING_APPROVAL" },
  },
];

const emailStatusOptions = [
  { label: "Pending", value: "pending", meta: { code: "PENDING" } },
  { label: "Sending", value: "sending", meta: { code: "SENDING" } },
  { label: "Sent", value: "sent", meta: { code: "SENT" } },
  { label: "Failed", value: "failed", meta: { code: "FAILED" } },
];

const StudentOnboardingDetailMain = ({ id }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notify = useNotify();

  const [values, setValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [errors, setErrors] = useState({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-onboarding", id],
    queryFn: () => getOnboardingStudentById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (!data) return;
    const normalized = normalizeOnboardingToForm(data);
    setValues(normalized);
    setInitialValues(normalized);
    setErrors({});
  }, [data]);

  const changedFields = useMemo(() => {
    if (!values || !initialValues) return {};
    return getChangedFields(initialValues, values);
  }, [initialValues, values]);

  const updateMutation = useMutation({
    mutationFn: async (payload) => updateOnboardingStudentById(id, payload),
    onSuccess: async (updated) => {
      const merged = {
        ...data,
        ...updated,
      };
      const normalized = normalizeOnboardingToForm(merged);
      setValues(normalized);
      setInitialValues(normalized);
      setErrors({});
      notify.success("Student onboarding updated");
      await queryClient.invalidateQueries({
        queryKey: ["student-onboarding", id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["student-onboarding-list"],
      });
    },
    onError: (error) => {
      notify.error(error?.message || "Failed to update onboarding");
    },
  });

  const handleResendVerification = () => {
    if (!values) return;

    const nextValues = {
      ...values,
      verification_email_status: "pending",
      verification_email_tries: (values.verification_email_tries || 0) + 1,
      verification_email_last_error: "",
    };

    setValues(nextValues);

    updateMutation.mutate({
      verification_email_status: nextValues.verification_email_status,
      verification_email_tries: nextValues.verification_email_tries,
      verification_email_last_error: nextValues.verification_email_last_error,
    });
  };

  const handleApprove = () => {
    notify.success("Student approved");
    router.push("/admin/dashboards/admin-students/onboarding");
  };

  const handleResendApproval = () => {
    if (!values) return;

    const nextValues = {
      ...values,
      approval_email_status: "pending",
      approval_email_tries: (values.approval_email_tries || 0) + 1,
      approval_email_last_error: "",
    };

    setValues(nextValues);

    updateMutation.mutate({
      approval_email_status: nextValues.approval_email_status,
      approval_email_tries: nextValues.approval_email_tries,
      approval_email_last_error: nextValues.approval_email_last_error,
    });
  };

  const formFields = [
    {
      name: "full_name",
      label: "Full Name",
      type: "text",
      layout: "full",
      placeholder: "Student full name",
      readOnly: true,
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      layout: "half",
      placeholder: "student@email.com",
      readOnly: true,
    },
    {
      name: "username",
      label: "Username",
      type: "text",
      layout: "half",
      placeholder: "Auto / assigned later",
      readOnly: true,
    },
    {
      name: "status",
      label: "Status",
      type: "async-dropdown",
      layout: "half",
      placeholder: "Status",
      readOnly: true,
      dropdownProps: {
        options: statusOptions,
        isLoading: false,
        hasMore: false,
        getSublabel: (opt) => (opt?.meta?.code ? `Code: ${opt.meta.code}` : ""),
      },
    },
    {
      name: "email_verified_at",
      label: "Email Verified At",
      type: "text",
      layout: "half",
      placeholder: "-",
      readOnly: true,
    },
    {
      name: "created_at",
      label: "Registered At",
      type: "text",
      layout: "half",
      placeholder: "-",
      readOnly: true,
    },
    {
      name: "verification_email_status",
      label: "Verification Email Status",
      type: "async-dropdown",
      layout: "half",
      placeholder: "Verification email status",
      readOnly: true,
      dropdownProps: {
        options: emailStatusOptions,
        isLoading: false,
        hasMore: false,
        getSublabel: (opt) => (opt?.meta?.code ? `Code: ${opt.meta.code}` : ""),
      },
    },
    {
      name: "verification_email_tries",
      label: "Verification Email Tries",
      type: "number",
      layout: "half",
      readOnly: true,
    },
    {
      name: "verification_email_last_error",
      label: "Verification Email Last Error",
      type: "text",
      layout: "full",
      placeholder: "-",
      readOnly: true,
    },
    {
      name: "approval_email_status",
      label: "Approval Email Status",
      type: "async-dropdown",
      layout: "half",
      placeholder: "Approval email status",
      readOnly: true,
      dropdownProps: {
        options: emailStatusOptions,
        isLoading: false,
        hasMore: false,
        getSublabel: (opt) => (opt?.meta?.code ? `Code: ${opt.meta.code}` : ""),
      },
    },
    {
      name: "approval_email_tries",
      label: "Approval Email Tries",
      type: "number",
      layout: "half",
      readOnly: true,
    },
    {
      name: "approval_email_last_error",
      label: "Approval Email Last Error",
      type: "text",
      layout: "full",
      placeholder: "-",
      readOnly: true,
    },
  ];

  const menuOptions = [
    ...(values?.status === "pending_email"
      ? [
          {
            label: "Resend Verification Email",
            action: handleResendVerification,
          },
        ]
      : []),
    ...(values?.status === "pending_approval"
      ? [
          {
            label: "Approve Student",
            action: handleApprove,
          },
          {
            label: "Resend Approval Email",
            action: handleResendApproval,
          },
        ]
      : []),
  ];

  const formTitle = data?.full_name
    ? `${id} - ${data.full_name}`
    : "Loading...";

  const formStatus = updateMutation.isPending ? "Updating..." : "Read Only";

  if (isLoading || !values) {
    return (
      <div className="p-10 flex items-center justify-center">Loading...</div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 flex items-center justify-center text-red-500">
        Failed to load onboarding record.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <FrappeForm
        title={formTitle}
        status={formStatus}
        fields={formFields}
        values={values}
        errors={errors}
        onChange={() => {}}
        onSave={() => {}}
        isSaving={updateMutation.isPending}
        menuOptions={menuOptions}
        showSaveButton={false}
      />
    </div>
  );
};

export default StudentOnboardingDetailMain;
