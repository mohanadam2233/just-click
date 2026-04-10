"use client";

import Preloader from "@/components/shared/others/Preloader";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import { useOnboardingDetail } from "@/features/people/hooks";
import useNotify from "@/hooks/useNotify";
import { useMemo } from "react";

const OnboardingDetailMain = ({ id }) => {
  const notify = useNotify();
  const { data: response, isLoading, isError } = useOnboardingDetail(id);
  
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
      name: "identifier",
      label: "Student/Staff ID",
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
      name: "user_type",
      label: "User Type",
      type: "text",
      layout: "half",
      readOnly: true,
    },
    {
      name: "status",
      label: "User Status",
      type: "text",
      layout: "half",
      readOnly: true,
    },
    {
      name: "template",
      label: "Email Template",
      type: "text",
      layout: "half",
      readOnly: true,
    },
    {
      name: "email_status",
      label: "Outbox Status",
      type: "text",
      layout: "half",
      readOnly: true,
    },
  ], []);

  const values = useMemo(() => {
    if (!onboardingData) return {};
    return {
      full_name: onboardingData.profile?.full_name || "",
      identifier: onboardingData.profile?.student_id || onboardingData.profile?.staff_id || onboardingData.profile?.identifier || "",
      username: onboardingData.user?.username || "",
      email: onboardingData.user?.email || "",
      user_type: onboardingData.user?.user_type || "",
      status: onboardingData.user?.status || "",
      template: onboardingData.email_outbox?.template || "",
      email_status: onboardingData.email_outbox?.status || "",
    };
  }, [onboardingData]);

  if (isLoading || !onboardingData) {
    return <Preloader />;
  }

  if (isError) {
    return <div className="p-10 flex items-center justify-center text-red-500">Failed to load onboarding details.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <FrappeForm
        title={`Onboarding: ${onboardingData.profile?.full_name || onboardingData.user?.email}`}
        status={values.email_status}
        fields={formFields}
        values={values}
        errors={{}}
        onChange={() => {}}
        onSave={() => notify.warning("Editing is not implemented yet.")}
        isSaving={false}
        menuOptions={[]}
      />
    </div>
  );
};

export default OnboardingDetailMain;
