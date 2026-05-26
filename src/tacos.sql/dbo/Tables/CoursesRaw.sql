CREATE TABLE [dbo].[CoursesRaw] (
    [AcademicYear] [nvarchar](7) NULL,
    [AcademicTermCode] [nvarchar](6) NULL,
    [CollegeCode] [nvarchar](2) NULL,
    [College] [nvarchar](100) NULL,
    [DeptCode] [nvarchar](4) NULL,
    [DeptName] [nvarchar](100) NULL,
    [SubjectCode] [nvarchar](4) NULL,
    [CourseNumber] [nvarchar](7) NULL,
    [CourseName] [nvarchar](255) NULL,
    [Enrollment] [int] NULL,
    [NumCreditSections] [int] NULL,
    [NumNonCreditSections] [int] NULL
);

GO

CREATE NONCLUSTERED INDEX [IX_CoursesRaw_AcademicTermCode_AcademicYear]
    ON [dbo].[CoursesRaw] ([AcademicTermCode], [AcademicYear]);
