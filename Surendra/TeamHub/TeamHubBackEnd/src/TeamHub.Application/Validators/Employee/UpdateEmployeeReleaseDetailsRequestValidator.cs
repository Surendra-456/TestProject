using FluentValidation;
using TeamHub.Application.DTOs.Employee;

namespace TeamHub.Application.Validators.Employee;

public sealed class UpdateEmployeeReleaseDetailsRequestValidator : AbstractValidator<UpdateEmployeeReleaseDetailsRequest>
{
    public UpdateEmployeeReleaseDetailsRequestValidator()
    {
        RuleFor(request => request.ReleaseDate)
            .NotNull()
            .WithMessage("Release date is required.");

        RuleFor(request => request.ReasonForRelease)
            .Cascade(CascadeMode.Stop)
            .Must(reason => !string.IsNullOrWhiteSpace(reason)).WithMessage("Reason for release is required.")
            .MaximumLength(250).WithMessage("Reason for release must be 250 characters or fewer.");
    }
}