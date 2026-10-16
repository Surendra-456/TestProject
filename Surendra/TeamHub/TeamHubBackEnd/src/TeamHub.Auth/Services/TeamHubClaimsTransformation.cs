using System.Security.Claims;
using Dapper;
using Microsoft.AspNetCore.Authentication;
using TeamHub.Infrastructure.Database;

namespace TeamHub.Auth.Services;

internal sealed class TeamHubClaimsTransformation(IDbConnectionFactory connectionFactory) : IClaimsTransformation
{
    private const string ResolvedClaim = "teamhub_identity_resolved";

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var identity = principal.Identity as ClaimsIdentity;
        var tenantId = principal.FindFirst("tid")?.Value;
        var objectId = principal.FindFirst("oid")?.Value;
        if (identity is null || !identity.IsAuthenticated ||
            string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(objectId) ||
            principal.HasClaim(ResolvedClaim, "true"))
        {
            return principal;
        }

        var email = principal.FindFirst("email")?.Value;

        using var connection = connectionFactory.CreateConnection();
        const string sql = """
            DECLARE @UserId INT;

            SELECT @UserId = UserId
            FROM dbo.Users
            WHERE EntraTenantId = @TenantId AND EntraObjectId = @ObjectId;

            IF @UserId IS NULL AND @Email IS NOT NULL
            BEGIN
                UPDATE u WITH (UPDLOCK, ROWLOCK)
                SET EntraTenantId = @TenantId,
                    EntraObjectId = @ObjectId
                FROM dbo.Users u
                INNER JOIN dbo.Employees e ON e.EmployeeId = u.EmployeeId
                WHERE u.EntraTenantId IS NULL
                  AND u.EntraObjectId IS NULL
                  AND u.IsActive = 1
                  AND e.IsActive = 1
                  AND LOWER(LTRIM(RTRIM(e.Email))) = LOWER(LTRIM(RTRIM(@Email)))
                  AND NOT EXISTS
                  (
                      SELECT 1 FROM dbo.Users existing
                      WHERE existing.EntraTenantId = @TenantId
                        AND existing.EntraObjectId = @ObjectId
                  );

                SELECT @UserId = UserId
                FROM dbo.Users
                WHERE EntraTenantId = @TenantId AND EntraObjectId = @ObjectId;
            END;

            SELECT u.UserId, u.EmployeeId, r.RoleName
            FROM dbo.Users u
            INNER JOIN dbo.Employees e ON e.EmployeeId = u.EmployeeId
            INNER JOIN dbo.Roles r ON r.RoleId = e.RoleId
            WHERE u.UserId = @UserId
              AND u.IsActive = 1
              AND e.IsActive = 1
              AND r.IsActive = 1;
            """;
        var linkedUser = await connection.QueryFirstOrDefaultAsync<LinkedUser>(
            new CommandDefinition(sql, new { TenantId = tenantId, ObjectId = objectId, Email = email }));

        identity.AddClaim(new Claim(ResolvedClaim, "true"));
        if (linkedUser is not null)
        {
            identity.AddClaim(new Claim("UserId", linkedUser.UserId.ToString(System.Globalization.CultureInfo.InvariantCulture)));
            identity.AddClaim(new Claim("EmployeeId", linkedUser.EmployeeId.ToString(System.Globalization.CultureInfo.InvariantCulture)));
            identity.AddClaim(new Claim("Role", linkedUser.RoleName));
        }

        return principal;
    }

    private sealed record LinkedUser(int UserId, int EmployeeId, string RoleName);
}