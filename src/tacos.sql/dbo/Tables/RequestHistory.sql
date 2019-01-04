CREATE TABLE [dbo].[RequestHistory] (
    [Id]                       INT            IDENTITY (1, 1) NOT NULL,
    [RequestId]                INT            NOT NULL,
    [DepartmentId]             INT            NOT NULL,
    [CourseNumber]             NVARCHAR (20)  NOT NULL,
    [CourseType]               NVARCHAR (50)  NULL,
    [RequestType]              NVARCHAR (50)  NULL,
    [Approved]                 BIT            NULL,
    [Exception]                BIT            NOT NULL,
    [ExceptionAnnualizedTotal] FLOAT (53)     NOT NULL,
    [ExceptionReason]          NVARCHAR (MAX) NULL,
    [ExceptionTotal]           FLOAT (53)     NOT NULL,
	[AnnualizedTotal]          FLOAT (53)     NOT NULL,
    [CalculatedTotal]          FLOAT (53)     NOT NULL,
	[AverageEnrollment]        FLOAT (53)     NOT NULL,
    [AverageSectionsPerCourse] FLOAT (53)     NOT NULL,
    [TimesOfferedPerYear]      FLOAT (53)     NOT NULL,
    [UpdatedBy]                NVARCHAR (450) NULL,
    [UpdatedOn]                DATETIME2 (7)  NOT NULL,
    CONSTRAINT [PK_RequestHistory] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_RequestHistory_Requests_RequestId] FOREIGN KEY ([RequestId]) REFERENCES [dbo].[Requests] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_RequestHistory_RequestId]
    ON [dbo].[RequestHistory]([RequestId] ASC);

