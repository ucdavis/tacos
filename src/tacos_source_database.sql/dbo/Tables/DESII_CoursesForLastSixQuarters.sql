CREATE TABLE [dbo].[DESII_CoursesForLastSixQuarters] (
    [AcademicYear]         NVARCHAR (7)  NOT NULL,
    [AcademicTermCode]     NVARCHAR (6)  NOT NULL,
    [College]              NVARCHAR (40) NULL,
    [DeptName]             NVARCHAR (40) NULL,
    [SubjectCode]          NVARCHAR (4)  NOT NULL,
    [CourseNumber]         NVARCHAR (7)  NOT NULL,
    [CourseName]           VARCHAR (255) NULL,
    [Enrollment]           INT           NULL,
    [NumCreditSections]    INT           NULL,
    [NumNonCreditSections] INT           NULL
);


GO
CREATE CLUSTERED INDEX [DESII_CoursesForLastSixQuarters_SubjCodeCrseNumAcademicTermCode_CLSTRIDX]
    ON [dbo].[DESII_CoursesForLastSixQuarters]([SubjectCode] ASC, [CourseNumber] ASC, [AcademicTermCode] DESC);


GO
CREATE NONCLUSTERED INDEX [DESII_CoursesForLastSixQuarters_AcademicTermCode_IDX]
    ON [dbo].[DESII_CoursesForLastSixQuarters]([AcademicTermCode] DESC);

