'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from './index';

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
}
