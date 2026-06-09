"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import {
  useLogout,
  useMyProfilePage,
  useUpdateMyProfilePage,
} from "@/features/auth/hooks";
import useNotify from "@/hooks/useNotify";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function formatProfileType(type) {
  if (type === "student") return "Student";
  if (type === "staff") return "Staff / Teacher";
  return "User";
}

function formatStatus(status) {
  const map = {
    pending_email: "Pending Email",
    pending_approval: "Pending Approval",
    active: "Active",
    rejected: "Rejected",
  };

  return map[status] || status || "—";
}

function formatBool(value) {
  if (value === true) return "Enabled";
  if (value === false) return "Disabled";
  return "—";
}

function getInitials(fullName, username) {
  const source = fullName || username || "User";

  return String(source)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function canEdit(profile, field) {
  return Array.isArray(profile?.can_edit) && profile.can_edit.includes(field);
}

function getProfileValues(profile) {
  if (!profile) {
    return {
      full_name: "",
      username: "",
      email: "",
      profile_type_label: "",
      roles_label: "",
      status: "",
      status_label: "",
      user_is_enabled: false,
      user_is_enabled_label: "",
      profile_is_enabled: false,
      profile_is_enabled_label: "",

      student_id: "",
      staff_id: "",
      faculty_name: "",
      department_name: "",
      classroom_name: "",
      semester_name: "",

      new_password: "",
    };
  }

  return {
    full_name: profile.full_name || "",
    username: profile.username || "",
    email: profile.email || "",
    profile_type_label: formatProfileType(profile.profile_type),
    roles_label: profile.roles?.length ? profile.roles.join(", ") : "User",

    status: profile.status || "",
    status_label: formatStatus(profile.status),

    user_is_enabled: Boolean(profile.user_is_enabled),
    user_is_enabled_label: formatBool(profile.user_is_enabled),

    profile_is_enabled: Boolean(profile.profile_is_enabled),
    profile_is_enabled_label: formatBool(profile.profile_is_enabled),

    student_id: profile.student_id || "",
    staff_id: profile.staff_id || "",

    faculty_name: profile.faculty?.name || "",
    department_name: profile.department?.name || "",

    classroom_name: profile.classroom?.name
      ? profile.classroom?.room_number
        ? `${profile.classroom.name} (${profile.classroom.room_number})`
        : profile.classroom.name
      : "",

    semester_name: profile.semester?.name
      ? profile.semester?.number
        ? `${profile.semester.name} (${profile.semester.number})`
        : profile.semester.name
      : "",

    // Always keep password empty on profile load.
    new_password: "",
  };
}

function buildUpdatePayload(profile, values) {
  const payload = {};

  if (canEdit(profile, "full_name")) {
    payload.full_name = values.full_name || "";
  }

  if (canEdit(profile, "email")) {
    payload.email = values.email || "";
  }

  if (canEdit(profile, "staff_id")) {
    payload.staff_id = values.staff_id || null;
  }

  if (canEdit(profile, "status")) {
    payload.status = values.status || profile.status;
  }

  if (canEdit(profile, "user_is_enabled")) {
    payload.user_is_enabled = Boolean(values.user_is_enabled);
  }

  if (canEdit(profile, "profile_is_enabled")) {
    payload.profile_is_enabled = Boolean(values.profile_is_enabled);
  }

  const password = String(values.new_password || "").trim();

  if (password) {
    payload.set_new_password = true;
    payload.new_password = password;
    payload.logout_from_all_devices = true;
  }

  return payload;
}

function ProfileHeader({ profile }) {
  const initials = getInitials(profile?.full_name, profile?.username);
  const fullName = profile?.full_name || profile?.username || "User";
  const roleLabel = profile?.roles?.length ? profile.roles.join(", ") : "User";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 rounded-md px-5 py-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primaryColor text-base font-bold text-white">
          {initials}
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {fullName}
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>@{profile?.username || "user"}</span>
            <span>•</span>
            <span>{formatProfileType(profile?.profile_type)}</span>
            <span>•</span>
            <span>{roleLabel}</span>
          </div>
        </div>
      </div>

      <div className="text-left sm:text-right">
        <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
          Account Status
        </div>
        <div className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100">
          {formatStatus(profile?.status)}
        </div>
      </div>
    </div>
  );
}

const UserProfileDetails = () => {
  const router = useRouter();
  const notify = useNotify();

  const { data: apiResponse, isLoading, isError } = useMyProfilePage();
  const updateMutation = useUpdateMyProfilePage();
  const logoutMutation = useLogout();

  const profile = apiResponse?.data?.profile || null;

  const [values, setValues] = useState(() => getProfileValues(null));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!profile) return;

    const next = getProfileValues(profile);

    setValues((prev) => ({
      ...next,
      // Force clear password even if browser/react tries to keep it.
      new_password: "",
    }));

    setErrors({});
  }, [profile]);

  const isAdminEditable = useMemo(() => {
    return (
      canEdit(profile, "email") ||
      canEdit(profile, "staff_id") ||
      canEdit(profile, "status") ||
      canEdit(profile, "user_is_enabled") ||
      canEdit(profile, "profile_is_enabled")
    );
  }, [profile]);

  const handleChange = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (
      canEdit(profile, "full_name") &&
      !String(values.full_name || "").trim()
    ) {
      nextErrors.full_name = "Full name is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = (e) => {
    e?.preventDefault?.();

    if (!profile) return;

    if (!validate()) {
      notify.error("Please fix the highlighted fields.");
      return;
    }

    const payload = buildUpdatePayload(profile, values);

    updateMutation.mutate(payload, {
      onSuccess: (res) => {
        const loggedOut = Boolean(res?.data?.logged_out);

        if (loggedOut) {
          notify.success("Password changed. Please log in again.");
          router.replace("/login");
          return;
        }

        notify.success("Profile updated successfully.");

        setValues((prev) => ({
          ...prev,
          new_password: "",
        }));
      },

      onError: (error) => {
        const msg =
          error?.info?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update profile.";

        notify.error(String(msg));
      },
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace("/login");
      },
    });
  };

  const formFields = useMemo(() => {
    if (!profile) return [];

    return [
      {
        section: "Profile Information",
        fields: [
          {
            name: "full_name",
            label: "Full Name",
            type: "text",
            required: canEdit(profile, "full_name"),
            layout: "half",
            readOnly: !canEdit(profile, "full_name"),
            placeholder: "Your full name",
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
            readOnly: !canEdit(profile, "email"),
            placeholder: "email@example.com",
          },
          {
            name: "profile_type_label",
            label: "Profile Type",
            type: "text",
            layout: "half",
            readOnly: true,
          },
          {
            name: "roles_label",
            label: "Roles",
            type: "text",
            layout: "half",
            readOnly: true,
          },
          canEdit(profile, "status")
            ? {
                name: "status",
                label: "Status",
                type: "select",
                layout: "half",
                options: [
                  { label: "Pending Email", value: "pending_email" },
                  { label: "Pending Approval", value: "pending_approval" },
                  { label: "Active", value: "active" },
                  { label: "Rejected", value: "rejected" },
                ],
              }
            : {
                name: "status_label",
                label: "Status",
                type: "text",
                layout: "half",
                readOnly: true,
              },
        ],
      },
      {
        section: "Academic / Organization",
        fields: [
          {
            name: "student_id",
            label: "Student ID",
            type: "text",
            layout: "half",
            readOnly: true,
            condition: () => Boolean(profile.student_id),
          },
          {
            name: "staff_id",
            label: "Staff ID",
            type: "text",
            layout: "half",
            readOnly: !canEdit(profile, "staff_id"),
            condition: () =>
              Boolean(profile.staff_id) || canEdit(profile, "staff_id"),
          },
          {
            name: "faculty_name",
            label: "Faculty",
            type: "text",
            layout: "half",
            readOnly: true,
          },
          {
            name: "department_name",
            label: "Department",
            type: "text",
            layout: "half",
            readOnly: true,
          },
          {
            name: "classroom_name",
            label: "Classroom",
            type: "text",
            layout: "half",
            readOnly: true,
            condition: () => Boolean(profile.classroom),
          },
          {
            name: "semester_name",
            label: "Semester",
            type: "text",
            layout: "half",
            readOnly: true,
            condition: () => Boolean(profile.semester),
          },
        ],
      },
      {
        section: "Account Controls",
        fields: [
          {
            name: "user_is_enabled",
            label: "User Enabled",
            type: "checkbox",
            layout: "half",
            checkboxLabel: "User account is enabled",
            checkboxDescription:
              "Disable this only when the user should not be able to access the system.",
            condition: () => canEdit(profile, "user_is_enabled"),
          },
          {
            name: "profile_is_enabled",
            label: "Profile Enabled",
            type: "checkbox",
            layout: "half",
            checkboxLabel: "Profile is enabled",
            checkboxDescription:
              "Controls whether the linked student/staff profile is active.",
            condition: () => canEdit(profile, "profile_is_enabled"),
          },
          {
            name: "user_is_enabled_label",
            label: "User Enabled",
            type: "text",
            layout: "half",
            readOnly: true,
            condition: () => !canEdit(profile, "user_is_enabled"),
          },
          {
            name: "profile_is_enabled_label",
            label: "Profile Enabled",
            type: "text",
            layout: "half",
            readOnly: true,
            condition: () => !canEdit(profile, "profile_is_enabled"),
          },
        ],
      },
      {
        section: "Security",
        fields: [
          {
            name: "new_password",
            inputName: "profile_new_password_field",
            label: "New Password",
            type: "password",
            layout: "half",
            placeholder: "Leave blank to keep current password",
            autoComplete: "new-password",
            description:
              "If you enter a new password, you will be logged out from all devices after saving.",
          },
        ],
      },
    ];
  }, [profile]);

  const headerActions = (
    <button
      type="button"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className="inline-flex items-center justify-center rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
    >
      {logoutMutation.isPending ? "Logging out..." : "Logout"}
    </button>
  );

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-500">Loading profile...</div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load profile.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <FrappeForm
        title="My Profile"
        status={isAdminEditable ? "Managed Profile" : "Self Service"}
        fields={formFields}
        values={values}
        errors={errors}
        onChange={handleChange}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
        headerActions={headerActions}
        topContent={<ProfileHeader profile={profile} />}
      />
    </div>
  );
};

export default UserProfileDetails;
