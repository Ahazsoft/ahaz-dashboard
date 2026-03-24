"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  DoorOpen,
  RefreshCcw,
} from "lucide-react";
import type { JobData as JobModel } from "@/lib/models/job";

// Use JobModel from lib/models/job.ts

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-800",
  closed: "bg-red-100 text-red-800",
};

const STATUS_OPTIONS = ["open", "closed"];

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<JobModel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusChangeJob, setStatusChangeJob] = useState<{
    id: string;
    newStatus: "open" | "closed";
  } | null>(null);
  const [viewJob, setViewJob] = useState<JobModel | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshJobs = () => {
    // Fetch latest jobs from API
    setIsRefreshing(true);
    fetch("http://backend.ahaz.io/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        const apiJobs = (data || []).map((j: any) => ({
          id: String(j.id),
          company: j.company,
          title: j.title,
          jobType: j.jobType ?? j.job_type,
          jobLevel: j.jobLevel ?? j.job_level,
          location: j.location,
          salary: j.salary,
          description: j.description,
          education: j.education,
          email: j.email,
          postDate: j.postDate ?? j.post_date,
          expiryDate: j.expiryDate ?? j.expiry_date,
          status: j.status ?? "open",
          applicants: j.applicants ?? [],
        }));
        setJobs(apiJobs);
      })
      .catch((err) => console.error("Failed to fetch jobs", err))
      .finally(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  // Load jobs from API on mount
  useEffect(() => {
    let mounted = true;
    setIsRefreshing(true);
    fetch("https://backend.ahaz.io/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        const apiJobs = (data || []).map((j: any) => ({
          id: String(j.id),
          company: j.company,
          title: j.title,
          jobType: j.jobType ?? j.job_type,
          jobLevel: j.jobLevel ?? j.job_level,
          location: j.location,
          salary: j.salary,
          description: j.description,
          education: j.education,
          email: j.email,
          postDate: j.postDate ?? j.post_date,
          expiryDate: j.expiryDate ?? j.expiry_date,
          status: j.status ?? "open",
          applicants: j.applicants ?? [],
        }));
        setJobs(apiJobs);
      })
      .catch((err) => console.error("Failed to fetch jobs", err))
      .finally(() => setIsRefreshing(false));

    return () => {
      mounted = false;
    };
  }, []);

  // Filter and search logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  // Handle delete (call API and update UI)
  const handleDelete = async (id: string) => {
    try {
      // optimistically update UI
      const updatedJobs = jobs.filter((job) => job.id !== id);
      setJobs(updatedJobs);

      const res = await fetch(`http://backend.ahaz.io/api/job/delete/${id}`, { method: "DELETE" });
      if (!res.ok) {
        // revert on failure: re-fetch jobs
        console.error(
          "Failed to delete job",
          await res.text().catch(() => res.status),
        );
        // reload from API
        fetch("http://backend.ahaz.io/api/jobs")
          .then((r) => r.json())
          .then((data) =>
            setJobs(
              (data.jobs || []).map((j: any) => ({
                id: String(j.id),
                company: j.company,
                title: j.title,
                jobType: j.jobType ?? j.job_type,
                jobLevel: j.jobLevel ?? j.job_level,
                location: j.location,
                salary: j.salary,
                description: j.description,
                education: j.education,
                email: j.email,
                postDate: j.postDate ?? j.post_date,
                expiryDate: j.expiryDate ?? j.expiry_date,
                status: j.status ?? "open",
                applicants: j.applicants ?? [],
              })),
            ),
          );
      }
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Handle status change (persist via API + optimistic UI)
  const handleStatusChange = async (id: string, newStatus: "open" | "closed") => {
    const prevJobs = jobs;
    const optimistic = jobs.map((job) =>
      job.id === id ? { ...job, status: newStatus } : job,
    );
    setJobs(optimistic);

    try {
      const res = await fetch(`http://backend.ahaz.io/api/job/editstatus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error(await res.text().catch(() => String(res.status)));
      }

      const json = await res.json();
      const updated = json.job;

      const normalized = {
        id: String(updated.id),
        company: updated.company,
        title: updated.title,
        jobType: updated.jobType ?? updated.job_type,
        jobLevel: updated.jobLevel ?? updated.job_level,
        location: updated.location,
        salary: updated.salary,
        description: updated.description,
        education: updated.education,
        email: updated.email,
        postDate: updated.postDate ?? updated.post_date,
        expiryDate: updated.postDate ?? updated.post_date,
        status: updated.status ?? "open",
        applicants: updated.applicants ?? [],
      } as JobModel;

      const finalJobs = optimistic.map((j) => (j.id === String(normalized.id) ? normalized : j));
      setJobs(finalJobs);
      try {
        localStorage.setItem("jobs", JSON.stringify(finalJobs));
      } catch (e) {
        // ignore localStorage errors
      }
    } catch (err) {
      console.error("Failed to change status", err);
      setJobs(prevJobs);
    } finally {
      setStatusChangeJob(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Jobs</h1>
          <p className="text-gray-500 mt-1">View and manage all job postings</p>
        </div>
        <Link href="/admin/jobs/create">
          <Button className="bg-blue-500 hover:bg-primary">
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by title, location, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader
          className="px-5"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <CardTitle>Job Postings</CardTitle>
          {/* <RefreshCcw className="w-4 h-4 mr-2" onClick={refreshJobs} /> */}
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {jobs.length === 0
                  ? "No jobs posted yet. Create your first job posting!"
                  : "No jobs match your search criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-700">Title</TableHead>
                    <TableHead className="text-gray-700">Type</TableHead>
                    <TableHead className="text-gray-700">Experience</TableHead>
                    <TableHead className="text-gray-700">Posted</TableHead>
                    <TableHead className="text-gray-700">Closes</TableHead>
                    <TableHead className="text-gray-700">Status</TableHead>
                    <TableHead className="text-right text-gray-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow
                      key={job.id}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      <TableCell className="font-medium text-gray-900">
                        {job.title}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {job.jobType}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {job.jobLevel}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {formatDate(job.postDate)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {formatDate(job.expiryDate)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[job.status]}`}
                        >
                          {job.status === "open" ? "Open" : "Closed"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                setStatusChangeJob({
                                  id: job.id,
                                  newStatus:
                                    job.status === "open" ? "closed" : "open",
                                })
                              }
                              className="cursor-pointer"
                            >
                              <DoorOpen className="w-4 h-4 mr-2" />
                              {job.status === "open"
                                ? "Close"
                                : "Reopen"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() =>
                                (window.location.href = `/admin/jobs/edit/${job.id}`)
                              }
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={() => setDeleteConfirm(job.id)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Posting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job posting? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog
        open={statusChangeJob !== null}
        onOpenChange={() => setStatusChangeJob(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Job Status</DialogTitle>
            <DialogDescription>
              {statusChangeJob?.newStatus === "closed"
                ? "Are you sure you want to close this position?"
                : "Are you sure you want to reopen this position?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusChangeJob(null)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() =>
                statusChangeJob &&
                handleStatusChange(
                  statusChangeJob.id,
                  statusChangeJob.newStatus,
                )
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Job Details Dialog */}
      <Dialog open={viewJob !== null} onOpenChange={() => setViewJob(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewJob?.title}</DialogTitle>
            <DialogDescription>Job posting details</DialogDescription>
          </DialogHeader>
          {viewJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <p className="text-gray-900">{viewJob.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Job Type</p>
                  <p className="text-gray-900">{viewJob.jobType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Salary</p>
                  <p className="text-gray-900">{viewJob.salary}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <p
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[viewJob.status]}`}
                  >
                    {viewJob.status === "open" ? "Open" : "Closed"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </p>
                <ul className="space-y-1">
                  {viewJob.description
                    .split(/\r?\n/)
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        • {line.replace(/^[-*]\s?/, "")}
                      </li>
                    ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Posted Date
                  </p>
                  <p className="text-sm text-gray-900">
                    {formatDate(viewJob.postDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Closing Date
                  </p>
                  <p className="text-sm text-gray-900">
                    {formatDate(viewJob.expiryDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
