"use client";

import Preloader from "@/components/shared/others/Preloader";
import FrappeForm from "@/components/shared/forms/FrappeForm";
import { useStaffDetail, useUpdateStaff } from "@/features/people/hooks";
import { useDepartmentsDropdown, useFacultiesDropdown } from "@/features/academic/hooks";
import useNotify from "@/hooks/useNotify";
import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const TRACKED_FIELDS = [
  "department_id",
  "faculty_id",
  "is_enabled"
];

function extractDropdownRows(res) {
  return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
}

function mapOptions(items = []) {
  return items.map((item) => ({
    label: item?.label || item?.name || item?.title || item?.display_name || `Option #${item?.id}`,
    value: String(item?.value ?? item?.id ?? ""),
    meta: item?.meta || { code: item?.code || item?.display_name || item?.name || "" },
  }));
}

function getChangedFields(initialValues, currentValues) {
  const changed = {};
  TRACKED_FIELDS.forEach((key) => {
    if (JSON.stringify(initialValues?.[key]) !== JSON.stringify(currentValues?.[key])) {
      changed[key] = currentValues[key];
    }
  });
  return changed;
}

const StaffDetailMain = ({ id }) => {
  const router = useRouter();
  const notify = useNotify();

  const [values, setValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const hasInitializedRef = useRef(false);

  const { data: response, isLoading, isError } = useStaffDetail(id);
  const staffData = useMemo(() => {
    return response?.data?.data ?? response?.data ?? null;
  }, [response]);

  const { data: deptsRes, isLoading: isLoadingDepts } = useDepartmentsDropdown({ limit: 20 });
  const { data: facsRes, isLoading: isLoadingFacs } = useFacultiesDropdown({ limit: 20 });
  
  const departmentOptions = useMemo(() => mapOptions(extractDropdownRows(deptsRes)), [deptsRes]);
  const facultyOptions = useMemo(() => mapOptions(extractDropdownRows(facsRes)), [facsRes]);

  const updateMutation = useUpdateStaff();

  useEffect(() => {
    if (!staffData) return;

    const normalized = {
      full_name: staffData.profile?.full_name || "",
      staff_id: staffData.profile?.staff_id || "",
      username: staffData.user?.username || "",
      email: staffData.user?.email || "",
      status: staffData.user?.status || "",
      is_enabled: Boolean(staffData.flags?.is_enabled),
      department_id: staffData.context?.department?.id ? String(staffData.context.department.id) : "",
      faculty_id: staffData.context?.faculty?.id ? String(staffData.context.faculty.id) : "",
    };

    if (!hasInitializedRef.current || !initialValues) {
      setValues(normalized);
      setInitialValues(normalized);
      hasInitializedRef.current = true;
    }
  }, [staffData, initialValues]);

  const changedFields = useMemo(() => {
    if (!values || !initialValues) return {};
    return getChangedFields(initialValues, values);
  }, [initialValues, values]);

  const isDirty = Object.keys(changedFields).length > 0;

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e?.preventDefault?.();
    if (!values) return;
    if (!isDirty) {
      notify.warning("No changes in document");
      return;
    }

    const payload = {
      ...changedFields,
      ...(changedFields.department_id !== undefined ? { department_id: Number(changedFields.department_id) || null } : {}),
      ...(changedFields.faculty_id !== undefined ? { faculty_id: Number(changedFields.faculty_id) || null } : {}),
    };

    updateMutation.mutate(
      { id, payload },
      {
        onSuccess: () => {
          notify.success("Staff updated successfully");
          const nextValues = { ...values, ...changedFields };
          setValues(nextValues);
          setInitialValues(nextValues);
        },
        onError: (err) => {
          notify.error(err?.message || "Failed to update staff");
        },
      }
    );
  };

  const formFields = useMemo(() => [
    { name: "full_name", label: "Full Name", type: "text", layout: "half", readOnly: true },
    { name: "staff_id", label: "Staff ID", type: "text", layout: "half", readOnly: true },
    { name: "username", label: "Username", type: "text", layout: "half", readOnly: true },
    { name: "email", label: "Email", type: "text", layout: "half", readOnly: true },
    { 
      name: "department_id", 
      label: "Department", 
      type: "async-dropdown", 
      layout: "half",
      placeholder: "Select department",
      dropdownProps: { options: departmentOptions, isLoading: isLoadingDepts, getSublabel: (opt) => opt?.meta?.code ? `Code: ${opt.meta.code}` : "" } 
    },
    { 
      name: "faculty_id", 
      label: "Faculty", 
      type: "async-dropdown", 
      layout: "half",
      placeholder: "Select faculty",
      dropdownProps: { options: facultyOptions, isLoading: isLoadingFacs, getSublabel: (opt) => opt?.meta?.code ? `Code: ${opt.meta.code}` : "" } 
    },
    { name: "is_enabled", label: "Enabled", type: "checkbox", checkboxLabel: "Active User", layout: "half" },
  ], [departmentOptions, facultyOptions, isLoadingDepts, isLoadingFacs]);

  if (isLoading || !values) {
    return <Preloader />;
  }

  if (isError) {
    return <div className="p-10 flex items-center justify-center text-red-500">Failed to load staff details.</div>;
  }

  const formStatus = updateMutation.isPending ? "Saving..." : isDirty ? "Not Saved" : "Saved";

  return (
    <div className="max-w-7xl mx-auto w-full">
      <FrappeForm
        title={`Staff: ${staffData?.profile?.full_name || ""}`}
        status={formStatus}
        fields={formFields}
        values={values}
        errors={{}}
        onChange={handleChange}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
        menuOptions={[]}
      />
    </div>
  );
};

export default StaffDetailMain;
