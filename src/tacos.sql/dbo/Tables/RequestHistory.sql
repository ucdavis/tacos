CREATE TABLE [dbo].[RequestHistory] (
    [Id]                       INT            IDENTITY (1, 1) NOT NULL,
    [AnnualizedTotal]          FLOAT (53)     NOT NULL,
    [Approved]                 BIT            NULL,
    [CalculatedTotal]          FLOAT (53)     NOT NULL,
    [CourseType]               NVARCHAR (MAX) NULL,
    [Exception]                BIT            NOT NULL,
    [ExceptionAnnualizedTotal] FLOAT (53)     NOT NULL,
    [ExceptionReason]          NVARCHAR (MAX) NULL,
    [ExceptionTotal]           FLOAT (53)     NOT NULL,
    [RequestId]                INT            NOT NULL,
    [RequestType]              NVARCHAR (MAX) NULL,
    [UpdatedBy]                NVARCHAR (MAX) NULL,
    [UpdatedOn]                DATETIME2 (7)  NOT NULL,
    CONSTRAINT [PK_RequestHistory] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_RequestHistory_Requests_RequestId] FOREIGN KEY ([RequestId]) REFERENCES [dbo].[Requests] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_RequestHistory_RequestId]
    ON [dbo].[RequestHistory]([RequestId] ASC);

