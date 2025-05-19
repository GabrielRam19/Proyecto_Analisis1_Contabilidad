import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Box, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EstadosFinancieros = () => {
  const [estadosFinancieros, setEstadosFinancieros] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');

  // Cargar periodos al montar el componente
  useEffect(() => {
    axios.get('http://localhost:5000/api/periodos')
      .then(response => {
        setPeriodos(response.data);
        if (response.data.length > 0) {
          setPeriodoSeleccionado(response.data[0].periodo_id); // Selecciona el primero por defecto
          // Carga inicial de estados financieros para el primer periodo
          fetchEstadosFinancieros(response.data[0].periodo_id);
        }
      })
      .catch(error => console.error('Error cargando periodos:', error));
  }, []);

  // Función para llamar al endpoint con el periodo seleccionado
  const fetchEstadosFinancieros = (periodoId) => {
    axios.post('http://localhost:5000/api/libroscontables/EstadosFinancieros', {
      id_periodo: periodoId
    })
      .then(response => setEstadosFinancieros(response.data))
      .catch(error => console.error('Error cargando estados financieros:', error));
  };

  // Manejar cambio del select
  const handlePeriodoChange = (event) => {
    setPeriodoSeleccionado(event.target.value);
  };

  // Manejar submit del formulario
  const handleSubmit = (event) => {
    event.preventDefault();
    if (periodoSeleccionado) {
      fetchEstadosFinancieros(periodoSeleccionado);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(estadosFinancieros);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EstadosFinancieros");
    XLSX.writeFile(workbook, "EstadosFinancieros.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setTextColor("#D4AF37"); // Dorado
    doc.text("Estados Financieros", 20, 10);
    doc.autoTable({
      head: [['Tipo Estado', 'CuentaId', 'Código', 'Nombre', 'Total Debe', 'Total Haber', 'Saldo']],
      body: estadosFinancieros.map(row => [
        row.tipO_ESTADO,
        row.cuentA_ID,
        row.codigo,
        row.nombre,
        row.totaL_DEBE,
        row.totaL_HABER,
        row.saldo
      ])
    });
    doc.save("EstadosFinancieros.pdf");
  };

  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 0
  });

  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: '#121212', // negro muy oscuro
        color: '#FFFFFF',
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{ mt: 2, mb: 2, color: '#D4AF37', fontWeight: 'bold' }} // dorado
      >
        Estados Financieros
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: '#D4AF37' }} id="select-periodo-label">Seleccione un Periodo</InputLabel>
          <Select
            labelId="select-periodo-label"
            value={periodoSeleccionado}
            label="Seleccione un Periodo"
            onChange={handlePeriodoChange}
            sx={{
              color: '#FFFFFF',
              backgroundColor: '#333333',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D4AF37' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' },
            }}
            required
          >
            {periodos.map((p) => (
              <MenuItem key={p.id_periodo} value={p.id_periodo}>
                {`${p.descripcion} (${new Date(p.fecha_inicio).toLocaleDateString()} - ${new Date(p.fecha_fin).toLocaleDateString()})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: '#D4AF37',
            color: '#121212',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#FFD700' },
          }}
          fullWidth
        >
          Buscar Datos
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          onClick={exportToExcel}
          variant="contained"
          sx={{
            backgroundColor: '#D4AF37',
            color: '#121212',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#FFD700' },
            flex: 1
          }}
        >
          Exportar a Excel
        </Button>

        <Button
          onClick={exportToPDF}
          variant="contained"
          sx={{
            backgroundColor: '#D4AF37',
            color: '#121212',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#FFD700' },
            flex: 1
          }}
        >
          Exportar a PDF
        </Button>
      </Box>

      <Table sx={{ color: '#FFFFFF' }}>
        <TableHead sx={{ backgroundColor: '#333333' }}>
          <TableRow>
            <TableCell sx={{ color: '#D4AF37', fontWeight: 'bold' }}>Tipo Estado</TableCell>
            <TableCell sx={{ color: '#D4AF37', fontWeight: 'bold' }}>Cuenta Id</TableCell>
            <TableCell sx={{ color: '#D4AF37', fontWeight: 'bold' }}>Código</TableCell>
            <TableCell sx={{ color: '#D4AF37', fontWeight: 'bold' }}>Nombre</TableCell>
            <TableCell sx={{ color: '#D4AF37', fontWeight: 'bold' }}>Total Debe</TableCell>
            <TableCell sx={{ color: '#D4AF37', fontWeight: 'bold' }}>Total Haber</TableCell>
            <TableCell sx={{ color: '#D4AF37', fontWeight: 'bold' }}>Saldo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {estadosFinancieros.map((row, index) => (
            <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? '#222222' : '#121212' }}>
              <TableCell sx={{ color: '#FFFFFF' }}>{row.tipO_ESTADO}</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>{row.cuentA_ID}</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>{row.codigo}</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>{row.nombre}</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>{formatter.format(row.totaL_DEBE)}</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>{formatter.format(row.totaL_HABER)}</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>{formatter.format(row.saldo)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EstadosFinancieros;
