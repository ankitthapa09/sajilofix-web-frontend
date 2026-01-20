

import React from "react";
import StatCard from "../components/StatCard";
import RecentActivity from "../components/RecentActivity";

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Reports" value={5} subtitle="+2 this month" />
        <StatCard title="Total Views" value={374} subtitle="Avg 75 per report" />
        <StatCard title="Community Support" value={119} subtitle="24 upvotes avg" />
        <StatCard title="Resolution Rate" value="20%" subtitle="1 resolved" />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4">Report Status Overview</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-md p-4">
                <div className="text-sm text-gray-500">Pending Review</div>
                <div className="text-2xl font-semibold mt-2">2</div>
              </div>
              <div className="bg-blue-50 rounded-md p-4">
                <div className="text-sm text-blue-600">In Progress</div>
                <div className="text-2xl font-semibold mt-2">2</div>
              </div>
              <div className="bg-green-50 rounded-md p-4">
                <div className="text-sm text-green-600">Resolved</div>
                <div className="text-2xl font-semibold mt-2">1</div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-md p-4 text-sm text-blue-700">Average Response Time: 2.5 days — Authorities typically respond to reports within 3 days</div>
          </div>
        </div>

        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
 