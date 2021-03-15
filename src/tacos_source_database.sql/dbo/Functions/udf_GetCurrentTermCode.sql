
-- =============================================
-- Author:		Ken Taylor
-- Create date: October 10, 2018
-- Description:	Return the term code for the current quarter or the most recently term
-- if we're inbetween terms.
-- Usage:
/*
	USE Tacos
	GO

	SELECT [dbo].[udf_GetCurrentTermCode]() AS CurrentTerm

	GO
*/
-- Modifications:
-- 2019-03-26 by kjt: Revised to return the most recent termcode
--	if we're inbetween terms.
--
-- =============================================
CREATE FUNCTION [dbo].[udf_GetCurrentTermCode] 
(
)
RETURNS int
AS
BEGIN
	DECLARE @Result int

	SELECT @Result = (SELECT TOP (1) [Id]
	FROM [Students].[dbo].[TermCodes]
	WHERE [startDate] <= GETDATE() AND [endDate] >= DATEADD(dd, -111, GETDATE()) AND TypeCode = 'Q'
	ORDER BY startDate DESC)

	RETURN @Result

END