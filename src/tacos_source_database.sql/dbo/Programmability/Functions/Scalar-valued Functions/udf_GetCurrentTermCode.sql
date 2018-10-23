USE [Tacos]
GO

/****** Object:  UserDefinedFunction [dbo].[udf_GetCurrentTermCode]    Script Date: 10/19/2018 3:37:12 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Ken Taylor
-- Create date: October 10, 2018
-- Description:	Return the term code for the current quarter
-- =============================================
CREATE FUNCTION [dbo].[udf_GetCurrentTermCode] 
(
)
RETURNS int
AS
BEGIN
	DECLARE @Result int

	SELECT @Result = (SELECT [Id]
	FROM [Students].[dbo].[TermCodes]
	WHERE [startDate] <= GETDATE() AND [endDate] >= GETDATE() AND TypeCode = 'Q')

	RETURN @Result

END
GO

