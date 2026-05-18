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
        SecondLearningActivity,
        ThirdLearningActivity,
        FourthLearningActivity,
        Quarters,
        QuartersOffered,
        EffectiveTerm,
        Effective
    )
    SELECT DISTINCT
        COURSE AS Course,
        SUBSTRING(COURSE, 1, 3) AS SubjectCode,
        SUBSTRING(COURSE, 5, 10) AS CourseNumber,
        CROSS_LISTING AS CrossListing,
        TITLE AS Title,
        ABBRTITLE AS AbbreviatedTitle,
        COURSE_DESCRIPTION AS CourseDescription,
        COLLEGE AS College,
        DEPARTMENT AS Department,
        STATUS AS Status,
        Created_On AS CreatedOn,
        Updated_On AS UpdatedOn,
        [1ST_LEARNING_ACTIVITY] AS FirstLearningActivity,
        [2ND_LEARNING_ACTIVITY] AS SecondLearningActivity,
        [3RD_LEARNING_ACTIVITY] AS ThirdLearningActivity,
        [4TH_LEARNING_ACTIVITY] AS FourthLearningActivity,
        NULL AS Quarters,
        NULL AS QuartersOffered,
        EFFECTIVE_TERM AS EffectiveTerm,
        STVTERM_DESC AS Effective
    FROM SIS..BANINST1.ZCVGVNT z
    LEFT OUTER JOIN SIS..SATURN.STVTERM t
        ON z.EFFECTIVE_TERM = t.STVTERM_CODE
    WHERE z.STATUS = 'Active';

    COMMIT TRANSACTION;
END;
GO
