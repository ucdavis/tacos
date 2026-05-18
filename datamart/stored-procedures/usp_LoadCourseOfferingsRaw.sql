CREATE PROCEDURE dbo.usp_LoadCourseOfferingsRaw
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    TRUNCATE TABLE dbo.CourseOfferingsRaw;

    INSERT INTO dbo.CourseOfferingsRaw
    (
        AcademicYear,
        AcademicTermCode,
        CollegeCode,
        College,
        DeptCode,
        DeptName,
        SubjectCode,
        CourseNumber,
        CourseName,
        Enrollment,
        NumCreditSections,
        NumNonCreditSections
    )
    SELECT *
    FROM OPENQUERY
    (
        SIS,
        '
        SELECT DISTINCT
            ''20''
            || substr(stvterm_acyr_code, 1, 2)
            || ''-''
            || substr(stvterm_acyr_code, 3, 2)                  AS academic_year,
            ssbsect.ssbsect_term_code                           AS academic_term_code,
            stvcoll_code                                        AS college_code,
            stvcoll_desc                                        AS college,
            stvdept_code                                        AS dept_code,
            stvdept_desc                                        AS dept_name,
            ssbsect.ssbsect_subj_code                           AS subject_code,
            ssbsect.ssbsect_crse_numb                           AS course_number,
            scbcrse_title                                       AS course_name,
            SUM(enrollment)                                     AS enrollment,
            COUNT(DISTINCT substr(ssbsect_seq_numb, 1, 1))      AS num_credit_sections,
            SUM(non_credit_sections.non_credit_bearing_section) AS num_non_credit_sections
        FROM ssbsect
        LEFT OUTER JOIN stvsubj
            ON stvsubj_code = ssbsect_subj_code
        INNER JOIN stvterm
            ON stvterm_code = ssbsect_term_code
        INNER JOIN scbcrse
            ON scbcrse_subj_code = ssbsect_subj_code
           AND scbcrse_crse_numb = ssbsect_crse_numb
           AND scbcrse_csta_code = ''A''
           AND scbcrse_eff_term =
           (
               SELECT MAX(m.scbcrse_eff_term)
               FROM scbcrse m
               WHERE m.scbcrse_subj_code = ssbsect_subj_code
                 AND m.scbcrse_crse_numb = ssbsect_crse_numb
                 AND m.scbcrse_eff_term <= ssbsect_term_code
           )
        INNER JOIN stvcoll
            ON stvcoll_code = scbcrse_coll_code
        INNER JOIN stvdept
            ON stvdept_code = scbcrse_dept_code
        INNER JOIN
        (
            SELECT
                zftstcr_crn,
                zftstcr_term_code,
                COUNT(zftstcr_pidm) AS enrollment
            FROM zftstcr
            INNER JOIN zftsnap
                ON zftstcr_pidm = zftsnap_pidm
               AND zftstcr_term_code = zftsnap_term_code
               AND NVL(zftsnap_report_reg_ind, ''Y'') <> ''N''
               AND zftsnap_phase_ind = ''3''
               AND SUBSTR(zftsnap_term_code, 1, 4) >= (TO_CHAR(SYSDATE, ''YYYY'') - 3)
            WHERE zftstcr_rsts_code IN (''RE'')
              AND zftstcr_phase_ind = ''3''
            GROUP BY
                zftstcr_crn,
                zftstcr_term_code
        ) enrollment
            ON enrollment.zftstcr_crn = ssbsect_crn
           AND enrollment.zftstcr_term_code = ssbsect_term_code
        INNER JOIN
        (
            SELECT
                ssrmeet_term_code,
                ssrmeet_crn,
                SUM
                (
                    CASE
                        WHEN ssrmeet_credit_hr_sess = 0
                         AND ssrmeet_schd_code IN (''C'', ''D'', ''G'', ''H'')
                        THEN 1
                        ELSE 0
                    END
                ) AS non_credit_bearing_section
            FROM ssrmeet
            GROUP BY
                ssrmeet_term_code,
                ssrmeet_crn
        ) non_credit_sections
            ON non_credit_sections.ssrmeet_term_code = ssbsect.ssbsect_term_code
           AND non_credit_sections.ssrmeet_crn = ssbsect.ssbsect_crn
        WHERE substr(ssbsect.ssbsect_term_code, 1, 4) >= (to_char(sysdate, ''YYYY'') - 3)
        GROUP BY
            ''20''
            || substr(stvterm_acyr_code, 1, 2)
            || ''-''
            || substr(stvterm_acyr_code, 3, 2),
            ssbsect.ssbsect_term_code,
            stvcoll_code,
            stvcoll_desc,
            stvdept_code,
            stvdept_desc,
            ssbsect.ssbsect_subj_code,
            ssbsect.ssbsect_crse_numb,
            scbcrse_title,
            ssbsect_schd_code
        ORDER BY
            ssbsect.ssbsect_term_code,
            stvcoll_desc,
            stvdept_desc,
            ssbsect.ssbsect_subj_code,
            ssbsect.ssbsect_crse_numb,
            scbcrse_title
        '
    );

    COMMIT TRANSACTION;
END;
GO
