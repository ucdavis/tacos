USE [msdb]
GO

/****** Object:  Job [Load AZURE Tacos]    Script Date: 10/19/2018 3:15:37 PM ******/
BEGIN TRANSACTION
DECLARE @ReturnCode INT
SELECT @ReturnCode = 0
/****** Object:  JobCategory [[Uncategorized (Local)]]    Script Date: 10/19/2018 3:15:37 PM ******/
IF NOT EXISTS (SELECT name FROM msdb.dbo.syscategories WHERE name=N'[Uncategorized (Local)]' AND category_class=1)
BEGIN
EXEC @ReturnCode = msdb.dbo.sp_add_category @class=N'JOB', @type=N'LOCAL', @name=N'[Uncategorized (Local)]'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback

END

DECLARE @jobId BINARY(16)
EXEC @ReturnCode =  msdb.dbo.sp_add_job @job_name=N'Load AZURE Tacos', 
		@enabled=1, 
		@notify_level_eventlog=0, 
		@notify_level_email=2, 
		@notify_level_netsend=0, 
		@notify_level_page=0, 
		@delete_level=0, 
		@description=N'Truncate and reload the local tables, and then truncate and reload the Courses table on AzureTacos.', 
		@category_name=N'[Uncategorized (Local)]', 
		@owner_login_name=N'sa', 
		@notify_email_operator_name=N'apprequests', @job_id = @jobId OUTPUT
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Make a local copy of BIA DESII_Courses table]    Script Date: 10/19/2018 3:15:37 PM ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Make a local copy of BIA DESII_Courses table', 
		@step_id=1, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Truncate DESII_Courses table:

   TRUNCATE TABLE [dbo].[DESII_Courses]

-- Copy all the BIA data into our own table so it can be indexed
-- for faster response:

   INSERT INTO [dbo].[DESII_Courses]
   SELECT * FROM [dbo].[vDESII_Courses]
   ORDER BY SubjectCode, CourseNumber, AcademicTermCode DESC', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Make a local copy of CourseDescription table]    Script Date: 10/19/2018 3:15:37 PM ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Make a local copy of CourseDescription table', 
		@step_id=2, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'
-- Truncate the CourseDescription table:

    TRUNCATE TABLE [dbo].[CourseDescription]

-- Copy over all the Course Descriptions, i.e. Course Catalog information,
--  from the Registrar''''s Office:

	INSERT INTO [dbo].[CourseDescription]
	SELECT DISTINCT COURSE AS "Course"  
          , SUBSTRING(Course,1,3) "SubjectCode"
          , SUBSTRING(Course,5, 10) "CourseNumber"
		  ,CROSS_LISTING "CrossListing"
		  ,TITLE AS "Title"     
          ,ABBRTITLE "AbbreviatedTitle"
          ,COURSE_DESCRIPTION AS "CourseDescription" 
  		  ,COLLEGE AS "College" 
  		  ,DEPARTMENT AS "Department" 
  		  ,STATUS AS "Status" 
  		  ,Created_On AS "CreatedOn" 
		  ,Updated_ON AS "UpdatedOn"
		  --,Units
		  ,"1ST_LEARNING_ACTIVITY" AS "FirstLearningActivity"
		  ,"2ND_LEARNING_ACTIVITY" AS "SecondLearningActivity"
	      ,"3RD_LEARNING_ACTIVITY" AS "ThirdLearningActivity"
          ,"4TH_LEARNING_ACTIVITY" AS "FourthLearningActivity"
		  ,CONVERT(nvarchar(4000), QUARTERS) AS "Quarters"
		  ,QUARTERS_OFFERED AS "QuartersOffered"
          ,EFFECTIVE_TERM AS "EffectiveTerm"
        ,STVTERM_DESC AS "Effective"
  	  FROM SIS..BANINST1.ZCVGVNT
      LEFT OUTER JOIN SIS..SATURN.STVTERM ON EFFECTIVE_TERM = STVTERM_CODE
	  WHERE Status = ''Active''
	  ORDER BY Course 
', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Copy DESII Course data for the last two full academic years.]    Script Date: 10/19/2018 3:15:37 PM ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Copy DESII Course data for the last two full academic years.', 
		@step_id=3, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Truncate courses table: 

   TRUNCATE TABLE [dbo].[DESII_CoursesForLastSixQuarters]

-- Copy the course data for just the Fall, Winter, and Spring quarters 
-- for the last two (2) full academic years:

   INSERT INTO [dbo].[DESII_CoursesForLastSixQuarters]
   SELECT t1.* FROM [dbo].[vDESII_CoursesForLastSixQuartersFromDESII_Courses] t1
   ORDER BY SubjectCode, CourseNumber, t1.AcademicTermCode DESC
', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Truncate and repopulate the AggregatedCourses table non-cross-listed courses]    Script Date: 10/19/2018 3:15:37 PM ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Truncate and repopulate the AggregatedCourses table non-cross-listed courses', 
		@step_id=4, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Truncate the AggregatedCourses table:

	TRUNCATE TABLE [dbo].[AggregatedCourses]

-- Repopulate the AggregatedCourses table with aggregated data for
-- the non-cross-listed courses:

	INSERT INTO [dbo].[AggregatedCourses] (SubjectCode, CourseNumber, DeptName, Number, Name, AverageEnrollment, AverageSectionsPerCourse, TimesOfferedPerYear, IsCrossListed)
	SELECT * FROM [dbo].[udf_GetCombinedDataForNonCrossListedCourses]()', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Delete Cross-listed courses from the AggregatedCourses table and repopulate with cross-listed courses]    Script Date: 10/19/2018 3:15:37 PM ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Delete Cross-listed courses from the AggregatedCourses table and repopulate with cross-listed courses', 
		@step_id=5, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Delete Cross-listed courses from the AggregatedCourses table:

	DELETE FROM [dbo].[AggregatedCourses] WHERE IsCrossListed = 1

-- Repopulate with aggregated data for the cross-listed courses:

	INSERT INTO [dbo].[AggregatedCourses] (SubjectCode, CourseNumber, DeptName, Number, Name, AverageEnrollment, AverageSectionsPerCourse, TimesOfferedPerYear, IsCrossListed)
	SELECT * FROM [dbo].[udf_GetCombinedDataForCrossListedCourses]()', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Truncate and reload Courses table with aggregated data, plus other active courses from course catalog:]    Script Date: 10/19/2018 3:15:37 PM ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Truncate and reload Courses table with aggregated data, plus other active courses from course catalog:', 
		@step_id=6, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Truncate Courses table:

 	TRUNCATE TABLE [dbo].[Courses]

-- Reload the Courses table with aggregated course data
-- for the past two full academic years, plus other active
-- courses present in the course catalog:

	INSERT INTO [dbo].[Courses]
	SELECT * FROM [dbo].[vCurrentPlusActiveCourses]
	ORDER BY [Number]', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Truncate and Reload AZURE Tacos Courses]    Script Date: 10/19/2018 3:15:37 PM ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Truncate and Reload AZURE Tacos Courses', 
		@step_id=7, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'--Truncate remote Courses table:
	EXECUTE AZURE_TACOS.Tacos.dbo.sp_executesql @statement = N''TRUNCATE TABLE dbo.Courses''

-- Reload with updated data:
	INSERT INTO [AZURE_TACOS].[Tacos].[dbo].[Courses]
           ([Number]
           ,[Name]
           ,[AverageEnrollment]
           ,[AverageSectionsPerCourse]
           ,[TimesOfferedPerYear]
		   ,[IsCrossListed]
		   ,[IsOfferedWithinPastTwoYears]
           )
	SELECT     [Number]
		  ,[Name]
		  ,[AverageEnrollment]
		  ,[AverageSectionsPerCourse]
		  ,[TimesOfferedPerYear]
		  ,[IsCrossListed]
		  ,[IsOfferedWithinPastTwoYears]
	FROM [dbo].[Courses]
	ORDER BY Number

', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Truncate and Reload AZURE CourseDescription table]    Script Date: 10/19/2018 3:15:37 PM ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Truncate and Reload AZURE CourseDescription table', 
		@step_id=8, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Truncate remote CourseDescription table:
	EXECUTE AZURE_TACOS.Tacos.dbo.sp_executesql @statement = N''TRUNCATE TABLE dbo.CourseDescription''

-- Reload with updated table:
  INSERT INTO [AZURE_TACOS].[Tacos].[dbo].[CourseDescription] (
       [Course]
      ,[SubjectCode]
      ,[CourseNumber]
      ,[CrossListing]
      ,[Title]
      ,[AbbreviatedTitle]
      ,[CourseDescription]
      ,[College]
      ,[Department]
      ,[Status]
      ,[CreatedOn]
      ,[UpdatedOn]
      ,[FirstLearningActivity]
      ,[SecondLearningActivity]
      ,[ThirdLearningActivity]
      ,[FourthLearningActivity]
      ,[Quarters]
      ,[QuartersOffered]
      ,[EffectiveTerm]
      ,[Effective]
	)
  SELECT 
       REPLACE([Course],'' '','''')
      ,[SubjectCode]
      ,[CourseNumber]
      ,[CrossListing]
      ,[Title]
      ,[AbbreviatedTitle]
      ,[CourseDescription]
      ,[College]
      ,[Department]
      ,[Status]
      ,[CreatedOn]
      ,[UpdatedOn]
      ,[FirstLearningActivity]
      ,[SecondLearningActivity]
      ,[ThirdLearningActivity]
      ,[FourthLearningActivity]
      ,[Quarters]
      ,[QuartersOffered]
      ,[EffectiveTerm]
      ,[Effective]
  FROM [dbo].[CourseDescription]
', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Truncate and Reload AZURE DESII_Courses table with data for all terms within the past four academic years]    Script Date: 10/19/2018 3:15:37 PM ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Truncate and Reload AZURE DESII_Courses table with data for all terms within the past four academic years', 
		@step_id=9, 
		@cmdexec_success_code=0, 
		@on_success_action=1, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Truncate remote DESII_Courses table:
	EXECUTE AZURE_TACOS.Tacos.dbo.sp_executesql @statement = N''TRUNCATE TABLE dbo.DESII_Courses'' 

-- Reload with updated table for all terms occuring within the 
-- the past four (4) academic years:

-- Note: Data is intended to be used along with course description
-- for displaying further information regarding course enrollment.

 INSERT INTO [AZURE_TACOS].[Tacos].[dbo].[DESII_Courses](
       [AcademicYear]
      ,[AcademicTermCode]
      ,[College]
      ,[DeptName]
      ,[SubjectCode]
      ,[CourseNumber]
      ,[CourseName]
      ,[Enrollment]
      ,[NumCreditSections]
      ,[NumNonCreditSections]
)
SELECT DISTINCT [AcademicYear]
      ,[AcademicTermCode]
      ,[College]
      ,[DeptName]
      ,[SubjectCode]
      ,[CourseNumber]
      ,[CourseName]
      ,[Enrollment]
      ,[NumCreditSections]
      ,[NumNonCreditSections]
  FROM [dbo].[DESII_Courses]
  WHERE (
		AcademicYear BETWEEN 
			(SELECT [dbo].[udf_GetAcademicYearForNYearsAgo](NULL, 4)) AND
			(SELECT [dbo].[udf_GetEndingAcademicYear] (NULL))
		) 
  ORDER BY SubjectCode, CourseNumber, AcademicTermCode DESC', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_update_job @job_id = @jobId, @start_step_id = 1
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_add_jobschedule @job_id=@jobId, @name=N'Run AZURE Tacos Weekly Update', 
		@enabled=0, 
		@freq_type=8, 
		@freq_interval=1, 
		@freq_subday_type=1, 
		@freq_subday_interval=0, 
		@freq_relative_interval=0, 
		@freq_recurrence_factor=1, 
		@active_start_date=20181018, 
		@active_end_date=99991231, 
		@active_start_time=0, 
		@active_end_time=235959, 
		@schedule_uid=N'e360ca29-156f-44ae-89e1-9125e2ece1e9'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_add_jobserver @job_id = @jobId, @server_name = N'(local)'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
COMMIT TRANSACTION
GOTO EndSave
QuitWithRollback:
    IF (@@TRANCOUNT > 0) ROLLBACK TRANSACTION
EndSave:
GO

