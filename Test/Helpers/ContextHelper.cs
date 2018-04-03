using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using tacos.data;

namespace Test.Helpers
{
    public class ContextHelper : IDisposable
    {
        private SqliteConnection Connection { get; }
        public TacoDbContext Context { get; }

        public ContextHelper()
        {
            Connection = new SqliteConnection("DataSource=:memory:");
            Connection.Open();

            var options = new DbContextOptionsBuilder<TacoDbContext>()
                .UseSqlite(Connection)
                .Options;
            Context = new TacoDbContext(options);
            Context.Database.EnsureCreated();
        }


        public void Dispose()
        {
            Connection?.Close();
        }
    }
}
