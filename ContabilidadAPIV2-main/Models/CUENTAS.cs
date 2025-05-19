namespace ContabilidadAPIV2.Models
{
    using System.ComponentModel.DataAnnotations;

    public class CUENTAS
    {
        [Key]
        public int CUENTA_ID { get; set; }
        [Required]
        public string CODIGO { get; set; }
        [Required]
        public string NOMBRE { get; set; }
        [Required]
        public string TIPO { get; set; }
    }
}