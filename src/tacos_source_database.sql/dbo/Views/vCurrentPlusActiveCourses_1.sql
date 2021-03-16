/*
Author: Ken Taylor
Created On: October 17, 2018
Description: Returns a list of course data for courses offered within the 
  past two academic years, plus any other active courses listed in the course catalog.

Prerequisites: LoadingCourses and CourseDescription tables must have been loaded.

Usage: 

USE [Tacos]
GO

INSERT INTO [dbo].[Courses]
SELECT * FROM [dbo].[vCurrentPlusActiveCourses]
ORDER BY [Number]

GO

Modifications:

*/
CREATE VIEW [dbo].[vCurrentPlusActiveCourses]
AS
SELECT  t1.[SubjectCode]
	   ,t1.[CourseNumber]
	   ,[DeptName]
	   ,t1.[Number]
	   ,COALESCE([Name], t3.[Title]) [Name]
	   ,COALESCE([AverageEnrollment], 0) [AverageEnrollment]
	   ,COALESCE([AverageSectionsPerCourse], 0) [AverageSectionsPerCourse]
	   ,COALESCE([TimesOfferedPerYear], 0) [TimesOfferedPerYear]
	   ,IsCrossListed
	   ,CASE WHEN COALESCE([TimesOfferedPerYear], 0) = 0 THEN 0
		ELSE 1 END AS IsOfferedWithinPastTwoYears
FROM (
	-- Get a consolidated list of all active courses:
	SELECT 
		[SubjectCode]
	   ,[CourseNumber]
	   ,[Number]
	FROM [dbo].[AggregatedCourses]

    UNION

	SELECT DISTINCT 
		   [SubjectCode]
		  ,[CourseNumber]
		  ,[SubjectCode]+[CourseNumber] AS [Number]
	FROM [dbo].[CourseDescription]
	WHERE Status = 'Active'
) t1
LEFT OUTER JOIN [dbo].[AggregatedCourses] t2 ON t2.Number = t1.Number
LEFT OUTER JOIN [dbo].[CourseDescription] t3 ON t3.SubjectCode  = t1.SubjectCode AND t3.CourseNumber = t1.CourseNumber