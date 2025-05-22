import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  Box,
  FormControl,
  InputLabel
} from '@mui/material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EstadoResultados = () => {
  const [estadoResultados, setEstadoResultados] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [IdPeriodo, setPeriodoId] = useState('');

  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2
  });

  useEffect(() => {
    axios.get('http://localhost:5000/api/periodos')
      .then(res => setPeriodos(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!IdPeriodo) return;

    axios
      .post('http://localhost:5000/api/libroscontables/EstadoResultados', { id_periodo: IdPeriodo })
      .then(response => {
        const treeData = buildTree(response.data);
        setEstadoResultados(treeData);
      })
      .catch(error => console.error(error));
  }, [IdPeriodo]);

  // Construye el árbol padre-hijo sin indentación pero agrupado cerca
  const buildTree = (flatData) => {
    // Map de cuentas por código
    const map = new Map();
    flatData.forEach(item => map.set(item.codigo, {...item, children: []}));

    const tree = [];

    flatData.forEach(item => {
      if (item.codigoCuentaPadre && map.has(item.codigoCuentaPadre)) {
        // Si tiene padre, agregarlo a los hijos del padre
        map.get(item.codigoCuentaPadre).children.push(map.get(item.codigo));
      } else {
        // Si no tiene padre, es raíz
        tree.push(map.get(item.codigo));
      }
    });

    // Aplanar el árbol para renderizar sin indentación,
    // poniendo primero la cuenta padre y luego sus hijos
    const flatTree = [];
    const flatten = (nodes) => {
      nodes.forEach(n => {
        flatTree.push(n);
        if (n.children.length > 0) flatten(n.children);
      });
    };
    flatten(tree);

    return flatTree;
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(estadoResultados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'EstadoResultados');
    XLSX.writeFile(workbook, 'EstadoResultados.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setTextColor('#FFD700');
    doc.text('Estado de Resultados', 20, 10);
    doc.autoTable({
      head: [['Código', 'Código Padre', 'Nivel', 'Nombre', 'Resultado']],
      body: estadoResultados.map((row) => [
        row.codigo,
        row.codigoCuentaPadre || '-',
        row.nivelJerarquia != null ? row.nivelJerarquia : '-',
        row.nombre,
        formatter.format(row.resultado)
      ]),
      headStyles: { fillColor: [45, 45, 45], textColor: '#FFD700' },
      styles: { fillColor: [30, 30, 30], textColor: '#FFFFFF' }
    });
    doc.save('EstadoResultados.pdf');
  };

  const handlePeriodoChange = (event) => {
    setPeriodoId(event.target.value);
  };

  // Filtrar ingresos y gastos con el resultado ya procesado
  const ingresos = estadoResultados.filter((x) => x.resultado > 0);
  const gastos = estadoResultados.filter((x) => x.resultado < 0);

  const totalIngresos = ingresos.reduce((sum, x) => sum + x.resultado, 0);
  const totalGastos = gastos.reduce((sum, x) => sum + x.resultado, 0);
  const resultadoEjercicio = totalIngresos + totalGastos;

  return (
    <TableContainer
      component={Paper}
      sx={{
        p: 3,
        bgcolor: '#121212',
        color: '#fff',
        borderRadius: 2,
        boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)'
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#FFD700' }}>
        Estado de Resultados
      </Typography>

      {/* Select para elegir periodo */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel sx={{ color: '#FFD700' }}>Periodo</InputLabel>
        <Select
          value={IdPeriodo}
          label="Periodo"
          onChange={handlePeriodoChange}
          sx={{
            color: '#fff',
            bgcolor: '#222',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' }
          }}
        >
          {periodos.map((p) => (
            <MenuItem key={p.id_periodo} value={p.id_periodo}>
              {`${p.descripcion} (${new Date(p.fecha_inicio).toLocaleDateString()} - ${new Date(p.fecha_fin).toLocaleDateString()})`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Botones de exportación */}
      <Box sx={{ mb: 3 }}>
        <Button
          onClick={exportToExcel}
          variant="contained"
          sx={{ mr: 2, backgroundColor: '#FFD700', color: '#121212' }}
        >
          Exportar a Excel
        </Button>
        <Button
          onClick={exportToPDF}
          variant="contained"
          sx={{ backgroundColor: '#FFD700', color: '#121212' }}
        >
          Exportar a PDF
        </Button>
      </Box>

      {/* Tabla de ingresos */}
      <Typography variant="h6" sx={{ color: '#90ee90', mt: 2 }}>
        Ingresos
      </Typography>
      <Table size="small" sx={{ mb: 3 }}>
        <TableBody>
          {ingresos.map((row, i) => (
            <TableRow key={i}>
              <TableCell sx={{ color: '#fff' }}>{row.codigo}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{row.codigoCuentaPadre || '-'}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{row.nivelJerarquia != null ? row.nivelJerarquia : '-'}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{row.nombre}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{formatter.format(row.resultado)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={4} sx={{ color: '#FFD700', fontWeight: 'bold' }}>
              Total Ingresos
            </TableCell>
            <TableCell sx={{ color: '#FFD700', fontWeight: 'bold' }}>
              {formatter.format(totalIngresos)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Tabla de gastos */}
      <Typography variant="h6" sx={{ color: '#ff7373' }}>
        Gastos
      </Typography>
      <Table size="small" sx={{ mb: 3 }}>
        <TableBody>
          {gastos.map((row, i) => (
            <TableRow key={i}>
              <TableCell sx={{ color: '#fff' }}>{row.codigo}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{row.codigoCuentaPadre || '-'}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{row.nivelJerarquia != null ? row.nivelJerarquia : '-'}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{row.nombre}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{formatter.format(row.resultado)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={4} sx={{ color: '#FFD700', fontWeight: 'bold' }}>
              Total Gastos
            </TableCell>
            <TableCell sx={{ color: '#FFD700', fontWeight: 'bold' }}>
              {formatter.format(totalGastos)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Resultado final */}
      <Typography variant="h6" sx={{ mt: 3, color: '#FFD700', fontWeight: 'bold' }}>
        Resultado del Ejercicio: {formatter.format(resultadoEjercicio)}
      </Typography>
    </TableContainer>
  );
};

export default EstadoResultados;
