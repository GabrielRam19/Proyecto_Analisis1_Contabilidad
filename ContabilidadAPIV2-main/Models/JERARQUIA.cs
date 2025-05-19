namespace ContabilidadAPIV2.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public class JERARQUIA
    {
        [Key]
        public int id_jerarquia { get; set; }
        [Required]
        public string codigo_cuenta_padre { get; set; }
        [Required]
        public string codigo_cuenta_hijo {  get; set; }
        public int nivel {  get; set; }
    }

}