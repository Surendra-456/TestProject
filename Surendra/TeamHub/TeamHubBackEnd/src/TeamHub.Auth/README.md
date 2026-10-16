# TeamHub authentication

TeamHub uses Microsoft Entra ID for sign-in. The API validates Entra access
tokens and resolves each identity to an active `Users` and `Employees` record.
TeamHub roles come from `Employees.RoleId` and `Roles.RoleName`.

## Entra app registrations

Create two single-tenant app registrations in the development Entra tenant:

1. Register the API. Under **Expose an API**, set its Application ID URI to
	`api://<API_CLIENT_ID>` and add a delegated scope named `access_as_user`.
	Configure the API to issue the `email` optional claim in access tokens; first
	sign-in matches it to the pending TeamHub account's work email.
2. Register the Angular SPA. Add `http://localhost:4200` as a **Single-page
	application** redirect URI, then grant delegated permission to the API's
	`access_as_user` scope.

Set these API environment variables (or equivalent user secrets):

```text
Authentication__Entra__TenantId=<tenant-id>
Authentication__Entra__ApiClientId=<api-client-id>
```

Set the Angular values in `src/environments/environment.ts`:

```ts
entra: {
  tenantId: '<tenant-id>',
  clientId: '<spa-client-id>',
  apiScope: 'api://<api-client-id>/access_as_user'
}
```

The API requires its tenant and client ID at startup and validates the access
token audience against the API client ID. Do not use the SPA client ID as the
API audience.

## Database and employee accounts

Run `../TeamHub.Infrastructure/authentication-schema.sql` against the existing
TeamHub database after the employee and role tables exist. New `Users` tables
store Entra IDs without password columns. On an existing database, the script
adds nullable Entra identity columns, removes the old password fields, and seeds
the `Admin` and `Normal User` roles. Existing login-history and refresh-token
tables are preserved, and active refresh tokens are revoked.

Creating an employee also creates a pending TeamHub `Users` row in the same
database transaction. No Microsoft 365 account is provisioned. When an
employee's Entra account signs in with the matching work email, TeamHub
stores its tenant ID and object ID and uses the employee's active role. Assign
the first Admin role to a trusted employee through a controlled database update;
never expose an unauthenticated role bootstrap.

Only enable email-based first-login linking when employee work email addresses
are controlled by the Entra tenant administrators. Otherwise, pre-link the
Entra object ID through a trusted administrative process before allowing sign-in.

## Access rules

The public Home page calls only the redacted `GET /api/employees/home` endpoint.
All other API endpoints require the `Admin` role by default. Normal users can
sign in and view Home, while Admin users can access People, Settings, and
employee operations. The API enforces these rules independently of the Angular
route guards and menu visibility.
