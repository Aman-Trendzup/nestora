import { Outlet } from "react-router";

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Customer dashboard header and sidebar */}

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;