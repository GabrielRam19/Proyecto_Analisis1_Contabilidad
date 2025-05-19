namespace ContabilidadAPIV2.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public class PERIODO
    {
        [Key]
        public int id_periodo { get; set; }
        [Required]
        public DateOnly fecha_inicio { get; set; }
        [Required]
        public DateOnly fecha_fin { get; set; }
        public string descripcion { get; set; }
        public bool estado {  get; set; }
    }

}