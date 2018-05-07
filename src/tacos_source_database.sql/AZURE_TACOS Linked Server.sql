/****** Object:  LinkedServer [AZURE_TACOS]    Script Date: 5/1/2018 11:29:16 AM ******/
EXEC master.dbo.sp_addlinkedserver @server = N'AZURE_TACOS', @srvproduct=N'', @provider=N'SQLNCLI', @datasrc=N'tacos.database.windows.net', @catalog=N'Tacos'
 /* For security reasons the linked server remote logins password is changed with ######## */
EXEC master.dbo.sp_addlinkedsrvlogin @rmtsrvname=N'AZURE_TACOS',@useself=N'False',@locallogin=NULL,@rmtuser=N'tacos@tacos.database.windows.net',@rmtpassword='########'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS', @optname=N'collation compatible', @optvalue=N'false'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS', @optname=N'data access', @optvalue=N'true'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS', @optname=N'dist', @optvalue=N'false'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS', @optname=N'pub', @optvalue=N'false'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS', @optname=N'rpc', @optvalue=N'true'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS', @optname=N'rpc out', @optvalue=N'true'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS', @optname=N'sub', @optvalue=N'false'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS', @optname=N'connect timeout', @optvalue=N'0'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS', @optname=N'collation name', @optvalue=null
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS', @optname=N'lazy schema validation', @optvalue=N'false'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS', @optname=N'query timeout', @optvalue=N'0'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS', @optname=N'use remote collation', @optvalue=N'true'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS', @optname=N'remote proc transaction promotion', @optvalue=N'true'
GO

