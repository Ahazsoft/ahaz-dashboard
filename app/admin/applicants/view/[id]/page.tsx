"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Check, Star, X } from "lucide-react";
import Link from "next/link";

type Applicant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  github_link?: string | null;
  linkedin_link?: string | null;
  cv_url: string;
  job_id: string;
  created_at: string;
};

type Job = {
  id: string;
  title: string;
};

export default function ApplicantViewPage() {
  const params = useParams();
  const applicantId = params?.id as string | undefined;

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!applicantId) return;
    const fetchApplicant = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:3001/api/applicant/${applicantId}`,
        );
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setApplicant(data);
        // try to fetch job title if job id present
        if (data.job_id) {
          try {
            const jr = await fetch(
              `https://backend.ahaz.io/api/job/${data.job_id}`,
            );
            if (jr.ok) {
              const jdata = await jr.json();
              setJob({
                id: String(jdata.id),
                title: jdata.title ?? jdata.job_title ?? String(jdata.id),
              });
            }
          } catch (e) {
            // ignore job fetch errors; we'll fallback to id
          }
        }
      } catch (err) {
        setError("Failed to load applicant.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicant();
  }, [applicantId]);

  const handleAction = async (status: "hired" | "shortlisted" | "rejected") => {
    if (!applicant) return;
    setActionLoading(true);
    try {
      // optimistic UI change placeholder: backend API may differ
      await fetch(
        `http://localhost:3001/api/applicants/${applicant.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      ).catch(() => null);
      // update local notes/status if desired -- here we add a small note
      setApplicant((prev) =>
        prev
          ? {
              ...prev,
              notes: `Marked ${status} on ${new Date().toLocaleString()}`,
            }
          : prev,
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/jobs">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applicant</h1>
          <p className="text-gray-500 mt-1">
            Detail view for a single application
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-600">{error}</div>
          ) : applicant ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {applicant.first_name} {applicant.last_name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {job?.title ?? applicant.job_id}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Applied: {new Date(applicant.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-gray-900">{applicant.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-gray-900">{applicant.phone ?? "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Links & Notes
                  </p>
                  <div className="space-y-2">
                    <div>
                      {applicant.github_link ? (
                        <a
                          href={applicant.github_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          GitHub
                        </a>
                      ) : (
                        <span className="text-gray-500">GitHub: —</span>
                      )}
                    </div>
                    <div>
                      {applicant.linkedin_link ? (
                        <a
                          href={applicant.linkedin_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                      ) : (
                        <span className="text-gray-500">LinkedIn: —</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-500"
                        onClick={() => handleAction("hired")}
                        disabled={actionLoading}
                      >
                        <Check className="w-4 h-4 mr-2" /> Hire
                      </Button>
                      <Button
                        variant="outline"
                        className="border-yellow-500 text-yellow-600 hover:bg-yellow-500"
                        onClick={() => handleAction("shortlisted")}
                        disabled={actionLoading}
                      >
                        <Star className="w-4 h-4 mr-2" /> Shortlist
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-500"
                        onClick={() => handleAction("rejected")}
                        disabled={actionLoading}
                      >
                        <X className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">CV Preview</p>
                <div className="border rounded overflow-hidden h-96">
                  <iframe
                    src={applicant.cv_url}
                    className="w-full h-full"
                    title="CV Preview"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <a
                    href={applicant.cv_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open Full CV
                  </a>
                  <a
                    href={applicant.cv_url}
                    download
                    className="text-sm text-gray-500"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              No applicant selected.
            </div>
          )}
        </CardContent>
      </Card>

      {/* invisible dialog wrapper to match existing view UI patterns (kept for parity) */}
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent />
      </Dialog>
    </div>
  );
}
