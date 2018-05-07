USE [msdb]
GO

/****** Object:  Job [Load AZURE Tacos]    Script Date: 5/1/2018 11:07:33 AM ******/
BEGIN TRANSACTION
DECLARE @ReturnCode INT
SELECT @ReturnCode = 0
/****** Object:  JobCategory [[Uncategorized (Local)]]    Script Date: 5/1/2018 11:07:33 AM ******/
IF NOT EXISTS (SELECT name FROM msdb.dbo.syscategories WHERE name=N'[Uncategorized (Local)]' AND category_class=1)
BEGIN
EXEC @ReturnCode = msdb.dbo.sp_add_category @class=N'JOB', @type=N'LOCAL', @name=N'[Uncategorized (Local)]'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback

END

DECLARE @jobId BINARY(16)
EXEC @ReturnCode =  msdb.dbo.sp_add_job @job_name=N'Load AZURE Tacos', 
		@enabled=1, 
		@notify_level_eventlog=0, 
		@notify_level_email=0, 
		@notify_level_netsend=0, 
		@notify_level_page=0, 
		@delete_level=0, 
		@description=N'Truncate and reload the local tables, and then truncate and reload the Courses table on AzureTacos .', 
		@category_name=N'[Uncategorized (Local)]', 
		@owner_login_name=N'sa', @job_id = @jobId OUTPUT
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Make a local copy of BIA DESII_Courses table]    Script Date: 5/1/2018 11:07:33 AM ******/
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
		@command=N'USE [TACOS]
GO
    -- Copy all the BIA data into our own table so it can be indexed
    -- for faster response:

   TRUNCATE TABLE DESII_Courses --ForLastSixQuarters

   INSERT INTO DESII_Courses --ForLastSixQuarters
   SELECT * FROM vDESII_Courses
   ORDER BY SubjectCode, CourseNumber, AcademicTermCode DESC', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Make a local copt of the Registrar's Courses table]    Script Date: 5/1/2018 11:07:33 AM ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Make a local copt of the Registrar''s Courses table', 
		@step_id=2, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'    -- Copy over all the Course Descriptions from the Registrar''s Office
    TRUNCATE TABLE CourseDescription

	INSERT INTO CourseDescription
	SELECT DISTINCT [Course] 
		  ,[Title]     
		  ,[College]
		  ,[Department]
		  ,[Status]
		  ,Created_On AS CreatedOn, Updated_ON AS UpdatedOn
		  ,[Summary Of Course Contents] AS SummaryOfCourseContents, 
		   [Final Examination Requirement] AS FinalExaminationRequirement
	  FROM [ICMSP]..[NAVCOURSEINFO_AG].[COURSEDESCRIPTION]', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Copy the DESII Course data for just the last six(6) quarters into an indexed table.]    Script Date: 5/1/2018 11:07:33 AM ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Copy the DESII Course data for just the last six(6) quarters into an indexed table.', 
		@step_id=3, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Copy the course data for just the last quarters:
   TRUNCATE TABLE DESII_CoursesForLastSixQuarters

   INSERT INTO DESII_CoursesForLastSixQuarters
   SELECT t1.* FROM dbo.vDESII_CoursesForLastSixQuartersFromDESII_Courses t1
   --INNER JOIN [dbo].[vSixMostRecentTermCodesFromDESII_Courses] t2 ON t1.AcademicTermCode = t2.AcademicTermCode
   ORDER BY SubjectCode, CourseNumber, t1.AcademicTermCode DESC', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Load the courses table with data averages for the last six (6) quarters]    Script Date: 5/1/2018 11:07:33 AM ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Load the courses table with data averages for the last six (6) quarters', 
		@step_id=4, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Load up the course table:
	TRUNCATE TABLE dbo.Courses
	INSERT INTO dbo.Courses (SubjectCode, CourseNumber, Number, Name, AverageEnrollment, AverageSectionsPerCourse, TimesOfferedPerYear)
	SELECT     DISTINCT   t1.SubjectCode, t1.CourseNumber, t1.SubjectCode + t1.CourseNumber AS Number,
	COALESCE(t4.Title, t3.CourseName) AS Name, 
	CONVERT(float,SUM(t1.Enrollment)) / CONVERT(float,SUM(t1.NumCreditSections)) AS AverageEnrollment, 
	SUM(CONVERT(float, t1.NumNonCreditSections)) / SUM(CONVERT(float, t1.NumCreditSections)) AS AverageSectionsPerCourse,
	SUM(CONVERT(float, t1.NumCreditSections)) / 2  AS TimesOferedPerYear
	FROM            [dbo].[DESII_CoursesForLastSixQuarters] AS t1

	INNER JOIN (
		-- Get the max termcode for each course
		SELECT SubjectCode, CourseNumber, MAX(AcademicTermCode) TermCode
		FROM [dbo].[DESII_CoursesForLastSixQuarters]
		GROUP BY SubjectCode, CourseNumber

	) t2 ON t1.SubjectCode = t2.SubjectCode AND t1.CourseNumber = t2.CourseNumber
	INNER JOIN (
		-- get the course name corresponding to the max term code:
		SELECT SubjectCode, CourseNumber, CourseName, AcademicTermCode TermCode
		FROM [dbo].[DESII_CoursesForLastSixQuarters]
	) t3 ON t2.TermCode = t3.TermCode AND t2.SubjectCode = t3.SubjectCode AND t2.CourseNumber = t3.CourseNumber
	LEFT OUTER JOIN 
	(
		SELECT DISTINCT Course, MAX(CreatedOn) CreatedOn
		FROM CourseDescription 
		GROUP BY Course
	) t5 ON t1.SubjectCode + '' '' + t1.CourseNumber = t5.Course
	LEFT OUTER JOIN 
	(
		SELECT DISTINCT Course, CreatedOn, Title
		FROM CourseDescription 
	) t4 ON t5.Course = t4.Course AND t5.CreatedOn = t4.CreatedOn
	--WHERE  t1.SubjectCode = ''AAS'' AND t1.CourseNumber IN (''050'')
	GROUP BY t1.SubjectCode, t1.CourseNumber, COALESCE(t4.Title, t3.CourseName)--t3.CourseName
	HAVING        (SUM(t1.NumCreditSections) > 0)
	ORDER BY t1.SubjectCode, t1.CourseNumber', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Truncate AZURE Tacos  Coursrs and Reload]    Script Date: 5/1/2018 11:07:33 AM ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Truncate AZURE Tacos  Coursrs and Reload', 
		@step_id=5, 
		@cmdexec_success_code=0, 
		@on_success_action=1, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'	-- Truncate remote Courses table:
	EXECUTE AZURE_TACOS.Tacos.dbo.sp_executesql @statement = N''TRUNCATE TABLE dbo.Courses''

	-- Reload with updated data:
	INSERT INTO [AZURE_TACOS].[Tacos].[dbo].[Courses]
           ([Number]
           ,[Name]
           ,[AverageEnrollment]
           ,[AverageSectionsPerCourse]
           ,[TimesOfferedPerYear]
           )
	SELECT     [Number]
		  ,[Name]
		  ,[AverageEnrollment]
		  ,[AverageSectionsPerCourse]
		  ,[TimesOfferedPerYear]
	FROM [Tacos].[dbo].[Courses]
	ORDER BY Number
    
	', 
		@database_name=N'Tacos', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_update_job @job_id = @jobId, @start_step_id = 1
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_add_jobschedule @job_id=@jobId, @name=N'Run Azure Tacos Weekly Update', 
		@enabled=1, 
		@freq_type=8, 
		@freq_interval=3, 
		@freq_subday_type=1, 
		@freq_subday_interval=0, 
		@freq_relative_interval=0, 
		@freq_recurrence_factor=1, 
		@active_start_date=20180410, 
		@active_end_date=99991231, 
		@active_start_time=0, 
		@active_end_time=235959, 
		@schedule_uid=N'b2e2b853-4e26-419d-849f-888066df2581'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_add_jobserver @job_id = @jobId, @server_name = N'(local)'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
COMMIT TRANSACTION
GOTO EndSave
QuitWithRollback:
    IF (@@TRANCOUNT > 0) ROLLBACK TRANSACTION
EndSave:
GO

