CREATE TABLE [dbo].[Departments] (
    [Id]   INT            IDENTITY (1, 1) NOT NULL,
    [Code] NVARCHAR (20) NULL,
    [Name] NVARCHAR (450) NULL,
    CONSTRAINT [PK_Departments] PRIMARY KEY CLUSTERED ([Id] ASC)
);

