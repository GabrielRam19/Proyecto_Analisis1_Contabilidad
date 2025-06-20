public class BalanceSaldosParcialDto
{
    public int Cuenta_Id { get; set; }
    public string Codigo { get; set; }
    public string Nombre { get; set; }
    public decimal Total_Debe { get; set; }
    public decimal Total_Haber { get; set; }
}

public class BalanceSaldosDto
{
    public int Cuenta_Id { get; set; }
    public string Codigo { get; set; }
    public string Nombre { get; set; }
    public decimal Saldo_Inicial { get; set; }
    public decimal Total_Debe { get; set; }
    public decimal Total_Haber { get; set; }
    public decimal Saldo_Final { get; set; }
    public string? CodigoCuentaPadre { get; set; }
    public int? NivelJerarquia { get; set; }
}