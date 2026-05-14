<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\JobVacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecruitmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_list_only_open_jobs(): void
    {
        [$company, $department] = $this->companyAndDepartment();

        JobVacancy::create($this->jobData($company, $department, ['title' => 'Open Engineer', 'status' => 'open']));
        JobVacancy::create($this->jobData($company, $department, ['title' => 'Draft Engineer', 'status' => 'draft']));

        $response = $this->getJson('/api/public/jobs');

        $response->assertOk()
            ->assertJsonPath('data.0.title', 'Open Engineer');

        $this->assertCount(1, $response->json('data'));
    }

    public function test_public_can_apply_to_open_job(): void
    {
        [$company, $department] = $this->companyAndDepartment();
        $job = JobVacancy::create($this->jobData($company, $department));

        $response = $this->postJson("/api/public/jobs/{$job->id}/apply", [
            'firstName' => 'Alex',
            'lastName' => 'Martinez',
            'email' => 'alex@example.com',
            'phone' => '+1 555 1234',
            'location' => 'Remote',
            'experience' => '7 years',
            'coverLetter' => 'I am excited to apply because my background matches this position well.',
            'resume_path' => 'resumes/alex.pdf',
        ]);

        $response->assertCreated()
            ->assertJsonPath('name', 'Alex Martinez')
            ->assertJsonPath('status', 'new')
            ->assertJsonPath('jobTitle', 'Senior Software Engineer');

        $this->assertDatabaseHas('applicants', [
            'email' => 'alex@example.com',
            'vacancy_id' => $job->id,
            'status' => 'new',
        ]);
    }

    public function test_hr_can_create_job_using_frontend_field_names(): void
    {
        [$company, $department] = $this->companyAndDepartment();
        $hr = Employee::factory()->manager()->create([
            'department_id' => $department->id,
            'permission_override' => ['manage_employees' => true],
        ]);

        $response = $this->actingAs($hr, 'api')->postJson('/api/job-vacancies', [
            'title' => 'Product Designer',
            'department' => $department->name,
            'location' => 'Remote',
            'type' => 'Full-time',
            'positions' => 1,
            'salaryMin' => 90000,
            'salaryMax' => 120000,
            'deadline' => now()->addMonth()->toDateString(),
            'description' => 'Create thoughtful product experiences.',
            'requirements' => "Portfolio required\nFigma experience",
            'responsibilities' => "Design workflows\nPartner with engineers",
            'benefits' => "Remote work\nLearning budget",
        ]);

        $response->assertCreated()
            ->assertJsonPath('title', 'Product Designer')
            ->assertJsonPath('department', $department->name)
            ->assertJsonPath('type', 'Full-time');

        $this->assertDatabaseHas('job_vacancies', [
            'title' => 'Product Designer',
            'company_id' => $company->id,
            'department_id' => $department->id,
            'employment_type' => 'full-time',
        ]);
    }

    public function test_hr_can_update_applicant_status_and_rating(): void
    {
        [$company, $department] = $this->companyAndDepartment();
        $hr = Employee::factory()->manager()->create([
            'permission_override' => ['manage_employees' => true],
        ]);
        $job = JobVacancy::create($this->jobData($company, $department));
        $applicant = Applicant::create([
            'vacancy_id' => $job->id,
            'first_name' => 'Sarah',
            'last_name' => 'Chen',
            'email' => 'sarah@example.com',
            'phone' => '+1 555 1234',
            'status' => 'new',
            'applied_at' => now(),
        ]);

        $response = $this->actingAs($hr, 'api')->patchJson("/api/applicants/{$applicant->id}", [
            'status' => 'shortlisted',
            'rating' => 4.5,
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'shortlisted')
            ->assertJsonPath('rating', 4.5);

        $this->assertDatabaseHas('applicants', [
            'id' => $applicant->id,
            'status' => 'shortlisted',
            'reviewed_by' => $hr->id,
        ]);
    }

    public function test_staff_cannot_manage_jobs(): void
    {
        $staff = Employee::factory()->staff()->create();

        $this->actingAs($staff, 'api')->getJson('/api/job-vacancies')
            ->assertForbidden();
    }

    private function companyAndDepartment(): array
    {
        $company = Company::create([
            'company_name' => 'Acme',
            'email' => 'acme@example.com',
            'phone' => '123',
            'expiration_date' => now()->addYear()->toDateString(),
        ]);

        $department = Department::create([
            'company_id' => $company->id,
            'name' => 'Engineering',
            'description' => 'Builds products',
        ]);

        return [$company, $department];
    }

    private function jobData(Company $company, Department $department, array $overrides = []): array
    {
        return array_merge([
            'company_id' => $company->id,
            'department_id' => $department->id,
            'title' => 'Senior Software Engineer',
            'location' => 'San Francisco, CA',
            'description' => 'Build and maintain product systems.',
            'requirements' => '5+ years experience',
            'employment_type' => 'full-time',
            'number_of_positions' => 1,
            'opening_date' => now()->subWeek()->toDateString(),
            'closing_date' => now()->addMonth()->toDateString(),
            'status' => 'open',
        ], $overrides);
    }
}
