CREATE TABLE [dbo].[DESII_Courses](
	[AcademicYear] [nvarchar](7) NOT NULL,
	[AcademicTermCode] [nvarchar](6) NOT NULL,
	[College] [nvarchar](40) NULL,
	[DeptName] [nvarchar](40) NULL,
	[SubjectCode] [nvarchar](4) NOT NULL,
	[CourseNumber] [nvarchar](7) NOT NULL,
	[CourseName] [varchar](255) NOT NULL,
	[Enrollment] [int] NOT NULL,
	[NumCreditSections] [int] NOT NULL,
	[NumNonCreditSections] [int] NOT NULL,
 CONSTRAINT [PK_DESII_CoursesForLastSixQuarters] PRIMARY KEY NONCLUSTERED 
(
	[AcademicTermCode] ASC,
	[SubjectCode] ASC,
	[CourseNumber] ASC,
	[CourseName] ASC,
	[Enrollment] ASC,
	[NumCreditSections] ASC,
	[NumNonCreditSections] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]


