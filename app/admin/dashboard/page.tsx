"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Plus, Users } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [jobs, setJobs] = useState("");
  const [applicants, setApplicants] = useState("");
  const [activejobs, setActivejobs] = useState("");
  const [closedjobs, setClosedjobs] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("https://backend.ahaz.io/api/jobs");
        const data = await response.json();

        const active = data.filter(
          (job: { status: string }) => job.status === "open",
        );
        const closed = data.filter(
          (job: { status: string }) => job.status === "closed",
        );

        setJobs(data);
        setActivejobs(active);
        setClosedjobs(closed);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      }
    };
    const fetchApplicants = async () => {
      try {
        const response = await fetch("https://backend.ahaz.io/api/applicants");
        // const response = await fetch("http://localhost:3001/api/applicants");
        const data = await response.json();
        setApplicants(data);
      } catch (err) {
        console.error("Failed to fetch applicants", err);
      }
    };
    fetchApplicants();
    fetchJobs();
  }, []);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome to Ahaz Solutions Career Management
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-gray-500 mt-1"> Total job listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Positions
            </CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activejobs.length}</div>
            <p className="text-xs text-gray-500 mt-1">Open job listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Closed Positions
            </CardTitle>
            <Briefcase className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedjobs.length}</div>
            <p className="text-xs text-gray-500 mt-1">Recently closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applicants
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicants.length}</div>
            <p className="text-xs text-gray-500 mt-1">Applications received</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/admin/jobs/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </Link>
          <Link href="/admin/jobs">
            <Button variant="outline">
              <Briefcase className="w-4 h-4 mr-2" />
              Manage Postings
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
