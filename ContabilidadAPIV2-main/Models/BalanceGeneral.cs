namespace ContabilidadAPIV2.Models
{
    public class BalanceGeneral
    {
        public int CUENTA_ID { get; set; }
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public decimal TOTAL_DEBE { get; set; }
        public decimal TOTAL_HABER { get; set; }
        public decimal Saldo { get; set; }
        public string Tipo { get; set; }
    }

}
