CREATE PROCEDURE dbo.usp_LoadCourseDescription
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    TRUNCATE TABLE dbo.CourseDescription;

    INSERT INTO dbo.CourseDescription
    (
        Course,
        SubjectCode,
        CourseNumber,
        CrossListing,
        Title,
        AbbreviatedTitle,
        CourseDescription,
        College,
        Department,
        Status,
        CreatedOn,
        UpdatedOn,
        FirstLearningActivity,
        FirstContactHoursPeriod,
        SecondLearningActivity,
        SecondContactHoursPeriod,
        ThirdLearningActivity,
        ThirdContactHoursPeriod,
        FourthLearningActivity,
        FourthContactHoursPeriod,
        Ge2ArtsHumanities,
        Ge2ScienceEngineering,
        Ge2SocialSciences,
        Ge2Diversity,
        Ge2WritingExperience,
        Ge3ArtsHumanities,
        Ge3ScienceEngineering,
        Ge3SocialSciences,
        Ge3AmericanCultures,
        Ge3DomesticDiversity,
        Ge3OralLiteracy,
        Ge3QuantitativeLiteracy,
        Ge3ScientificLiteracy,
        Ge3VisualLiteracy,
        Ge3WorldCultures,
        Ge3WritingExperience,
        Quarters,
        QuartersOffered,
        EffectiveTerm,
        Effective
    )
    SELECT DISTINCT
        src.Course,
        SUBSTRING(src.Course, 1, 3) AS SubjectCode,
        SUBSTRING(src.Course, 5, 10) AS CourseNumber,
        src.CrossListing,
        src.Title,
        src.AbbreviatedTitle,
        src.CourseDescription,
        src.College,
        src.Department,
        src.Status,
        src.CreatedOn,
        src.UpdatedOn,
        src.FirstLearningActivity,
        src.FirstContactHoursPeriod,
        src.SecondLearningActivity,
        src.SecondContactHoursPeriod,
        src.ThirdLearningActivity,
        src.ThirdContactHoursPeriod,
        src.FourthLearningActivity,
        src.FourthContactHoursPeriod,
        src.Ge2ArtsHumanities,
        src.Ge2ScienceEngineering,
        src.Ge2SocialSciences,
        src.Ge2Diversity,
        src.Ge2WritingExperience,
        src.Ge3ArtsHumanities,
        src.Ge3ScienceEngineering,
        src.Ge3SocialSciences,
        src.Ge3AmericanCultures,
        src.Ge3DomesticDiversity,
        src.Ge3OralLiteracy,
        src.Ge3QuantitativeLiteracy,
        src.Ge3ScientificLiteracy,
        src.Ge3VisualLiteracy,
        src.Ge3WorldCultures,
        src.Ge3WritingExperience,
        NULL AS Quarters,
        NULL AS QuartersOffered,
        src.EffectiveTerm,
        src.Effective
    FROM OPENQUERY(SIS, '
        SELECT
            z.COURSE AS Course,
            z.CROSS_LISTING AS CrossListing,
            z.TITLE AS Title,
            z.ABBRTITLE AS AbbreviatedTitle,
            z.COURSE_DESCRIPTION AS CourseDescription,
            z.COLLEGE AS College,
            z.DEPARTMENT AS Department,
            z.STATUS AS Status,
            z.Created_On AS CreatedOn,
            z.Updated_On AS UpdatedOn,
            c.ZCRICMS_1ST_LEARNING_ACTIVITY AS FirstLearningActivity,
            c.ZCRICMS_1ST_CONTCT_HRS_PERIOD AS FirstContactHoursPeriod,
            c.ZCRICMS_2ND_LEARNING_ACTIVITY AS SecondLearningActivity,
            c.ZCRICMS_2ND_CONTCT_HRS_PERIOD AS SecondContactHoursPeriod,
            c.ZCRICMS_3RD_LEARNING_ACTIVITY AS ThirdLearningActivity,
            c.ZCRICMS_3RD_CONTCT_HRS_PERIOD AS ThirdContactHoursPeriod,
            c.ZCRICMS_4TH_LEARNING_ACTIVITY AS FourthLearningActivity,
            c.ZCRICMS_4TH_CONTACT_HRS_PERIOD AS FourthContactHoursPeriod,
            c.ZCRICMS_GE2_ARTHUM AS Ge2ArtsHumanities,
            c.ZCRICMS_GE2_SCIENG AS Ge2ScienceEngineering,
            c.ZCRICMS_GE2_SOCSCI AS Ge2SocialSciences,
            c.ZCRICMS_GE2_DIV AS Ge2Diversity,
            c.ZCRICMS_GE2_WRT AS Ge2WritingExperience,
            c.ZCRICMS_GE3_ARTHUM AS Ge3ArtsHumanities,
            c.ZCRICMS_GE3_SCIENG AS Ge3ScienceEngineering,
            c.ZCRICMS_GE3_SOCSCI AS Ge3SocialSciences,
            c.ZCRICMS_GE3_AMRL AS Ge3AmericanCultures,
            c.ZCRICMS_GE3_DIVL AS Ge3DomesticDiversity,
            c.ZCRICMS_GE3_ORLL AS Ge3OralLiteracy,
            c.ZCRICMS_GE3_QNTL AS Ge3QuantitativeLiteracy,
            c.ZCRICMS_GE3_SCIL AS Ge3ScientificLiteracy,
            c.ZCRICMS_GE3_VISL AS Ge3VisualLiteracy,
            c.ZCRICMS_GE3_WRLL AS Ge3WorldCultures,
            c.ZCRICMS_GE3_WRTL AS Ge3WritingExperience,
            z.EFFECTIVE_TERM AS EffectiveTerm,
            t.STVTERM_DESC AS Effective
        FROM BANINST1.ZCVGVNT z
        LEFT JOIN SATURN.STVTERM t
            ON z.EFFECTIVE_TERM = t.STVTERM_CODE
        LEFT JOIN SATURN.ZCRICMS c
            ON c.ZCRICMS_COURSE = z.COURSE
           AND z.EFFECTIVE_TERM BETWEEN c.ZCRICMS_START_TERM AND c.ZCRICMS_END_TERM
        WHERE z.STATUS = ''Active''
    ') src;

    COMMIT TRANSACTION;
END;
GO
