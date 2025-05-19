import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const baseURL = 'http://localhost:5000/api/JERARQUIAS';

const Estilos = {
  fondo: '#121212',
  fondoSec: '#1e1e1e',
  texto: '#f5f1e3', // blanco hueso
  dorado: '#cba135',
  boton: {
    backgroundColor: '#cba135',
    color: '#121212',
    '&:hover': {
      backgroundColor: '#a07e1f',
    },
  },
};

const Jerarquias = () => {
  const [jerarquias, setJerarquias] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id_jerarquia: 0,
    codigo_cuenta_padre: '',
    codigo_cuenta_hijo: '',
    nivel: '',
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Carga inicial
  useEffect(() => {
    fetchJerarquias();
  }, []);

  const fetchJerarquias = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(baseURL);
      setJerarquias(data);
    } catch (error) {
      console.error('Error al obtener jerarquías:', error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((old) => ({ ...old, [name]: value }));
  };

  const handleOpenDialog = (edit = false, jerarquia = null) => {
    if (edit && jerarquia) {
      setForm({
        id_jerarquia: jerarquia.id_jerarquia,
        codigo_cuenta_padre: jerarquia.codigo_cuenta_padre,
        codigo_cuenta_hijo: jerarquia.codigo_cuenta_hijo,
        nivel: jerarquia.nivel,
      });
      setIsEdit(true);
    } else {
      setForm({
        id_jerarquia: 0,
        codigo_cuenta_padre: '',
        codigo_cuenta_hijo: '',
        nivel: '',
      });
      setIsEdit(false);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await axios.put(`${baseURL}/${form.id_jerarquia}`, form);
      } else {
        await axios.post(baseURL, form);
      }
      fetchJerarquias();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar jerarquía:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta jerarquía?')) {
      try {
        await axios.delete(`${baseURL}/${id}`);
        fetchJerarquias();
      } catch (error) {
        console.error('Error al eliminar jerarquía:', error);
      }
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: Estilos.fondo,
        minHeight: '100vh',
        color: Estilos.texto,
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, color: Estilos.dorado, fontWeight: 'bold' }}>
        Gestión de Jerarquías
      </Typography>

      <Button
        variant="contained"
        sx={Estilos.boton}
        onClick={() => handleOpenDialog(false)}
      >
        Agregar Jerarquía
      </Button>

      <TableContainer
        component={Paper}
        sx={{
          mt: 3,
          backgroundColor: Estilos.fondoSec,
          color: Estilos.texto,
          boxShadow: '0 0 10px #000000',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#2e2e2e' }}>
              <TableCell sx={{ color: Estilos.dorado }}>ID</TableCell>
              <TableCell sx={{ color: Estilos.dorado }}>Código Padre</TableCell>
              <TableCell sx={{ color: Estilos.dorado }}>Código Hijo</TableCell>
              <TableCell sx={{ color: Estilos.dorado }}>Nivel</TableCell>
              <TableCell sx={{ color: Estilos.dorado }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: Estilos.texto }}>
                  Cargando...
                </TableCell>
              </TableRow>
            ) : jerarquias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: Estilos.texto }}>
                  No hay datos.
                </TableCell>
              </TableRow>
            ) : (
              jerarquias.map((jer) => (
                <TableRow key={jer.id_jerarquia} sx={{ '&:hover': { backgroundColor: '#333' } }}>
                  <TableCell sx={{ color: Estilos.texto }}>{jer.id_jerarquia}</TableCell>
                  <TableCell sx={{ color: Estilos.texto }}>{jer.codigo_cuenta_padre}</TableCell>
                  <TableCell sx={{ color: Estilos.texto }}>{jer.codigo_cuenta_hijo}</TableCell>
                  <TableCell sx={{ color: Estilos.texto }}>{jer.nivel}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleOpenDialog(true, jer)}
                      sx={{ color: Estilos.dorado }}
                      aria-label="editar"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(jer.id_jerarquia)}
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: Estilos.fondoSec, color: Estilos.dorado }}>
          {isEdit ? 'Editar Jerarquía' : 'Agregar Jerarquía'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: Estilos.fondo, color: Estilos.texto }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Código Cuenta Padre"
              name="codigo_cuenta_padre"
              value={form.codigo_cuenta_padre}
              onChange={handleChange}
              required
              sx={{
                input: { color: Estilos.texto },
                label: { color: Estilos.dorado },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: Estilos.dorado },
                  '&:hover fieldset': { borderColor: '#ffcc66' },
                  '&.Mui-focused fieldset': { borderColor: Estilos.dorado },
                },
              }}
            />
            <TextField
              label="Código Cuenta Hijo"
              name="codigo_cuenta_hijo"
              value={form.codigo_cuenta_hijo}
              onChange={handleChange}
              required
              sx={{
                input: { color: Estilos.texto },
                label: { color: Estilos.dorado },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: Estilos.dorado },
                  '&:hover fieldset': { borderColor: '#ffcc66' },
                  '&.Mui-focused fieldset': { borderColor: Estilos.dorado },
                },
              }}
            />
            <TextField
              label="Nivel"
              name="nivel"
              value={form.nivel}
              onChange={handleChange}
              type="number"
              inputProps={{ min: 0 }}
              required
              sx={{
                input: { color: Estilos.texto },
                label: { color: Estilos.dorado },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: Estilos.dorado },
                  '&:hover fieldset': { borderColor: '#ffcc66' },
                  '&.Mui-focused fieldset': { borderColor: Estilos.dorado },
                },
              }}
            />

            <DialogActions sx={{ px: 0 }}>
              <Button type="submit" sx={Estilos.boton} variant="contained">
                {isEdit ? 'Actualizar' : 'Agregar'}
              </Button>
              <Button onClick={handleCloseDialog} variant="outlined" sx={{ color: Estilos.dorado, borderColor: Estilos.dorado }}>
                Cancelar
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Jerarquias;
