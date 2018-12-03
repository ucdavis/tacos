CREATE TABLE [dbo].[Requests] (
    [Id]                       INT            IDENTITY (1, 1) NOT NULL,
    [Approved]                 BIT            NULL,
    [AnnualizedTotal]          FLOAT (53)     NOT NULL,
    [AverageEnrollment]        FLOAT (53)     NOT NULL,
    [AverageSectionsPerCourse] FLOAT (53)     NOT NULL,
    [CalculatedTotal]          FLOAT (53)     NOT NULL,
    [CourseNumber]             NVARCHAR (MAX) NULL,
    [CourseType]               NVARCHAR (MAX) NULL,
    [DepartmentId]             INT            NOT NULL,
    [Exception]                BIT            NOT NULL,
    [ExceptionAnnualizedTotal] FLOAT (53)     NOT NULL,
    [ExceptionReason]          NVARCHAR (MAX) NULL,
    [ExceptionTotal]           FLOAT (53)     NOT NULL,
    [RequestType]              NVARCHAR (MAX) NULL,
    [TimesOfferedPerYear]      FLOAT (53)     NOT NULL,
    [UpdatedBy]                NVARCHAR (MAX) NULL,
    [UpdatedOn]                DATETIME2 (7)  NOT NULL,
    CONSTRAINT [PK_Requests] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Requests_Departments_DepartmentId] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Departments] ([Id]) ON DELETE CASCADE
);



GO
CREATE NONCLUSTERED INDEX [IX_Requests_DepartmentId]
    ON [dbo].[Requests]([DepartmentId] ASC);

