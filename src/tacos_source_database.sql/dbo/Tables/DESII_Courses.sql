CREATE TABLE [dbo].[DESII_Courses] (
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
CREATE CLUSTERED INDEX [ClusteredIndex-20180410-094811]
    ON [dbo].[DESII_Courses]([SubjectCode] ASC, [CourseNumber] ASC, [AcademicTermCode] DESC);


GO
CREATE NONCLUSTERED INDEX [NonClusteredIndex-20180410-095059]
    ON [dbo].[DESII_Courses]([AcademicTermCode] DESC);

