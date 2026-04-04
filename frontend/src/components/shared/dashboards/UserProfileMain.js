import UserProfileDetails from "@/components/shared/dashboards/UserProfileDetails";

const UserProfileMain = ({ role = "user" }) => {
  return <UserProfileDetails role={role} />;
};

export default UserProfileMain;
