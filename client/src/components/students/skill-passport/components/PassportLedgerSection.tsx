'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Tabs,
  Tab,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Button,
} from '@mui/material';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  CapstoneProjectRecord,
  SolvedProblemRecord,
  AccreditedCourseRecord,
  ContestRecord,
} from './types';

export const formatTopPercentile = (percentile: number): string => {
  const top = 100 - percentile;
  if (top <= 0) return 'Top 0.1%';
  if (top < 1) {
    const formatted = parseFloat(top.toFixed(1));
    return `Top ${formatted > 0 ? formatted : '0.1'}%`;
  }
  return `Top ${Math.round(top)}%`;
};

interface PassportLedgerSectionProps {
  capstoneProjects: CapstoneProjectRecord[];
  solvedProblems: SolvedProblemRecord[];
  accreditedCourses: AccreditedCourseRecord[];
  contestHistory: ContestRecord[];
  onInspectCertificate: (course: AccreditedCourseRecord) => void;
}

export default function PassportLedgerSection({
  capstoneProjects,
  solvedProblems,
  accreditedCourses,
  contestHistory,
  onInspectCertificate,
}: PassportLedgerSectionProps) {
  const [activeLedgerTab, setActiveLedgerTab] = useState<'projects' | 'problems' | 'courses' | 'contests'>('projects');
  const [problemSearch, setProblemSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');

  const filteredProblems = useMemo(() => {
    return solvedProblems.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(problemSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(problemSearch.toLowerCase());
      const matchDiff = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
      return matchSearch && matchDiff;
    });
  }, [solvedProblems, problemSearch, difficultyFilter]);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '22px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
      }}
    >
      {/* Table Navigation Header */}
      <Box sx={{ px: 3, pt: 1.5, borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
        <Tabs
          value={activeLedgerTab}
          onChange={(_, val) => setActiveLedgerTab(val)}
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: '0.85rem',
              fontWeight: 800,
              textTransform: 'none',
              color: '#64748B',
              '&.Mui-selected': { color: '#2563EB' },
            },
          }}
        >
          <Tab icon={<AccountTreeRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={"Capstone Projects (" + capstoneProjects.length + ")"} value="projects" />
          <Tab icon={<CodeRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={"Solved Problems (" + solvedProblems.length + ")"} value="problems" />
          <Tab icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={"Accredited Courses (" + accreditedCourses.length + ")"} value="courses" />
          <Tab icon={<EmojiEventsRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={"Contest Records (" + contestHistory.length + ")"} value="contests" />
        </Tabs>
      </Box>

      {/* TAB 1: SOLVED PROBLEMS TABLE */}
      {activeLedgerTab === 'problems' && (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <Chip
                  key={diff}
                  label={diff === 'all' ? 'All Difficulties' : diff}
                  size="small"
                  onClick={() => setDifficultyFilter(diff)}
                  sx={{
                    fontWeight: 750,
                    fontSize: '0.74rem',
                    bgcolor: difficultyFilter === diff ? '#2563EB' : '#F1F5F9',
                    color: difficultyFilter === diff ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: difficultyFilter === diff ? '#1D4ED8' : '#E2E8F0' },
                  }}
                />
              ))}
            </Box>

            <TextField
              size="small"
              placeholder="Search problem title or code..."
              value={problemSearch}
              onChange={(e) => setProblemSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: '100%', sm: 280 }, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.82rem' } }}
            />
          </Box>

          <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflowX: 'auto' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>CODE & PROBLEM TITLE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>DIFFICULTY</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>TOPIC CATEGORY</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>LANGUAGE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>TESTS & BENCHMARK</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>SOLVED DATE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProblems.map((p) => (
                  <TableRow key={p.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem' }}>
                      {p.title}
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'monospace' }}>{p.code}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.difficulty}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          bgcolor: p.difficulty === 'Easy' ? '#F0FDF4' : p.difficulty === 'Medium' ? '#EFF6FF' : '#FEF2F2',
                          color: p.difficulty === 'Easy' ? '#16A34A' : p.difficulty === 'Medium' ? '#2563EB' : '#DC2626',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.8rem', fontWeight: 500 }}>{p.category}</TableCell>
                    <TableCell sx={{ color: '#1E293B', fontSize: '0.8rem', fontWeight: 700 }}>{p.language}</TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#059669', fontSize: '0.8rem', fontWeight: 800 }}>
                        {p.runtimeMs} ms ({formatTopPercentile(p.percentile)})
                      </Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '0.68rem' }}>
                        {p.testsPassed} Tests Passed
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>{p.solvedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TAB 2: ACCREDITED COURSES TABLE */}
      {activeLedgerTab === 'courses' && (
        <Box sx={{ p: 3 }}>
          <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '14px' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>COURSE TITLE & ID</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>INSTRUCTOR & DOMAIN</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>CURRICULUM LABS</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>GRADE / SCORE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>COMPLETED</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>CREDENTIAL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accreditedCourses.map((c) => (
                  <TableRow key={c.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem' }}>
                      {c.title}
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'monospace' }}>SERIAL: {c.code}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.8rem' }}>
                      {c.instructor}
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>{c.category}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#1E293B', fontSize: '0.8rem', fontWeight: 600 }}>{c.hours} Verified Hours</TableCell>
                    <TableCell sx={{ color: '#16A34A', fontWeight: 800, fontSize: '0.82rem' }}>{c.grade}</TableCell>
                    <TableCell sx={{ color: '#64748B', fontSize: '0.8rem' }}>{c.completedDate}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onInspectCertificate(c)}
                        sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.75rem', borderRadius: '8px', color: '#2563EB', borderColor: '#BFDBFE' }}
                      >
                        Inspect Certificate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TAB 3: CONTEST PERFORMANCE TABLE */}
      {activeLedgerTab === 'contests' && (
        <Box sx={{ p: 3 }}>
          <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '14px' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>CONTEST TITLE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>DIVISION</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>GLOBAL RANK</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>SCORE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>RATING DELTA</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>DATE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contestHistory.map((cnt) => (
                  <TableRow key={cnt.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem' }}>{cnt.title}</TableCell>
                    <TableCell>
                      <Chip label={cnt.division} size="small" sx={{ fontSize: '0.68rem', fontWeight: 800, bgcolor: '#FEF3C7', color: '#B45309' }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.82rem' }}>
                      #{cnt.rank} <span style={{ color: '#64748B', fontWeight: 500 }}>/ {cnt.totalParticipants}</span>
                      <Typography sx={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>{formatTopPercentile(cnt.percentile)}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#059669', fontWeight: 800, fontSize: '0.82rem' }}>{cnt.score} pts</TableCell>
                    <TableCell>
                      <Chip
                        label={cnt.ratingDelta > 0 ? `+${cnt.ratingDelta}` : `${cnt.ratingDelta}`}
                        size="small"
                        sx={{
                          bgcolor: cnt.ratingDelta > 0 ? '#ECFDF5' : cnt.ratingDelta < 0 ? '#FEF2F2' : '#F1F5F9',
                          color: cnt.ratingDelta > 0 ? '#16A34A' : cnt.ratingDelta < 0 ? '#DC2626' : '#64748B',
                          fontWeight: 800,
                          fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>{cnt.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TAB 4: CAPSTONE PROJECTS TABLE */}
      {activeLedgerTab === 'projects' && (
        <Box sx={{ p: 3 }}>
          <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '14px' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>PROJECT TITLE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>DOMAIN & SPECIALIZATION</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>TECH STACK</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>FACULTY AUDIT SCORE</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>COMPLETED</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {capstoneProjects.map((proj) => (
                  <TableRow key={proj.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem' }}>
                      {proj.title}
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Verified by: {proj.verifiedBy}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>{proj.domain}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {proj.stack.map((stk) => (
                          <Chip key={stk} label={stk} size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, bgcolor: '#F1F5F9', color: '#334155' }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#16A34A', fontWeight: 800, fontSize: '0.82rem' }}>{proj.evaluationScore}% (Pass with Distinction)</TableCell>
                    <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>{proj.completionDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Card>
  );
}
