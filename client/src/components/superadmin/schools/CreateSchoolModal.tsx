'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import NumbersRoundedIcon from '@mui/icons-material/NumbersRounded';
import DomainRoundedIcon from '@mui/icons-material/DomainRounded';

export interface NewSchoolData {
  name: string;
  code: string;
  domain: string;
  district: string;
  curriculum: string;
  grades: string;
  quota: number;
}

interface CreateSchoolModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: NewSchoolData) => void;
}

export default function CreateSchoolModal({ open, onClose, onCreate }: CreateSchoolModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [domain, setDomain] = useState('');
  const [district, setDistrict] = useState('New York City District 2');
  const [curriculum, setCurriculum] = useState('STEM Honors / AP');
  const [grades, setGrades] = useState('Grades 9–12');
  const [quota, setQuota] = useState(1500);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleNameChange = (val: string) => {
    setName(val);
    if (!code) {
      const generatedCode = val
        .split(' ')
        .filter((w) => w.length > 2)
        .map((w) => w[0].toUpperCase())
        .join('')
        .substring(0, 5);
      if (generatedCode) {
        setCode(`${generatedCode}-SCH`);
      }
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'School name is required';
    if (!code.trim()) errs.code = 'School code is required';
    if (quota <= 0) errs.quota = 'Student quota must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onCreate({
      name,
      code: code.toUpperCase(),
      domain: domain.trim() || `${code.toLowerCase().replace(/[^a-z0-9]/g, '')}.k12.edu`,
      district,
      curriculum,
      grades,
      quota: Number(quota),
    });
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setCode('');
    setDomain('');
    setDistrict('New York City District 2');
    setCurriculum('STEM Honors / AP');
    setGrades('Grades 9–12');
    setQuota(1500);
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            maxWidth: 540,
            width: '100%',
            p: 1.5,
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            bgcolor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SchoolRoundedIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
            Register New School
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
            Provision K-12 STEM academy tenant with isolated cohorts & coding labs
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3.5, pt: '28px !important', pb: 3 }}>
        {/* School Name */}
        <Box>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
            School / Academy Name *
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. Thomas Jefferson High School for Science & Tech"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SchoolRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                '& fieldset': { borderColor: '#E2E8F0' },
              },
            }}
          />
        </Box>

        {/* Code and Domain */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              School Code *
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. TJHSST-VA"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              error={Boolean(errors.code)}
              helperText={errors.code}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <NumbersRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  fontFamily: 'monospace',
                  '& fieldset': { borderColor: '#E2E8F0' },
                },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Email Domain
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. tjhsst.edu"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PublicRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  '& fieldset': { borderColor: '#E2E8F0' },
                },
              }}
            />
          </Box>
        </Box>

        {/* District & Curriculum */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              District / League
            </Typography>
            <Select
              fullWidth
              size="small"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              sx={{
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              }}
            >
              <MenuItem value="New York City District 2">New York City District 2</MenuItem>
              <MenuItem value="Fairfax County Public Schools">Fairfax County Public Schools</MenuItem>
              <MenuItem value="New England Prep League">New England Prep League</MenuItem>
              <MenuItem value="California Unified">California Unified</MenuItem>
              <MenuItem value="Central Board / International">Central Board / International</MenuItem>
              <MenuItem value="UK Independent Schools">UK Independent Schools</MenuItem>
            </Select>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Curriculum Track
            </Typography>
            <Select
              fullWidth
              size="small"
              value={curriculum}
              onChange={(e) => setCurriculum(e.target.value)}
              sx={{
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              }}
            >
              <MenuItem value="STEM Honors / AP">STEM Honors / AP</MenuItem>
              <MenuItem value="IB Diploma Programme">IB Diploma Programme</MenuItem>
              <MenuItem value="Advanced Placement (AP)">Advanced Placement (AP)</MenuItem>
              <MenuItem value="CBSE / Olympiad Track">CBSE / Olympiad Track</MenuItem>
              <MenuItem value="Cambridge A-Levels">Cambridge A-Levels</MenuItem>
            </Select>
          </Box>
        </Box>

        {/* Grades & Quota */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Grades Offered
            </Typography>
            <Select
              fullWidth
              size="small"
              value={grades}
              onChange={(e) => setGrades(e.target.value)}
              sx={{
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              }}
            >
              <MenuItem value="Grades 9–12">Grades 9–12 (High School)</MenuItem>
              <MenuItem value="Grades 6–12">Grades 6–12 (Middle + High)</MenuItem>
              <MenuItem value="Grades K–12">Grades K–12 (Full Academy)</MenuItem>
              <MenuItem value="Senior High (11–12)">Senior High (11–12)</MenuItem>
            </Select>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Student Seat Quota *
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              placeholder="1500"
              value={quota}
              onChange={(e) => setQuota(Number(e.target.value))}
              error={Boolean(errors.quota)}
              helperText={errors.quota}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <DomainRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  '& fieldset': { borderColor: '#E2E8F0' },
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          onClick={handleClose}
          sx={{
            textTransform: 'none',
            color: '#64748B',
            fontWeight: 600,
            borderRadius: '8px',
            px: 2,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: '#2563EB',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '8px',
            px: 2.75,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          Provision School Tenant
        </Button>
      </DialogActions>
    </Dialog>
  );
}
