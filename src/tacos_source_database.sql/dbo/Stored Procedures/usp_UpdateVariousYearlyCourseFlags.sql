
-- =============================================
-- Author:		Ken Taylor
-- Create date: February 3, 2021
-- Description:	Sets the WasCourseTaughtInMostRecentYear and
--	IsCourseTaughtOnceEveryTwoYears course flags.
--
-- Prerequsites: The Courses table must have already been loaded with
--	the base course data.
--
-- Usage:

/*
	USE [Tacos]
	GO

	EXEC usp_UpdateVariousYearlyCourseFlags

*/
-- Modifications:
--	2021-03-15 by kjt: Inverted setting of WasCourseTaughtInMostRecentYear as per Brian McEligot.
--
-- =============================================
CREATE PROCEDURE [dbo].[usp_UpdateVariousYearlyCourseFlags]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    DECLARE @MostRecentYear varchar(7) = (SELECT MAX(AcademicYear) 
	FROM [dbo].[vDESII_CoursesForLastSixQuartersFromDESII_Courses])

	UPDATE [dbo].Courses
	SET WasCourseTaughtInMostRecentYear = COALESCE(t2.WasCourseTaughtInMostRecentYear,t1.IsOfferedWithinPastTwoYears),
		IsCourseTaughtOnceEveryTwoYears = COALESCE(t2.IsCourseTaughtOnceEveryTwoYears,t1.IsOfferedWithinPastTwoYears)
	FROM [dbo].Courses t1
	LEFT OUTER JOIN (
		SELECT
		   CASE WHEN MAX(AcademicYear) =  @MostRecentYear THEN 0 ELSE 1 END AS WasCourseTaughtInMostRecentYear,
		   CASE WHEN Count(DISTINCT AcademicYear) = 1 THEN 1 ELSE 0 END AS IsCourseTaughtOnceEveryTwoYears, 
		   SubjectCode, CourseNumber
		FROM [dbo].[vDESII_CoursesForLastSixQuartersFromDESII_Courses]
		GROUP BY SubjectCode, CourseNumber
		--ORDER BY IsCourseTaughtOnceEveryTwoYears DESC, SubjectCode, CourseNumber
	) t2 ON t1.SubjectCode = t2.SubjectCode ANd t1.CourseNumber = t2.CourseNumber
END