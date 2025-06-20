import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, Button, Box, MenuItem, Select, InputLabel, FormControl, Alert, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
  const [periodoEstado, setPeriodoEstado] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/periodos')
      .then(response => setPeriodos(response.data))
      .catch(error => console.error('Error al cargar periodos:', error));
  }, []);

  const handleChangePeriodo = (event) => {
    const idPeriodo = event.target.value;
    setPeriodoSeleccionado(idPeriodo);
    const periodo = periodos.find(p => p.id_periodo === idPeriodo);
    if (periodo) {
      setPeriodoEstado(periodo.estado);
      setShowAlert(periodo.estado === false);
    } else {
      setPeriodoEstado(null);
      setShowAlert(false);
    }
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

  const formatDate = (fecha) => {
  const [year, month, day] = fecha.split('T')[0].split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-GT');
};

  const exportToExcel = () => {
    const flatData = libroMayor.flatMap(cuenta => [
      {
        Codigo: cuenta.codigo,
        Nombre: cuenta.nombre,
        CuentaPadre: cuenta.codigoCuentaPadre || '---',
        Nivel: cuenta.nivelJerarquia,
        Fecha: '',
        Descripcion: 'Saldo Inicial',
        Debe: '',
        Haber: '',
        Saldo: cuenta.saldoInicial
      },
      ...cuenta.movimientos.map(mov => ({
        Codigo: cuenta.codigo,
        Nombre: cuenta.nombre,
        CuentaPadre: cuenta.codigoCuentaPadre || '---',
        Nivel: cuenta.nivelJerarquia,
        Fecha: formatDate(mov.fecha),
        Descripcion: mov.descripcion,
        Debe: mov.debe,
        Haber: mov.haber,
        Saldo: mov.saldo,
      }))
    ]);

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
      const startY = doc.autoTable.previous?.finalY + 25 || 40;
      doc.setFontSize(14);
      doc.text(`${cuenta.codigo} - ${cuenta.nombre}`, 20, startY - 10);
      doc.setFontSize(10);
      doc.text(`Cuenta Padre: ${cuenta.codigoCuentaPadre || '---'} | Nivel Jerarquía: ${cuenta.nivelJerarquia}`, 20, startY);

      const bodyData = [
        ['--', '', '', cuenta.saldoInicial.toFixed(2)],
        ...cuenta.movimientos.map(mov => [
          formatDate(mov.fecha),
          mov.debe.toFixed(2),
          mov.haber.toFixed(2),
          mov.saldo.toFixed(2),
        ]),
      ];

      doc.autoTable({
        startY: startY + 5,
        head: [['Fecha', 'Debe', 'Haber', 'Saldo']],
        body: bodyData,
      });
    });

    doc.save('LibroMayor.pdf');
  };

  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
  });

  return (
    <TableContainer component={Paper} sx={{
      backgroundColor: negro,
      color: blanco,
      padding: 3,
      borderRadius: 2,
      boxShadow: '0 0 10px rgba(212,175,55,0.5)',
    }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: dorado, textAlign: 'center' }}>
        Libro Mayor
      </Typography>

      {showAlert && (
        <Alert severity="warning" action={
          <IconButton color="inherit" size="small" onClick={() => setShowAlert(false)}>
            <CloseIcon fontSize="inherit" />
          </IconButton>
        } sx={{ mb: 3 }}>
          Está mostrando un período abierto. Los valores mostrados no incluyen saldos del período anterior.
        </Alert>
      )}

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
                {`${p.descripcion} (${formatDate(p.fecha_inicio)} - ${formatDate(p.fecha_fin)})`}
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

      {libroMayor.map((cuenta) => (
        <Box key={cuenta.cuentaId} sx={{ mb: 5 }}>
          <Typography variant="h6" sx={{ color: dorado, mb: 0.5 }}>
            {cuenta.codigo} - {cuenta.nombre}
          </Typography>
          <Typography variant="body2" sx={{ color: blanco, mb: 1, fontStyle: 'italic' }}>
            Cuenta Padre: {cuenta.codigoCuentaPadre || '---'} | Nivel Jerarquía: {cuenta.nivelJerarquia}
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
              <TableRow sx={{ backgroundColor: '#333' }}>
                <TableCell sx={{ color: blanco, fontStyle: 'italic' }}>-- Saldo Inicial --</TableCell>
                <TableCell sx={{ color: blanco }}>-</TableCell>
                <TableCell sx={{ color: blanco }}>-</TableCell>
                <TableCell sx={{ color: blanco }}>{formatter.format(cuenta.saldoInicial)}</TableCell>
              </TableRow>

              {cuenta.movimientos.map((mov, i) => (
                <TableRow key={i}
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: grisOscuro }, '&:hover': { backgroundColor: '#3e3e3e' } }}>
                  <TableCell sx={{ color: blanco }}>{formatDate(mov.fecha)}</TableCell>
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
