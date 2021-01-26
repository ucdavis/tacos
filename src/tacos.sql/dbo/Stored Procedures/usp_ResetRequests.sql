-- =============================================
-- Author:      Scott Kirkland
-- Create Date: 2/12/2020
-- Description: Reset all requests to non-submitted, no exception state
-- =============================================
CREATE PROCEDURE usp_ResetRequests

AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON

    -- Insert statements for procedure here
    UPDATE Requests set Approved = null, 
		Exception = 0, ExceptionAnnualizedTotal = 0, ExceptionAnnualCount = 0, ExceptionReason = null, ExceptionTotal = 0, 
		ApprovedComment = null, Submitted = 0, SubmittedBy = null, SubmittedOn = null

END