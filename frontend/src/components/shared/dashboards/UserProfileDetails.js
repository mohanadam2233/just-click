"use client";

import { useState } from "react";
import { useMyProfilePage, useUpdateMyProfilePage } from "@/features/auth/hooks";

const getInitials = (fullName) => {
  if (!fullName) return "U";
  const parts = fullName.split(" ");
  return parts.slice(0, 2).map((n) => n[0]).join("").toUpperCase();
};

const ProfileRow = ({ label, value, multiline = false }) => {
  return (
    <div className="grid grid-cols-1 gap-2 py-5 md:grid-cols-12 md:gap-x-8 border-t border-borderColor dark:border-borderColor-dark first:border-t-0">
      <div className="md:col-span-4">
        <span className="text-sm font-medium text-contentColor dark:text-contentColor-dark">
          {label}
        </span>
      </div>
      <div className="md:col-span-8">
        <span
          className={`text-sm md:text-[15px] text-blackColor dark:text-blackColor-dark ${
            multiline ? "leading-7" : ""
          }`}
        >
          {value || "—"}
        </span>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <div className="rounded-5 border border-borderColor dark:border-borderColor-dark bg-whiteColor dark:bg-whiteColor-dark px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-contentColor dark:text-contentColor-dark">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-blackColor dark:text-blackColor-dark">
        {value || "—"}
      </p>
    </div>
  );
};

const UserProfileDetails = ({ role = "user" }) => {
  const { data: apiResponse, isLoading, isError } = useMyProfilePage();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateMyProfilePage();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  if (isLoading) {
    return <div className="p-8 text-center text-contentColor animate-pulse">Loading profile...</div>;
  }
  if (isError || !apiResponse?.data?.profile) {
    return <div className="p-8 text-center text-red-500">Failed to load profile.</div>;
  }

  const profile = apiResponse.data.profile;
  const fullName = profile.full_name || "Unknown User";
  const initials = getInitials(fullName);
  const userRoles = profile.roles?.length > 0 ? profile.roles.join(", ") : "User";

  return (
    <div className="mb-30px">
      <div className="overflow-hidden rounded-5 border border-borderColor dark:border-borderColor-dark bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark">
        {/* Top */}
        <div className="px-5 py-6 md:px-8 md:py-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primaryColor text-lg font-bold text-white">
                {initials}
              </div>

              <div className="min-w-0">
                <div className="inline-flex items-center rounded-full border border-borderColor dark:border-borderColor-dark px-3 py-1 text-xs font-medium text-contentColor dark:text-contentColor-dark">
                  {userRoles}
                </div>

                <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-blackColor dark:text-blackColor-dark">
                  {fullName}
                </h2>

                <p className="mt-1 text-sm text-contentColor dark:text-contentColor-dark">
                  @{profile.username}
                </p>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-contentColor dark:text-contentColor-dark">
                  {profile.profile_type === "staff" ? "Staff Member" : profile.profile_type === "student" ? "Student" : "Platform User"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (!isEditing && profile) {
                    setFormData({ full_name: profile.full_name || "" });
                  }
                }}
                className="inline-flex items-center justify-center rounded-5 bg-blackColor px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-blackColor"
              >
                {isEditing ? "Cancel Edit" : "Edit profile"}
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-5 border border-borderColor dark:border-borderColor-dark px-4 py-2.5 text-sm font-medium text-blackColor dark:text-blackColor-dark transition-colors hover:bg-gray-50 dark:hover:bg-darkdeep3"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-borderColor dark:border-borderColor-dark px-5 py-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard label="Email" value={profile.email} />
            <StatCard label="Status" value={profile.status} />
            <StatCard label="Profile Type" value={profile.profile_type || "—"} />
          </div>
        </div>

        {/* Details */}
        <div className="border-t border-borderColor dark:border-borderColor-dark px-5 py-6 md:px-8 md:py-8 lg:px-10">
          <div className="mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-blackColor dark:text-blackColor-dark">
              {isEditing ? "Edit Profile Details" : "Profile Details"}
            </h3>
            <p className="mt-1 text-sm text-contentColor dark:text-contentColor-dark">
              {isEditing ? "Update your personal and account information." : "Personal and account information."}
            </p>
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-4 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-blackColor dark:text-whiteColor mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name || ""}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full rounded-md border border-borderColor dark:border-borderColor-dark bg-transparent px-4 py-2 text-sm text-blackColor dark:text-whiteColor focus:border-primaryColor focus:outline-none"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    updateProfile(formData, {
                      onSuccess: () => setIsEditing(false),
                    });
                  }}
                  disabled={isUpdating}
                  className="mt-2 inline-flex items-center justify-center rounded-5 bg-primaryColor px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:bg-primaryColor/90 disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <ProfileRow label="ID" value={profile.id} />
              <ProfileRow label="Full Name" value={profile.full_name} />
              <ProfileRow label="Username" value={profile.username} />
              <ProfileRow label="Email" value={profile.email} />
              
              {profile.student_id ? <ProfileRow label="Student ID" value={profile.student_id} /> : null}
              {profile.staff_id ? <ProfileRow label="Staff ID" value={profile.staff_id} /> : null}
              
              <ProfileRow label="Roles" value={userRoles} />
              {profile.faculty?.name ? <ProfileRow label="Faculty" value={profile.faculty.name} /> : null}
              {profile.department?.name ? <ProfileRow label="Department" value={profile.department.name} /> : null}
              {profile.classroom?.name ? <ProfileRow label="Classroom" value={profile.classroom.name} /> : null}
              <ProfileRow label="Status" value={profile.status} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetails;
