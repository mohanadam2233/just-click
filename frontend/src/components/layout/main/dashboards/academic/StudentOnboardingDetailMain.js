"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import useNotify from "@/hooks/useNotify";
import { studentOnboardingDetailsData } from "@/lib/mockAcademicData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const TRACKED_FIELDS = [
  "full_name",
  "email",
  "status",
  "verification_email_status",
  "approval_email_status",
];

const onboardingSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  status: z.string().min(1, "Status is required"),
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

  const isDirty = Object.keys(changedFields).length > 0;

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
      notify.success("Document saved");
      await queryClient.invalidateQueries({
        queryKey: ["student-onboarding", id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["student-onboarding-list"],
      });
    },
    onError: (error) => {
      notify.error(error?.message || "Failed to save document");
    },
  });

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!values) return;

    setErrors({});
    const result = onboardingSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      notify.error("Please fix the highlighted fields");
      return;
    }

    if (!isDirty) {
      notify.warning("No changes in document");
      return;
    }

    updateMutation.mutate(changedFields);
  };

  const handleResendVerification = () => {
    notify.success("Verification email resent");
    setValues((prev) => ({
      ...prev,
      verification_email_status: "pending",
      verification_email_tries: (prev?.verification_email_tries || 0) + 1,
      verification_email_last_error: "",
    }));
  };

  const handleApprove = () => {
    notify.success("Student approved");
    router.push("/admin/dashboards/admin-students/onboarding");
  };

  const handleResendApproval = () => {
    notify.success("Approval email resent");
    setValues((prev) => ({
      ...prev,
      approval_email_status: "pending",
      approval_email_tries: (prev?.approval_email_tries || 0) + 1,
      approval_email_last_error: "",
    }));
  };

  const formFields = [
    {
      name: "full_name",
      label: "Full Name",
      type: "text",
      required: true,
      layout: "full",
      placeholder: "Student full name",
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      required: true,
      layout: "half",
      placeholder: "student@email.com",
    },
    {
      name: "username",
      label: "Username",
      type: "text",
      required: false,
      layout: "half",
      placeholder: "Auto / assigned later",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      layout: "half",
      options: [
        {
          label: "Pending Email Verification",
          value: "pending_email",
        },
        {
          label: "Pending Approval",
          value: "pending_approval",
        },
      ],
    },
    {
      name: "email_verified_at",
      label: "Email Verified At",
      type: "text",
      required: false,
      layout: "half",
      placeholder: "-",
    },
    {
      name: "created_at",
      label: "Registered At",
      type: "text",
      required: false,
      layout: "half",
      placeholder: "-",
    },
    {
      name: "verification_email_status",
      label: "Verification Email Status",
      type: "select",
      layout: "half",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Sending", value: "sending" },
        { label: "Sent", value: "sent" },
        { label: "Failed", value: "failed" },
      ],
    },
    {
      name: "approval_email_status",
      label: "Approval Email Status",
      type: "select",
      layout: "half",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Sending", value: "sending" },
        { label: "Sent", value: "sent" },
        { label: "Failed", value: "failed" },
      ],
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

  const formStatus = updateMutation.isPending
    ? "Saving..."
    : isDirty
      ? "Not Saved"
      : "Saved";

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
        onChange={handleChange}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
        menuOptions={menuOptions}
      />

      <div className="mt-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-sm shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Email Delivery Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 dark:text-gray-100">
              Verification Email
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Status: {values.verification_email_status || "-"}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Tries: {values.verification_email_tries ?? 0}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Last Error: {values.verification_email_last_error || "-"}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 dark:text-gray-100">
              Approval Email
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Status: {values.approval_email_status || "-"}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Tries: {values.approval_email_tries ?? 0}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Last Error: {values.approval_email_last_error || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOnboardingDetailMain;
