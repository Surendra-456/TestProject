using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TeamHub.API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class CurrentUserController : ControllerBase
{
    [Authorize]
    [HttpGet("me")]
    public ActionResult<CurrentUserResponse> GetCurrentUser()
    {
        if (!int.TryParse(User.FindFirstValue("UserId"), out var userId) ||
            !int.TryParse(User.FindFirstValue("EmployeeId"), out var employeeId))
        {
            return Unauthorized();
        }

        return Ok(new CurrentUserResponse(
            userId,
            employeeId,
            User.FindFirstValue("preferred_username") ?? User.FindFirstValue("email") ?? string.Empty,
            User.FindAll("Role").Select(claim => claim.Value).Distinct(StringComparer.OrdinalIgnoreCase).ToArray()));
    }
}

public sealed record CurrentUserResponse(int UserId, int EmployeeId, string Username, IReadOnlyList<string> Roles);