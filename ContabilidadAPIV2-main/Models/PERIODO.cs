namespace ContabilidadAPIV2.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Text.Json.Serialization;

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
        // Propiedad para referenciar al periodo anterior
        public int? id_periodo_anterior { get; set; }

        [ForeignKey("id_periodo_anterior")]
        [JsonIgnore]
        public PERIODO? PeriodoAnterior { get; set; }
    }

}