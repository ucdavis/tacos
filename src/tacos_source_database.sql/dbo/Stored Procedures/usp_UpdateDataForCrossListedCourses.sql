-- =============================================
-- Author:		Ken Taylor
-- Create date: February 3, 2021
-- Description:	Update the data for the cross-listed courses.
-- Prerequsites: The Courses table must have already been loaded with
--	the base course data.
-- Notes:
/*
Logic for populating the data for cross listed courses:
   Note that the courses table must have already been loaded, as we
   use the AverageEnrollment present in that table.

	Input:
	1. A list of all of the crosslisted courses, and their average enrollment from the courses table.
	2. A list of the crosslisted courses and their crosslistings.

	Output:
	1. Crosslisted courses with their sum of the Average Enrollment for the course itself and 
	each of its crosslistings.  This sum will be the new Average Enrollment for the crosslisted
	course and its corresponding crosslistings.
*/
-- Usage:

/*
	USE [Tacos]
	GO

	EXEC usp_UpdateDataForCrossListedCourses

*/
-- Modifications:
--

-- =============================================
CREATE PROCEDURE usp_UpdateDataForCrossListedCourses 
	-- Add the parameters for the stored procedure here
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    DECLARE @CommonRows TABLE (
	Course varchar(10),
	AverageEnrollment float,
	CombinedAverageEnrollment float,
	CrossListing varchar(10),
	CrossListingsString varchar(50),
	IsCrossListed bit,
	IsBaseCourse bit -- This allows us to easily determine the base row.
  )

	-- We're using the course description table for this as it
	--	will contain all the active courses, regardless of their
	--	enrollment values.
	-- We will not worry about whether or not a course was taught within
	-- the past 2 years at this time, because one of it's other sectons might have 
	-- been, and we'll figure that out using the courses table.

	-- @CommonRows contains each course (n times, one entry for each cross listing), 
	-- and the cross-listed course's individual cross listing(s), 
	-- plus the original non-parsed cross listing field from the CourseDescription table.
	-- Note that this does not add a row for the base course as a cross-listed entry, so we'll
	-- need to account for this later.

	-- Add record for each of the cross-listed courses:
	  INSERT INTO @CommonRows (Course, CrossListing, CrossListingsString, 
	  IsCrossListed, IsBaseCourse)
	  SELECT REPLACE(t1.Course, ' ', '') Course, 
		REPLACE(t2.CrossListing, ' ', ''), t1.CrossListing, 
		1 AS IsCrossListed,
		0 AS IsBaseCourse
	  FROM CourseDescription t1
	  CROSS APPLY  [dbo].[udf_ParseOutCrossListedCourses] (
		t1.[Course], t1.CrossListing
		) t2
	  WHERE t1.[CrossListing]  IS NOT NULL AND 
		Status = 'Active' --AND t1.Course = 'EBS 148'
	  ORDER BY t1.Course

	  -- Add a record for each of the base courses:
	  INSERT INTO @CommonRows (
			Course, 
			CrossListing,
			CrossListingsString,
			IsCrossListed,
			IsBaseCourse
		)
		SELECT DISTINCT Course, Course AS CrossListing, CrossListingsString, 
		1 AS IsCrossListed, 1 AS IsBaseCourse
		FROM @CommonRows t1
		ORDER BY Course, CrossListing, CrossListingsString

	 -- Set the AverageEnrollment for the base courses:
	  UPDATE @CommonRows
	  SET AverageEnrollment = t2.NonCrossListedAverageEnrollment
	  FROM @CommonRows t1
	  INNER JOIN Courses t2 ON t1.Course = t2.Number

	  -- This logic sets the average enrollment for the courses' cross-listed 
	  -- segments, which are currently set to the base course' AverageEnrollment:  
	  -- (See previous example.)

	UPDATE @CommonRows
	SET AverageEnrollment = t2.AverageEnrollment
	FROM @CommonRows t1
	INNER JOIN (
		SELECT t2.Course, t2.AverageEnrollment, t1.CrossListing
		FROM @CommonRows t1
		INNER JOIN @CommonRows t2 ON 
			t1.CrossListing = t2.Course
	) t2 ON t1.CrossListing = t2.Course

	-- Now we perform the actual update of the combined average enrollment:
	UPDATE @CommonRows
	SET CombinedAverageEnrollment = CombinedEnrollment
	FROM @CommonRows t1
	INNER JOIN (
		SELECT Course, SUM(AverageEnrollment) CombinedEnrollment
		FROM @CommonRows
		GROUP BY Course
	) t2 ON t1.Course = t2.Course

 ---- Check to make sure things happened as we had intended:
 -- SELECT Course, AverageEnrollment AS NonCrossListedAverageEnrollment,
	--CombinedAverageEnrollment AS AverageEnrollment,
	--CrossListingsString, IsCrossListed
 -- FROM @CommonRows
 -- WHERE IsBaseCourse = 1
 -- ORDER BY Course

  -- Second to last is to update the actual Courses table with all of the cross-listed course data:
	UPDATE Courses
	SET NonCrossListedAverageEnrollment = t2.NonCrossListedAverageEnrollment,
		AverageEnrollment = t2.CombinedAverageEnrollment,
		IsCrossListed = t2.IsCrossListed,
		CrossListingsString = t2.CrossListingsString
	FROM Courses t1
	INNER JOIN (
		SELECT Course, t1.AverageEnrollment AS NonCrossListedAverageEnrollment, 
			t1.IsCrossListed, t1.CrossListingsString,t1.CombinedAverageEnrollment 
		FROM @CommonRows t1
		INNER JOIN Courses t2 ON t1.Course = t2.Number
		WHERE IsBaseCourse = 1  
	) t2 ON t1.Number = t2.Course

	-- Last is to take care of some final housekeeping:

	-- Since we've identified all of the cross listed courses that are active, but
	-- not offered within the past 2 years, and other active, but not offered within
	-- the past 2 years courses must not be cross listed courses.
	-- Therefore, we can update any remaing null IsCrossListed fields with 0,
	-- as these courses can assumed not to be cross listed.
	--
	UPDATE Courses
	SET IsCrossListed = 0
	WHERE IsCrossListed IS NULL

	-- Populate the department name as this may have yet to be done:
	-- (I think there was/is an issue with updating the department name 
	-- using data present in the registration data as the department name can
	-- (and does) differ between one year and the next, and this caused duplicate
	-- entries.
	-- Making the update here using the CourseDescription table eliminates that 
	-- possibility, as the CourseDescription table only contains a single entry
	-- for each active course, and hence, only a single Department.)

	UPDATE Courses
	SET DeptName = t2.Department
	FROM Courses t1
	INNER JOIN ( 
		SELECT t2.*, t1.* 
		FROM Courses t1
		LEFT OUTER JOIN (
			SELECT DISTINCT Course, Department
			FROM CourseDescription
			WHERE Status = 'Active'
		) t2 ON t1.Number = REPLACE(Course, ' ' ,'')
	) t2 ON t1.Number = t2.Number
	WHERE t1.DeptName IS NULL AND t2.Department IS NOT NULL

END