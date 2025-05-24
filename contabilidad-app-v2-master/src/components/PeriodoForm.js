import { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, MenuItem } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const PeriodoForm = () => {
  const [periodo, setPeriodo] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    descripcion: '',
    estado: false,
    id_periodo_anterior: ''
  });

  const [periodosCerrados, setPeriodosCerrados] = useState([]);

  const params = useParams();
  const navigate = useNavigate();
  const id_periodo = params.id;

  // Obtener periodo actual si estamos en modo edición
  useEffect(() => {
    if (id_periodo) {
      axios
        .get(`http://localhost:5000/api/PERIODOS/${id_periodo}`)
        .then((response) => setPeriodo(response.data))
        .catch((error) => console.error(error));
    }
  }, [id_periodo]);

  // Obtener lista de periodos cerrados si el estado actual es true
  useEffect(() => {
    if (periodo.estado === true || periodo.estado === 'true') {
      axios
        .get('http://localhost:5000/api/periodos?cerrado=true')
        .then((response) => setPeriodosCerrados(response.data))
        .catch((error) => console.error(error));
    }
  }, [periodo.estado]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    let newValue = value;
    if (name === 'estado') {
      newValue = value === 'true'; // convierte string a boolean
    } else if (type === 'checkbox') {
      newValue = checked;
    }

    setPeriodo((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

const handleSubmit = (event) => {
  event.preventDefault();

  const fechaInicioActual = new Date(periodo.fecha_inicio);

  // Convertir id_periodo_anterior: '' => null, string a int si tiene valor
  const idPeriodoAnteriorProcesado =
    periodo.id_periodo_anterior === '' || periodo.id_periodo_anterior === null
      ? null
      : parseInt(periodo.id_periodo_anterior);

  // Validación: No se puede seleccionar el mismo periodo como anterior
  if (
    idPeriodoAnteriorProcesado &&
    id_periodo &&
    idPeriodoAnteriorProcesado === parseInt(id_periodo)
  ) {
    alert('No puedes seleccionar el mismo periodo como periodo anterior.');
    return;
  }

  // Validación: el periodo anterior no puede tener fecha mayor o igual al actual
  if (idPeriodoAnteriorProcesado) {
    const periodoAnterior = periodosCerrados.find(
      (p) => parseInt(p.id_periodo) === idPeriodoAnteriorProcesado
    );

    if (periodoAnterior) {
      const fechaInicioAnterior = new Date(periodoAnterior.fecha_inicio);
      const fechaFinAnterior = new Date(periodoAnterior.fecha_fin);

      if (
        fechaInicioAnterior >= fechaInicioActual ||
        fechaFinAnterior >= fechaInicioActual
      ) {
        alert(
          'El periodo anterior no puede tener una fecha de inicio o fin mayor o igual al periodo actual.'
        );
        return;
      }
    }
  }

  // Construir objeto a enviar con el id_periodo_anterior procesado
  const periodoParaEnviar = {
    ...periodo,
    id_periodo_anterior: idPeriodoAnteriorProcesado,
  };

  // Enviar según si es creación o edición
  if (id_periodo) {
    axios
      .put(`http://localhost:5000/api/PERIODOS/${id_periodo}`, periodoParaEnviar)
      .then(() => navigate('/periodos'))
      .catch((error) => console.error(error));
  } else {
    axios
      .post('http://localhost:5000/api/PERIODOS', periodoParaEnviar)
      .then(() => navigate('/periodos'))
      .catch((error) => console.error(error));
  }
};

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        mt: 3,
        p: 4,
        borderRadius: 2,
        backgroundColor: '#121212',
        color: '#FFD700',
        maxWidth: 600,
        mx: 'auto',
        boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 'bold',
          color: '#FFD700',
          textAlign: 'center',
        }}
      >
        {id_periodo ? 'Editar Periodo' : 'Crear Periodo'}
      </Typography>

      <TextField
        label="Fecha de Inicio"
        name="fecha_inicio"
        type="date"
        value={periodo.fecha_inicio}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        InputLabelProps={{ shrink: true, sx: { color: '#FFD700' } }}
        sx={{
          input: { color: '#fff' },
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
          mb: 2,
        }}
      />

      <TextField
        label="Fecha de Fin"
        name="fecha_fin"
        type="date"
        value={periodo.fecha_fin}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        InputLabelProps={{ shrink: true, sx: { color: '#FFD700' } }}
        sx={{
          input: { color: '#fff' },
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
          mb: 2,
        }}
      />

      <TextField
        label="Descripción"
        name="descripcion"
        value={periodo.descripcion}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        InputLabelProps={{ sx: { color: '#FFD700' } }}
        sx={{
          input: { color: '#fff' },
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
          mb: 2,
        }}
      />

      <TextField
        label="Cerrado"
        name="estado"
        select
        value={String(periodo.estado)}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ sx: { color: '#FFD700' } }}
        sx={{
          color: '#fff',
          '& .MuiSelect-select': {
            color: '#fff',
            backgroundColor: '#222',
            padding: '10px',
            borderRadius: 1,
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
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: '#222',
              color: '#FFD700',
              '& .MuiMenuItem-root:hover': {
                backgroundColor: '#444',
              },
              '&.Mui-selected': {
                backgroundColor: '#555',
                '&:hover': {
                  backgroundColor: '#666',
                },
              },
            },
          },
        }}
      >
        <MenuItem value="false">No</MenuItem>
        <MenuItem value="true">Sí</MenuItem>
      </TextField>

      {periodo.estado === true || periodo.estado === 'true' ? (
        <TextField
          label="Periodo Anterior Cerrado"
          name="id_periodo_anterior"
          select
          value={periodo.id_periodo_anterior || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ sx: { color: '#FFD700' } }}
          sx={{
            color: '#fff',
            '& .MuiSelect-select': {
              color: '#fff',
              backgroundColor: '#222',
              padding: '10px',
              borderRadius: 1,
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
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: '#222',
                color: '#FFD700',
                '& .MuiMenuItem-root:hover': {
                  backgroundColor: '#444',
                },
                '&.Mui-selected': {
                  backgroundColor: '#555',
                  '&:hover': {
                    backgroundColor: '#666',
                  },
                },
              },
            },
          }}
        >
          {periodosCerrados.map((p) => (
            <MenuItem key={p.id_periodo} value={p.id_periodo}>
              {p.descripcion} ({p.fecha_inicio} a {p.fecha_fin})
            </MenuItem>
          ))}
        </TextField>
      ) : null}

      <Button
        type="submit"
        variant="contained"
        sx={{
          backgroundColor: '#FFD700',
          color: '#121212',
          fontWeight: 'bold',
          '&:hover': {
            backgroundColor: '#bfa31b',
          },
          width: '100%',
          py: 1.5,
        }}
      >
        {id_periodo ? 'Guardar Cambios' : 'Crear Periodo'}
      </Button>
    </Box>
  );
};

export default PeriodoForm;
