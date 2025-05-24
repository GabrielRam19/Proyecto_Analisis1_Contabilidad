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
  InputLabel,
  Alert
} from '@mui/material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EstadoResultados = () => {
  const [estadoResultados, setEstadoResultados] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [IdPeriodo, setPeriodoId] = useState('');
  const [periodoEstado, setPeriodoEstado] = useState(true); // true = cerrado, false = abierto

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
    if (!IdPeriodo) {
      setEstadoResultados([]);
      setPeriodoEstado(true);
      return;
    }

    axios
      .post('http://localhost:5000/api/libroscontables/EstadoResultados', { id_periodo: IdPeriodo })
      .then(response => {
        // Suponiendo que la respuesta es un objeto con { estadoResultados: [], estadoPeriodo: true/false }
        // Pero según tu código anterior, recibes directamente un arreglo de cuentas
        // Entonces, para obtener el estado, debemos buscarlo en periodos o hacer otra llamada

        // Para simplificar, busquemos el periodo seleccionado en la lista periodos:
        const periodoSeleccionado = periodos.find(p => p.id_periodo === IdPeriodo);
        if (periodoSeleccionado) {
          setPeriodoEstado(periodoSeleccionado.estado);
        } else {
          setPeriodoEstado(true); // por defecto cerrado
        }

        const treeData = buildTree(response.data);
        setEstadoResultados(treeData);
      })
      .catch(error => console.error(error));
  }, [IdPeriodo, periodos]);

  // Construye el árbol padre-hijo sin indentación pero agrupado cerca
  const buildTree = (flatData) => {
    const map = new Map();
    flatData.forEach(item => map.set(item.codigo, {...item, children: []}));

    const tree = [];

    flatData.forEach(item => {
      if (item.codigoCuentaPadre && map.has(item.codigoCuentaPadre)) {
        map.get(item.codigoCuentaPadre).children.push(map.get(item.codigo));
      } else {
        tree.push(map.get(item.codigo));
      }
    });

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

  const parseDateWithoutTimezone = (fecha) => {
    const [year, month, day] = fecha.split('T')[0].split('-');
    return new Date(year, month - 1, day);
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

      {/* Alerta no intrusiva si el periodo no está cerrado */}
      {!periodoEstado && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Los resultados son preliminares porque el periodo seleccionado no está cerrado.
        </Alert>
      )}

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
              {`${p.descripcion} (${parseDateWithoutTimezone(p.fecha_inicio).toLocaleDateString()} - ${parseDateWithoutTimezone(p.fecha_fin).toLocaleDateString()})`}
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
