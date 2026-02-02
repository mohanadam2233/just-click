import SidebarDashboard from "../dashboards/SidebarDashboard";

const DashboardContainer = ({ children }) => {
  return (
    <section>
      <div className="container-fluid-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-30px pt-30px pb-100px">
          <SidebarDashboard />
          <div className="lg:col-start-4 lg:col-span-9">{children}</div>
        </div>
      </div>
    </section>
  );
};

export default DashboardContainer;
