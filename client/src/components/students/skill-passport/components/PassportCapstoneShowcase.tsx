'use client';

import React from 'react';
import { Box, Typography, Card, Chip, IconButton, Button } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import { FaGithub } from 'react-icons/fa';
import { CapstoneProjectRecord } from './types';

interface PassportCapstoneShowcaseProps {
  capstoneProjects: CapstoneProjectRecord[];
  activeProjectIdx: number;
  setActiveProjectIdx: React.Dispatch<React.SetStateAction<number>>;
}

export default function PassportCapstoneShowcase({
  capstoneProjects,
  activeProjectIdx,
  setActiveProjectIdx,
}: PassportCapstoneShowcaseProps) {
  if (!capstoneProjects || capstoneProjects.length === 0) {
    return null;
  }

  const safeIdx = Math.max(0, Math.min(activeProjectIdx, capstoneProjects.length - 1));
  const proj = capstoneProjects[safeIdx];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '22px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        p: { xs: 2.5, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header & Interactive Slider Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
              Major Engineering Capstones
            </Typography>
            <Chip
              label="INTERACTIVE SHOWCASE"
              size="small"
              sx={{ height: 20, fontSize: '0.64rem', fontWeight: 800, bgcolor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.3 }}>
            Peer-reviewed production architectures with live telemetry, benchmark verification, and code integrity audits
          </Typography>
        </Box>

        {/* Slider Navigation Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, bgcolor: '#F1F5F9', p: 0.5, borderRadius: '10px' }}>
            {capstoneProjects.map((p, idx) => (
              <Box
                component="button"
                type="button"
                key={p.id}
                onClick={() => setActiveProjectIdx(idx)}
                aria-label={`Project ${idx + 1}: ${p.title}`}
                aria-pressed={safeIdx === idx}
                sx={{
                  border: 'none',
                  outline: 'none',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: '7px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  bgcolor: safeIdx === idx ? '#FFFFFF' : 'transparent',
                  color: safeIdx === idx ? '#2563EB' : '#64748B',
                  boxShadow: safeIdx === idx ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': { color: '#0F172A' },
                  '&:focus-visible': { outline: '2px solid #2563EB' },
                }}
              >
                0{idx + 1}
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <IconButton
              size="small"
              aria-label="Previous capstone project"
              onClick={() =>
                setActiveProjectIdx((prev) => {
                  const maxIdx = capstoneProjects.length - 1;
                  const clamped = Math.max(0, Math.min(prev, maxIdx));
                  return clamped > 0 ? clamped - 1 : maxIdx;
                })
              }
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#334155',
                '&:hover': { bgcolor: '#EFF6FF', borderColor: '#BFDBFE', color: '#2563EB' },
              }}
            >
              <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Next capstone project"
              onClick={() =>
                setActiveProjectIdx((prev) => {
                  const maxIdx = capstoneProjects.length - 1;
                  const clamped = Math.max(0, Math.min(prev, maxIdx));
                  return clamped < maxIdx ? clamped + 1 : 0;
                })
              }
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#334155',
                '&:hover': { bgcolor: '#EFF6FF', borderColor: '#BFDBFE', color: '#2563EB' },
              }}
            >
              <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Active Project Slide Content */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' },
          gap: 3,
          p: { xs: 2, sm: 2.8 },
          borderRadius: '18px',
          bgcolor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Left Column: Project Overview & Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {/* Domain Pill & Defense Score */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Project 0{safeIdx + 1} of 0{capstoneProjects.length}
                </Typography>
                <Typography sx={{ color: '#CBD5E1' }}>•</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 750, color: '#2563EB', bgcolor: '#EFF6FF', px: 1, py: 0.2, borderRadius: '6px' }}>
                  {proj.domain}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#ECFDF5', px: 1.2, py: 0.3, borderRadius: '9999px', border: '1px solid #A7F3D0' }}>
                <VerifiedRoundedIcon sx={{ fontSize: 14, color: '#059669' }} />
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#047857' }}>
                  {proj.evaluationScore}% Defense Score
                </Typography>
              </Box>
            </Box>

            {/* Project Title */}
            <Typography sx={{ fontWeight: 850, fontSize: '1.15rem', color: '#0F172A', lineHeight: 1.3 }}>
              {proj.title}
            </Typography>

            {/* Summary */}
            <Typography sx={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6 }}>
              {proj.summary}
            </Typography>

            {/* Key Benchmark Metric Box */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: '8px 12px',
                borderRadius: '10px',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
              }}
            >
              <BoltRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
              <Typography sx={{ fontSize: '0.76rem', color: '#334155', fontWeight: 650 }}>
                <span style={{ color: '#64748B', fontWeight: 700 }}>Benchmark:</span> {proj.metrics}
              </Typography>
            </Box>
          </Box>

          {/* Bottom Row: Tech Stack & Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1, borderTop: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', alignItems: 'center' }}>
              {proj.stack.map((stk) => (
                <Typography
                  key={stk}
                  sx={{
                    fontSize: '0.72rem',
                    color: '#334155',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    px: 1,
                    py: 0.3,
                    borderRadius: '6px',
                    fontWeight: 650,
                  }}
                >
                  {stk}
                </Typography>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              {proj.repositoryUrl && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => window.open(proj.repositoryUrl, '_blank', 'noopener,noreferrer')}
                  startIcon={<FaGithub size={13} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 750,
                    fontSize: '0.76rem',
                    borderRadius: '9px',
                    color: '#1E293B',
                    borderColor: '#CBD5E1',
                    bgcolor: '#FFFFFF',
                    py: 0.5,
                    px: 1.4,
                    '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                  }}
                >
                  Code Repository
                </Button>
              )}
              {proj.liveDemoUrl && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => window.open(proj.liveDemoUrl, '_blank', 'noopener,noreferrer')}
                  startIcon={<LaunchRoundedIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 750,
                    fontSize: '0.76rem',
                    borderRadius: '9px',
                    bgcolor: '#2563EB',
                    py: 0.5,
                    px: 1.5,
                    boxShadow: '0 4px 14px rgba(37, 99, 255, 0.25)',
                    '&:hover': { bgcolor: '#1D4ED8' },
                  }}
                >
                  Live System
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Right Column: Dynamic Architectural Graphic & Telemetry HUD */}
        <Box
          sx={{
            bgcolor: '#0B1120',
            borderRadius: '16px',
            border: '1px solid #1E293B',
            p: 2.2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            minHeight: 280,
          }}
        >
          {safeIdx === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#A7F3D0', letterSpacing: '0.06em' }}>
                    LIVE TOPOLOGY & TELEMETRY
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: '#38BDF8', bgcolor: 'rgba(56, 189, 248, 0.12)', px: 0.9, py: 0.2, borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                  120,000 req/s Peak
                </Typography>
              </Box>

              <Box sx={{ width: '100%', height: 140, position: 'relative', bgcolor: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', p: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100%" height="100%" viewBox="0 0 320 110" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="streamGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <rect x="8" y="38" width="56" height="34" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
                  <text x="36" y="52" fill="#94A3B8" fontSize="8" fontWeight="bold" textAnchor="middle">Ingress</text>
                  <text x="36" y="64" fill="#38BDF8" fontSize="7" fontWeight="bold" textAnchor="middle">gRPC</text>

                  <line x1="64" y1="55" x2="112" y2="55" stroke="url(#streamGrad1)" strokeWidth="2" strokeDasharray="4 2" />

                  <circle cx="145" cy="55" r="28" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                  <circle cx="145" cy="55" r="22" fill="#1E293B" />
                  <text x="145" y="52" fill="#FFFFFF" fontSize="8.5" fontWeight="900" textAnchor="middle">Redis Lua</text>
                  <text x="145" y="63" fill="#4ADE80" fontSize="7" fontWeight="bold" textAnchor="middle">Cluster Sync</text>

                  <path d="M 173 55 L 208 25" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 2" />
                  <path d="M 173 55 L 208 55" stroke="#38BDF8" strokeWidth="1.5" />
                  <path d="M 173 55 L 208 85" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 2" />

                  <rect x="208" y="10" width="102" height="26" rx="5" fill="#1E293B" stroke="#475569" strokeWidth="1" />
                  <text x="259" y="24" fill="#E2E8F0" fontSize="7.5" fontWeight="bold" textAnchor="middle">Go Node 01 · 0.38ms</text>

                  <rect x="208" y="42" width="102" height="26" rx="5" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
                  <text x="259" y="56" fill="#38BDF8" fontSize="7.5" fontWeight="900" textAnchor="middle">Go Node 02 · Active</text>

                  <rect x="208" y="74" width="102" height="26" rx="5" fill="#1E293B" stroke="#475569" strokeWidth="1" />
                  <text x="259" y="88" fill="#E2E8F0" fontSize="7.5" fontWeight="bold" textAnchor="middle">Go Node 03 · Standby</text>
                </svg>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>P99 LATENCY</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 900 }}>&lt;0.38ms</Typography>
                </Box>
                <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>FAILOVER</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#4ADE80', fontWeight: 900 }}>0 Packet Loss</Typography>
                </Box>
                <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>ALGORITHM</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#FCD34D', fontWeight: 900 }}>Token Bucket</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {safeIdx === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#A7F3D0', letterSpacing: '0.06em' }}>
                    ISOLATED KERNEL RUNTIME
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: '#4ADE80', bgcolor: 'rgba(74, 222, 128, 0.12)', px: 0.9, py: 0.2, borderRadius: '4px', border: '1px solid rgba(74, 222, 128, 0.25)' }}>
                  cgroups v2 + Seccomp
                </Typography>
              </Box>

              <Box sx={{ width: '100%', height: 140, position: 'relative', bgcolor: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', p: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100%" height="100%" viewBox="0 0 320 110" preserveAspectRatio="xMidYMid meet">
                  <rect x="8" y="38" width="62" height="34" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
                  <text x="39" y="52" fill="#94A3B8" fontSize="7.5" fontWeight="bold" textAnchor="middle">BullMQ</text>
                  <text x="39" y="64" fill="#F59E0B" fontSize="7" fontWeight="bold" textAnchor="middle">Job Queue</text>

                  <line x1="70" y1="55" x2="108" y2="55" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />

                  <rect x="108" y="15" width="28" height="80" rx="4" fill="#1E293B" stroke="#EF4444" strokeWidth="1.5" />
                  <text x="122" y="52" fill="#F87171" fontSize="7" fontWeight="900" textAnchor="middle" transform="rotate(-90 122 52)">SECCOMP</text>

                  <line x1="136" y1="55" x2="168" y2="55" stroke="#10B981" strokeWidth="2" />

                  <rect x="168" y="15" width="144" height="80" rx="8" fill="#0F172A" stroke="#10B981" strokeWidth="1.8" />
                  <text x="240" y="32" fill="#34D399" fontSize="8" fontWeight="bold" textAnchor="middle">Isolated Container Jail</text>

                  <rect x="178" y="42" width="124" height="14" rx="3" fill="#1E293B" />
                  <rect x="178" y="42" width="75" height="14" rx="3" fill="#2563EB" />
                  <text x="240" y="52" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" textAnchor="middle">RAM: 64MB (42MB used)</text>

                  <rect x="178" y="62" width="124" height="14" rx="3" fill="#1E293B" />
                  <rect x="178" y="62" width="98" height="14" rx="3" fill="#10B981" />
                  <text x="240" y="72" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" textAnchor="middle">CPU Quota: 1 Core (0.2s)</text>
                </svg>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>COLD START</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#4ADE80', fontWeight: 900 }}>45ms</Typography>
                </Box>
                <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>CONTAINMENT</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 900 }}>100% Isolated</Typography>
                </Box>
                <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>SYSCALLS</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#FCD34D', fontWeight: 900 }}>Strict Whitelist</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {(safeIdx === 2 || safeIdx > 2) && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#818CF8', boxShadow: '0 0 8px #818CF8' }} />
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#C7D2FE', letterSpacing: '0.06em' }}>
                    AST SYNTAX GRAPH NEURAL INFERENCE
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: '#A78BFA', bgcolor: 'rgba(167, 139, 250, 0.12)', px: 0.9, py: 0.2, borderRadius: '4px', border: '1px solid rgba(167, 139, 250, 0.25)' }}>
                  99.4% Accuracy
                </Typography>
              </Box>

              <Box sx={{ width: '100%', height: 140, position: 'relative', bgcolor: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', p: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100%" height="100%" viewBox="0 0 320 110" preserveAspectRatio="xMidYMid meet">
                  <circle cx="36" cy="55" r="18" fill="#1E293B" stroke="#6366F1" strokeWidth="1.5" />
                  <text x="36" y="58" fill="#A5B4FC" fontSize="7.5" fontWeight="bold" textAnchor="middle">AST Tree</text>

                  <line x1="54" y1="55" x2="105" y2="55" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="3 2" />

                  <rect x="105" y="30" width="85" height="50" rx="6" fill="#1E293B" stroke="#818CF8" strokeWidth="1.5" />
                  <text x="147" y="52" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">Graph Embedder</text>
                  <text x="147" y="65" fill="#34D399" fontSize="7" fontWeight="bold" textAnchor="middle">Cosine Dist: 0.02</text>

                  <line x1="190" y1="55" x2="235" y2="55" stroke="#34D399" strokeWidth="2" />

                  <rect x="235" y="35" width="75" height="40" rx="6" fill="#064E3B" stroke="#10B981" strokeWidth="1.5" />
                  <text x="272" y="53" fill="#A7F3D0" fontSize="7.5" fontWeight="bold" textAnchor="middle">Verdict</text>
                  <text x="272" y="65" fill="#FFFFFF" fontSize="8" fontWeight="900" textAnchor="middle">100% Unique</text>
                </svg>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>PARSER</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#A5B4FC', fontWeight: 900 }}>Tree-sitter</Typography>
                </Box>
                <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>PRECISION</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 900 }}>99.4%</Typography>
                </Box>
                <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>EMBEDDINGS</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#FCD34D', fontWeight: 900 }}>512-Dim Vector</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
}
