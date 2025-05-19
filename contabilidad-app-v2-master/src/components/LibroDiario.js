import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";

export default function LibroDiario() {
  const [idPeriodo, setIdPeriodo] = useState("");
  const [periodos, setPeriodos] = useState([]);
  const [libroDiario, setLibroDiario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Obtener períodos al montar
  useEffect(() => {
    const fetchPeriodos = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/periodos");
        if (!res.ok) throw new Error("Error al cargar períodos");
        const data = await res.json();
        setPeriodos(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los períodos.");
      }
    };

    fetchPeriodos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idPeriodo) return;

    setLoading(true);
    setError("");
    setLibroDiario([]);

    try {
      const response = await fetch("http://localhost:5000/api/libroscontables/LibroDiario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_periodo: idPeriodo }),
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setLibroDiario(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalDebe = libroDiario.reduce(
    (acc, asiento) => acc + asiento.detalles.reduce((sum, d) => sum + d.debe, 0),
    0
  );
  const totalHaber = libroDiario.reduce(
    (acc, asiento) => acc + asiento.detalles.reduce((sum, d) => sum + d.haber, 0),
    0
  );
  const estaBalanceado = totalDebe === totalHaber;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        bgcolor: "#121212",
        color: "#fff",
        borderRadius: 2,
        boxShadow: "0 0 15px rgba(255, 215, 0, 0.3)",
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: "bold", color: "#FFD700", letterSpacing: 1 }}
      >
        Consulta Libro Diario
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
      >
        <TextField
  label="Periodo Contable"
  select
  value={idPeriodo}
  onChange={(e) => setIdPeriodo(e.target.value)}
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

        <Button
          type="submit"
          variant="contained"
          disabled={!idPeriodo}
          sx={{
            backgroundColor: "#FFD700",
            color: "#121212",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#e6c200",
            },
          }}
        >
          Consultar
        </Button>
      </Box>

      {loading && <CircularProgress sx={{ color: "#FFD700" }} />}
      {error && <Alert severity="error">{error}</Alert>}

      {libroDiario.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 4, color: "#FFD700", fontWeight: "bold" }}>
            Partida: {idPeriodo}
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 2, bgcolor: "#1E1E1E" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#FFD700", fontWeight: "bold", bgcolor: "#2e2e2e" }}>
                    Fecha
                  </TableCell>
                  <TableCell sx={{ color: "#FFD700", fontWeight: "bold", bgcolor: "#2e2e2e" }}>
                    Descripción
                  </TableCell>
                  <TableCell sx={{ color: "#FFD700", fontWeight: "bold", bgcolor: "#2e2e2e" }}>
                    Detalles
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {libroDiario.map((asiento) => (
                  <TableRow key={asiento.asientoId}>
                    <TableCell sx={{ color: "#fff" }}>
                      {new Date(asiento.fecha).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ color: "#ddd" }}>{asiento.descripcion}</TableCell>
                    <TableCell>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: "#FFD700", fontWeight: "bold" }}>
                              Código Cuenta
                            </TableCell>
                            <TableCell sx={{ color: "#FFD700", fontWeight: "bold" }}>
                              Nombre Cuenta
                            </TableCell>
                            <TableCell sx={{ color: "#FFD700", fontWeight: "bold" }}>
                              Debe
                            </TableCell>
                            <TableCell sx={{ color: "#FFD700", fontWeight: "bold" }}>
                              Haber
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {asiento.detalles.map((d, i) => (
                            <TableRow key={i}>
                              <TableCell sx={{ color: "#fff" }}>{d.codigoCuenta}</TableCell>
                              <TableCell sx={{ color: "#ddd" }}>{d.nombreCuenta}</TableCell>
                              <TableCell sx={{ color: "#fff" }}>{d.debe.toFixed(2)}</TableCell>
                              <TableCell sx={{ color: "#fff" }}>{d.haber.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ color: "#FFD700", fontWeight: "bold" }}>
              Totales del libro
            </Typography>
            <Typography>Total Debe: {totalDebe.toFixed(2)}</Typography>
            <Typography>Total Haber: {totalHaber.toFixed(2)}</Typography>
            <Typography sx={{ fontWeight: "bold", color: estaBalanceado ? "lightgreen" : "#ff5555" }}>
              {estaBalanceado
                ? "✅ El libro está balanceado."
                : "❌ ¡El libro NO está balanceado!"}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}
