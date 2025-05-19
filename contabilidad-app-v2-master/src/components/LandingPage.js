import React from 'react';
import { Typography, Paper } from '@mui/material';

const LandingPage = () => {
  return (
    <Paper
      elevation={3}
      sx={{
        backgroundColor: '#121212',
        color: '#FFD700',
        padding: 4,
        borderRadius: 2,
        textAlign: 'center',
        height: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
        Bienvenido al Sistema de Contabilidad
      </Typography>
      <Typography variant="h6" sx={{ color: '#CCCCCC' }}>
        Administra tus cuentas, genera reportes financieros y mantén el control contable de tu organización.
      </Typography>
    </Paper>
  );
};

export default LandingPage;
