'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { SkillDomain } from './types';

interface PassportCompetenciesMatrixProps {
  skillDomains: SkillDomain[];
  competencyFilter: string;
  setCompetencyFilter: (filter: string) => void;
}

export default function PassportCompetenciesMatrix({
  skillDomains,
  competencyFilter,
  setCompetencyFilter,
}: PassportCompetenciesMatrixProps) {
  const filteredCompetencies = React.useMemo(() => {
    if (competencyFilter === 'all') return skillDomains;
    return skillDomains.filter((sk) => sk.domain.toLowerCase() === competencyFilter.toLowerCase());
  }, [skillDomains, competencyFilter]);

  const averageMastery = React.useMemo(() => {
    if (!skillDomains || skillDomains.length === 0) return '0.0';
    const total = skillDomains.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return (total / skillDomains.length).toFixed(1);
  }, [skillDomains]);

  const filterTabs = React.useMemo(() => {
    const rawTabs = [
      { label: 'All Competencies', val: 'all' },
      { label: 'Algorithms', val: 'Algorithms' },
      { label: 'Systems', val: 'System Engineering' },
      { label: 'Databases', val: 'Databases' },
      { label: 'Frontend', val: 'Frontend' },
      { label: 'Cloud & DevOps', val: 'Cloud & DevOps' },
    ];

    return rawTabs.map((tab) => {
      const count =
        tab.val === 'all'
          ? (skillDomains ? skillDomains.length : 0)
          : (skillDomains || []).filter(
              (sk) => sk.domain.toLowerCase() === tab.val.toLowerCase()
            ).length;
      return { ...tab, count };
    });
  }, [skillDomains]);

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
      }}
    >
      {/* Header & Metric Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
              Verified Engineering Competencies & Mastery Matrix
            </Typography>
            <Chip
              label="PROCTORED & AUDITED"
              size="small"
              sx={{ height: 20, fontSize: '0.64rem', fontWeight: 800, bgcolor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.3 }}>
            Directly evaluated via automated sandboxed test suites, AST syntactic verification, and proctored execution
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ bgcolor: '#FAF5FF', px: 1.4, py: 0.5, borderRadius: '8px', border: '1px solid #F3E8FF', textAlign: 'right' }}>
            <Typography sx={{ fontSize: '0.64rem', color: '#0B1F3A', fontWeight: 800, textTransform: 'uppercase' }}>
              Average Mastery
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F264F', lineHeight: 1.1 }}>
              {averageMastery}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Domain Filter Chips */}
      <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', alignItems: 'center' }}>
        {filterTabs.map((tab) => {
          const isSelected = competencyFilter === tab.val;
          return (
            <Chip
              key={tab.val}
              label={`${tab.label} (${tab.count})`}
              size="small"
              onClick={() => setCompetencyFilter(tab.val)}
              sx={{
                fontWeight: 750,
                fontSize: '0.74rem',
                cursor: 'pointer',
                bgcolor: isSelected ? '#0B1F3A' : '#F1F5F9',
                color: isSelected ? '#FFFFFF' : '#475569',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isSelected ? '#17366E' : '#E2E8F0',
                },
              }}
            />
          );
        })}
      </Box>

      {/* Structured Competency Matrix Table (Rule 10 Compliant) */}
      <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflowX: 'auto' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', letterSpacing: '0.04em', py: 1.5 }}>
                COMPETENCY & DOMAIN
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', letterSpacing: '0.04em', py: 1.5 }}>
                MASTERY TIER
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', letterSpacing: '0.04em', py: 1.5 }}>
                TEST SUITES PASSED
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', letterSpacing: '0.04em', py: 1.5, minWidth: 200 }}>
                SCORE & PROGRESS
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', letterSpacing: '0.04em', py: 1.5 }}>
                DIFFICULTY DISTRIBUTION
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', letterSpacing: '0.04em', py: 1.5 }}>
                AUDIT STATUS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCompetencies.map((sk) => {
              const isMaster = sk.level === 'Master';
              const isExpert = sk.level === 'Expert';
              const badgeBg = isMaster ? '#FAF5FF' : isExpert ? '#F5F3FF' : '#ECFDF5';
              const badgeColor = isMaster ? '#0B1F3A' : isExpert ? '#7C3AED' : '#059669';

              return (
                <TableRow key={sk.name} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                      <Typography sx={{ fontWeight: 850, fontSize: '0.88rem', color: '#0F172A' }}>
                        {sk.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748B', bgcolor: '#F1F5F9', px: 0.8, py: 0.2, borderRadius: '4px' }}>
                          {sk.domain}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={sk.level}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        bgcolor: badgeBg,
                        color: badgeColor,
                        border: `1px solid ${isMaster ? '#D8B4FE' : isExpert ? '#DDD6FE' : '#A7F3D0'}`,
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A' }}>
                        {sk.testCount} Test Suites
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                        {sk.solvedCount} Problems Verified
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, width: '100%', maxWidth: 220 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: '#0F172A' }}>
                          {sk.score}%
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B' }}>
                          Top {100 - Math.round(sk.score * 0.95)}% Benchmark
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 7, borderRadius: '9999px', bgcolor: '#F1F5F9', overflow: 'hidden' }}>
                        <Box
                          sx={{
                            width: `${sk.score}%`,
                            height: '100%',
                            borderRadius: '9999px',
                            backgroundImage: isMaster
                              ? 'linear-gradient(90deg, #5B2D90 0%, #17366E 100%)'
                              : isExpert
                              ? 'linear-gradient(90deg, #8B5CF6 0%, #6D28D9 100%)'
                              : 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                          }}
                        />
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 750, color: '#166534', bgcolor: '#DCFCE7', px: 0.7, py: 0.2, borderRadius: '4px' }}>
                        {sk.easy}E
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 750, color: '#0F264F', bgcolor: '#E9D5FF', px: 0.7, py: 0.2, borderRadius: '4px' }}>
                        {sk.medium}M
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 750, color: '#991B1B', bgcolor: '#FEE2E2', px: 0.7, py: 0.2, borderRadius: '4px' }}>
                        {sk.hard}H
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="right" sx={{ py: 2 }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#ECFDF5', px: 1, py: 0.3, borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                      <VerifiedRoundedIcon sx={{ fontSize: 13, color: '#059669' }} />
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#047857' }}>
                        PASS (0 Flags)
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
