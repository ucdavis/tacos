CREATE TABLE [dbo].[Requests] (
    [Id]                       INT            IDENTITY (1, 1) NOT NULL,
    [IsActive]				   BIT			  NOT NULL DEFAULT 1, 
    [Approved]                 BIT            NULL,
    [AnnualizedTotal]          FLOAT (53)     NOT NULL,
    [CalculatedTotal]          FLOAT (53)     NOT NULL,
    [CourseNumber]             NVARCHAR (20)  NOT NULL,
    [CourseType]               NVARCHAR (50)  NULL,
    [DepartmentId]             INT            NOT NULL,
    [Exception]                BIT            NOT NULL,
    [ExceptionAnnualizedTotal] FLOAT (53)     NOT NULL,
    [ExceptionReason]          NVARCHAR (MAX) NULL,
    [ExceptionTotal]           FLOAT (53)     NOT NULL,
    [RequestType]              NVARCHAR (50)  NULL,
    [UpdatedBy]                NVARCHAR (450) NULL,
    [UpdatedOn]                DATETIME2 (7)  NOT NULL,
    CONSTRAINT [PK_Requests] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Requests_Courses_CourseNumber] FOREIGN KEY ([CourseNumber]) REFERENCES [dbo].[Courses] ([Number]) ON DELETE CASCADE,
    CONSTRAINT [FK_Requests_Departments_DepartmentId] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Departments] ([Id]) ON DELETE CASCADE
);



GO
CREATE NONCLUSTERED INDEX [IX_Requests_DepartmentId]
    ON [dbo].[Requests]([DepartmentId] ASC);

