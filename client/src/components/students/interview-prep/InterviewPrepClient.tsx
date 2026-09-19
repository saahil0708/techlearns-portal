'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

interface InterviewQuestion {
  id: string;
  title: string;
  company: string;
  category: 'Algorithms' | 'System Design' | 'Behavioral';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  frequencyPct: number;
  solvedStatus: boolean;
  slug: string;
}

const COMPANIES = ['All Companies', 'Google', 'Amazon', 'Meta', 'Microsoft', 'Uber'];

const QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q-1',
    title: 'Design In-Memory Distributed Cache with Eviction Policies (LRU/LFU)',
    company: 'Google',
    category: 'System Design',
    difficulty: 'Hard',
    frequencyPct: 96,
    solvedStatus: true,
    slug: 'design-cache',
  },
  {
    id: 'q-2',
    title: 'Median of Two Sorted Arrays in O(log(min(N,M)))',
    company: 'Amazon',
    category: 'Algorithms',
    difficulty: 'Hard',
    frequencyPct: 92,
    solvedStatus: false,
    slug: 'median-arrays',
  },
  {
    id: 'q-3',
    title: 'Tell me about a time you resolved a major production deadlock under pressure',
    company: 'Meta',
    category: 'Behavioral',
    difficulty: 'Medium',
    frequencyPct: 98,
    solvedStatus: true,
    slug: 'behavioral-deadlock',
  },
  {
    id: 'q-4',
    title: 'Serialize and Deserialize Binary Tree with Level-Order BFS',
    company: 'Microsoft',
    category: 'Algorithms',
    difficulty: 'Medium',
    frequencyPct: 88,
    solvedStatus: true,
    slug: 'serialize-tree',
  },
  {
    id: 'q-5',
    title: 'Design Geolocation Geospatial Indexing (Uber H3 / Quadtree)',
    company: 'Uber',
    category: 'System Design',
    difficulty: 'Hard',
    frequencyPct: 94,
    solvedStatus: false,
    slug: 'geospatial-index',
  },
];

export default function InterviewPrepClient() {
  const toast = useToast();
  const [selectedCompany, setSelectedCompany] = useState('All Companies');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [mockModalOpen, setMockModalOpen] = useState(false);
  const [mockType, setMockType] = useState<'DSA' | 'System Design' | 'Behavioral'>('DSA');

  const filtered = QUESTIONS.filter((q) => {
    const matchCompany = selectedCompany === 'All Companies' || q.company === selectedCompany;
    const matchCat = categoryFilter === 'ALL' || q.category === categoryFilter;
    const matchSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCompany && matchCat && matchSearch;
  });

  const handleStartMockInterview = () => {
    setMockModalOpen(false);
    toast.success(`Starting 45-Minute AI ${mockType} Mock Interview session!`, 'Simulator Launched');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* 1. Header Card */}
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
              <DescriptionOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem', lineHeight: 1.2 }}>
                FAANG & Tier-1 Interview Prep Hub
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.3 }}>
                Company curated question sets, AI mock video/voice simulator, and behavioral STAR drill bank
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => setMockModalOpen(true)}
            sx={{
              bgcolor: '#2563EB',
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.86rem',
              px: 2.5,
              py: 1,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Launch AI Mock Interview
          </Button>
        </Box>

        {/* Company Filter Pills */}
        <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
          {COMPANIES.map((comp) => (
            <Chip
              key={comp}
              label={comp}
              onClick={() => setSelectedCompany(comp)}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                borderRadius: '8px',
                bgcolor: selectedCompany === comp ? '#2563EB' : '#F1F5F9',
                color: selectedCompany === comp ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
                '&:hover': { bgcolor: selectedCompany === comp ? '#1D4ED8' : '#E2E8F0' },
              }}
            />
          ))}
        </Box>

        {/* Search */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search interview questions, design drills, algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flex: 1, minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '0.84rem' } }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            {['ALL', 'Algorithms', 'System Design', 'Behavioral'].map((cat) => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setCategoryFilter(cat)}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  borderRadius: '8px',
                  bgcolor: categoryFilter === cat ? '#0F172A' : '#FFFFFF',
                  color: categoryFilter === cat ? '#FFFFFF' : '#475569',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
        </Box>
      </Card>

      {/* 2. Structured Questions Table */}
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
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 2 }}>QUESTION / DRILL TITLE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>COMPANY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>TRACK</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>DIFFICULTY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>ASKED FREQUENCY</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>PRACTICE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((q) => (
                <TableRow key={q.id} hover sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                  <TableCell sx={{ py: 2.25 }}>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem', lineHeight: 1.3 }}>
                      {q.title}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip label={q.company} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.72rem', borderRadius: '6px' }} />
                  </TableCell>

                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.84rem' }}>
                    {q.category}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={q.difficulty}
                      size="small"
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        bgcolor: q.difficulty === 'Easy' ? '#ECFDF5' : q.difficulty === 'Medium' ? '#FEF3C7' : '#FEE2E2',
                        color: q.difficulty === 'Easy' ? '#059669' : q.difficulty === 'Medium' ? '#D97706' : '#DC2626',
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem' }}>
                      {q.frequencyPct}% Frequency
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Link href={`/problems/${q.slug}`} style={{ textDecoration: 'none' }}>
                      <Button
                        size="small"
                        variant={q.solvedStatus ? 'outlined' : 'contained'}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          bgcolor: q.solvedStatus ? 'transparent' : '#2563EB',
                        }}
                      >
                        {q.solvedStatus ? 'Review Solution' : 'Solve Drill'}
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 3. AI Mock Interview Launch Modal */}
      <Dialog
        open={mockModalOpen}
        onClose={() => setMockModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A' }}>
          Configure AI Mock Interview
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontSize: '0.84rem', color: '#64748B' }}>
            Choose an interview format to begin a 45-minute timed simulation with interactive code evaluation & AI speech feedback.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(['DSA', 'System Design', 'Behavioral'] as const).map((t) => (
              <Box
                key={t}
                onClick={() => setMockType(t)}
                sx={{
                  p: 1.75,
                  borderRadius: '12px',
                  border: `2px solid ${mockType === t ? '#2563EB' : '#E2E8F0'}`,
                  bgcolor: mockType === t ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                }}
              >
                {t === 'DSA' && <CodeRoundedIcon sx={{ color: '#2563EB' }} />}
                {t === 'System Design' && <AutoAwesomeRoundedIcon sx={{ color: '#8B5CF6' }} />}
                {t === 'Behavioral' && <MicRoundedIcon sx={{ color: '#EA580C' }} />}
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                    {t} Simulation
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                    {t === 'DSA' && 'Live coding with test runners and time complexity probing'}
                    {t === 'System Design' && 'Architecture whiteboard with high availability scaling questions'}
                    {t === 'Behavioral' && 'STAR format voice recording with clarity and impact score'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setMockModalOpen(false)} sx={{ textTransform: 'none', borderRadius: '10px' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleStartMockInterview} sx={{ bgcolor: '#2563EB', textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}>
            Start Simulation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
