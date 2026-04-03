"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { MoreVertical, Eye, Search, ArrowLeft } from "lucide-react";

type Applicant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  cv_url?: string;
  job_id?: string;
  created_at?: string;
};

type Job = {
  id: string;
  title: string;
  company?: string;
  location?: string;
  jobType?: string;
  jobLevel?: string;
  salary?: string;
  description?: string;
  postDate?: string;
  expiryDate?: string;
  email?: string;
};

export default function JobApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");

  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Fetch single job by id using the dedicated endpoint
        try {
          // const jobRes = await fetch(`http://localhost:3001/api/job/${id}`);
          const jobRes = await fetch(`https://backend.ahaz.io/api/job/${id}`);
          const jobJson = await jobRes.json();
          const found = jobJson?.job ?? jobJson; // support { job } or direct job
          if (found) {
            setJob({
              id: String(found.id),
              title: found.title,
              company: found.company,
              location: found.location,
              jobType: found.jobType ?? found.job_type,
              jobLevel: found.jobLevel ?? found.job_level,
              salary: found.salary,
              description: found.description,
              postDate: found.postDate ?? found.post_date,
              expiryDate: found.expiryDate ?? found.expiry_date,
              email: found.email,
            });
          }
        } catch (e) {
          console.error("Failed to fetch job by id", e);
        }

        // const appsRes = await fetch("http://localhost:3001/api/applicants");
        const appsRes = await fetch("https://backend.ahaz.io/api/applicants");
        const appsJson = await appsRes.json();
        const forJob = (appsJson || [])
          .filter((a: any) => String(a.job_id) === id)
          .map((a: any) => ({
            id: String(a.id),
            first_name: a.first_name || a.firstName || "",
            last_name: a.last_name || a.lastName || "",
            email: a.email,
            phone: a.phone,
            cv_url: a.cv_url || a.cvUrl || a.cvUrl,
            job_id: String(a.job_id ?? a.jobId ?? ""),
            created_at: a.created_at ?? a.createdAt,
          }));
        setApplicants(forJob);
      } catch (err) {
        console.error("Failed to load job/applicants", err);
      }
    };

    fetchData();
  }, [id]);

  const filtered = useMemo(() => {
    if (!search.trim()) return applicants;
    const s = search.toLowerCase();
    return applicants.filter(
      (a) =>
        `${a.first_name} ${a.last_name}`.toLowerCase().includes(s) ||
        (a.email || "").toLowerCase().includes(s),
    );
  }, [applicants, search]);

  const formatDate = (d?: string) => (d ? new Date(d).toLocaleString() : "");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button  onClick={()=> router.back()} variant="ghost" size="icon" className="text-gray-600">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Applicants for: {job?.title ?? "Loading..."}
          </h1>
          <p className="text-gray-500 mt-1">{job?.company}</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search applicants by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Applicants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applicants ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {applicants.length === 0 ? (
            <div className="text-center py-12">
              No applicants for this job yet.
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              No applicants match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>CV</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {a.first_name} {a.last_name}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${a.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {a.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        {a.cv_url ? (
                          <a
                            href={a.cv_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View CV
                          </a>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(a.created_at)}</TableCell>
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
                                router.push(`/admin/applicants/view/${a.id}`)
                              }
                            >
                              <Eye className="w-4 h-4 mr-2" /> View
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
