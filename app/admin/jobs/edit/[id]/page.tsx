"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { JobData } from "@/lib/models/job";

const jobFormSchema = z.object({
  title: z
    .string()
    .min(1, "Job title is required")
    .min(3, "Title must be at least 3 characters"),
  company: z.string(),
  jobType: z.string().min(1, "Job type is required"),
  jobLevel: z.string().min(1, "Job level is required"),
  location: z.string().min(1, "Location is required"),
  salary: z.string().min(1, "Salary information is required"),
  education: z.string().min(1, "Education is required"),
  description: z.string().min(1, "Description is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  email: z.string().email("Invalid email address"),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

const educationOptions = [
  "Tvet",
  "Secondary School",
  "Certificate",
  "Diploma",
  "Bachelors Degree",
  "Masters",
  "Phd",
];

const jobTypes = [
  "Internship",
  "Part-time",
  "Full-time",
  "Contract",
  "Remote",
  "Hybrid",
];
const jobLevels = ["Junior", "Intermediate", "Senior", "Expert"];

export default function EditJobPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      jobType: "",
      company: "Ahaz Software",
      jobLevel: "",
      location: "Bole, Addis Ababa",
      salary: "",
      description: "",
      education: "Bachelors Degree",
      expiryDate: "",
      email: "recruitement@ahaz.io",
    },
  });

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    // Try fetching job from API first
    // fetch(`http://localhost:3001/api/job/${id}`)
    fetch(`https://backend.ahaz.io/api/job/${id}`)
      .then((res) => {
        console.log(res);

        if (!res.ok) throw new Error("not-found");
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        const j = data;
        console.log(`job data: ${j}`);
        if (j) {
          form.reset({
            title: j.title ?? "",
            company: j.company ?? "Ahaz Software",
            jobType: j.job_type ?? "",
            jobLevel: j.job_level ?? "",
            location: j.location ?? "Bole, Addis Ababa",
            salary: j.salary ?? "",
            description: j.description ?? "",
            education: j.education ?? "Bachelors Degree",
            expiryDate: j.expiry_date ? j.expiry_date.split("T")[0] : "",
            email: j.email ?? "recruitement@ahaz.io",
          });
          console.log("Values after reset:", form.getValues());
        } else {
          // fallback to localStorage
          const savedJobs = JSON.parse(
            localStorage.getItem("jobs") || "[]",
          ) as JobData[];
          const existing = savedJobs.find((s) => s.id === id);
          if (existing) {
            form.reset({
              title: existing.title,
              jobType: existing.jobType,
              jobLevel: existing.jobLevel,
              location: existing.location,
              salary: existing.salary,
              description: existing.description,
              education: existing.education,
              expiryDate: existing.expiryDate,
              email: existing.email,
            });
          }
        }
      })
      .catch(() => {
        // fallback to localStorage on any error
        const savedJobs = JSON.parse(
          localStorage.getItem("jobs") || "[]",
        ) as JobData[];
        const existing = savedJobs.find((j) => j.id === id);
        if (existing) {
          form.reset({
            title: existing.title,
            jobType: existing.jobType,
            jobLevel: existing.jobLevel,
            location: existing.location,
            salary: existing.salary,
            description: existing.description,
            education: existing.education,
            expiryDate: existing.expiryDate,
            email: existing.email,
          });
        }
      })
      .finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  async function onSubmit(values: JobFormValues) {
    if (!id) return;
    setIsSaving(true);
    try {
      // const res = await fetch(`http://localhost:3001/api/job/edit/${id}`, {
      const res = await fetch(`https://backend.ahaz.io/api/job/edit/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          expiryDate: new Date(values.expiryDate).toISOString(), // <-- replaced original date
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to update job");
      }
      // success — navigate back to manage
      router.push("/admin/jobs");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  if (!id) {
    return <div className="py-12 text-center">Missing job id</div>;
  }

  if (isLoading) return <div className="py-12 text-center">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/jobs">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
          <p className="text-gray-500 mt-1">Update job posting</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-full border border-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full border border-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border border-black">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {jobTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Level</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border border-black">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {jobLevels.map((l) => (
                            <SelectItem key={l} value={l}>
                              {l}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full border border-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full border border-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border border-black">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {educationOptions.map((e) => (
                            <SelectItem key={e} value={e}>
                              {e}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          // readOnly
                          className="w-full border border-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="w-full border border-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-36 resize-y border border-black"
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      use markdown document format .md
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-6">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Link href="/admin/jobs">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
