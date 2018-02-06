CREATE TABLE [dbo].[Submissions] (
    [Id]      INT            IDENTITY (1, 1) NOT NULL,
    [Actor]   NVARCHAR (MAX) NULL,
    [Created] DATETIME2 (7)  NOT NULL,
    CONSTRAINT [PK_Submissions] PRIMARY KEY CLUSTERED ([Id] ASC)
);

