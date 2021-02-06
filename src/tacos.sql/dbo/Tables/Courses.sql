CREATE TABLE [dbo].[Courses] (
    [Number]	[NVARCHAR] (20) NOT NULL,
	[Name]		[NVARCHAR] (255) NULL,
	[DeptName]	[NVARCHAR] (100) NULL, 
    [AverageEnrollment]        [FLOAT]         NOT NULL,
    [AverageSectionsPerCourse] [FLOAT]         NOT NULL,
	[TimesOfferedPerYear]      [FLOAT]         NOT NULL,
	[IsCrossListed] [bit] NULL,
	[CrossListingsString] VARCHAR(50) NULL, 
	[IsOfferedWithinPastTwoYears] [bit] NULL,
    [WasCourseTaughtInMostRecentYear] BIT NULL, 
    [IsCourseTaughtOnceEveryTwoYears] BIT NULL, 
    [NonCrossListedAverageEnrollment] FLOAT NULL, 
    CONSTRAINT [PK_Courses] PRIMARY KEY CLUSTERED ([Number] ASC)
);

