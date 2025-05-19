
namespace ContabilidadAPIV2.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class ASIENTOS
    {
        [Key]
        public int ASIENTO_ID { get; set; }
        [Required]
        public DateTime FECHA { get; set; }
        [Required]
        public string DESCRIPCION { get; set; }
        public int id_periodo { get; set; }
        public ICollection<DETALLE_ASIENTO> Detalles { get; set; } = new List<DETALLE_ASIENTO>();
    }

    public class DETALLE_ASIENTO
    {
        [Key]
        public int DETALLE_ID { get; set; }
        public int ASIENTO_ID { get; set; }
        public int CUENTA_ID { get; set; }
        public decimal DEBE { get; set; }
        public decimal HABER { get; set; }

        public ASIENTOS? Asiento { get; set; }

        [ForeignKey(nameof(CUENTA_ID))]
        public CUENTAS? Cuenta { get; set; }
    }

}