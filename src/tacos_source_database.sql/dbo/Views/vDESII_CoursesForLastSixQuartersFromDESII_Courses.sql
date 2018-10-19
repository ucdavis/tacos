USE [Tacos]
GO

/****** Object:  View [dbo].[vDESII_CoursesForLastSixQuartersFromDESII_Courses]    Script Date: 10/19/2018 3:28:48 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



/*
	Author: by Ken Taylor
	Created: October 17, 2018
	
	Description: Selects just those records for the past two full academic years
	  from the dbo.DESII_Courses table.
	  .  Replaces the previous view, which used a hard-coded 
	  term codes list comprised of term codes for the past two academic years of 2015-16 and 
	  2016-17.  This version will roll the term codes forward once a new academic year
	  is completed.

	Prerequsites: dbo.DESII_Courses must have been loaded first.

	Requires: User defined function [dbo].[udf_GetTermCodeTableForPriorTwoAcademicYears](NULL)
	  to get a list of term codes for last two full academic years to be used in the where
	  clause.

	Usage:
	 
	 USE [Tacos]
	 GO
	 
	 SELECT * FROM  [dbo].[vDESII_CoursesForLastSixQuartersFromDESII_Courses]
	 ORDER BY SubjectCode, CourseNumber, AcademicYear, AcademicTermCode

	 GO

	Modifications:

*/
CREATE VIEW [dbo].[vDESII_CoursesForLastSixQuartersFromDESII_Courses]
AS 
SELECT DISTINCT AcademicYear, AcademicTermCode, t1.College, DeptName, t1.SubjectCode, t1.CourseNumber, CourseName, Enrollment, NumCreditSections, NumNonCreditSections
FROM            dbo.DESII_Courses t1
WHERE        (AcademicTermCode IN
                             (SELECT        TermCode
                               FROM            dbo.udf_GetTermCodeTableForPriorTwoAcademicYears(NULL)))
GO


