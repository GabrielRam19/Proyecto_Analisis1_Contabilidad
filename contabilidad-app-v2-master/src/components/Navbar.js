import React, { useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  IconButton,
  AppBar,
  CssBaseline,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

// Importa tus componentes de contenido aquí:
import CuentaList from './CuentaList';
import CuentaForm from './CuentaForm';
import AsientoList from './AsientoList';
import AsientoForm from './AsientoForm';
import LibroDiario from './LibroDiario';
import LibroMayor from './LibroMayor';
import BalanceSaldos from './BalanceSaldos';
import EstadoResultados from './EstadoResultados';
import BalanceGeneral from './BalanceGeneral';
import EstadosFinancieros from './EstadosFinancieros';
import PeriodoForm from './PeriodoForm';
import PeriodoList from './PeriodoList';
import LandingPage from './LandingPage';
import Jerarquias from './Jerarquias';

const drawerWidth = 240;

const Navbar = () => {
  const [open, setOpen] = useState(true);

  const handleToggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#121212', minHeight: '100vh' }}>
      <CssBaseline />

      {/* AppBar superior con botón de menú */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1e1e1e',
          color: '#FFD700',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleToggleDrawer}
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap>
            Contabilidad
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer lateral */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#2c2c2c',
            color: '#FFD700',
          },
        }}
      >
        <Toolbar />
        <Divider sx={{ backgroundColor: '#444' }} />
        <List>
          {[
            { text: 'Periodos', path: '/periodos' },
            { text: 'Cuentas', path: '/cuentas' },
            { text: 'Jerarquias de cuentas', path: '/jerarquias'},
            { text: 'Asientos', path: '/asientos' },
            { text: 'Libro Diario', path: '/libro-diario'},
            { text: 'Libro Mayor', path: '/libro-mayor' },
            { text: 'Balance de Saldos', path: '/balance-saldos' },
            { text: 'Estado de Resultados', path: '/estado-resultados' },
            { text: 'Balance General', path: '/balance-general' },
            { text: 'Estados Financieros', path: '/estados-financieros' },
          ].map(({ text, path }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton component={Link} to={path} sx={{ color: '#FFD700' }}>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: open ? `${drawerWidth}px` : '0px',
          transition: 'margin-left 0.3s',
          backgroundColor: '#121212',
          minHeight: '100vh',
          color: '#fff',
        }}
      >
        <Toolbar />
        <Box sx={{ px: 0 }}>
          <Routes>
            <Route exact path="/" element={<LandingPage />} />
            <Route exact path="/periodos" element={<PeriodoList />} />
            <Route exact path="/jerarquias" element={<Jerarquias />} />
            <Route path="/periodos/crear" element={<PeriodoForm />} />
            <Route path="/periodos/:id" element={<PeriodoForm />} />
            <Route exact path="/cuentas" element={<CuentaList />} />
            <Route path="/cuentas/crear" element={<CuentaForm />} />
            <Route path="/cuentas/:id" element={<CuentaForm />} />
            <Route exact path="/asientos" element={<AsientoList />} />
            <Route path="/asientos/crear" element={<AsientoForm />} />
            <Route path="/asientos/:id" element={<AsientoForm />} />
            <Route path="/libro-diario" element={<LibroDiario />} />
            <Route path="/libro-mayor" element={<LibroMayor />} />
            <Route path="/balance-saldos" element={<BalanceSaldos />} />
            <Route path="/estado-resultados" element={<EstadoResultados />} />
            <Route path="/balance-general" element={<BalanceGeneral />} />
            <Route path="/estados-financieros" element={<EstadosFinancieros />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default Navbar;
