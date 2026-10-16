using System.ComponentModel.DataAnnotations;

namespace TeamHub.Application.DTOs.Employee;

public class UpdateEmployeeReleaseDetailsRequest
{
    public DateOnly? ReleaseDate { get; set; }

    [MaxLength(250)]
    public string? ReasonForRelease { get; set; }
}