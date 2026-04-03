"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MoreVertical, Eye, Trash2, Search, ChevronUp, ChevronDown } from "lucide-react";
import { useRouter } from 'next/navigation';
// Define types for better TypeScript support
type Applicant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  github_link: string | null;
  linkedin_link: string | null;
  cv_url: string;
  job_id: string;
  created_at: string;
};

type Job = {
  id: string;
  title: string;
};

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]); // <-- array, not string
  const [jobs, setJobs] = useState<Job[]>([]); // <-- array, not string
  const [searchTerm, setSearchTerm] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [sortField, setSortField] = useState<"name" | "position" | "email" | "applied" | "cv">("applied");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewApplicant, setViewApplicant] = useState<Applicant | null>(null);
  const router = useRouter();
  useEffect(() => {
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

    const fetchJobs = async () => {
      try {
        // const response = await fetch("http://localhost:3001/api/jobs");
        const response = await fetch("https://backend.ahaz.io/api/jobs");
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      }
    };

    fetchApplicants();
    fetchJobs(); // <-- fetch jobs as well
  }, []);

  // Build job filter options from fetched jobs
  const jobOptions = useMemo(() => {
    if (!jobs.length) return [];
    return jobs.map((job) => ({
      id: job.id,
      title: job.title, // assuming job has a "title" field; adjust if different
    }));
  }, [jobs]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const fullName =
        `${applicant.first_name} ${applicant.last_name}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesJob = jobFilter === "all" || applicant.job_id === jobFilter;

      return matchesSearch && matchesJob;
    });
  }, [applicants, searchTerm, jobFilter]);

  // Sort the filtered applicants based on selected column and direction
  const sortedApplicants = useMemo(() => {
    const arr = [...filteredApplicants];
    const compare = (a: Applicant, b: Applicant) => {
      let va: string | number = "";
      let vb: string | number = "";
      switch (sortField) {
        case "name":
          va = `${a.first_name} ${a.last_name}`.toLowerCase();
          vb = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case "position":
          // use job title from jobs list when available
          va = (jobs.find((j) => j.id === a.job_id)?.title ?? a.job_id).toLowerCase();
          vb = (jobs.find((j) => j.id === b.job_id)?.title ?? b.job_id).toLowerCase();
          break;
        case "email":
          va = a.email.toLowerCase();
          vb = b.email.toLowerCase();
          break;
        case "cv":
          va = (a.cv_url || "").toLowerCase();
          vb = (b.cv_url || "").toLowerCase();
          break;
        case "applied":
        default:
          va = new Date(a.created_at).getTime();
          vb = new Date(b.created_at).getTime();
          break;
      }

      if (typeof va === "number" && typeof vb === "number") {
        return va - vb;
      }
      return (va as string).localeCompare(vb as string);
    };

    arr.sort((a, b) => {
      const res = compare(a, b);
      return sortDirection === "asc" ? res : -res;
    });

    return arr;
  }, [filteredApplicants, sortField, sortDirection, jobs]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  const handleDelete = async (id: string) => {
    // Implement actual delete API call here
    try {
      await fetch(`http://localhost:3001/api/applicants/${id}`, {
        method: "DELETE",
      });
      // Update local state after successful deletion
      setApplicants((prev) => prev.filter((applicant) => applicant.id !== id));
    } catch (err) {
      console.error("Failed to delete applicant", err);
    }
    setDeleteConfirm(null);
  };

  // Helper to get job title from job_id
  const getJobTitle = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    return job ? job.title : jobId; // fallback to ID if title missing
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
          <p className="text-gray-500 mt-1">Manage job applicants</p>
        </div>
        <div>
          <Button asChild>
            <Link href="/admin/applicants">Refresh</Link>
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {jobOptions.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applicants Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Applicants</CardTitle>
        </CardHeader>
        <CardContent>
          {applicants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No applicants yet.</p>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No applicants match your search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                      <TableHead
                        className="cursor-pointer select-none"
                        onClick={() => {
                          if (sortField === "name") setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                          else {
                            setSortField("name");
                            setSortDirection("asc");
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          Name
                          {sortField === "name" ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )
                          ) : null}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none"
                        onClick={() => {
                          if (sortField === "position") setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                          else {
                            setSortField("position");
                            setSortDirection("asc");
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          Position
                          {sortField === "position" ? (sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none"
                        onClick={() => {
                          if (sortField === "email") setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                          else {
                            setSortField("email");
                            setSortDirection("asc");
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          Email
                          {sortField === "email" ? (sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none"
                        onClick={() => {
                          if (sortField === "cv") setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                          else {
                            setSortField("cv");
                            setSortDirection("asc");
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          CV
                          {sortField === "cv" ? (sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none"
                        onClick={() => {
                          if (sortField === "applied") setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                          else {
                            setSortField("applied");
                            setSortDirection("desc");
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          Applied
                          {sortField === "applied" ? (sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedApplicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium">
                        {applicant.first_name} {applicant.last_name}
                      </TableCell>
                      <TableCell>{getJobTitle(applicant.job_id)}</TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${applicant.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {applicant.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a
                          href={applicant.cv_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View CV
                        </a>
                      </TableCell>
                      <TableCell>{formatDate(applicant.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/applicants/view/${applicant.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setDeleteConfirm(applicant.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
