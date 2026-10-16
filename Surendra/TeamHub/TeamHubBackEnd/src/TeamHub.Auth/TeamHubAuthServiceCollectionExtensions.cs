using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TeamHub.Auth.Services;
using Microsoft.IdentityModel.Tokens;

namespace TeamHub.Auth;

public static class TeamHubAuthServiceCollectionExtensions
{
    public static IServiceCollection AddTeamHubAuth(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var tenantId = configuration["Authentication:Entra:TenantId"];
        var apiClientId = configuration["Authentication:Entra:ApiClientId"];
        if (string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(apiClientId))
        {
            throw new InvalidOperationException(
                "Set Authentication:Entra:TenantId and Authentication:Entra:ApiClientId before starting the API.");
        }

        var authority = $"https://login.microsoftonline.com/{tenantId}/v2.0";

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.Authority = authority;
                options.Audience = apiClientId;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    NameClaimType = "preferred_username",
                    RoleClaimType = "Role"
                };
            });

        services.AddAuthorization(options =>
        {
            var adminPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .RequireRole("Admin")
                .Build();

            options.AddPolicy("AdminOnly", adminPolicy);
            options.FallbackPolicy = adminPolicy;
        });

        services.AddScoped<IClaimsTransformation, TeamHubClaimsTransformation>();
        return services;
    }
}
