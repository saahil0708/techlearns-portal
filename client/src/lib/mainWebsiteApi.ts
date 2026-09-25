import { CourseProgram } from '@/types/course-program';

export const INITIAL_PROGRAMS_MAP: Record<string, CourseProgram> = {
  'cloud-devops': {
    slug: 'cloud-devops',
    category: 'Cloud & Infrastructure',
    badge: '☁️ HIGH PLACEMENT RATE',
    title: 'Cloud Engineering, DevOps & SRE',
    tagline: 'Master Infrastructure-as-Code, Kubernetes, CI/CD Pipelines & Multi-Cloud Observability',
    description:
      'A hands-on cloud engineering track covering Linux internals, AWS/GCP architecture, Terraform IaC, Docker, Kubernetes orchestration, Helm, Prometheus monitoring, and Chaos Engineering.',
    rating: 4.85,
    reviewsCount: 'Cohort Audited',
    enrolledCount: 'Max 30 / Cohort',
    salaryHike: 'CEL™ Track',
    nextCohortDate: 'Starts October 20, 2026',
    duration: '5–6 Months',
    effort: '12–15 hrs/week',
    level: 'Intermediate',
    price: '₹59,999',
    emi: '₹4,999/mo (12 Months No-Cost EMI + ₹11 down payment)',
    heroImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    tools: [
      { name: 'AWS Cloud', iconTag: 'WS', category: 'Cloud' },
      { name: 'Terraform', iconTag: 'TF', category: 'IaC' },
      { name: 'Docker', iconTag: 'DK', category: 'Containers' },
      { name: 'Kubernetes (EKS)', iconTag: 'K8', category: 'Orchestration' },
      { name: 'Linux Bash', iconTag: 'LX', category: 'OS' },
      { name: 'Prometheus', iconTag: 'PR', category: 'Monitoring' },
      { name: 'Grafana', iconTag: 'GF', category: 'Observability' },
      { name: 'GitHub Actions', iconTag: 'GH', category: 'CI/CD' },
    ],
    pedagogyMix: { theory: 30, practice: 50, exposure: 20 },
    curriculum: [
      {
        durationWeeks: 'Weeks 1–4',
        title: 'Linux Internals, Networking & AWS Cloud Foundations',
        summary:
          'Master core operating system primitives, VPC networking, security groups, IAM policies, and compute instances on AWS.',
        topics: [
          'Linux system administration, shell scripting & process management',
          'TCP/IP, DNS, TLS certificates, load balancers & VPC subnets',
          'AWS IAM least-privilege security & CloudTrail auditing',
          'Automating instance provisioning with AWS CLI & CloudFormation',
        ],
        handsOnLab: 'Building a secure multi-tier VPC network with public/private subnets and NAT gateways',
        projectDeliverable: 'High-Availability Multi-Tier AWS Cloud Network',
      },
      {
        durationWeeks: 'Weeks 5–8',
        title: 'Infrastructure as Code (Terraform) & Containerization',
        summary:
          'Write modular Terraform modules to provision reproducible cloud environments and optimize multi-stage Docker builds.',
        topics: [
          'Terraform state management, remote backends & module registries',
          'Docker container security, non-root users & image size optimization',
          'Building automated CI/CD deployment pipelines with GitHub Actions',
          'Container registries (ECR) & automated vulnerability scanning',
        ],
        handsOnLab: 'Automated provisioning of 3 AWS environments (Dev, Staging, Prod) via Terraform',
        projectDeliverable: 'Modular Infrastructure as Code (IaC) Framework',
      },
      {
        durationWeeks: 'Weeks 9–12',
        title: 'Kubernetes (EKS) Orchestration & Helm Packaging',
        summary:
          'Deploy and manage containerized microservices on production Kubernetes clusters with automated scaling and service discovery.',
        topics: [
          'Kubernetes Pods, Deployments, Services & Ingress controllers',
          'Horizontal Pod Autoscaling (HPA) & Cluster Autoscaler',
          'Helm charts for application lifecycle management',
          'Service Mesh: Traffic routing, canary deployments with Istio',
        ],
        handsOnLab: 'Deploying a self-healing microservice cluster on AWS EKS with zero-downtime rolling updates',
        projectDeliverable: 'Production Kubernetes (EKS) Microservice Cluster',
      },
      {
        durationWeeks: 'Weeks 13–16',
        title: 'Observability, Chaos Engineering & FSL Defense',
        summary:
          'Implement full observability with Prometheus, Grafana, and OpenTelemetry, conduct chaos testing, and defend system reliability.',
        topics: [
          'Prometheus metrics scraping & PromQL alert rules',
          'Grafana dashboards for SLO / SLA / Error Budget tracking',
          'Chaos Engineering: Injecting pod failures & latency simulations',
          'Disaster recovery planning & automated backup failover',
        ],
        handsOnLab: 'Injecting chaos into a Kubernetes cluster and validating automated failover',
        projectDeliverable: 'Enterprise SRE Observability & Automated Incident Response',
      },
    ],
    curriculumTracks: [
      {
        id: 'cloud-devops-track',
        label: 'Cloud & DevOps Engineering',
        icon: 'shield',
        modules: [
          {
            moduleNumber: 1,
            title: 'Linux Internals, Shell Scripting & Networking',
            badge: 'Common Module',
            topics: [
              'Linux Kernel Basics, Process Scheduling & Memory Management',
              'Bash Automation, Regex & Cron Job Orchestration',
              'Networking Protocols: TCP/IP, DNS, TLS Certificates & SSH Hardening',
              'User Management, Permissions (chmod/chown) & Security Auditing',
            ],
          },
          {
            moduleNumber: 2,
            title: 'AWS Cloud Infrastructure & Multi-Tier VPCs',
            badge: 'Common Module',
            topics: [
              'AWS IAM Least-Privilege Policies & MFA Enforcement',
              'Multi-Tier VPC Architecture: Public/Private Subnets & NAT Gateways',
              'Compute & Storage: EC2 Auto-Scaling Groups, EBS & S3 Lifecycle',
              'Application Load Balancers (ALB) & Route 53 DNS Routing',
            ],
          },
          {
            moduleNumber: 3,
            title: 'Infrastructure as Code (IaC) with Terraform',
            badge: 'Specialization Module',
            topics: [
              'Declarative HCL Syntax & Terraform State Management',
              'Remote State Locks with S3 & DynamoDB',
              'Modular Infrastructure Design & Registry Modules',
              'Terraform Plan, Apply, Drift Detection & Automated Rollbacks',
            ],
          },
          {
            moduleNumber: 4,
            title: 'Docker Containerization & CI/CD Pipelines',
            badge: 'Specialization Module',
            topics: [
              'Multi-Stage Dockerfile Optimization & Minimal Base Images',
              'Docker Compose for Local Multi-Service Development',
              'GitHub Actions CI/CD: Automated Linting, Testing & Image Pushes',
              'Container Security Scanning with Trivy & Amazon ECR',
            ],
          },
          {
            moduleNumber: 5,
            title: 'Production Kubernetes (EKS) Cluster Orchestration',
            badge: 'Specialization Module',
            topics: [
              'Kubernetes Architecture: Control Plane, Nodes, Pods & Deployments',
              'Ingress Controllers, ClusterIP, NodePort & Service Meshes',
              'Horizontal Pod Autoscaling (HPA) & Cluster Autoscaler',
              'Helm Charts for Reusable Application Packaging',
            ],
          },
          {
            moduleNumber: 6,
            title: 'Full-Stack Observability & Chaos Engineering',
            badge: 'Specialization Module',
            topics: [
              'Prometheus Metrics Scraping, Exporters & PromQL Rules',
              'Grafana Dashboards for SLO / SLA / Error Budget Telemetry',
              'Distributed Tracing with OpenTelemetry & Jaeger',
              'Chaos Mesh: Latency Simulation & Pod Termination Drills',
            ],
          },
          {
            moduleNumber: 7,
            title: 'Multi-Region Cloud Fabric Capstone Defense',
            badge: 'Capstone Module',
            topics: [
              '100% Codified Multi-Region High-Availability AWS Deployment',
              'Zero-Downtime Rolling & Blue/Green Deployments',
              'Live Capstone Defense before SRE Staff Architects',
              'Verifiable Skill Passport & Placement Fast-Track',
            ],
          },
        ],
      },
      {
        id: 'sre-devsecops',
        label: 'Site Reliability & DevSecOps',
        icon: 'code',
        modules: [
          {
            moduleNumber: 1,
            title: 'Site Reliability Fundamentals & SLOs',
            badge: 'Common Module',
            topics: [
              'SRE Core Tenets: Eliminating Toil & Embracing Risk',
              'Defining SLA, SLO & Error Budget Calculation',
              'Incident Command Structure & Post-Mortem Culture',
            ],
          },
          {
            moduleNumber: 2,
            title: 'DevSecOps & Automated Security Pipelines',
            badge: 'Specialization Module',
            topics: [
              'Static Application Security Testing (SAST) in CI/CD',
              'Secret Management with HashiCorp Vault & AWS Secrets Manager',
              'Zero-Trust Network Policies in Kubernetes',
            ],
          },
          {
            moduleNumber: 3,
            title: 'Autonomous SRE Capstone Defense',
            badge: 'Capstone Module',
            topics: [
              'Self-Healing Kubernetes Deployments with Auto-Remediation',
              'Disaster Recovery Drill & Failover Validation',
              'Final Staff Architect Code Review',
            ],
          },
        ],
      },
    ],
    projects: [
      {
        title: 'Terraform-Managed Multi-Region High-Availability AWS Fabric',
        tagline: 'Production-grade cloud architecture provisioning VPCs, EKS, RDS, and CloudFront across 2 AWS regions.',
        description:
          '100% codified using Terraform with remote S3 state locks, automated drift detection, and security guardrails.',
        techStack: ['Terraform', 'AWS', 'Docker', 'GitHub Actions'],
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        metric: '100% Automated IaC',
        repoHash: 'sha256:2d4e6f8a...c0b1',
      },
    ],
    instructors: [
      {
        name: 'Siddharth Menon',
        role: 'Principal SRE Architect',
        company: 'techlearns',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
        experience: '13+ Years Exp',
        bio: '',
      },
    ],
    externalCertifications: [
      'AWS Certified Solutions Architect - Associate',
      'Certified Kubernetes Administrator (CKA)',
      'techlearns Certified Cloud & DevOps Architect',
    ],
    careerOutcomes: {
      topRoles: ['Cloud Engineer', 'DevOps Engineer', 'Site Reliability Engineer (SRE)', 'Platform Engineer'],
      avgSalary: '₹15.0 LPA',
      highestSalary: '₹34.0 LPA',
      hiringCompanies: ['Amazon', 'Oracle', 'Cisco', 'Razorpay', 'Wipro', 'TCS', 'Accenture'],
    },
    faqs: [
      {
        question: 'Do I need prior cloud or Linux experience for Cloud & DevOps Engineering?',
        answer:
          'No prior cloud experience is required. We start with Linux system administration, shell scripting, and network security fundamentals before progressing to AWS, Terraform, and Kubernetes.',
      },
      {
        question: 'What tools and infrastructure platforms are covered in this program?',
        answer:
          'You will master AWS Cloud, Terraform (IaC), Docker, Kubernetes (EKS), Prometheus, Grafana, Linux Bash, Helm, and GitHub Actions CI/CD pipelines.',
      },
      {
        question: 'Will I build production Infrastructure as Code (IaC) with Terraform?',
        answer:
          'Yes! You will write modular Terraform scripts to provision multi-region AWS infrastructure (VPC, EKS, RDS) with remote S3 state locks and automated drift detection.',
      },
      {
        question: 'How do Kubernetes orchestration and Chaos Engineering get taught?',
        answer:
          'You will deploy microservices on AWS EKS with horizontal pod autoscaling (HPA), Helm charts, and Istio service mesh, while simulating outage failures using Chaos Engineering.',
      },
      {
        question: 'Which industry certifications does this Cloud & DevOps course align with?',
        answer:
          'This track prepares you for AWS Certified Solutions Architect - Associate, Certified Kubernetes Administrator (CKA), and techlearns Certified Cloud Architect.',
      },
      {
        question: 'What real-world SRE projects will I add to my portfolio?',
        answer:
          'You will build a Terraform-Managed Multi-Region High-Availability AWS Fabric and an Enterprise 99.99% Observability & Reliability Suite with Prometheus & Grafana alerting.',
      },
    ],
  },
};

const MAIN_SITE_API_URL =
  process.env.MAIN_WEBSITE_API_URL || process.env.NEXT_PUBLIC_MAIN_WEBSITE_API_URL || '';

/**
 * Fetches all course programs from the main website API with ISR caching,
 * or falls back to the initial dataset if not yet configured.
 */
export async function fetchCoursePrograms(): Promise<CourseProgram[]> {
  if (MAIN_SITE_API_URL) {
    try {
      const res = await fetch(`${MAIN_SITE_API_URL}/programs`, {
        next: { revalidate: 60 },
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.MAIN_WEBSITE_API_KEY
            ? { Authorization: `Bearer ${process.env.MAIN_WEBSITE_API_KEY}` }
            : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : Object.values(data);
      }
    } catch (err) {
      console.warn('Failed to fetch programs from main website API, falling back to local dataset:', err);
    }
  }

  return Object.values(INITIAL_PROGRAMS_MAP);
}

/**
 * Fetches a single course program by slug from the main website API.
 */
export async function fetchCourseProgramBySlug(slug: string): Promise<CourseProgram | null> {
  if (MAIN_SITE_API_URL) {
    try {
      const res = await fetch(`${MAIN_SITE_API_URL}/programs/${slug}`, {
        next: { revalidate: 60 },
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.MAIN_WEBSITE_API_KEY
            ? { Authorization: `Bearer ${process.env.MAIN_WEBSITE_API_KEY}` }
            : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        return data as CourseProgram;
      }

      if (res.status === 404) {
        return null;
      }
    } catch (err) {
      console.warn(`Failed to fetch program ${slug} from main website API, falling back:`, err);
      return INITIAL_PROGRAMS_MAP[slug] || null;
    }
    return null;
  }

  return INITIAL_PROGRAMS_MAP[slug] || null;
}
