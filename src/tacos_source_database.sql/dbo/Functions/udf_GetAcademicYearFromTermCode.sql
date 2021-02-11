-- =============================================
-- Author:		Ken Taylor
-- Create date: February 4, 2021
-- Description:	Given a term code, determine the corresponding Academic Year
-- Notes: I just saved this as an example of how to determine the academic year from the termcode.
-- It should be optimized for better efficiency if we were to use it in a production setting.  
-- 
-- Usage:
/*
	USE [Tacos]
	GO

	SELECT dbo.udf_GetAcademicYearFromTermCode(201704) AS AcademicYear
	-- Should return 2017-18

	SELECT dbo.udf_GetAcademicYearFromTermCode(201803) AS AcademicYear
	-- Should also return 2017-18

*/
-- Modifications:
--
-- =============================================
CREATE FUNCTION udf_GetAcademicYearFromTermCode 
(
	-- Add the parameters for the function here
	@TermCode int
)
RETURNS varchar(7)
AS
BEGIN
	-- Declare the return variable here
	DECLARE @Result varchar(7)

	-- How to determine the academic year from the term code:
/*
Business rules:

Terms 04 - 10 use the term code''s year as the prefix, and the subsequent year''s 
	2 digit YR abberviation as the suffix
Any other terms, i.e. 01-03, use the subsequent year as the prefix, and the term code''s 
	2 digit YR abberviation as the suffix.

AcademicYear	AcademicTermcode

-- 2017-18:
2017-18	201803
2017-18	201802
2017-18	201801

2017-18	201710
2017-18	201709
2017-18	201708
2017-18	201707
2017-18	201706
2017-18	201705
2017-18	201704
--

-- 2016-17:
2016-17	201703
2016-17	201702
2016-17	201701

2016-17	201610
2016-17	201609
2016-17	201608
2016-17	201607
2016-17	201606
2016-17	201605
2016-17	201604
--
*/
	-- DECLARE @TermCode varchar(6) = '201704' -- Uncomment for testing

	DECLARE @TcYear varchar(4) = LEFT(@TermCode, 4) 
	DECLARE @TcTerm varchar(2) = RIGHT(@TermCode, 2)
	DECLARE @TermCodeYearPrefix varchar(4) = @TcYear
	DECLARE @PriorYearPrefix varchar(4) = CONVERT(varchar(4),CONVERT(int, @TermCodeYearPrefix -1))
	DECLARE @SubsequentYearPrefix varchar(4) = CONVERT(varchar(4), CONVERT(int,@TermCodeYearPrefix + 1))

	DECLARE @TermCodeYearSuffix varchar(2) = RIGHT(@TcYear,2)
	DECLARE @PriorYearSuffix varchar(2) = CONVERT(varchar(2), CONVERT(int, @TermCodeYearSuffix -1))
	DECLARE @SubsequentYearSuffix varchar(2) = CONVERT(varchar(2), CONVERT(int, @TermCodeYearSuffix +1))

	DECLARE @AcademicYear varchar(7) = ''

	SELECT @AcademicYear = CASE WHEN @TcTerm BETWEEN '04' AND '10' THEN @TermCodeYearPrefix + '-' + @SubsequentYearSuffix
							ELSE @PriorYearPrefix +'-' + @TermCodeYearSuffix END

	--PRINT @AcademicYear

	SELECT @Result = @AcademicYear

	-- Return the result of the function
	RETURN @Result

END