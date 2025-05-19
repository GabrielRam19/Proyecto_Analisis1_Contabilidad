import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Box,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';

const AsientoList = () => {
  const [asientos, setAsientos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/periodos')
      .then(res => setPeriodos(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!periodoSeleccionado) {
      setAsientos([]);
      return;
    }
    axios.get(`http://localhost:5000/api/asientos/periodo/${periodoSeleccionado}`)
      .then(res => setAsientos(res.data))
      .catch(err => console.error(err));
  }, [periodoSeleccionado]);

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/api/asientos/${id}`)
      .then(() => setAsientos(asientos.filter(a => a.asientO_ID !== id)))
      .catch(error => console.error(error));
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        p: 3,
        bgcolor: '#121212',
        color: '#fff',
        borderRadius: 2,
        boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)', // sombra dorada suave
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: 'bold', color: '#FFD700', letterSpacing: 1 }}
      >
        Asientos Contables
      </Typography>

      <Box sx={{ mb: 3, maxWidth: 350 }}>
        <TextField
  label="Periodo Contable"
  select
  value={periodoSeleccionado}
  onChange={e => setPeriodoSeleccionado(e.target.value)}
  SelectProps={{
    native: true,
    displayEmpty: true,
    MenuProps: {
      PaperProps: {
        sx: {
          bgcolor: '#222',
          color: '#fff',
        },
      },
    },
    sx: {
      color: '#fff',
      backgroundColor: '#222',
    },
  }}
  fullWidth
  InputLabelProps={{
    shrink: true,
    sx: { color: '#FFD700', fontWeight: 'bold' },
  }}
  sx={{
  color: '#fff',
  '& select': {
    color: '#fff',
    backgroundColor: '#222',
  },
  '& option': {
    backgroundColor: '#222 !important',
    color: '#fff !important',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#555',
    },
    '&:hover fieldset': {
      borderColor: '#FFD700',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700',
    },
  },
  mb: 1.5,
}}
>
  <option value="">Seleccione un periodo</option>
  {periodos.map((periodo) => (
    <option key={periodo.id_periodo} value={periodo.id_periodo}>
      {periodo.descripcion} ({periodo.fecha_inicio} - {periodo.fecha_fin})
    </option>
  ))}
</TextField>
      </Box>

      <Button
        component={Link}
        to="/asientos/crear"
        variant="contained"
        sx={{
          mb: 3,
          backgroundColor: '#FFD700',
          color: '#121212',
          fontWeight: 'bold',
          '&:hover': {
            backgroundColor: '#e6c200',
          },
          '&:disabled': {
            backgroundColor: '#555',
            color: '#aaa',
            cursor: 'not-allowed',
          },
        }}
        disabled={!periodoSeleccionado}
      >
        Crear Asiento
      </Button>

      <Table sx={{ bgcolor: '#1E1E1E', borderRadius: 2 }} stickyHeader>
        <TableHead>
  <TableRow>
    <TableCell
      sx={{
        backgroundColor: '#2e2e2e',
        color: '#FFD700',
        fontWeight: 'bold',
        borderBottom: '1px solid #444',
      }}
    >
      Fecha
    </TableCell>
    <TableCell
      sx={{
        backgroundColor: '#2e2e2e',
        color: '#FFD700',
        fontWeight: 'bold',
        borderBottom: '1px solid #444',
      }}
    >
      Descripción
    </TableCell>
    <TableCell
      sx={{
        backgroundColor: '#2e2e2e',
        color: '#FFD700',
        fontWeight: 'bold',
        borderBottom: '1px solid #444',
      }}
    >
      Acciones
    </TableCell>
  </TableRow>
</TableHead>
        <TableBody>
          {asientos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ color: '#aaa', fontStyle: 'italic' }}>
                {periodoSeleccionado
                  ? 'No hay asientos para este periodo.'
                  : 'Seleccione un periodo para ver asientos.'}
              </TableCell>
            </TableRow>
          ) : (
            asientos.map(asiento => (
              <TableRow
                key={asiento.asientO_ID}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' },
                }}
              >
                <TableCell sx={{ color: '#fff' }}>{asiento.fecha}</TableCell>
                <TableCell sx={{ color: '#ddd' }}>{asiento.descripcion}</TableCell>
                <TableCell>
  <IconButton
    component={Link}
    to={`/asientos/${asiento.asientO_ID}`}
    sx={{ color: '#FFD700' }}
    aria-label="editar"
  >
    <Edit />
  </IconButton>
  <IconButton
    onClick={() => handleDelete(asiento.asientO_ID)}
    sx={{ color: '#ff5555' }}
    aria-label="eliminar"
  >
    <Delete />
  </IconButton>
</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AsientoList;
