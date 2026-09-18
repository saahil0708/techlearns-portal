'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Tooltip,
  Autocomplete,
  Chip,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import LocationCityRoundedIcon from '@mui/icons-material/LocationCityRounded';
import PinDropRoundedIcon from '@mui/icons-material/PinDropRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

import {
  INDIAN_STATES,
  INDIAN_STATES_CITIES,
  lookupPincode,
} from '@/data/indianLocations';

export interface NewInstitutionData {
  name: string;
  code: string;
  domain: string;
  state?: string;
  city?: string;
  pincode?: string;
  region: string;
  quota: number;
  tier: string;
  adminEmail: string;
}

export type NewCollegeData = NewInstitutionData;

interface CreateInstitutionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewInstitutionData) => void;
}

function generateInstitutionCode(name: string): string {
  if (!name.trim()) return '';

  // 1. If name contains parentheses like "Swami Vivekanand Institute (SVIET)"
  const parenMatch = name.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const candidate = parenMatch[1].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (candidate.length >= 2) return candidate;
  }

  // 2. Remove filler words and extract meaningful acronym
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 0 &&
        !['OF', 'AND', 'THE', 'FOR', 'IN', 'AT', 'DEPT', 'DEPARTMENT', 'COLLEGE', 'INSTITUTE', 'INSTITUTION', 'UNIVERSITY'].includes(
          w.toUpperCase()
        )
    );

  if (words.length === 0) {
    const allWords = name.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    return allWords.map((w) => w[0]).join('').toUpperCase().slice(0, 6);
  }

  if (words.length === 1) {
    return words[0].slice(0, 8).toUpperCase();
  }

  const acronym = words.map((w) => w[0]).join('').toUpperCase();
  if (acronym.length >= 2 && acronym.length <= 8) {
    return acronym;
  }

  return words.slice(0, 4).map((w) => w[0]).join('').toUpperCase();
}

export default function CreateInstitutionModal({ open, onClose, onSubmit }: CreateInstitutionModalProps) {
  const [formData, setFormData] = useState<NewInstitutionData>({
    name: '',
    code: '',
    domain: '',
    state: '',
    city: '',
    pincode: '',
    region: 'Asia-Pacific',
    quota: 2500,
    tier: 'Enterprise Tier',
    adminEmail: '',
  });

  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [detectedPlaces, setDetectedPlaces] = useState<string[]>([]);
  const [isDetectingPin, setIsDetectingPin] = useState(false);
  const [detectedLocationInfo, setDetectedLocationInfo] = useState<string | null>(null);
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);

  const pincodeLookupSeq = useRef(0);

  const handleNameChange = (nameVal: string) => {
    setFormData((prev) => {
      const updated = { ...prev, name: nameVal };
      if (!codeManuallyEdited) {
        updated.code = generateInstitutionCode(nameVal);
      }
      return updated;
    });
  };

  const handlePincodeChange = async (pinVal: string) => {
    const sanitized = pinVal.replace(/\D/g, '').slice(0, 6);
    setPincode(sanitized);

    if (sanitized.length === 6) {
      const currentSeq = ++pincodeLookupSeq.current;
      setIsDetectingPin(true);
      try {
        const detected = await lookupPincode(sanitized);
        if (pincodeLookupSeq.current !== currentSeq) return;

        if (detected) {
          setSelectedState(detected.state);
          setSelectedCity(detected.city);
          setDetectedPlaces(detected.places && detected.places.length > 0 ? detected.places : [detected.city]);
          if (detected.district && detected.district.toLowerCase() !== detected.city.toLowerCase()) {
            setDetectedLocationInfo(`Auto-detected: ${detected.city}, ${detected.district} Dist. (${detected.state})`);
          } else {
            setDetectedLocationInfo(`Auto-detected: ${detected.city}, ${detected.state}`);
          }
        } else {
          setSelectedState('');
          setSelectedCity('');
          setDetectedPlaces([]);
          setDetectedLocationInfo(null);
        }
      } catch {
        if (pincodeLookupSeq.current !== currentSeq) return;
        setSelectedState('');
        setSelectedCity('');
        setDetectedPlaces([]);
        setDetectedLocationInfo(null);
      } finally {
        if (pincodeLookupSeq.current === currentSeq) {
          setIsDetectingPin(false);
        }
      }
    } else {
      pincodeLookupSeq.current++;
      setIsDetectingPin(false);
      if (detectedLocationInfo) {
        setDetectedPlaces([]);
        setDetectedLocationInfo(null);
      }
    }
  };

  const handleAutoGenerateCode = () => {
    const generated = generateInstitutionCode(formData.name);
    setFormData((prev) => ({ ...prev, code: generated }));
    setCodeManuallyEdited(false);
  };

  const handleChange = (field: keyof NewInstitutionData, value: string | number) => {
    if (field === 'code') {
      setCodeManuallyEdited(true);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const cityOptions = useMemo(() => {
    const stateCities = selectedState && INDIAN_STATES_CITIES[selectedState] ? INDIAN_STATES_CITIES[selectedState] : [];
    const combined = Array.from(new Set([...detectedPlaces, ...stateCities]));
    return combined;
  }, [selectedState, detectedPlaces]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    const locationFormatted = [selectedCity, selectedState, pincode ? `PIN: ${pincode}` : '']
      .filter(Boolean)
      .join(', ');

    onSubmit({
      ...formData,
      state: selectedState,
      city: selectedCity,
      pincode: pincode,
      region: locationFormatted || formData.region || 'Asia-Pacific',
    });
    onClose();
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      bgcolor: '#F8FAFC',
      borderRadius: '10px',
      color: '#0F172A',
      fontSize: '0.88rem',
      '& fieldset': { borderColor: '#E2E8F0' },
      '&:hover fieldset': { borderColor: '#CBD5E1' },
      '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': {
      color: '#64748B',
      fontSize: '0.88rem',
      '&.Mui-focused': { color: '#2563EB', fontWeight: 600 },
    },
    '& .MuiFormHelperText-root': {
      fontSize: '0.74rem',
      color: '#64748B',
      mt: 0.5,
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
            color: '#0F172A',
            p: 0.5,
            maxHeight: '92vh',
          },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              flexShrink: 0,
            }}
          >
            <AccountBalanceRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1.22rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Onboard New Institution
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
              Create an isolated organization tenant with automated PIN code location detection
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: '#64748B', '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' } }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, pt: 1, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
          
          {/* Section 1: Institution Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {/* Institution Full Name */}
            <TextField
              fullWidth
              label="Institution Full Name *"
              placeholder="e.g. Swami Vivekanand Institute of Engineering & Technology (SVIET)"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              helperText="Official university or college name (Unique code is auto-generated as you type)"
              sx={inputStyle}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Unique Join Code & Domain Whitelist */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Institution Unique Code *"
                placeholder="e.g. SVIET"
                required
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase().replace(/\s+/g, '-'))}
                helperText="Students use this code to join this institution"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CodeRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Auto-generate code from name" arrow>
                          <IconButton
                            size="small"
                            onClick={handleAutoGenerateCode}
                            disabled={!formData.name.trim()}
                            sx={{
                              color: '#2563EB',
                              p: 0.5,
                              bgcolor: '#EFF6FF',
                              '&:hover': { bgcolor: '#DBEAFE' },
                            }}
                          >
                            <AutoFixHighRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={inputStyle}
              />

              <TextField
                label="Email Domain (Optional)"
                placeholder="e.g. sviet.ac.in"
                value={formData.domain}
                onChange={(e) => handleChange('domain', e.target.value.toLowerCase().trim())}
                helperText="Optional: Leave blank for all emails (Gmail, etc.)"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LanguageRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={inputStyle}
              />
            </Box>
          </Box>

          {/* Section 2: Campus Location & PIN Code Auto-Detection */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1, borderTop: '1px dashed #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnRoundedIcon sx={{ fontSize: 16, color: '#2563EB' }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Location & PIN Code Auto-Detection
                </Typography>
              </Box>
              {detectedLocationInfo && (
                <Chip
                  icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important', color: '#16A34A !important' }} />}
                  label={detectedLocationInfo}
                  size="small"
                  sx={{
                    bgcolor: '#F0FDF4',
                    color: '#15803D',
                    border: '1px solid #BBF7D0',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    height: 22,
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.75 }}>
              {/* PIN Code Field with instant auto-detect */}
              <TextField
                label="PIN Code (Auto-Detect)"
                placeholder="e.g. 140401"
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                helperText={
                  isDetectingPin ? 'Detecting city & district...' : 'Type 6-digit PIN to auto-fill'
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PinDropRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {isDetectingPin && <CircularProgress size={16} sx={{ color: '#2563EB' }} />}
                      </InputAdornment>
                    ),
                  },
                }}
                sx={inputStyle}
              />

              {/* State Searchable Dropdown */}
              <Autocomplete
                options={INDIAN_STATES}
                value={selectedState || null}
                onChange={(_e, val) => {
                  const newState = val || '';
                  setSelectedState(newState);
                  setDetectedPlaces([]);
                  setDetectedLocationInfo(null);
                  if (newState && INDIAN_STATES_CITIES[newState]) {
                    if (selectedCity && !INDIAN_STATES_CITIES[newState].includes(selectedCity)) {
                      setSelectedCity('');
                    }
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="State / UT"
                    placeholder="Search State..."
                    helperText="Dropdown cum search list"
                    sx={inputStyle}
                    slotProps={{
                      ...params.slotProps,
                      input: {
                        ...params.slotProps.input,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <LocationOnRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                            </InputAdornment>
                            {params.slotProps.input.startAdornment}
                          </>
                        ),
                      },
                    }}
                  />
                )}
              />

              {/* City Searchable Dropdown & Free Text */}
              <Autocomplete
                freeSolo
                options={cityOptions}
                value={selectedCity}
                onInputChange={(_e, val) => {
                  setSelectedCity(val);
                }}
                onChange={(_e, val) => {
                  setSelectedCity(val || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="City / Campus"
                    placeholder={selectedState ? `Select or enter city...` : 'Enter or select city...'}
                    helperText={selectedState ? `Cities in ${selectedState}` : 'Auto-detected / custom city'}
                    sx={inputStyle}
                    slotProps={{
                      ...params.slotProps,
                      input: {
                        ...params.slotProps.input,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <LocationCityRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                            </InputAdornment>
                            {params.slotProps.input.startAdornment}
                          </>
                        ),
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Box>

          {/* Section 3: Administration & Quota */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1, borderTop: '1px dashed #E2E8F0' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1.5fr' }, gap: 2 }}>
              <TextField
                label="Student Seat Quota"
                type="number"
                value={formData.quota}
                onChange={(e) => handleChange('quota', Number(e.target.value))}
                helperText="Maximum allowed concurrent student accounts"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={inputStyle}
              />

              <TextField
                label="Primary Admin / Dean Email"
                type="email"
                placeholder="dean.cs@institution.edu"
                value={formData.adminEmail}
                onChange={(e) => handleChange('adminEmail', e.target.value)}
                helperText="Official administrative contact email for instant tenant invitation"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={inputStyle}
              />
            </Box>
          </Box>

          {/* Batch & Hierarchy Hint Callout */}
          <Box
            sx={{
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              p: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.25,
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 18, color: '#2563EB', mt: 0.15, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
              <strong>Hierarchical Batches:</strong> Once onboarded, you can create batches/cohorts (e.g., CSE-2026) under this institution. Each batch receives a unique sub-code for automatic student grouping.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            onClick={onClose}
            sx={{
              color: '#64748B',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              borderRadius: '8px',
              px: 2,
              '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disableElevation
            sx={{
              bgcolor: '#2563EB',
              backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              borderRadius: '10px',
              px: 3,
              py: 1,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': {
                bgcolor: '#1D4ED8',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
              },
            }}
          >
            Create Institution Tenant
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
