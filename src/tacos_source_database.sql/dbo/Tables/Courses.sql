CREATE TABLE [dbo].[Courses] (
    [SubjectCode]                     NVARCHAR (4)   NOT NULL,
    [CourseNumber]                    NVARCHAR (7)   NOT NULL,
    [DeptName]                        NVARCHAR (100) NULL,
    [Number]                          NVARCHAR (15)  NOT NULL,
    [Name]                            NVARCHAR (255) NULL,
    [NonCrossListedAverageEnrollment] FLOAT (53)     NULL,
    [AverageEnrollment]               FLOAT (53)     NULL,
    [AverageSectionsPerCourse]        FLOAT (53)     NULL,
    [TimesOfferedPerYear]             FLOAT (53)     NULL,
    [IsCrossListed]                   BIT            NULL,
    [CrossListingsString]             VARCHAR (50)   NULL,
    [IsOfferedWithinPastTwoYears]     BIT            NULL,
    [WasCourseTaughtInMostRecentYear] BIT            NULL,
    [IsCourseTaughtOnceEveryTwoYears] BIT            NULL,
    CONSTRAINT [PK_Courses] PRIMARY KEY CLUSTERED ([Number] ASC)
);





