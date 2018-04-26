CREATE TABLE [dbo].[Courses] (
    [Number]                   [NVARCHAR] (20) NOT NULL,
    [AverageEnrollment]        [FLOAT]         NOT NULL,
    [AverageSectionsPerCourse] [FLOAT]         NOT NULL,
    [Name]                     [NVARCHAR] (255)    NULL,
    [TimesOfferedPerYear]      [FLOAT]         NOT NULL,
    CONSTRAINT [PK_Courses] PRIMARY KEY CLUSTERED ([Number] ASC)
);

