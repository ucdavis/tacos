USE [Tacos]
GO

/****** Object:  UserDefinedFunction [dbo].[udf_GetCombinedDataForCrossListedCourses]    Script Date: 10/19/2018 3:30:14 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Ken Taylor
-- Create date: October 17, 2018
-- Description:	Combine the enrollment and sections data
--	for all the cross-listed courses identified in the
--  course catalog for the past two academic years.
--
-- Prerequsites: [dbo].[DESII_CoursesForLastSixQuarters] table must have been loaded.
--	[dbo].[CourseDescription] table must have been loaded.
--
-- Usage:
/*
	USE [Tacos]
	GO

	DELETE FROM Tacos.dbo.LoadingCourses WHERE IsCrossListed = 1
	INSERT INTO Tacos.dbo.LoadingCourses (SubjectCode, CourseNumber, DeptName, Number, Name, AverageEnrollment, AverageSectionsPerCourse, TimesOfferedPerYear, IsCrossListed)
	SELECT * FROM [dbo].[udf_GetCombinedDataForCrossListedCourses]()

	GO
*/
-- Modifications:
-- =============================================
CREATE FUNCTION [dbo].[udf_GetCombinedDataForCrossListedCourses] 
()
RETURNS @CrossListedCourseTotals TABLE (
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
    -- We use this value so we don't get course info for a course
	-- that was offered in a future term, meaning a term code that
	-- occured after the two full academic years in question.
	DECLARE @MaxTermCode int = (SELECT MAX(TermCode) FROM  
	[dbo].[udf_GetTermCodeTableForPriorTwoAcademicYears](NULL))

	DECLARE myCursor CURSOR FOR
	SELECT 
		 t3.AcademicYear
		,t3.AcademicTermCode
		,t1.[Course]
		,t1.[SubjectCode]
		,t1.[CourseNumber]
		,t1.Title
		,u.CrossListing
		,Enrollment
		,NumCreditSections
		,NumNonCreditSections
  FROM [Tacos].[dbo].[CourseDescription] t1
  CROSS APPLY [dbo].[udf_ParseOutCrossListedCourses] (
	t1.[Course], t1.CrossListing
	) u
  INNER  JOIN [dbo].[DESII_CoursesForLastSixQuarters] t3 ON t1.SubjectCode = t3.SubjectCode
	AND (t1.CourseNumber = t3.CourseNumber OR t1.Course = u.CrossListing) 
  WHERE t1.[CrossListing]  IS NOT NULL AND Status = 'Active'
  ORDER BY 1, 3

  DECLARE @CommonRows TABLE ( 
	AcademicYear varchar(10), 
	AcademicTermCode varchar(10), 
	Course varchar(10), 
    SubjectCode varchar(3), 
	CourseNumber varchar(5), 
	Title varchar(MAX), 
	CrossListing varchar(10), 
    Enrollment int, 
	NumCreditSections int, 
	NumNonCreditSections int
  )

  DECLARE @AcademicYear varchar(10), @AcademicTermCode varchar(10), 
	  @Course varchar(10), @SubjectCode varchar(3), @CourseNumber varchar(5),
	  @Title varchar(MAX), @CrossListing varchar(10), @Enrollment int, 
	  @NumCreditSections int, @NumNonCreditSections int

  OPEN myCursor
  FETCH NEXT FROM myCursor INTO @AcademicYear, @AcademicTermCode, @Course, 
	@SubjectCode, @CourseNumber, @Title, @CrossListing, @Enrollment, 
    @NumCreditSections , @NumNonCreditSections 

  WHILE @@FETCH_STATUS <> -1
  BEGIN
	DECLARE @RowsPresent int
    SELECT @RowsPresent = (
		SELECT COUNT(*)  
		FROM @CommonRows t1
		WHERE t1.AcademicYear = @AcademicYear AND 
			t1.AcademicTermCode = @AcademicTermCode AND
			t1.Course = @Course AND 
			t1.Enrollment = @Enrollment AND 
			t1.NumCreditSections = @NumCreditSections AND
			t1.NumNonCreditSections = @NumNonCreditSections
		)

	-- Insert the primary row for each academic year:
	IF @RowsPresent = 0
		INSERT INTO @CommonRows (AcademicYear, AcademicTermCode, Course, SubjectCode, CourseNumber,
			CrossListing, Enrollment, NumCreditSections, NumNonCreditSections)
		VALUES (@AcademicYear, @AcademicTermCode, @Course, @SubjectCode, @CourseNumber, --@Title, -- We can't use this title,
	    -- because some of the titles for the cross-listed courses are slightly different due to punctuation and misspelt words.
			@Course, @Enrollment, @NumCreditSections , @NumNonCreditSections)

		--Every entry will refer to a cross-listed course, so add it to the table:
	INSERT INTO @CommonRows (AcademicYear, AcademicTermCode, Course, SubjectCode, CourseNumber, --Title, -- We can't use this title,
	-- because some of the titles for the cross-listed courses are slightly different due to punctuation and misspelt words.
		CrossListing, Enrollment, NumCreditSections, NumNonCreditSections)
	VALUES (@AcademicYear, @AcademicTermCode, @Course, @SubjectCode, @CourseNumber, --@Title, 
		@CrossListing, @Enrollment, @NumCreditSections , @NumNonCreditSections)

	FETCH NEXT FROM myCursor INTO @AcademicYear, @AcademicTermCode, @Course , @SubjectCode, @CourseNumber, @Title, 
		@CrossListing, @Enrollment, @NumCreditSections, @NumNonCreditSections 
  END
  CLOSE myCursor
  DEALLOCATE myCursor

  -- Calculate the averages, set the titles and return the list of combined cross-listed courses:
  INSERT INTO @CrossListedCourseTotals
  SELECT 
	LEFT(t1.CrossListing,4) SubjectCode, 
	SUBSTRING(t1.CrossListing, 5,10) CourseNumber, 
	NULL AS DeptName,
	REPLACE(t1.CrossListing, ' ', '') AS [Number], 
	t3.Title AS [Name], 
	CONVERT(float, SUM(t1.Enrollment)) / CONVERT(float, SUM(t1.NumCreditSections)) AS AvgEnrollment,
	CONVERT(float, SUM(t1.NumNonCreditSections)) / CONVERT(float, SUM(t1.NumCreditSections)) AS AvgSectionsPerCourse,
	CONVERT(float, SUM(t1.NumCreditSections)) / 2 AS TimesOfferedPerYear,
	1 AS IsCrosslisted
  FROM @CommonRows t1
  INNER JOIN [dbo].[DESII_CoursesForLastSixQuarters] t2 ON 
	t1.CrossListing = t2.SubjectCode + ' ' + t2.CourseNumber -- This is necessary so we don't get an 
	--	entry for a cross-listing that was not offered in the past 6 quarters.
  LEFT OUTER JOIN CourseDescription t3 ON t1.CrossListing = t3.Course -- We add the title back to the record in this step.
  GROUP BY t1.CrossListing, t3.Title
  HAVING (SUM(t1.NumCreditSections) > 0)
  ORDER BY 1

  RETURN 

END
GO


