CREATE TABLE [dbo].[RequestHistory] (
    [Id]                       INT            IDENTITY (1, 1) NOT NULL,
    [RequestId]                INT            NOT NULL,
    [DepartmentId]             INT            NOT NULL,
    [CourseNumber]             NVARCHAR (20)  NOT NULL,
    [CourseType]               NVARCHAR (50)  NULL,
    [Approved]                 BIT            NULL,
    [Exception]                BIT            NOT NULL,
    [ExceptionAnnualizedTaTotal] FLOAT (53)   NOT NULL,
    [ExceptionAnnualizedReaderTotal] FLOAT (53) NOT NULL,
    [ExceptionAnnualCount]     FLOAT (53)     NOT NULL,
    [ExceptionReason]          NVARCHAR (MAX) NULL,
    [ExceptionTaTotal]         FLOAT (53)     NOT NULL,
    [ExceptionReaderTotal]     FLOAT (53)     NOT NULL,
    [ApprovedComment]          NVARCHAR (MAX) NULL, 
	[AnnualizedTaTotal]        FLOAT (53)     NOT NULL,
    [AnnualizedReaderTotal]    FLOAT (53)     NOT NULL,
    [CalculatedTaTotal]        FLOAT (53)     NOT NULL,
    [CalculatedReaderTotal]    FLOAT (53)     NOT NULL,
	[AverageEnrollment]        FLOAT (53)     NOT NULL,
    [AverageSectionsPerCourse] FLOAT (53)     NOT NULL,
    [TimesOfferedPerYear]      FLOAT (53)     NOT NULL,
    [UpdatedBy]                NVARCHAR (450) NULL,
    [UpdatedOn]                DATETIME2 (7)  NOT NULL,
    CONSTRAINT [PK_RequestHistory] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_RequestHistory_Requests_RequestId] FOREIGN KEY ([RequestId]) REFERENCES [dbo].[Requests] ([Id]) ON DELETE NO ACTION
);


GO
CREATE NONCLUSTERED INDEX [IX_RequestHistory_RequestId]
    ON [dbo].[RequestHistory]([RequestId] ASC);
