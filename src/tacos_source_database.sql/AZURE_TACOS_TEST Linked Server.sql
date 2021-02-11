USE [master]
GO

/****** Object:  LinkedServer [AZURE_TACOS_TEST]    Script Date: 2/11/2021 1:49:49 PM ******/
EXEC master.dbo.sp_addlinkedserver @server = N'AZURE_TACOS_TEST', @srvproduct=N'', @provider=N'SQLNCLI', @datasrc=N'tacos-test.database.windows.net', @catalog=N'Tacos-Test'
 /* For security reasons the linked server remote logins password is changed with ######## */
EXEC master.dbo.sp_addlinkedsrvlogin @rmtsrvname=N'AZURE_TACOS_TEST',@useself=N'False',@locallogin=NULL,@rmtuser=N'tacos',@rmtpassword='########'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS_TEST', @optname=N'collation compatible', @optvalue=N'false'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS_TEST', @optname=N'data access', @optvalue=N'true'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS_TEST', @optname=N'dist', @optvalue=N'false'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS_TEST', @optname=N'pub', @optvalue=N'false'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS_TEST', @optname=N'rpc', @optvalue=N'true'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS_TEST', @optname=N'rpc out', @optvalue=N'true'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS_TEST', @optname=N'sub', @optvalue=N'false'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS_TEST', @optname=N'connect timeout', @optvalue=N'0'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS_TEST', @optname=N'collation name', @optvalue=null
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS_TEST', @optname=N'lazy schema validation', @optvalue=N'false'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS_TEST', @optname=N'query timeout', @optvalue=N'0'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS_TEST', @optname=N'use remote collation', @optvalue=N'true'
GO

EXEC master.dbo.sp_serveroption @server=N'AZURE_TACOS_TEST', @optname=N'remote proc transaction promotion', @optvalue=N'true'
GO


