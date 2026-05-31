<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Company::query()
            ->withCount(['departments', 'employees', 'payrolls'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search): void {
                $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('industry', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate($request->integer('per_page', 15))
            ->through(fn (Company $company) => $this->payload($company)));
    }

    public function show(Company $company): JsonResponse
    {
        return response()->json($this->payload(
            $company->loadCount(['departments', 'employees', 'payrolls']),
            true
        ));
    }

    public function update(Request $request, Company $company): JsonResponse
    {
        $data = $request->validate([
            'company_name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('companies', 'email')->ignore($company->id)],
            'phone' => ['sometimes', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:100'],
            'size' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'website' => ['nullable', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:150'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'contact_title' => ['nullable', 'string', 'max:150'],
            'employee_count' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'registration_number' => ['nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'string', Rule::in(['pending', 'approved', 'rejected', 'active', 'inactive', 'suspended'])],
        ]);

        $company->update($data);

        $request->attributes->set('skip_audit_log', true);
        AuditLog::record(
            action: 'Updated company',
            module: 'Company',
            description: "Updated company settings for {$company->company_name}",
            employee: $request->user(),
            status: 'success'
        );

        return response()->json($this->payload(
            $company->fresh()->loadCount(['departments', 'employees', 'payrolls']),
            true
        ));
    }

    private function payload(Company $company, bool $includeDetails = false): array
    {
        $employeeCount = (int) ($company->employees_count ?: ($company->employee_count ?? 0));
        $status = $company->status ?? 'approved';

        $payload = [
            'id' => $company->id,
            'companyName' => $company->company_name,
            'name' => $company->company_name,
            'email' => $company->email,
            'phone' => $company->phone,
            'address' => $company->address,
            'industry' => $company->industry ?? 'General',
            'size' => $company->size ?? $this->sizeFromEmployeeCount($employeeCount),
            'country' => $company->country ?? '',
            'city' => $company->city ?? '',
            'website' => $company->website ?? '',
            'contactName' => $company->contact_name ?? $company->company_name,
            'contactEmail' => $company->contact_email ?? $company->email,
            'contactPhone' => $company->contact_phone ?? $company->phone,
            'jobTitle' => $company->contact_title ?? 'Company Admin',
            'employeeCount' => $employeeCount,
            'requestDate' => $company->created_at?->toISOString(),
            'status' => $status,
            'description' => $company->description ?? '',
            'registrationNumber' => $company->registration_number ?? 'COMP-'.$company->id,
        ];

        if ($includeDetails) {
            $payload['registeredDate'] = $company->created_at?->toDateString();
            $payload['expirationDate'] = $company->expiration_date?->toDateString();
            $payload['metrics'] = [
                'totalEmployees' => $employeeCount,
                'activeEmployees' => $employeeCount,
                'departments' => (int) ($company->departments_count ?? 0),
                'payrollRuns' => (int) ($company->payrolls_count ?? 0),
                'lastPayroll' => null,
            ];
        }

        return $payload;
    }

    private function sizeFromEmployeeCount(int $count): string
    {
        return match (true) {
            $count >= 1000 => 'Enterprise (1000+)',
            $count >= 200 => 'Large (200-1000)',
            $count >= 50 => 'Medium (50-200)',
            $count >= 10 => 'Small (10-50)',
            default => 'Startup (1-10)',
        };
    }
}
