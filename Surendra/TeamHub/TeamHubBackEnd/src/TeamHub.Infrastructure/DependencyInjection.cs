using Microsoft.Extensions.DependencyInjection;
using TeamHub.Application.Contracts.Repositories;
using TeamHub.Infrastructure.BloodGroups;
using TeamHub.Infrastructure.Database;
using TeamHub.Infrastructure.Departments;
using TeamHub.Infrastructure.Designations;
using TeamHub.Infrastructure.AddressTypes;
using TeamHub.Infrastructure.Genders;
using TeamHub.Infrastructure.JobTypes;
using TeamHub.Infrastructure.Recruitments;
using TeamHub.Infrastructure.Roles;
using TeamHub.Infrastructure.Skills;
using TeamHub.Infrastructure.Teams;
using TeamHub.Infrastructure.CotivityDepartments;
using TeamHub.Infrastructure.CotivityDesignations;
using TeamHub.Infrastructure.CotivityEmployees;
using TeamHub.Infrastructure.Employees;
using TeamHub.Infrastructure.BusinessUnits;
using TeamHub.Infrastructure.DressSizes;

namespace TeamHub.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddSingleton<IDbConnectionFactory>(new SqlConnectionFactory(connectionString));
        services.AddScoped<IBloodGroupRepository, BloodGroupRepository>();
        services.AddScoped<IDepartmentRepository, DepartmentRepository>();
        services.AddScoped<IDesignationRepository, DesignationRepository>();
        services.AddScoped<IGenderRepository, GenderRepository>();
        services.AddScoped<IAddressTypeRepository, AddressTypeRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<ITeamRepository, TeamRepository>();
        services.AddScoped<ISkillRepository, SkillRepository>();
        services.AddScoped<IRecruitmentRepository, RecruitmentRepository>();
        services.AddScoped<IJobTypeRepository, JobTypeRepository>();
        services.AddScoped<ICotivityDepartmentRepository, CotivityDepartmentRepository>();
        services.AddScoped<ICotivityDesignationRepository, CotivityDesignationRepository>();
        services.AddScoped<ICotivityEmployeeRepository, CotivityEmployeeRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IBusinessUnitRepository, BusinessUnitRepository>();
        services.AddScoped<IDressSizeRepository, DressSizeRepository>();

        return services;
    }
}