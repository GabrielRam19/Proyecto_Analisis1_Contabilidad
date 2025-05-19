import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Select from 'react-select';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Edit, Delete } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';

// Colores dorado y blanco para texto
const goldColor = '#D4AF37';
const whiteColor = '#FFFFFF';

// Fondo negro y grises
const bgDark = '#121212';  // casi negro
const bgGrayDark = '#1E1E1E'; // gris muy oscuro
const bgGray = '#2C2C2C'; // gris oscuro

const customStyles = {
    container: (provided) => ({
        ...provided,
        color: whiteColor,
        backgroundColor: bgGrayDark,
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: bgDark,
        borderColor: goldColor,
        color: whiteColor,
    }),
    singleValue: (provided) => ({
        ...provided,
        color: whiteColor,
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: bgGrayDark,
        color: whiteColor,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? goldColor : bgGrayDark,
        color: state.isFocused ? bgDark : whiteColor,
        cursor: 'pointer',
    }),
};

const CuentaList = () => {
    const [cuentas, setCuentas] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/CUENTAS')
            .then(response => setCuentas(response.data))
            .catch(error => console.error(error));
    }, []);

    const handleDelete = (id) => {
        axios.delete(`http://localhost:5000/api/cuentas/${id}`)
            .then(() => setCuentas(cuentas.filter(cuenta => cuenta.cuentA_ID !== id)))
            .catch(error => console.error(error));
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(cuentas);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CuentasContables");
        XLSX.writeFile(workbook, "cuentasContables.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setTextColor(goldColor);
        doc.setFontSize(18);
        doc.text("Cuentas Contables", 20, 10);
        doc.setTextColor(0, 0, 0);
        doc.autoTable({
            head: [['Código', 'Nombre', 'Tipo']],
            body: cuentas.map(row => [row.codigo, row.nombre, row.tipo]),
            styles: { fillColor: [44, 44, 44] },
            headStyles: { fillColor: [212, 175, 55], textColor: 0 },
        });
        doc.save("cuentasContables.pdf");
    };

    const [selectValue, setSelectValue] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!selectValue) return;
        axios.get(`http://localhost:5000/api/CUENTAS/tipoCuenta/${selectValue.value}`)
            .then(response => setCuentas(response.data))
            .catch(error => console.error(error));
    };

    return (
        <Paper sx={{ backgroundColor: bgDark, color: whiteColor, p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: goldColor, fontWeight: 'bold' }}>
                Cuentas Contables
            </Typography>

            <Button
                component={Link}
                to="/cuentas/crear"
                variant="contained"
                sx={{
                    mb: 2,
                    mr: 2,
                    backgroundColor: goldColor,
                    color: bgDark,
                    fontWeight: 'bold',
                    '&:hover': { backgroundColor: '#b38f1e' }
                }}
            >
                Crear Cuenta
            </Button>

            <Button
                onClick={exportToExcel}
                variant="contained"
                sx={{
                    mb: 2,
                    mr: 2,
                    backgroundColor: goldColor,
                    color: bgDark,
                    fontWeight: 'bold',
                    '&:hover': { backgroundColor: '#b38f1e' }
                }}
            >
                Exportar a Excel
            </Button>

            <Button
                onClick={exportToPDF}
                variant="contained"
                sx={{
                    mb: 2,
                    backgroundColor: goldColor,
                    color: bgDark,
                    fontWeight: 'bold',
                    '&:hover': { backgroundColor: '#b38f1e' }
                }}
            >
                Exportar a PDF
            </Button>

            <Typography variant="h6" sx={{ mt: 3, mb: 2, color: whiteColor }}>
                Seleccione un Tipo de Cuenta
            </Typography>

            <Container>
                <Row>
                    <Col xs={8} sm={6} md={4}>
                        <Select
                            options={[
                                { value: 'Activo', label: 'Activo' },
                                { value: 'Pasivo', label: 'Pasivo' },
                                { value: 'Capital', label: 'Capital' },
                                { value: 'Ingreso', label: 'Ingreso' },
                                { value: 'Gasto', label: 'Gasto' }
                            ]}
                            onChange={setSelectValue}
                            styles={customStyles}
                            placeholder="Seleccione tipo..."
                            isClearable
                        />
                    </Col>
                    <Col xs={4} sm={2} md={2}>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            sx={{
                                height: '100%',
                                backgroundColor: goldColor,
                                color: bgDark,
                                fontWeight: 'bold',
                                '&:hover': { backgroundColor: '#b38f1e' }
                            }}
                            disabled={!selectValue}
                        >
                            Buscar
                        </Button>
                    </Col>
                </Row>
            </Container>

            <TableContainer component={Paper} sx={{ mt: 3, backgroundColor: bgGrayDark }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: bgGray }}>
                            <TableCell sx={{ color: goldColor, fontWeight: 'bold' }}>Código</TableCell>
                            <TableCell sx={{ color: goldColor, fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ color: goldColor, fontWeight: 'bold' }}>Tipo</TableCell>
                            <TableCell sx={{ color: goldColor, fontWeight: 'bold' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cuentas.map((cuenta) => (
                            <TableRow key={cuenta.cuentA_ID} sx={{ '&:hover': { backgroundColor: bgGray } }}>
                                <TableCell sx={{ color: whiteColor }}>{cuenta.codigo}</TableCell>
                                <TableCell sx={{ color: whiteColor }}>{cuenta.nombre}</TableCell>
                                <TableCell sx={{ color: whiteColor }}>{cuenta.tipo}</TableCell>
                                <TableCell>
  <IconButton
    component={Link}
    to={`/asientos/${cuenta.cuentA_ID}`}
    sx={{ color: '#FFD700' }}
    aria-label="editar"
  >
    <Edit />
  </IconButton>
  <IconButton
    onClick={() => handleDelete(cuenta.cuentA_ID)}
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
        </Paper>
    );
};

export default CuentaList;
