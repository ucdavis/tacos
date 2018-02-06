CREATE TABLE [dbo].[Requests] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [Approved]        BIT            NOT NULL,
    [CalculatedTotal] FLOAT (53)     NOT NULL,
    [CourseNumber]    NVARCHAR (MAX) NULL,
    [SubmissionId]    INT            NOT NULL,
    CONSTRAINT [PK_Requests] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Requests_Submissions_SubmissionId] FOREIGN KEY ([SubmissionId]) REFERENCES [dbo].[Submissions] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_Requests_SubmissionId]
    ON [dbo].[Requests]([SubmissionId] ASC);

