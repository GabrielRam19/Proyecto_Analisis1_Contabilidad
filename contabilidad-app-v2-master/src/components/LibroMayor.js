import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, Button, Box, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const dorado = '#D4AF37';
const negro = '#121212';
const grisOscuro = '#1E1E1E';
const grisMedio = '#2E2E2E';
const blanco = '#FFFFFF';

const LibroMayor = () => {
  const [libroMayor, setLibroMayor] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');

  // Cargar los periodos al iniciar el componente
  useEffect(() => {
    axios.get('http://localhost:5000/api/periodos') // Ajusta esta URL según tu API de periodos
      .then(response => setPeriodos(response.data))
      .catch(error => console.error('Error al cargar periodos:', error));
  }, []);

  const handleChangePeriodo = (event) => {
    setPeriodoSeleccionado(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!periodoSeleccionado) return;

    axios.post('http://localhost:5000/api/libroscontables/LibroMayor', {
      id_periodo: periodoSeleccionado
    })
      .then(response => setLibroMayor(response.data))
      .catch(error => console.error('Error al obtener libro mayor:', error));
  };

  const exportToExcel = () => {
    const flatData = libroMayor.flatMap(cuenta =>
      cuenta.movimientos.map(mov => ({
        Codigo: cuenta.codigo,
        Nombre: cuenta.nombre,
        Fecha: mov.fecha,
        Descripcion: mov.descripcion,
        Debe: mov.debe,
        Haber: mov.haber,
        Saldo: mov.saldo,
      }))
    );
    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LibroMayor');
    XLSX.writeFile(workbook, 'LibroMayor.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setTextColor(dorado);
    doc.setFontSize(18);
    doc.text('Libro Mayor', 20, 20);
    doc.setTextColor(0, 0, 0);

    libroMayor.forEach((cuenta, index) => {
      doc.setFontSize(14);
      doc.text(`${cuenta.codigo} - ${cuenta.nombre}`, 20, doc.autoTable.previous?.finalY + 10 || 30);

      doc.autoTable({
        startY: doc.autoTable.previous?.finalY + 20 || 40,
        head: [['Fecha', 'Debe', 'Haber', 'Saldo']],
        body: cuenta.movimientos.map(mov =>
          [mov.fecha, mov.debe, mov.haber, mov.saldo]),
      });
    });

    doc.save('LibroMayor.pdf');
  };

  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 0,
  });

  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: negro,
        color: blanco,
        padding: 3,
        borderRadius: 2,
        boxShadow: '0 0 10px rgba(212,175,55,0.5)',
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: dorado, textAlign: 'center' }}>
        Libro Mayor
      </Typography>

      {/* Formulario para seleccionar periodo */}
      <Box component="form" onSubmit={handleSubmit}
        sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto' }}>

        <FormControl fullWidth>
          <InputLabel sx={{ color: dorado }}>Seleccione un período</InputLabel>
          <Select
            value={periodoSeleccionado}
            label="Seleccione un período"
            onChange={handleChangePeriodo}
            required
            sx={{
              color: blanco,
              backgroundColor: grisOscuro,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: dorado },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: dorado },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: dorado },
              '& .MuiSvgIcon-root': { color: dorado },
            }}
          >
            {periodos.map(p => (
              <MenuItem key={p.id_periodo} value={p.id_periodo}>
                {`${p.descripcion} (${new Date(p.fecha_inicio).toLocaleDateString()} - ${new Date(p.fecha_fin).toLocaleDateString()})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained"
          sx={{
            backgroundColor: dorado,
            color: negro,
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#b38b18' },
          }}>
          Buscar Datos
        </Button>
      </Box>

      {/* Botones de exportación */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button onClick={exportToExcel} variant="contained"
          sx={{ backgroundColor: dorado, color: negro, fontWeight: 'bold', '&:hover': { backgroundColor: '#b38b18' } }}>
          Exportar a Excel
        </Button>
        <Button onClick={exportToPDF} variant="contained"
          sx={{ backgroundColor: dorado, color: negro, fontWeight: 'bold', '&:hover': { backgroundColor: '#b38b18' } }}>
          Exportar a PDF
        </Button>
      </Box>

      {/* Visualización por cuenta */}
      {libroMayor.map((cuenta) => (
        <Box key={cuenta.cuentaId} sx={{ mb: 5 }}>
          <Typography variant="h6" sx={{ color: dorado, mb: 1 }}>
            {cuenta.codigo} - {cuenta.nombre}
          </Typography>
          <Table sx={{ backgroundColor: grisMedio }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: grisOscuro }}>
                {['Fecha', 'Debe', 'Haber', 'Saldo'].map((col) => (
                  <TableCell key={col} sx={{ color: dorado, fontWeight: 'bold' }}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cuenta.movimientos.map((mov, i) => (
                <TableRow key={i}
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: grisOscuro }, '&:hover': { backgroundColor: '#3e3e3e' } }}>
                  <TableCell sx={{ color: blanco }}>{mov.fecha}</TableCell>
                  <TableCell sx={{ color: blanco }}>{formatter.format(mov.debe)}</TableCell>
                  <TableCell sx={{ color: blanco }}>{formatter.format(mov.haber)}</TableCell>
                  <TableCell sx={{ color: blanco }}>{formatter.format(mov.saldo)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ))}
    </TableContainer>
  );
};

export default LibroMayor;
