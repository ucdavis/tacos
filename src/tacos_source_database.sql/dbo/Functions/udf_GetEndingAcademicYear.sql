-- =============================================
-- Author:		Ken Taylor
-- Create date: October 10, 2018
-- Description:	Given a TermCode, return the 
--	ending AcademicYear to use in the where clause.
-- Usage:
/*

USE [Tacos]
GO

SELECT [dbo].[udf_GetEndingAcademicYear] (NULL)
GO

*/
CREATE FUNCTION [dbo].[udf_GetEndingAcademicYear]
(
	@TermCode int -- The current term code for the present date
	--	or whatever ending term code desired.
)
RETURNS varchar(10)
AS
BEGIN
	IF @TermCode = 0 OR @TermCode IS NULL
		SELECT @TermCode = (
			SELECT [dbo].[udf_GetCurrentTermCode]()
		)

	DECLARE @Result varchar(10)

	DECLARE @Year int = LEFT(@TermCode,4)
	DECLARE @QuarterCode varchar(2) = RIGHT(@TermCode,2)
	DECLARE @EndingAcademicYear varchar(10)

	IF @QuarterCode = '10'
		SELECT @EndingAcademicYear = (
			SELECT DISTINCT AcademicYear 
			FROM DESII_Courses
			WHERE AcademicTermCode = CONVERT(char(4), @Year -2) + @QuarterCode)
	ELSE
		SELECT @EndingAcademicYear = (
			SELECT DISTINCT AcademicYear 
			FROM DESII_Courses
			WHERE AcademicTermCode = CONVERT(char(4), @Year -3) + @QuarterCode)


	SELECT @Result = @EndingAcademicYear

	RETURN @Result

END