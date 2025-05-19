import { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useParams, useNavigate } from "react-router-dom";
import Select from 'react-select';

const options = [
    { value: 'Activo', label: 'Activo' },
    { value: 'Pasivo', label: 'Pasivo' },
    { value: 'Capital', label: 'Capital' },
    { value: 'Ingreso', label: 'Ingreso' },
    { value: 'Gasto', label: 'Gasto' }
];

const customStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: '#121212', // muy oscuro casi negro
        borderColor: '#555', // gris medio para borde
        color: 'white',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: 'goldenrod', // texto dorado
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#1e1e1e', // gris oscuro para menú
        color: 'white',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#333' : '#1e1e1e',
        color: 'white',
        cursor: 'pointer',
    }),
};

const CuentaForm = () => {
    const [cuenta, setCuenta] = useState({ codigo: '', nombre: '', tipo: '' });
    const params = useParams();
    const navigate = useNavigate();
    const cuentA_ID = params.id;

    useEffect(() => {
        if (cuentA_ID) {
            axios.get(`http://localhost:5000/api/CUENTAS/${cuentA_ID}`)
                .then(response => setCuenta(response.data))
                .catch(error => console.error(error));
        }
    }, [cuentA_ID]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setCuenta({ ...cuenta, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (cuentA_ID) {
            axios.put(`http://localhost:5000/api/CUENTAS/${cuentA_ID}`, cuenta)
                .then(() => navigate('/cuentas'))
                .catch(error => console.error(error));
        } else {
            axios.post('http://localhost:5000/api/CUENTAS', cuenta)
                .then(() => navigate('/cuentas'))
                .catch(error => console.error(error));
        }
    };

    const getSelect = (val) => {
        setCuenta(prev => ({ ...prev, tipo: val.value }));
    };

    return (
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            mt: 3, 
            backgroundColor: '#121212', 
            p: 3, 
            borderRadius: 2, 
            color: 'white', 
            maxWidth: 600,
            mx: 'auto',
            boxShadow: '0 0 10px #333'
          }}
        >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                color: 'goldenrod', 
                fontWeight: 'bold' 
              }}
            >
              {cuentA_ID ? 'Editar Cuenta' : 'Crear Cuenta'}
            </Typography>
            <TextField
                label="Código"
                name="codigo"
                value={cuenta.codigo}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ style: { color: 'goldenrod' } }}
                sx={{
                    input: { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#555' },
                        '&:hover fieldset': { borderColor: 'goldenrod' },
                        '&.Mui-focused fieldset': { borderColor: 'goldenrod' },
                    }
                }}
            />
            <TextField
                label="Nombre"
                name="nombre"
                value={cuenta.nombre}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ style: { color: 'goldenrod' } }}
                sx={{
                    input: { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#555' },
                        '&:hover fieldset': { borderColor: 'goldenrod' },
                        '&.Mui-focused fieldset': { borderColor: 'goldenrod' },
                    }
                }}
            />
            <Box sx={{ mt: 2, mb: 2 }}>
                <Select
                    placeholder="Seleccione Tipo"
                    options={options}
                    onChange={getSelect}
                    styles={customStyles}
                    value={options.find(option => option.value === cuenta.tipo) || null}
                    isSearchable={false}
                />
            </Box>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ 
                mt: 2, 
                backgroundColor: 'goldenrod', 
                color: '#121212',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#c8a200' }
              }}
              fullWidth
            >
                {cuentA_ID ? 'Guardar Cambios' : 'Crear Cuenta'}
            </Button>
        </Box>
    );
};

export default CuentaForm;
