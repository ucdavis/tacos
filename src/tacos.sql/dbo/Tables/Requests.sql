CREATE TABLE [dbo].[Requests] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [Approved]        BIT            NULL,
    [CalculatedTotal] FLOAT (53)     NOT NULL,
    [ContestReason]   NVARCHAR (MAX) NULL,
    [ContestTotal]    FLOAT (53)     NOT NULL,
    [Contested]       BIT            NOT NULL,
    [CourseNumber]    NVARCHAR (MAX) NULL,
    [CourseType]      NVARCHAR (MAX) NULL,
    [RequestType]     NVARCHAR (MAX) NULL,
    [SubmissionId]    INT            NOT NULL,
    CONSTRAINT [PK_Requests] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Requests_Submissions_SubmissionId] FOREIGN KEY ([SubmissionId]) REFERENCES [dbo].[Submissions] ([Id]) ON DELETE CASCADE
);




GO
CREATE NONCLUSTERED INDEX [IX_Requests_SubmissionId]
    ON [dbo].[Requests]([SubmissionId] ASC);

