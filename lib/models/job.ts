export type JobStatus = 'open' | 'closed';

export type JobData = {
  id: string;
  company: string;
  title: string;
  jobType: string;
  jobLevel: string;
  location: string;
  salary: string;
  description: string; // multi-line string (bullet points)
  education: string;
  applicants: Applicant[];
  email: string;
  postDate: string;
  expiryDate: string;
  status: JobStatus;
};

export type Applicant = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  cvUrl?: string; // link to Supabase storage (stored in DB)
  appliedAt?: string;
};

export class Job implements JobData {
  id: string;
  company: string;
  title: string;
  jobType: string;
  jobLevel: string;
  location: string;
  salary: string;
  description: string;
  education: string;
  applicants: Applicant[];
  email: string;
  postDate: string;
  expiryDate: string;
  status: JobStatus;

  constructor(data: JobData) {
    this.id = data.id;
    this.company = data.company;
    this.title = data.title;
    this.jobType = data.jobType;
    this.jobLevel = data.jobLevel;
    this.location = data.location;
    this.salary = data.salary;
    this.description = data.description;
    this.education = data.education;
    this.applicants = data.applicants ?? [];
    this.email = data.email;
    this.postDate = data.postDate;
    this.expiryDate = data.expiryDate;
    this.status = data.status;
  }

  static create(params: Partial<JobData> & { id: string; title: string; jobType: string; jobLevel: string; location: string; salary: string; description: string; education: string; email: string; expiryDate: string; applicants?: Applicant[] } ): Job {
    const data: JobData = {
      id: params.id,
      company: params.company ?? 'Ahaz Solutions',
      title: params.title,
      jobType: params.jobType,
      jobLevel: params.jobLevel,
      location: params.location,
      salary: params.salary,
      description: params.description,
      education: params.education,
      applicants: params.applicants ?? [],
      email: params.email,
      postDate: params.postDate ?? new Date().toISOString(),
      expiryDate: params.expiryDate,
      status: (params.status as JobStatus) ?? 'open',
    };

    return new Job(data);
  }
}
