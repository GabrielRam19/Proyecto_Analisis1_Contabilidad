using ContabilidadAPIV2.Models;
using Microsoft.EntityFrameworkCore;

namespace ContabilidadAPIV2.Controllers
{


    public class ContabilidadContext : DbContext
    {
        public ContabilidadContext(DbContextOptions<ContabilidadContext> options) : base(options) { }

        public DbSet<CUENTAS> CUENTAS { get; set; }
        public DbSet<ASIENTOS> ASIENTOS { get; set; }
        public DbSet<DETALLE_ASIENTO> DETALLE_ASIENTO { get; set; }
        public DbSet<JERARQUIA> JERARQUIA { get; set; }
        public DbSet<PERIODO> PERIODO { get; set; }
        public DbSet<SALDOCUENTAPERIODO> SALDOCUENTAPERIODO { get; set; }

        public DbSet<LibroMayor> LibroMayor { get; set; }
        public DbSet<BalanceSaldos> BalanceSaldos { get; set; }
        public DbSet<EstadoResultados> EstadoResultados { get; set; }
        public DbSet<BalanceGeneral> BalanceGeneral { get; set; }
        public DbSet<EstadosFinancieros> EstadosFinancieros { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<LibroMayorMovimientoDto>().HasNoKey();
            modelBuilder.Entity<BalanceSaldosDto>().HasNoKey();
            modelBuilder.Entity<BalanceSaldosParcialDto>().HasNoKey();
            modelBuilder.Entity<LibroMayorMovimientoRawDto>().HasNoKey();
            modelBuilder.Entity<EstadoResultadosDto>().HasNoKey();
            modelBuilder.Entity<BalanceGeneralMovimientoParcialDto>().HasNoKey();

            modelBuilder.Entity<LibroMayor>().ToView("Libro_Mayor").HasKey(e => new { e.CUENTA_ID, e.Fecha });
            modelBuilder.Entity<BalanceSaldos>().ToView("Balance_Saldos").HasKey(e => e.CUENTA_ID);
            modelBuilder.Entity<EstadoResultados>().ToView("Estado_Resultados").HasKey(e => e.CUENTA_ID);
            modelBuilder.Entity<BalanceGeneral>().ToView("Balance_General").HasKey(e => e.CUENTA_ID);
            modelBuilder.Entity<EstadosFinancieros>().ToView("Estados_Financieros").HasKey(e => new { e.TIPO_ESTADO, e.CUENTA_ID });

            // Relaciones
            modelBuilder.Entity<ASIENTOS>()
                .HasMany(a => a.Detalles)
                .WithOne(d => d.Asiento)
                .HasForeignKey(d => d.ASIENTO_ID);
        }
    }

}
