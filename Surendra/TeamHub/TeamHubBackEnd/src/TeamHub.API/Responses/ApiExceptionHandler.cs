using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace TeamHub.API.Responses;

public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (httpContext.RequestAborted.IsCancellationRequested)
        {
            return false;
        }

        var (status, title, detail) = exception switch
        {
            SqlException { Number: 2601 or 2627 } => (
                StatusCodes.Status409Conflict,
                "Duplicate value",
                "A record with this value already exists. Please use a unique value."),
            SqlException { Number: 547 } => (
                StatusCodes.Status409Conflict,
                "Related record conflict",
                "This record is referenced by other records and cannot be changed or deleted."),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Request failed",
                "An unexpected error occurred while processing your request.")
        };

        logger.LogError(exception, "API request failed with status {StatusCode}.", status);

        var problem = new ProblemDetails
        {
            Type = $"https://httpstatuses.com/{status}",
            Title = title,
            Status = status,
            Detail = detail,
            Instance = httpContext.Request.Path
        };
        ApiProblemDetailsFactory.AddResponseFields(problem, detail);

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}