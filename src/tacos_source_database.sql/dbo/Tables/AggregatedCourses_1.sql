CREATE TABLE [dbo].[AggregatedCourses] (
    [SubjectCode]              NVARCHAR (4)   NOT NULL,
    [CourseNumber]             NVARCHAR (7)   NOT NULL,
    [DeptName]                 NVARCHAR (50)  NULL,
    [Number]                   NVARCHAR (15)  NOT NULL,
    [Name]                     NVARCHAR (255) NULL,
    [AverageEnrollment]        FLOAT (53)     NULL,
    [AverageSectionsPerCourse] FLOAT (53)     NULL,
    [TimesOfferedPerYear]      FLOAT (53)     NULL,
    [IsCrossListed]            BIT            NULL,
    CONSTRAINT [PK_AggregatedCourses] PRIMARY KEY CLUSTERED ([Number] ASC)
);

