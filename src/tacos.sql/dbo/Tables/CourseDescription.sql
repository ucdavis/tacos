CREATE TABLE [dbo].[CourseDescription](
	[Course] [nvarchar](10) NULL,
	[SubjectCode] [nvarchar](3) NOT NULL,
	[CourseNumber] [nvarchar](5) NOT NULL,
	[CrossListing] [nvarchar](50) NULL,
	[Title] [nvarchar](200) NULL,
	[AbbreviatedTitle] [nvarchar](100) NULL,
	[CourseDescription] [nvarchar](2000) NULL,
	[College] [nvarchar](100) NULL,
	[Department] [nvarchar](100) NULL,
	[Status] [nvarchar](50) NOT NULL,
	[CreatedOn] [nvarchar](50) NULL,
	[UpdatedOn] [nvarchar](50) NULL,
	[FirstLearningActivity] [nvarchar](100) NULL,
	[SecondLearningActivity] [nvarchar](100) NULL,
	[ThirdLearningActivity] [nvarchar](100) NULL,
	[FourthLearningActivity] [nvarchar](100) NULL,
	[Quarters] [nvarchar](300) NULL,
	[QuartersOffered] [nvarchar](50) NULL,
	[EffectiveTerm] [nvarchar](6) NULL,
	[Effective] [nvarchar](50) NULL,
 CONSTRAINT [PK_CourseDescription] PRIMARY KEY CLUSTERED 
(
	[SubjectCode] ASC,
	[CourseNumber] ASC,
	[Status] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]