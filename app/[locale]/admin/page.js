// app/dashboard/page.js

import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import LogoutButton from "@/components/LogoutButton";
import { getSession } from "next-auth/react";

export default async function DashboardPage() {
  // const session = await getSession(authOptions);

  // if (!session) {
  //   redirect("/login");
  // }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Front Desk Dashboard
              </h1>
              <div className="ml-4 text-sm text-gray-500">Welcome,</div>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-4"></span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Day-to-Day Operations
              </h2>
              <p className="text-gray-600">
                Your receptionist dashboard is ready! Here you can manage:
              </p>
              <ul className="mt-4 list-disc list-inside text-gray-600">
                <li>Guest check-ins/check-outs</li>
                <li>Room assignments</li>
                <li>Reservations</li>
                <li>Guest requests</li>
                <li>Billing and payments</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
