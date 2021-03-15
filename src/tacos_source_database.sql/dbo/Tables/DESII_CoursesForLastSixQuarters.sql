CREATE TABLE [dbo].[DESII_CoursesForLastSixQuarters] (
    [AcademicYear]         NVARCHAR (7)  NOT NULL,
    [AcademicTermCode]     NVARCHAR (6)  NOT NULL,
    [College]              NVARCHAR (40) NULL,
    [DeptName]             NVARCHAR (40) NULL,
    [SubjectCode]          NVARCHAR (4)  NOT NULL,
    [CourseNumber]         NVARCHAR (7)  NOT NULL,
    [CourseName]           VARCHAR (255) NOT NULL,
    [Enrollment]           INT           NOT NULL,
    [NumCreditSections]    INT           NOT NULL,
    [NumNonCreditSections] INT           NOT NULL,
    CONSTRAINT [PK_DESII_CoursesForLastSixQuarters] PRIMARY KEY NONCLUSTERED ([AcademicTermCode] ASC, [SubjectCode] ASC, [CourseNumber] ASC, [CourseName] ASC, [Enrollment] ASC, [NumCreditSections] ASC, [NumNonCreditSections] ASC)
);




GO
CREATE CLUSTERED INDEX [DESII_CoursesForLastSixQuarters_SubjCodeCrseNumAcademicTermCode_CLSTRIDX]
    ON [dbo].[DESII_CoursesForLastSixQuarters]([SubjectCode] ASC, [CourseNumber] ASC, [AcademicTermCode] DESC);


GO
CREATE NONCLUSTERED INDEX [DESII_CoursesForLastSixQuarters_AcademicTermCode_IDX]
    ON [dbo].[DESII_CoursesForLastSixQuarters]([AcademicTermCode] DESC);

