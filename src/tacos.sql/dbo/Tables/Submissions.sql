CREATE TABLE [dbo].[Submissions] (
    [Id]         INT            IDENTITY (1, 1) NOT NULL,
    [Actor]      NVARCHAR (MAX) NULL,
    [ActorName]  NVARCHAR (MAX) NULL,
    [Created]    DATETIME2 (7)  NOT NULL,
    [Department] NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_Submissions] PRIMARY KEY CLUSTERED ([Id] ASC)
);



