namespace ContabilidadAPIV2.Models
{
    public class LibroMayor
    {
        public int CUENTA_ID { get; set; }
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Debe { get; set; }
        public decimal Haber { get; set; }
        public decimal Saldo { get; set; }
    }

}
