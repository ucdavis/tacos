CREATE TABLE [dbo].[CourseDescription] (
    [Course]                      VARCHAR (128)  NOT NULL,
    [Title]                       VARCHAR (250)  NULL,
    [College]                     VARCHAR (250)  NULL,
    [Department]                  VARCHAR (250)  NULL,
    [Status]                      VARCHAR (250)  NULL,
    [CreatedOn]                   VARCHAR (10)   NULL,
    [UpdatedOn]                   VARCHAR (10)   NULL,
    [SummaryOfCourseContents]     VARCHAR (3999) NULL,
    [FinalExaminationRequirement] VARCHAR (3999) NULL
);


GO
CREATE CLUSTERED INDEX [ClusteredIndex-20180410-111102]
    ON [dbo].[CourseDescription]([Course] ASC, [CreatedOn] DESC);

