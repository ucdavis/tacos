CREATE TABLE [dbo].[Requests]
(
    [Id] INT IDENTITY (1, 1) NOT NULL,
    [Approved] BIT NULL,
    [CalculatedTotal] FLOAT (53) NOT NULL,
    [AnnualizedTotal] FLOAT (53) NOT NULL,
    [AverageEnrollment] FLOAT(53) NOT NULL,
    [AverageSectionsPerCourse] FLOAT(53) NOT NULL,
    [TimesOfferedPerYear] FLOAT(53) NOT NULL,
    [ExceptionReason] NVARCHAR (MAX) NULL,
    [ExceptionTotal] FLOAT (53) NOT NULL,
    [ExceptionAnnualizedTotal] FLOAT (53) NOT NULL,
    [Exception] BIT NOT NULL,
    [CourseNumber] NVARCHAR (MAX) NULL,
    [CourseType] NVARCHAR (MAX) NULL,
    [RequestType] NVARCHAR (MAX) NULL,
    [SubmissionId] INT NOT NULL,
    CONSTRAINT [PK_Requests] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Requests_Submissions_SubmissionId] FOREIGN KEY ([SubmissionId]) REFERENCES [dbo].[Submissions] ([Id]) ON DELETE CASCADE
);




GO
CREATE NONCLUSTERED INDEX [IX_Requests_SubmissionId]
    ON [dbo].[Requests]([SubmissionId] ASC);

