CREATE TABLE [dbo].[Courses] (
    [Number]                   NVARCHAR (450) NOT NULL,
    [AverageEnrollment]        INT            NOT NULL,
    [AverageSectionsPerCourse] FLOAT (53)     NOT NULL,
    [Name]                     NVARCHAR (MAX) NULL,
    [TimesOfferedPerYear]      FLOAT (53)     NOT NULL,
    CONSTRAINT [PK_Courses] PRIMARY KEY CLUSTERED ([Number] ASC)
);

