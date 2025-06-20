public class LibroMayorMovimientoRawDto
{
    public int Detalle_Id { get; set; }
    public int Cuenta_Id { get; set; }
    public string Codigo { get; set; }
    public string Nombre { get; set; }
    public int Asiento_Id { get; set; }
    public string Descripcion { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Debe { get; set; }
    public decimal Haber { get; set; }
}

public class LibroMayorMovimientoDto
{
    public int Detalle_Id { get; set; } // <- �Clave �nica!
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
    public decimal SaldoInicial { get; set; }
    public List<LibroMayorMovimientoDto> Movimientos { get; set; }
    public string CodigoCuentaPadre { get; set; }
    public int? NivelJerarquia { get; set; }
}
