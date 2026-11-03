import { Outlet } from "react-router";

const OwnerLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Owner dashboard header and sidebar */}

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default OwnerLayout;