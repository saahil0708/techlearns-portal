'use client';

import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Card } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

interface CalendarWidgetProps {
  primaryBlue?: string;
}

export default function CalendarWidget({ primaryBlue = '#2563eb' }: CalendarWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const borderColor = '#E2E8F0';

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '24px',
        border: `1px solid ${borderColor}`,
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDate}
          onChange={(newVal) => setSelectedDate(newVal)}
          views={['day']}
          slotProps={{
            day: {
              sx: {
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                width: 34,
                height: 34,
                margin: '2px 3px',
                borderRadius: '50%',
                '&.MuiPickersDay-today': {
                  borderColor: '#2563EB',
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  color: '#2563EB',
                  fontWeight: 700,
                },
                '&.Mui-selected': {
                  bgcolor: '#2563EB !important',
                  color: '#FFFFFF !important',
                  fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
                  '&:hover': { bgcolor: '#1D4ED8 !important' },
                },
                '&.Mui-selected.MuiPickersDay-today': {
                  bgcolor: '#2563EB !important',
                  color: '#FFFFFF !important',
                  border: 'none !important',
                },
                '&:hover': {
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                },
              },
            },
          }}
          sx={{
            width: '100%',
            maxWidth: 310,
            height: 'auto',
            maxHeight: 'none',
            '& .MuiPickersCalendarHeader-root': {
              pl: 1.5,
              pr: 1.5,
              mt: 0.5,
              mb: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            '& .MuiPickersCalendarHeader-label': {
              color: '#0F172A',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '-0.02em',
            },
            '& .MuiPickersCalendarHeader-switchViewButton': {
              display: 'none',
            },
            '& .MuiPickersArrowSwitcher-root': {
              display: 'flex',
              gap: 0.5,
            },
            '& .MuiPickersArrowSwitcher-button': {
              color: '#64748B',
              p: 0.5,
              '& .MuiSvgIcon-root': { fontSize: 18 },
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            },
            '& .MuiDayCalendar-weekDayLabel': {
              color: '#94A3B8',
              fontWeight: 700,
              fontSize: '0.8rem',
              width: 34,
              height: 30,
              margin: '0 3px',
            },
            '& .MuiDayCalendar-header': {
              mt: 0,
              mb: 1,
            },
            '& .MuiPickersSlideTransition-root': {
              minHeight: 215,
              overflow: 'hidden !important',
            },
            '& .MuiDayCalendar-slideTransition': {
              overflow: 'hidden !important',
            },
            '& .MuiDayCalendar-monthContainer': {
              minHeight: 210,
              overflow: 'hidden !important',
            },
          }}
        />
      </LocalizationProvider>
    </Card>
  );
}

