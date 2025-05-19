import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
  Button, Box, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BalanceSaldos = () => {
  const [balanceSaldos, setBalanceSaldos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/periodos')
      .then(res => setPeriodos(res.data))
      .catch(err => console.error(err));
  }, []);

  const handlePeriodoChange = (event) => {
  setPeriodoSeleccionado(event.target.value);
};

  const handleSubmit = (event) => {
  event.preventDefault();

  axios.post('http://localhost:5000/api/libroscontables/BalanceSaldos', {
    id_periodo: periodoSeleccionado
  })
    .then(response => setBalanceSaldos(response.data))
    .catch(error => console.error(error));
};

  const exportToExcel = () => {
    const dataWithNature = balanceSaldos.map(row => ({
        ...row,
        naturaleza: (row.saldo_Final || 0) >= 0 ? 'Deudor' : 'Acreedor'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataWithNature);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BalanceSaldos");
    XLSX.writeFile(workbook, "BalanceSaldos.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Balance de Saldos", 20, 10);
    doc.autoTable({
        head: [['CuentaId', 'Código', 'Nombre', 'Saldo inicial', 'Total Debe', 'Total Haber', 'Saldo final', 'Naturaleza']],
        body: balanceSaldos.map(row => [
            row.cuenta_Id,
            row.codigo,
            row.nombre,
            row.saldo_Inicial,
            row.total_Debe,
            row.total_Haber,
            row.saldo_Final,
            (row.saldo_Final || 0) >= 0 ? 'Deudor' : 'Acreedor'
        ])
    });
    doc.save("BalanceSaldos.pdf");
  };

  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 0
  });

  return (
    <TableContainer component={Paper} sx={{
      p: 3,
      bgcolor: '#121212',
      color: '#fff',
      borderRadius: 2,
      boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)',
    }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#FFD700', letterSpacing: 1 }}>
        Balance de Saldos
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>Seleccionar Periodo</Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="periodo-select-label" sx={{ color: '#FFD700' }}>Periodo</InputLabel>
          <Select
            labelId="periodo-select-label"
            value={periodoSeleccionado}
            onChange={handlePeriodoChange}
            sx={{
              color: '#fff',
              bgcolor: '#222',
              borderRadius: 1,
              '.MuiSvgIcon-root': { color: '#FFD700' }
            }}
          >
            {periodos.map(p => (
                          <MenuItem key={p.id_periodo} value={p.id_periodo}>
                            {`${p.descripcion} (${new Date(p.fecha_inicio).toLocaleDateString()} - ${new Date(p.fecha_fin).toLocaleDateString()})`}
                          </MenuItem>
                        ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" color="primary" sx={{
          backgroundColor: '#FFD700',
          color: '#121212',
          fontWeight: 'bold',
          '&:hover': { backgroundColor: '#e6c200' }
        }}>
          Buscar Datos
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Button onClick={exportToExcel} variant="contained" sx={{
          mr: 2,
          backgroundColor: '#FFD700',
          color: '#121212',
          fontWeight: 'bold',
          '&:hover': { backgroundColor: '#e6c200' }
        }}>
          Exportar a Excel
        </Button>
        <Button onClick={exportToPDF} variant="contained" sx={{
          backgroundColor: '#FFD700',
          color: '#121212',
          fontWeight: 'bold',
          '&:hover': { backgroundColor: '#e6c200' }
        }}>
          Exportar a PDF
        </Button>
      </Box>

      <Table sx={{ bgcolor: '#1E1E1E', borderRadius: 2 }} stickyHeader>
        <TableHead>
          <TableRow>
            {['Cuenta Id', 'Código', 'Nombre', 'Saldo inicial', 'Total Debe', 'Total Haber', 'Saldo final', 'Naturaleza'].map((headCell) => (
                <TableCell
                    key={headCell}
                    sx={{
                    backgroundColor: '#2e2e2e',
                    color: '#FFD700',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #444',
                    }}
                >
                    {headCell}
                </TableCell>
                ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {balanceSaldos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ color: '#aaa', fontStyle: 'italic' }}>
                No hay datos disponibles.
              </TableCell>
            </TableRow>
          ) : (
            balanceSaldos.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' },
                }}
              >
                <TableCell sx={{ color: '#fff' }}>{row.cuenta_Id}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{row.codigo}</TableCell>
                <TableCell sx={{ color: '#ddd' }}>{row.nombre}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{formatter.format(row.saldo_Inicial)}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{formatter.format(row.total_Debe)}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{formatter.format(row.total_Haber)}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{formatter.format(row.saldo_Final)}</TableCell>
                <TableCell sx={{ color: '#fff' }}>
                    {(row.saldo_Final || 0) >= 0 ? 'Deudor' : 'Acreedor'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BalanceSaldos;
