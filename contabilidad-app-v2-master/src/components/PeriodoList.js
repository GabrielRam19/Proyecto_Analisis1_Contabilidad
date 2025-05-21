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
  Box,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';

const PeriodoList = () => {
  const [periodos, setPeriodos] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/PERIODOS')
      .then(response => setPeriodos(response.data))
      .catch(error => console.error(error));
  }, []);

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/api/PERIODOS/${id}`)
      .then(() => setPeriodos(periodos.filter((periodo) => periodo.id_periodo !== id)))
      .catch(error => console.error(error));
  };

  // Función para obtener la descripción del periodo anterior dado su ID
  const obtenerDescripcionPeriodoAnterior = (idAnterior) => {
    const periodoAnterior = periodos.find(p => p.id_periodo === idAnterior);
    return periodoAnterior ? periodoAnterior.descripcion : '-';
  };

  return (
    <Box
      sx={{
        backgroundColor: '#121212',
        color: '#FFD700',
        minHeight: '80vh',
        p: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#FFD700' }}>
        Periodos Contables
      </Typography>

      <Button
        component={Link}
        to="/periodos/crear"
        variant="contained"
        sx={{
          mb: 2,
          backgroundColor: '#FFD700',
          color: '#121212',
          '&:hover': {
            backgroundColor: '#bfa31b',
          },
        }}
      >
        Crear Periodo
      </Button>

      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: '#1e1e1e',
          borderRadius: 2,
          boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {['Fecha Inicio', 'Fecha Fin', 'Descripción', 'Cerrado', 'Periodo Anterior', 'Acciones'].map((headCell) => (
                <TableCell
                  key={headCell}
                  sx={{ color: '#FFD700', fontWeight: 'bold', borderBottom: '1px solid #444' }}
                >
                  {headCell}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {periodos.map((periodo) => (
              <TableRow
                key={periodo.id_periodo}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: '#2c2c2c' },
                  '&:hover': { backgroundColor: '#3a3a3a' },
                }}
              >
                <TableCell sx={{ color: '#fff' }}>{periodo.fecha_inicio}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{periodo.fecha_fin}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{periodo.descripcion}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{periodo.estado ? 'Sí' : 'No'}</TableCell>
                <TableCell sx={{ color: '#fff' }}>
                  {periodo.id_periodo_anterior
                    ? obtenerDescripcionPeriodoAnterior(periodo.id_periodo_anterior)
                    : '-'}
                </TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/periodos/${periodo.id_periodo}`}
                    sx={{ color: '#FFD700' }}
                    aria-label="editar"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(periodo.id_periodo)}
                    sx={{ color: '#ff5555' }}
                    aria-label="eliminar"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PeriodoList;
