namespace ContabilidadAPIV2.Models
{
	using System;
	using System.Collections.Generic;
	using System.ComponentModel.DataAnnotations;
	using System.ComponentModel.DataAnnotations.Schema;

	public class SALDOCUENTAPERIODO
	{
		[Key]
		public int id_saldo { get; set; }

		[Required]
		public int id_periodo { get; set; }

		[Required]
		public int cuenta_id { get; set; }

		[Required]
		public decimal saldo_inicial { get; set; }

		[Required]
		public decimal total_debe { get; set; }

		[Required]
		public decimal total_haber { get; set; }

		[Required]
		public decimal saldo_final { get; set; }

		[ForeignKey("id_periodo")]
		public PERIODO Periodo { get; set; }

		[ForeignKey("cuenta_id")]
		public CUENTAS Cuenta { get; set; }
	}


}