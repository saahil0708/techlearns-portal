'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
} from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import TipTapEditor from '@/components/shared/TipTapEditor';
import { formatArticleMarkdown } from '@/utils/markdown';

interface ReadingTheoryTabProps {
  readingContent: string;
  setReadingContent: (content: string) => void;
  editorMode: 'tiptap' | 'markdown';
  setEditorMode: (mode: 'tiptap' | 'markdown') => void;
  previewMarkdown: boolean;
  setPreviewMarkdown: (preview: boolean) => void;
  keyTakeaways: string[];
  setKeyTakeaways: (takeaways: string[]) => void;
  borderColor: string;
}

export function ReadingTheoryTab({
  readingContent,
  setReadingContent,
  editorMode,
  setEditorMode,
  previewMarkdown,
  setPreviewMarkdown,
  keyTakeaways,
  setKeyTakeaways,
  borderColor,
}: ReadingTheoryTabProps) {
  const handleAddTakeaway = () => {
    setKeyTakeaways([...keyTakeaways, '']);
  };

  const handleRemoveTakeaway = (index: number) => {
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
          Technical Lesson Notes & Special Callouts
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            onClick={() => setEditorMode(editorMode === 'tiptap' ? 'markdown' : 'tiptap')}
            startIcon={<EditNoteRoundedIcon />}
            sx={{
              fontSize: '0.78rem',
              textTransform: 'none',
              fontWeight: 700,
              color: '#475569',
              bgcolor: '#F1F5F9',
              borderRadius: '8px',
              px: 1.2,
              '&:hover': { bgcolor: '#E2E8F0' },
            }}
          >
            {editorMode === 'tiptap' ? 'Switch to Raw Markdown' : 'Switch to TipTap Visual Editor'}
          </Button>

          <Button
            size="small"
            onClick={() => setPreviewMarkdown(!previewMarkdown)}
            startIcon={previewMarkdown ? <EditNoteRoundedIcon /> : <VisibilityRoundedIcon />}
            sx={{
              fontSize: '0.78rem',
              textTransform: 'none',
              fontWeight: 700,
              color: '#2563EB',
              bgcolor: '#EFF6FF',
              borderRadius: '8px',
              px: 1.2,
            }}
          >
            {previewMarkdown ? 'Edit Content' : 'Live Preview'}
          </Button>
        </Box>
      </Box>

      {previewMarkdown ? (
        <Box
          sx={{
            minHeight: 280,
            maxHeight: 460,
            overflowY: 'auto',
            p: 2.5,
            borderRadius: '12px',
            bgcolor: '#FFFFFF',
            border: `1px solid ${borderColor}`,
            color: '#0F172A',
            fontSize: '0.94rem',
            lineHeight: 1.7,
          }}
          dangerouslySetInnerHTML={{
            __html: formatArticleMarkdown(readingContent) || '<em>(No content written yet)</em>',
          }}
        />
      ) : editorMode === 'tiptap' ? (
        <TipTapEditor
          content={readingContent}
          onChange={(html) => setReadingContent(html)}
          minHeight={260}
          maxHeight={440}
          placeholder="Start typing your technical lesson notes... Use 'Insert Special Note' for callouts with custom backgrounds."
        />
      ) : (
        <TextField
          fullWidth
          multiline
          rows={10}
          placeholder="## Technical Guide Title&#10;&#10;Write comprehensive lecture notes with markdown headings, lists, and code blocks...&#10;&#10;> [!NOTE]&#10;> Custom note background&#10;&#10;```python&#10;# Example&#10;def solution(): pass&#10;```"
          value={readingContent}
          onChange={(e) => setReadingContent(e.target.value)}
          slotProps={{
            input: {
              sx: {
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontFamily: 'monospace',
                bgcolor: '#F8FAFC',
                '& fieldset': { borderColor: borderColor },
                '&:hover fieldset': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset': { borderColor: '#2563EB' },
              },
            },
          }}
        />
      )}

      {/* Key Takeaways Section */}
      <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '14px', border: `1px solid ${borderColor}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
            Key Takeaways & High-Yield Bullet Highlights
          </Typography>
          <Button
            size="small"
            onClick={handleAddTakeaway}
            startIcon={<AddCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', color: '#2563EB' }}
          >
            Add Takeaway
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {keyTakeaways.map((note, nIdx) => (
            <Box key={nIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={`Takeaway bullet ${nIdx + 1}...`}
                value={note}
                onChange={(e) => {
                  const next = [...keyTakeaways];
                  next[nIdx] = e.target.value;
                  setKeyTakeaways(next);
                }}
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      bgcolor: '#FFFFFF',
                    },
                  },
                }}
              />
              <IconButton
                size="small"
                onClick={() => handleRemoveTakeaway(nIdx)}
                disabled={keyTakeaways.length <= 1}
                sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
