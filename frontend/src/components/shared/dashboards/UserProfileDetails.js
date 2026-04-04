"use client";

const mockUsers = {
  admin: {
    registrationDate: "20 January 2024, 9:00 PM",
    firstName: "Michelle",
    lastName: "Obama",
    username: "obama007",
    email: "obama@example.com",
    phone: "+55 669 4456 25987",
    role: "Administrator",
    expertise: "System Management",
    bio: "Experienced platform administrator responsible for managing academic workflows, users, and operational settings across the system.",
  },
  teacher: {
    registrationDate: "18 February 2024, 10:30 AM",
    firstName: "Sarah",
    lastName: "Johnson",
    username: "sjohnson",
    email: "sarah@example.com",
    phone: "+1 555 210 7788",
    role: "Instructor",
    expertise: "Computer Science",
    bio: "Instructor focused on delivering course materials, guiding students, and managing classroom content effectively.",
  },
  user: {
    registrationDate: "10 March 2024, 2:15 PM",
    firstName: "User",
    lastName: "Account",
    username: "user001",
    email: "user@example.com",
    phone: "—",
    role: "User",
    expertise: "—",
    bio: "Profile information is currently using mock data.",
  },
};

const getInitials = (firstName, lastName) =>
  `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

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
  const profile = mockUsers[role] || mockUsers.user;
  const initials = getInitials(profile.firstName, profile.lastName);
  const fullName = `${profile.firstName} ${profile.lastName}`;

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
                  {profile.role}
                </div>

                <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-blackColor dark:text-blackColor-dark">
                  {fullName}
                </h2>

                <p className="mt-1 text-sm text-contentColor dark:text-contentColor-dark">
                  @{profile.username}
                </p>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-contentColor dark:text-contentColor-dark">
                  {profile.bio}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-5 bg-blackColor px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-blackColor"
              >
                Edit profile
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
            <StatCard label="Phone" value={profile.phone} />
            <StatCard label="Expertise" value={profile.expertise} />
          </div>
        </div>

        {/* Details */}
        <div className="border-t border-borderColor dark:border-borderColor-dark px-5 py-6 md:px-8 md:py-8 lg:px-10">
          <div className="mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-blackColor dark:text-blackColor-dark">
              Profile details
            </h3>
            <p className="mt-1 text-sm text-contentColor dark:text-contentColor-dark">
              Personal and account information.
            </p>
          </div>

          <div>
            <ProfileRow
              label="Registration Date"
              value={profile.registrationDate}
            />
            <ProfileRow label="First Name" value={profile.firstName} />
            <ProfileRow label="Last Name" value={profile.lastName} />
            <ProfileRow label="Username" value={profile.username} />
            <ProfileRow label="Email" value={profile.email} />
            <ProfileRow label="Phone Number" value={profile.phone} />
            <ProfileRow label="Role" value={profile.role} />
            <ProfileRow label="Expertise" value={profile.expertise} />
            <ProfileRow label="Biography" value={profile.bio} multiline />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetails;
