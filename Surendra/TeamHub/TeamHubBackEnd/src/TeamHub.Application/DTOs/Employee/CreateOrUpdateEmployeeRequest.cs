namespace TeamHub.Application.DTOs.Employee;

public class CreateOrUpdateEmployeeRequest
{
    public int ENumber { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public DateOnly JoinedDate { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? AlternateEmail { get; set; }
    public int DesignationId { get; set; }
    public int DepartmentId { get; set; }
    public int JobTypeId { get; set; }
    public int BloodGroupId { get; set; }
    public int GenderId { get; set; }
    public int? ReportsToEmployeeId { get; set; }
    public int? LeadEmployeeId { get; set; }
    public string? StationNumber { get; set; }
    public int? RecruitmentId { get; set; }
    public int ExtensionNumber { get; set; }
    public string CitizenshipNumber { get; set; } = string.Empty;
    public DateOnly? DateOfBirth { get; set; }
    public string PANNumber { get; set; } = string.Empty;
    public string? LockerNumber { get; set; }
    public int RoleId { get; set; }
    public int TeamId { get; set; }
    public int? CotivityEmployeeId { get; set; }
    public string? ImageBase64 { get; set; }
    public bool IsActive { get; set; } = true;
    public DateOnly? ReleaseDate { get; set; }
    public string? ReasonForRelease { get; set; }
    public IReadOnlyList<EmployeeAddressDto> Addresses { get; set; } = [];
    public IReadOnlyList<EmployeeSkillDto> Skills { get; set; } = [];
    public IReadOnlyList<EmployeeDressSizesDto> DressSizes { get; set; } = [];
}