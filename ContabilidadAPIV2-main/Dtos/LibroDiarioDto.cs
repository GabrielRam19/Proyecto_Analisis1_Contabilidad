public class LibroDiarioDto
{
    public DateTime Fecha { get; set; }
    public string Descripcion { get; set; }
    public int AsientoId { get; set; }
    public List<DetalleLibroDiarioDto> Detalles { get; set; } = new List<DetalleLibroDiarioDto>();
}

public class DetalleLibroDiarioDto
{
    public string CodigoCuenta { get; set; }
    public string NombreCuenta { get; set; }
    public decimal Debe { get; set; }
    public decimal Haber { get; set; }
}