USE [Tacos]
GO

/****** Object:  UserDefinedFunction [dbo].[udf_GetAcademicYearForNYearsAgo]    Script Date: 10/19/2018 3:36:40 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		Ken Taylor
-- Create date: October 10, 2018
-- Description:	Given a TermCode, return the 
--	AcademicYear for four years ago.
-- Usage:
/*

USE [Tacos]
GO

SELECT [dbo].[udf_GetAcademicYearForNYearsAgo] (
  NULL,  4) FourYearsAgo -- For four years ago

  
SELECT [dbo].[udf_GetAcademicYearForNYearsAgo] (
  NULL,  2) TwoYearsAgo -- For 2 years ago

 SELECT [dbo].[udf_GetAcademicYearForNYearsAgo] (
  NULL,  1) LastYear -- For last year ago

GO

*/
-- =============================================
CREATE FUNCTION [dbo].[udf_GetAcademicYearForNYearsAgo]
(
	@AcademicYear varchar(10), -- The EndingAcademicYear to be use in the where clause,
	-- i.e., the AcademicYear.
	@YearsAgo int -- The prior number of academic years to go back to.
)
RETURNS varchar(10)
AS
BEGIN
	IF @AcademicYear IS NULL OR @AcademicYear = 0
		SELECT @AcademicYear = (
			SELECT [dbo].[udf_GetEndingAcademicYear] (NULL)
		)

	DECLARE @Result varchar(10)
	DECLARE @BeginningEndingAcademicYear int = LEFT(@AcademicYear,4)
	DECLARE @BeginningStartingAcademic int = @BeginningEndingAcademicYear - @YearsAgo + 1
	DECLARE @BeginningAcademicYear varchar(10) = 
		CONVERT(char(4), @BeginningStartingAcademic) + '-' +
		CONVERT(char(2), RIGHT(@BeginningStartingAcademic + 1,2))
	SELECT @Result = @BeginningAcademicYear

	RETURN @Result

END
GO

