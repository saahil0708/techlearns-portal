'use client';

import React from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { FaLinkedin } from 'react-icons/fa';
import QRCodeCanvas from './QRCodeCanvas';
import { AccreditedCourseRecord } from './types';

interface PassportModalsProps {
  qrModalOpen: boolean;
  onCloseQrModal: () => void;
  shareModalOpen: boolean;
  onCloseShareModal: () => void;
  selectedCert: AccreditedCourseRecord | null;
  onCloseCertModal: () => void;
  verificationUrl: string;
  studentName: string;
  institutionName: string;
  onCopyLink: () => void;
}

export default function PassportModals({
  qrModalOpen,
  onCloseQrModal,
  shareModalOpen,
  onCloseShareModal,
  selectedCert,
  onCloseCertModal,
  verificationUrl,
  studentName,
  institutionName,
  onCopyLink,
}: PassportModalsProps) {
  return (
    <>
      {/* QR Modal */}
      <Dialog
        open={qrModalOpen}
        onClose={onCloseQrModal}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 2, textAlign: 'center' } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0F172A' }}>
            Passport Verification QR
          </Typography>
          <IconButton size="small" aria-label="Close" onClick={onCloseQrModal}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <QRCodeCanvas url={verificationUrl} size={180} />
          </Box>
          <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
            Scan to inspect verified student credentials for <strong>{studentName}</strong>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 1.5 }}>
          <Button
            variant="contained"
            onClick={onCopyLink}
            startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, bgcolor: '#2563EB', fontSize: '0.82rem', px: 3 }}
          >
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Modal */}
      <Dialog
        open={shareModalOpen}
        onClose={onCloseShareModal}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 2 } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0F172A' }}>
            Share Skill Passport
          </Typography>
          <IconButton size="small" aria-label="Close" onClick={onCloseShareModal}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            value={verificationUrl}
            slotProps={{ input: { readOnly: true, sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={onCopyLink}
            startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '10px', bgcolor: '#2563EB', fontSize: '0.84rem' }}
          >
            Copy Verification Link
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FaLinkedin size={16} color="#0A66C2" />}
            onClick={() => {
              const url = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(verificationUrl);
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, borderColor: '#CBD5E1', color: '#0F172A', fontSize: '0.84rem' }}
          >
            Share to LinkedIn
          </Button>
        </DialogContent>
      </Dialog>

      {/* Certificate Modal */}
      <Dialog
        open={Boolean(selectedCert)}
        onClose={onCloseCertModal}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '22px', p: 2 } } }}
      >
        {selectedCert && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0F172A' }}>
                Official Course Credential
              </Typography>
              <IconButton size="small" aria-label="Close" onClick={onCloseCertModal}>
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ py: 1.5 }}>
              <Box sx={{ bgcolor: '#0F172A', color: '#FFFFFF', border: '1.5px solid #334155', borderRadius: '16px', p: 3.5, textAlign: 'center', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(37,99,235,0.2) 0%, transparent 60%)' }}>
                <WorkspacePremiumRoundedIcon sx={{ fontSize: 46, color: '#F59E0B', mb: 1.5 }} />
                <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  {selectedCert.title}
                </Typography>
                <Typography sx={{ fontSize: '0.84rem', color: '#93C5FD', mt: 0.6 }}>
                  Awarded to <strong>{studentName}</strong> ({institutionName})
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', mt: 0.4 }}>
                  Instructor: {selectedCert.instructor} · Verified Lab Hours: {selectedCert.hours} hrs
                </Typography>

                <Box sx={{ my: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography sx={{ fontSize: '0.74rem', color: '#6EE7B7', fontWeight: 800 }}>
                    GRADE ACHIEVED: {selectedCert.grade}
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#FDE68A', fontWeight: 700, mt: 0.5 }}>
                    ID: {selectedCert.certificateId} · Date: {selectedCert.completedDate}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-end', pb: 1, px: 3 }}>
              <Button
                variant="outlined"
                onClick={onCloseCertModal}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.8rem' }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
