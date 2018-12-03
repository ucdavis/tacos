CREATE TABLE [dbo].[DepartmentRoles] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [DepartmentId] INT            NOT NULL,
    [Role]         NVARCHAR (MAX) NOT NULL,
    [UserId]       NVARCHAR (450) NOT NULL,
    CONSTRAINT [PK_DepartmentRoles] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_DepartmentRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_DepartmentRoles_Departments_DepartmentId] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Departments] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_DepartmentRoles_UserId]
    ON [dbo].[DepartmentRoles]([UserId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_DepartmentRoles_DepartmentId]
    ON [dbo].[DepartmentRoles]([DepartmentId] ASC);

