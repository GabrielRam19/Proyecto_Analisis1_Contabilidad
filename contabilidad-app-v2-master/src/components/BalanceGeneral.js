import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableRow,
    Paper, Typography, Button, TextField, Box, Grid, MenuItem
} from '@mui/material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BalanceGeneral = () => {
    const [balanceGeneral, setBalanceGeneral] = useState([]);
    const [periodoId, setPeriodoId] = useState('');
    const [periodos, setPeriodos] = useState([]);

    useEffect(() => {
        const fetchPeriodos = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/periodos');
                setPeriodos(res.data);
            } catch (err) {
                console.error("Error cargando periodos:", err);
            }
        };
        fetchPeriodos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/libroscontables/BalanceGeneral', {
                id_periodo: periodoId
            });
            setBalanceGeneral(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(balanceGeneral);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "BalanceGeneral");
        XLSX.writeFile(workbook, "BalanceGeneral.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setTextColor("#D4AF37");
        doc.text("Balance General", 20, 10);
        doc.autoTable({
            head: [['Código', 'Nombre', 'Debe', 'Haber', 'Saldo']],
            body: balanceGeneral.map(row => [row.codigo, row.nombre, row.total_debe, row.total_haber, row.saldo]),
            styles: { textColor: 0, fillColor: 230 },
            headStyles: { fillColor: [32, 32, 32], textColor: [212, 175, 55] },
        });
        doc.save("BalanceGeneral.pdf");
    };

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'GTQ',
        minimumFractionDigits: 2
    });

    const activos = balanceGeneral.filter(r => r.tipo === 'Activo');
    const pasivos = balanceGeneral.filter(r => r.tipo === 'Pasivo');
    const capitales = balanceGeneral.filter(r => r.tipo === 'Capital');

    const getTotal = (arr) => arr.reduce((sum, r) => sum + (r.saldo || 0), 0);

    const totalActivos = getTotal(activos);
    const totalPasivoCapital = getTotal([...pasivos, ...capitales]);
    const diferencia = totalActivos - totalPasivoCapital;

    return (
        <TableContainer
            component={Paper}
            sx={{
                backgroundColor: '#121212',
                color: '#fff',
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)'
            }}
        >
            <Typography variant="h5" sx={{ color: '#D4AF37', mb: 2 }}>
                Balance General
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
                <TextField
                    label="Periodo"
                    select
                    fullWidth
                    value={periodoId}
                    onChange={(e) => setPeriodoId(e.target.value)}
                    required
                    sx={{
                        '& label': { color: '#D4AF37' },
                        '& .MuiInputBase-input': { color: '#fff' },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#555' },
                            '&:hover fieldset': { borderColor: '#D4AF37' },
                            '&.Mui-focused fieldset': { borderColor: '#D4AF37' },
                        }
                    }}
                >
                    {periodos.map((p) => (
                        <MenuItem key={p.id_periodo} value={p.id_periodo}>
                            {`${p.descripcion} (${new Date(p.fecha_inicio).toLocaleDateString()} - ${new Date(p.fecha_fin).toLocaleDateString()})`}
                        </MenuItem>
                    ))}
                </TextField>
                <Button type="submit" variant="contained" sx={{ mt: 2, backgroundColor: '#D4AF37', color: '#121212' }}>
                    Buscar Balance
                </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Button onClick={exportToExcel} variant="contained" sx={{ mr: 2, backgroundColor: '#D4AF37', color: '#121212' }}>
                    Exportar a Excel
                </Button>
                <Button onClick={exportToPDF} variant="contained" sx={{ backgroundColor: '#D4AF37', color: '#121212' }}>
                    Exportar a PDF
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* ACTIVO */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ color: '#D4AF37' }}>Activo</Typography>
                    <Table size="small">
                        <TableBody>
                            {activos.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell sx={{ color: '#fff' }}>{row.codigo}</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>{row.nombre}</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>{formatter.format(row.saldo)}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell />
                                <TableCell sx={{ color: '#D4AF37', fontWeight: 'bold' }}>Total Activo</TableCell>
                                <TableCell sx={{ color: '#D4AF37', fontWeight: 'bold' }}>{formatter.format(totalActivos)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Grid>

                {/* PASIVO Y CAPITAL */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ color: '#D4AF37' }}>Pasivo y Capital</Typography>
                    <Table size="small">
                        <TableBody>
                            {[...pasivos, ...capitales].map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell sx={{ color: '#fff' }}>{row.codigo}</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>{row.nombre}</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>{formatter.format(row.saldo)}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell />
                                <TableCell sx={{ color: '#D4AF37', fontWeight: 'bold' }}>Total Pasivo y Capital</TableCell>
                                <TableCell sx={{ color: '#D4AF37', fontWeight: 'bold' }}>
                                    {formatter.format(totalPasivoCapital)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Grid>
            </Grid>

            {/* SECCIÓN DIFERENCIA (solo si hay resultados) */}
            {balanceGeneral.length > 0 && (
                <Box sx={{
                    mt: 4,
                    p: 2,
                    backgroundColor: diferencia === 0 ? '#1e4620' : '#4a1c1c',
                    borderRadius: 2,
                    textAlign: 'center'
                }}>
                    <Typography variant="h6" sx={{ color: '#D4AF37' }}>
                        {diferencia === 0
                            ? '✅ El balance cuadra perfectamente.'
                            : '⚠️ Diferencia en el balance'}
                    </Typography>
                    {diferencia !== 0 && (
                        <Typography variant="body1" sx={{ color: '#fff', mt: 1 }}>
                            Diferencia: {formatter.format(diferencia)}
                        </Typography>
                    )}
                </Box>
            )}
        </TableContainer>
    );
};

export default BalanceGeneral;
