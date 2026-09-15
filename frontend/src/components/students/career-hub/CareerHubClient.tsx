'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  LinearProgress,
  Switch,
  FormControlLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { useToast } from '@/context/ToastContext';

interface RoleBenchmark {
  role: string;
  matchScore: number;
  openDrives: number;
  averagePackage: string;
  topSkillsMatch: string[];
}

const BENCHMARKS: RoleBenchmark[] = [
  {
    role: 'Full-Stack Software Engineer',
    matchScore: 92,
    openDrives: 148,
    averagePackage: '₹18 - ₹32 LPA',
    topSkillsMatch: ['Next.js 15', 'TypeScript', 'NestJS', 'PostgreSQL', 'Docker'],
  },
  {
    role: 'Backend Distributed Systems Engineer',
    matchScore: 84,
    openDrives: 94,
    averagePackage: '₹22 - ₹38 LPA',
    topSkillsMatch: ['Go', 'Raft Consensus', 'Redis', 'gRPC', 'Kubernetes'],
  },
  {
    role: 'Cloud Native & DevOps Engineer',
    matchScore: 68,
    openDrives: 76,
    averagePackage: '₹16 - ₹28 LPA',
    topSkillsMatch: ['Docker Sandbox', 'CI/CD', 'Prometheus', 'Linux Kernel'],
  },
];

export default function CareerHubClient() {
  const toast = useToast();
  const [recruiterVisible, setRecruiterVisible] = useState(true);
  const [atsScore, setAtsScore] = useState(91);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanResume = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setAtsScore(94);
      toast.success('Resume parsed and ATS compatibility re-calculated!', 'Scan Complete');
    }, 1500);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* 1. Top Header Banner */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                border: '1px solid #DBEAFE',
              }}
            >
              <WorkOutlineRoundedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem', lineHeight: 1.2 }}>
                Career Hub & ATS Intelligence
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.3 }}>
                Automated resume keyword scanner, recruiter spotlight visibility, and compensation benchmarks
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 1, px: 2, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={recruiterVisible}
                  onChange={(e) => {
                    setRecruiterVisible(e.target.checked);
                    toast.info(e.target.checked ? 'Your profile is now visible to verified hiring partners!' : 'Profile hidden from recruiter searches.', 'Visibility Updated');
                  }}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                    Recruiter Spotlight: {recruiterVisible ? 'Active' : 'Hidden'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                    50+ Hiring Partners
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Box>
      </Card>

      {/* 2. ATS Resume Scanner Card */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.2fr' }, gap: 3 }}>
        {/* Left: ATS Score Gauge */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: 20, color: '#2563EB' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                AI Resume ATS Compatibility
              </Typography>
            </Box>
            <Chip
              label="Top 3% Score"
              size="small"
              sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, fontSize: '0.72rem', borderRadius: '6px' }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
              <svg width={100} height={100} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={50} cy={50} r={40} stroke="#EEF2F6" strokeWidth={8} fill="transparent" />
                <circle
                  cx={50}
                  cy={50}
                  r={40}
                  stroke="#10B981"
                  strokeWidth={8}
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 - (atsScore / 100) * (2 * Math.PI * 40)}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                  {atsScore}
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748B' }}>
                  / 100
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.94rem', color: '#0F172A', mb: 0.5 }}>
                Exceptional Recruiter Parsing
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.45 }}>
                Your resume passed all key parsing checks (Role Keywords, Impact Quantifiers, Clean Typography & Section Hierarchy).
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={<UploadFileRoundedIcon />}
            onClick={handleScanResume}
            disabled={isScanning}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontSize: '0.84rem' }}
          >
            {isScanning ? 'Analyzing Keywords & Formatting...' : 'Re-Scan Resume'}
          </Button>
        </Card>

        {/* Right: Key ATS Feedback checklist */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', mb: 0.5 }}>
            Key ATS Optimization Insights
          </Typography>

          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
            <CheckCircleRoundedIcon sx={{ color: '#16A34A', fontSize: 18, mt: 0.2 }} />
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534' }}>
                High Tech Stack Keyword Density
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', color: '#14532D' }}>
                Contains all 12 key skills expected for Full-Stack & Systems Engineering roles.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
            <CheckCircleRoundedIcon sx={{ color: '#16A34A', fontSize: 18, mt: 0.2 }} />
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534' }}>
                Verified Proof of Work Attached
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', color: '#14532D' }}>
                Includes live sandbox deployment links & cryptographically signed skill passports.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
            <WarningAmberRoundedIcon sx={{ color: '#D97706', fontSize: 18, mt: 0.2 }} />
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400E' }}>
                Recommended Improvement
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', color: '#78350F' }}>
                Add more quantifiable performance metrics (e.g. "Reduced query latency by 45% under load").
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* 3. Role Fit & Compensation Benchmarks Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 2 }}>CAREER ROLE PATHWAY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>PROFILE FIT SCORE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>OPEN DRIVES</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>COMPENSATION BAND</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>MATCHED SKILLS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {BENCHMARKS.map((b) => (
                <TableRow key={b.role} hover sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                  <TableCell sx={{ py: 2.25 }}>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                      {b.role}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ width: 160 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 900, color: '#2563EB' }}>
                        {b.matchScore}% Match
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={b.matchScore}
                        sx={{ height: 6, borderRadius: '9999px', bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#2563EB' } }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontWeight: 700, color: '#059669', fontSize: '0.86rem' }}>
                    {b.openDrives} Live Openings
                  </TableCell>

                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>
                    {b.averagePackage}
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {b.topSkillsMatch.map((s) => (
                        <Chip key={s} label={s} size="small" sx={{ bgcolor: '#F1F5F9', fontSize: '0.7rem', height: 22 }} />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
