import { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Grid } from '@mui/material';
import { useParams, useNavigate } from "react-router-dom";

const AsientoForm = () => {
  const [asiento, setAsiento] = useState({ fecha: '', descripcion: '', detalles: [], id_periodo: null });
  const [cuentas, setCuentas] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [detalle, setDetalle] = useState({ CUENTA_ID: 0, debe: 0, haber: 0 });
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const params = useParams();
  const navigate = useNavigate();
  const asientO_ID = params.id;

  useEffect(() => {
    axios.get('http://localhost:5000/api/CUENTAS')
      .then(response => setCuentas(response.data))
      .catch(error => console.error(error));

    axios.get('http://localhost:5000/api/PERIODOS')
      .then(response => setPeriodos(response.data))
      .catch(error => console.error(error));

    if (asientO_ID) {
      axios.get(`http://localhost:5000/api/asientos/${asientO_ID}`)
        .then(response => {
          setAsiento(response.data);
          if (response.data.id_periodo) {
            setPeriodoSeleccionado(response.data.id_periodo);
          }
        })
        .catch(error => console.error(error));
    }
  }, [asientO_ID]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAsiento({ ...asiento, [name]: value });
  };

  const handleDetalleChange = (event) => {
    const { name, value } = event.target;
    setDetalle((prevDetalle) => ({
      ...prevDetalle,
      [name]: name === "CUENTA_ID" ? Number(value) : parseFloat(value) || 0,
    }));
  };

  const addDetalle = () => {
    setAsiento({ ...asiento, detalles: [...asiento.detalles, detalle] });
    setDetalle({ CUENTA_ID: 0, debe: 0, haber: 0 });
  };

  const handleSubmit = (event) => {
event.preventDefault();

if (!periodoSeleccionado) {
alert('Debe seleccionar un periodo contable.');
return;
}

const periodo = periodos.find(p => p.id_periodo === parseInt(periodoSeleccionado));
if (!periodo) {
alert('Periodo no válido.');
return;
}

if (periodo.estado === true || periodo.estado === 1) {
alert('El periodo seleccionado ya está cerrado y no se pueden registrar asientos en él.');
return;
}

// Validar fecha dentro del rango
  const fechaAsiento = new Date(asiento.fecha);
  const fechaInicio = new Date(periodo.fecha_inicio);
  const fechaFin = new Date(periodo.fecha_fin);

  // Importante: fechaFin puede incluir hasta el final del día, para no excluir el mismo día
  fechaFin.setHours(23, 59, 59, 999);

  if (fechaAsiento < fechaInicio || fechaAsiento > fechaFin) {
    alert(`La fecha del asiento debe estar entre ${periodo.fecha_inicio} y ${periodo.fecha_fin}`);
    return;
  }

const asientoEnviar = { ...asiento, id_periodo: periodoSeleccionado };

if (asientO_ID) {
axios.put(`http://localhost:5000/api/asientos/${asientO_ID}`, asientoEnviar).then(() => navigate('/asientos'))
.catch(error => console.error(error));
} else {
axios.post('http://localhost:5000/api/asientos', asientoEnviar)
.then(() => navigate('/asientos'))
.catch(error => console.error(error));
}
};

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 3, p: 3, borderRadius: 2, backgroundColor: '#111', color: '#fff' }}
    >
      <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 'bold', mb: 2 }}>
        {asientO_ID ? 'Editar Asiento' : 'Crear Asiento'}
      </Typography>

      <TextField
        label="Fecha"
        name="fecha"
        type="date"
        value={asiento.fecha}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        InputLabelProps={{
          shrink: true,
          sx: { color: '#FFD700', fontWeight: 'bold' },
        }}
        sx={{
          '& input': {
            color: '#fff',
            backgroundColor: '#222',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#555' },
            '&:hover fieldset': { borderColor: '#FFD700' },
            '&.Mui-focused fieldset': { borderColor: '#FFD700' },
          },
          mb: 1.5,
        }}
      />

      <TextField
        label="Descripción"
        name="descripcion"
        value={asiento.descripcion}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        InputLabelProps={{
          sx: { color: '#FFD700', fontWeight: 'bold' },
        }}
        sx={{
          '& input': {
            color: '#fff',
            backgroundColor: '#222',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#555' },
            '&:hover fieldset': { borderColor: '#FFD700' },
            '&.Mui-focused fieldset': { borderColor: '#FFD700' },
          },
          mb: 1.5,
        }}
      />

      {/* Select Periodo Contable */}
      <TextField
        label="Periodo Contable"
        select
        value={periodoSeleccionado}
        onChange={e => setPeriodoSeleccionado(e.target.value)}
        SelectProps={{
          native: true,
          displayEmpty: true,
          MenuProps: {
            PaperProps: {
              sx: {
                bgcolor: '#222',
                color: '#fff',
              },
            },
          },
          sx: {
            color: '#fff',
            backgroundColor: '#222',
          },
        }}
        fullWidth
        InputLabelProps={{
          shrink: true,
          sx: { color: '#FFD700', fontWeight: 'bold' },
        }}
        sx={{
          color: '#fff',
          '& select': {
            color: '#fff',
            backgroundColor: '#222',
          },
          '& option': {
            backgroundColor: '#222 !important',
            color: '#fff !important',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#555',
            },
            '&:hover fieldset': {
              borderColor: '#FFD700',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FFD700',
            },
          },
          mb: 1.5,
        }}
      >
        <option value="">Seleccione un periodo</option>
        {periodos.map((periodo) => (
          <option key={periodo.id_periodo} value={periodo.id_periodo}>
            {periodo.descripcion} ({periodo.fecha_inicio} - {periodo.fecha_fin})
          </option>
        ))}
      </TextField>

      <Grid container spacing={2} sx={{ mt: 2, mb: 2 }}>
        <Grid item xs={4}>
          {/* Select Cuenta */}
          <TextField
            label="Cuenta"
            name="CUENTA_ID"
            select
            value={detalle.CUENTA_ID}
            onChange={handleDetalleChange}
            SelectProps={{
              native: true,
              MenuProps: {
                PaperProps: {
                  sx: { bgcolor: '#222', color: '#fff' },
                },
              },
              sx: { color: '#fff', backgroundColor: '#222' },
            }}
            fullWidth
            InputLabelProps={{
              sx: { color: '#FFD700', fontWeight: 'bold' },
            }}
            sx={{
              '& select': {
                color: '#fff',
                backgroundColor: '#222',
              },
              '& option': {
                backgroundColor: '#222 !important',
                color: '#fff !important',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#555' },
                '&:hover fieldset': { borderColor: '#FFD700' },
                '&.Mui-focused fieldset': { borderColor: '#FFD700' },
              },
            }}
          >
            <option value="">Seleccione una cuenta</option>
            {cuentas.map((cuenta) => (
              <option key={cuenta.cuentA_ID} value={cuenta.cuentA_ID}>
                {cuenta.codigo} - {cuenta.nombre}
              </option>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={4}>
          <TextField
            label="Debe"
            name="debe"
            type="number"
            value={detalle.debe}
            onChange={handleDetalleChange}
            fullWidth
            InputLabelProps={{ sx: { color: '#FFD700', fontWeight: 'bold' } }}
            sx={{
              '& input': {
                color: '#fff',
                backgroundColor: '#222',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#555' },
                '&:hover fieldset': { borderColor: '#FFD700' },
                '&.Mui-focused fieldset': { borderColor: '#FFD700' },
              },
            }}
          />
        </Grid>

        <Grid item xs={4}>
          <TextField
            label="Haber"
            name="haber"
            type="number"
            value={detalle.haber}
            onChange={handleDetalleChange}
            fullWidth
            InputLabelProps={{ sx: { color: '#FFD700', fontWeight: 'bold' } }}
            sx={{
              '& input': {
                color: '#fff',
                backgroundColor: '#222',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#555' },
                '&:hover fieldset': { borderColor: '#FFD700' },
                '&.Mui-focused fieldset': { borderColor: '#FFD700' },
              },
            }}
          />
        </Grid>
      </Grid>

      <Button
        onClick={addDetalle}
        variant="contained"
        sx={{
          bgcolor: '#FFD700',
          color: '#000',
          fontWeight: 'bold',
          '&:hover': { bgcolor: '#e6c200' }
        }}
      >
        Añadir Detalle
      </Button>

      <Button
        type="submit"
        variant="contained"
        sx={{
          bgcolor: '#FFD700',
          color: '#000',
          fontWeight: 'bold',
          ml: 2,
          mt: 2,
          '&:hover': { bgcolor: '#e6c200' }
        }}
      >
        {asientO_ID ? 'Guardar Cambios' : 'Crear Asiento'}
      </Button>
    </Box>
  );
};

export default AsientoForm;
