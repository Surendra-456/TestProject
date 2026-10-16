/*
    Authentication schema for TeamHub.
    Run against the existing TeamHub database after databasesesign.sql.
    Employee roles are stored in dbo.Employees.RoleId and reference dbo.Roles.
*/

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users
    (
        UserId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
        EmployeeId INT NOT NULL,
        Username NVARCHAR(100) NOT NULL,
        Email NVARCHAR(255)  NULL,
        EntraTenantId NVARCHAR(36) NULL,
        EntraObjectId NVARCHAR(36) NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT (1),
        LastLoginDate DATETIME2 NULL,
        CreatedDate DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedDate DEFAULT (SYSUTCDATETIME()),
        UpdatedDate DATETIME2 NULL,
        CONSTRAINT UQ_Users_EmployeeId UNIQUE (EmployeeId),
        CONSTRAINT UQ_Users_Username UNIQUE (Username),
        CONSTRAINT FK_Users_Employees FOREIGN KEY (EmployeeId) REFERENCES dbo.Employees(EmployeeId)
    );
END
GO

IF COL_LENGTH(N'dbo.Users', N'EntraTenantId') IS NULL
    ALTER TABLE dbo.Users ADD EntraTenantId NVARCHAR(36) NULL;
GO

IF COL_LENGTH(N'dbo.Users', N'EntraObjectId') IS NULL
    ALTER TABLE dbo.Users ADD EntraObjectId NVARCHAR(36) NULL;
GO

IF COL_LENGTH(N'dbo.Users', N'PasswordHash') IS NOT NULL AND EXISTS
(
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = N'PasswordHash' AND is_nullable = 0
)
    ALTER TABLE dbo.Users ALTER COLUMN PasswordHash NVARCHAR(MAX) NULL;
GO

IF COL_LENGTH(N'dbo.Users', N'PasswordSalt') IS NOT NULL AND EXISTS
(
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = N'PasswordSalt' AND is_nullable = 0
)
    ALTER TABLE dbo.Users ALTER COLUMN PasswordSalt NVARCHAR(MAX) NULL;
GO

IF COL_LENGTH(N'dbo.Users', N'PasswordHash') IS NOT NULL
   AND COL_LENGTH(N'dbo.Users', N'PasswordSalt') IS NOT NULL
BEGIN
    EXEC(N'UPDATE dbo.Users SET PasswordHash = NULL, PasswordSalt = NULL WHERE PasswordHash IS NOT NULL OR PasswordSalt IS NOT NULL;');
END
GO

IF COL_LENGTH(N'dbo.Users', N'PasswordHash') IS NOT NULL
    ALTER TABLE dbo.Users DROP COLUMN PasswordHash;
GO

IF COL_LENGTH(N'dbo.Users', N'PasswordSalt') IS NOT NULL
    ALTER TABLE dbo.Users DROP COLUMN PasswordSalt;
GO

DECLARE @FirstLoginDefaultConstraint SYSNAME;
SELECT @FirstLoginDefaultConstraint = dc.name
FROM sys.default_constraints dc
INNER JOIN sys.columns c
    ON c.object_id = dc.parent_object_id
   AND c.column_id = dc.parent_column_id
WHERE dc.parent_object_id = OBJECT_ID(N'dbo.Users')
  AND c.name = N'IsFirstLogin';

IF @FirstLoginDefaultConstraint IS NOT NULL
    EXEC(N'ALTER TABLE dbo.Users DROP CONSTRAINT ' + QUOTENAME(@FirstLoginDefaultConstraint));

IF COL_LENGTH(N'dbo.Users', N'IsFirstLogin') IS NOT NULL
    ALTER TABLE dbo.Users DROP COLUMN IsFirstLogin;
GO

INSERT INTO dbo.Users (EmployeeId, Username, Email, IsActive, CreatedDate)
SELECT e.EmployeeId, CONCAT(N'teamhub-', e.EmployeeId), e.Email, e.IsActive, SYSUTCDATETIME()
FROM dbo.Employees e
WHERE NOT EXISTS
(
    SELECT 1 FROM dbo.Users u WHERE u.EmployeeId = e.EmployeeId
);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Users_EntraIdentity' AND object_id = OBJECT_ID(N'dbo.Users'))
    CREATE UNIQUE INDEX UX_Users_EntraIdentity
        ON dbo.Users(EntraTenantId, EntraObjectId)
        WHERE EntraTenantId IS NOT NULL AND EntraObjectId IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = N'Admin')
    INSERT INTO dbo.Roles (RoleName, CreatedDate, IsActive)
    VALUES (N'Admin', SYSUTCDATETIME(), 1);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = N'Normal User')
    INSERT INTO dbo.Roles (RoleName, CreatedDate, IsActive)
    VALUES (N'Normal User', SYSUTCDATETIME(), 1);
GO

IF OBJECT_ID(N'dbo.RefreshTokens', N'U') IS NOT NULL
    UPDATE dbo.RefreshTokens
    SET RevokedDate = COALESCE(RevokedDate, SYSUTCDATETIME());
GO
