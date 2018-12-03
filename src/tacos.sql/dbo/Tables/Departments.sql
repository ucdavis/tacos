CREATE TABLE [dbo].[Departments] (
    [Id]   INT            IDENTITY (1, 1) NOT NULL,
    [Code] NVARCHAR (MAX) NULL,
    [Name] NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_Departments] PRIMARY KEY CLUSTERED ([Id] ASC)
);

