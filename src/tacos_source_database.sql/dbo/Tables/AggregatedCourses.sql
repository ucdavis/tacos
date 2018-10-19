CREATE TABLE [dbo].[AggregatedCourses](
	[SubjectCode] [nvarchar](4) NOT NULL,
	[CourseNumber] [nvarchar](7) NOT NULL,
	[DeptName] [nvarchar](50) NULL,
	[Number] [nvarchar](15) NOT NULL,
	[Name] [nvarchar](255) NULL,
	[AverageEnrollment] [float] NULL,
	[AverageSectionsPerCourse] [float] NULL,
	[TimesOfferedPerYear] [float] NULL,
	[IsCrossListed] [bit] NULL,
 CONSTRAINT [PK_AggregatedCourses] PRIMARY KEY CLUSTERED 
(
	[Number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY];


