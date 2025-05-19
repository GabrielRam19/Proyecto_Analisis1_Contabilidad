public class LibroMayorMovimientoDto
{
    public int Detalle_Id { get; set; } // <- ¡Clave única!
    public int Cuenta_Id { get; set; }
    public string Codigo { get; set; }
    public string Nombre { get; set; }
    public int Asiento_Id { get; set; }
    public string Descripcion { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Debe { get; set; }
    public decimal Haber { get; set; }
    public decimal Saldo { get; set; }
}

public class LibroMayorAgrupado
{
    public int CuentaId { get; set; }
    public string Codigo { get; set; }
    public string Nombre { get; set; }
    public List<LibroMayorMovimientoDto> Movimientos { get; set; }
}
