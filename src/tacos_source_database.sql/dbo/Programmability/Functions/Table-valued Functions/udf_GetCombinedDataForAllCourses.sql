USE [Tacos]
GO

/****** Object:  UserDefinedFunction [dbo].[udf_GetCombinedDataForAllCourses]    Script Date: 1/26/2021 11:34:10 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		John Knoll
-- Create date: 4/4/2019
-- Description:	Combine the enrollment and sections data for 
--	all the courses for the past two academic years.
--
-- Prerequsites: [dbo].[DESII_CoursesForLastSixQuarters] table must have been loaded.
--	[dbo].[CourseDescription] table must have been loaded.
--
-- Usage:
/*
	USE [Tacos]
	GO

	TRUNCATE TABLE Tacos.dbo.Courses
	INSERT INTO Tacos.dbo.Courses (SubjectCode, CourseNumber, DeptName, Number, Name, AverageEnrollment, AverageSectionsPerCourse, TimesOfferedPerYear, IsCrossListed)
	SELECT * FROM [dbo].[udf_GetCombinedDataForAllCourses]()

	GO
*/
-- Modifications:
--
-- =============================================
CREATE FUNCTION [dbo].[udf_GetCombinedDataForAllCourses] 
()
RETURNS 
@AllCourses TABLE 
(
	[SubjectCode] [nvarchar](4) NOT NULL,
	[CourseNumber] [nvarchar](7) NOT NULL,
	[DeptName] [nvarchar](50) NULL,
	[Number] [nvarchar](15) NOT NULL,
	[Name] [nvarchar](255) NULL,
	[AverageEnrollment] [float] NULL,
	[AverageSectionsPerCourse] [float] NULL,
	[TimesOfferedPerYear] [float] NULL,
	[IsCrossListed] [bit] NULL
)
AS
BEGIN
	INSERT INTO @AllCourses
	SELECT DISTINCT  
		t1.SubjectCode,
		t1.CourseNumber, NULL AS DeptName,
		t1.SubjectCode + t1.CourseNumber AS Number,
		COALESCE(t4.Title, t3.CourseName) AS Name, 
		CONVERT(float, SUM(t1.Enrollment)) / CONVERT(float, SUM(t1.NumCreditSections)) AS AverageEnrollment, 
		SUM(CONVERT(float, t1.NumNonCreditSections)) / SUM(CONVERT(float, t1.NumCreditSections)) AS AverageSectionsPerCourse,
		SUM(CONVERT(float, t1.NumCreditSections)) / 2  AS TimesOfferedPerYear,
		0 AS IsCrossListed
	FROM          [dbo].[DESII_CoursesForLastSixQuarters] 
	  AS t1

	INNER JOIN (
		-- Get the max termcode for each course
		SELECT SubjectCode, CourseNumber, MAX(AcademicTermCode) TermCode
		FROM  [dbo].[DESII_CoursesForLastSixQuarters]
		GROUP BY SubjectCode, CourseNumber

	) t2 ON t1.SubjectCode = t2.SubjectCode AND t1.CourseNumber = t2.CourseNumber
	INNER JOIN (
		-- get the course name corresponding to the max term code:
		SELECT SubjectCode, CourseNumber, CourseName, AcademicTermCode TermCode
		FROM  [dbo].[DESII_CoursesForLastSixQuarters]
	) t3 ON t2.TermCode = t3.TermCode AND t2.SubjectCode = t3.SubjectCode AND t2.CourseNumber = t3.CourseNumber
	LEFT OUTER JOIN 
	(
		SELECT DISTINCT Course, MAX(CreatedOn) CreatedOn
		FROM CourseDescription 
		WHERE Status = 'Active'
		GROUP BY Course
	) t5 ON t1.SubjectCode + ' ' + t1.CourseNumber = t5.Course
	LEFT OUTER JOIN 
	(
		SELECT DISTINCT Course, CreatedOn, Title
		FROM CourseDescription 
		WHERE Status = 'Active'
	) t4 ON t5.Course = t4.Course AND t5.CreatedOn = t4.CreatedOn
	GROUP BY
		t1.SubjectCode,
		t1.CourseNumber,
		COALESCE(t4.Title, t3.CourseName)--t3.CourseName
	HAVING        (SUM(t1.NumCreditSections) > 0)
	ORDER BY t1.SubjectCode, t1.CourseNumber
	
	RETURN 
END
GO


