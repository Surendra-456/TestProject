namespace TeamHub.API.Responses;

public sealed record PublicEmployeeSummary(
    int Id,
    string Name,
    string? Designation,
    string? Department,
    string? TeamName,
    string? ImageBase64);