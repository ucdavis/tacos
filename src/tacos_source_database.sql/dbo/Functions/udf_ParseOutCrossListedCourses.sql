
-- =============================================
-- Author:		Ken Taylor
-- Create date: October 11, 2018
-- Description:	Parse out individual cross-listed courses 
-- from the course and cross-listed course sting provided.
-- Usage:
/*

USE [Tacos]
GO

SELECT * FROM [dbo].[udf_ParseOutCrossListedCourses] (
  'SOC 012Y',
  'SOC 012Y, PSC 12Y, POL 012Y')

  SELECT * FROM [dbo].[udf_ParseOutCrossListedCourses] (
  'POL 012Y',
  'SOC 012Y, CMN 012Y, and POL 012Y')

  SELECT * FROM [dbo].[udf_ParseOutCrossListedCourses] (
  'ECL 212B',
  'ESP 212B and ENV 200B.')

  SELECT * FROM [dbo].[udf_ParseOutCrossListedCourses] (
  'ESM 118', 'HYD 118; EBS 148.')

   SELECT * FROM [dbo].[udf_ParseOutCrossListedCourses] (
  'HYD 118', ' ESM 118; EBS 148.')

   SELECT * FROM [dbo].[udf_ParseOutCrossListedCourses] (
  'EBS 148', 'ESM 118; HYD 118.')
  

GO

-- How to use in a query:

  SELECT t1.[Course]
      ,t1.[SubjectCode]
      ,t1.[CourseNumber]
      ,t1.[Title]
      ,t1.CrossListing
	  ,u.CrossListing
  FROM [Tacos].[dbo].[CourseDescription] t1
  CROSS APPLY [dbo].[udf_ParseOutCrossListedCourses] (
	t1.[Course], t1.CrossListing
	) u
  WHERE t1.[CrossListing]  IS NOT NULL
  ORDER BY 1

*/
-- Modifications:
--	20210202 by kjt: Adding logic for removing leading spaces and semi-colons.
--
-- =============================================
CREATE FUNCTION [dbo].[udf_ParseOutCrossListedCourses] 
(
	@Course varchar(10),
	@CrossListing varchar(200)
)
RETURNS 
@CrossListings TABLE 
(
	Course varchar(10), 
	CrossListing varchar(100)
)
AS
BEGIN
	-- Split out the cross-listed courses:
	-- Uncomment below to run as script for testing: ------------------------------------
 --DECLARE @Course varchar(8) = --'EBS 148.'--'HYD 118'--'ESM 118' --'AAS 153' --'CMN 012Y'
 --DECLARE @CrossListing varchar(100) = --'ESM 118; HYD 118.'--' ESM 118; EBS 148.'--'HYD 118; EBS 148.' --'SOC 012Y, POL 012Y, and PSC 012Y' --'MSA 131B and CTS 146B'--'SOC 012Y, POL 012Y, and PSC 012Y'
 --DECLARE @CrossListings TABLE (Course varchar(10), CrossListedCourse varchar(10))
--------------------------------------------------------------------------------------
 DECLARE @CrossListedCourse varchar(10)
 DECLARE @AndPresentAt int
 DECLARE @NumCommas int

	SELECT @CrossListing = REPLACE(@CrossListing, '.', '') -- Remove any periods.
	SELECT @CrossListing = REPLACE(@CrossListing, ' 12Y', ' 012Y')  -- The leading zero
	SELECT @CrossListing = REPLACE(@CrossListing, ';', ',') -- Replace and semi-colons with commas.
	SELECT @CrossListing = LTRIM(@CrossListing) -- Remove any leading spaces.
	-- Handle the comma(s) prior to the "and":
	SELECT @AndPresentAt = CHARINDEX('and', @CrossListing)
	SELECT @NumCommas = LEN(@CrossListing) - LEN(REPLACE(@CrossListing, ',', ''))

	DECLARE @NumCommasProcessed int = 0
	WHILE @NumCommasProcessed <  @NumCommas
	BEGIN
		SELECT @CrossListedCourse = LEFT(@CrossListing,CHARINDEX(',',@CrossListing,0) -1) -- Looking for the comma
		SELECT @CrossListing = (SELECT REPLACE(@CrossListing, @CrossListedCourse, ''))
		SELECT @CrossListing = (
			SELECT LTRIM(SUBSTRING(@CrossListing, CHARINDEX(',',@CrossListing,0)+1, 50)) -- Using an LTRIM just in case they didn't use a space after the comma.
		)

		INSERT INTO @CrossListings VALUES (@Course, @CrossListedCourse)
		SELECT @NumCommasProcessed = @NumCommasProcessed + 1
	END
	DECLARE @LocationOfAnd int = (SELECT CHARINDEX('and', @CrossListing, 0 ))

	IF @LocationOfAnd >=10
	BEGIN
		-- Handle the course before the "and" for only 2 CrossListied courses:
		SELECT @CrossListedCourse = RTRIM(LEFT(@CrossListing,CHARINDEX('and',@CrossListing,0) -1)) 
		INSERT INTO @CrossListings VALUES (@Course, @CrossListedCourse)
	END
	IF @LocationOfAnd > 0
	BEGIN
		-- Handle the course after the "and":
		SELECT @CrossListedCourse = (
			SELECT LTRIM(SUBSTRING(@CrossListing, CHARINDEX('and', @CrossListing, 0 ) + 3, 50)) -- Looking for the space after the and
		) 
		INSERT INTO @CrossListings VALUES (@Course, @CrossListedCourse)
	END
	ELSE -- Handle a single crosslisted course only:
		INSERT INTO @CrossListings VALUES (@Course, @CrossListing)
	
	RETURN 
END