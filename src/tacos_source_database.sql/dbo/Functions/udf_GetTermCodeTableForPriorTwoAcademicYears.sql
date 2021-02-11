

-- =============================================
-- Author:		Ken Taylor
-- Create date: October 10, 2018
-- Description:	Populate a table of term codes for the prior 2 
--	academic years to be used in the where clause.
-- Usage:
/*
USE [Tacos]
GO

SELECT * 
FROM [dbo].[udf_GetTermCodeTableForPriorTwoAcademicYears] (NULL)

GO
*/
-- Modifications:
-- 20190326 by kjt: Revised logic to return the correct termcode list.
--
-- =============================================
CREATE FUNCTION [dbo].[udf_GetTermCodeTableForPriorTwoAcademicYears] 
( 
	@CurrentTerm int = NULL
)
RETURNS @TermCodes TABLE (
	TermCode varchar(6)
)
AS
BEGIN
  
	 -- Build a list of term codes from the prior 2 academic years:
  DECLARE @Year int 
  DECLARE @QuarterCode varchar(2) = ''
 
  IF @CurrentTerm = 0 OR @CurrentTerm IS NULL
	SELECT @CurrentTerm = (SELECT [dbo].[udf_GetCurrentTermCode] ()
)

  SELECT @Year = LEFT(@CurrentTerm,4)
  SELECT @QuarterCode = RIGHT(@CurrentTerm,2)
  
  DECLARE @CurrentYear char(4) = CONVERT(char(4), @Year)
  DECLARE @OneYearAgo char(4) = CONVERT(char(4), @Year -1)
  DECLARE @TwoYearsAgo char(4) = CONVERT(char(4), @Year -2)
  DECLARE @ThreeYearsAgo char(4) = CONVERT(char(4), @Year -3)
  DECLARE @FourYearsAgo char(4) = CONVERT(char(4), @Year -4)
  DECLARE @FiveYearsAgo char(4) = CONVERT(char(4), @Year -5)

   If @QuarterCode IN ('01', '03')
  BEGIN
	INSERT INTO @TermCodes (TermCode) values
		(@ThreeYearsAgo + '10'),
		(@TwoYearsAgo	+ '01'),
		(@TwoYearsAgo	+ '03'),
		(@TwoYearsAgo	+ '10'),
		(@OneYearAgo	+ '01'),
		(@OneYearAgo	+ '03')
  END
  ELSE IF @QuarterCode = '10' 
  --Note: Term codes for any given academic year start in 10 of the previous year, and 01, and 03 of the year in question, i.e.,
  -- (yyyy-1)10, yyyy01, and yyyy03. 
	BEGIN
		INSERT INTO @TermCodes (TermCode) values
		(@TwoYearsAgo	+ '10'),
		(@OneYearAgo	+ '01'),
		(@OneYearAgo	+ '03'),
		(@OneYearAgo	+ '10'),
		(@CurrentYear	+ '01'),
		(@CurrentYear	+ '03')
	END

-- The quarter list is is what we're going to use in the where clause.

--201510, 201601, 201603, 201610, 201701, 201703

	RETURN

END