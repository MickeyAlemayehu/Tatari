<?php

namespace Database\Seeders;

use App\Models\Applicant;
use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\JobVacancy;
use Illuminate\Database\Seeder;

class RecruitmentSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('email', 'hr@tatari.local')->first() ?? Company::query()->first();
        $creator = Employee::where('email', 'manager@tatari.local')->first();

        if (! $company) {
            return;
        }

        $jobs = [
            [
                'department' => 'Engineering',
                'title' => 'Senior Software Engineer',
                'location' => 'Addis Ababa, Ethiopia',
                'employment_type' => 'full-time',
                'number_of_positions' => 2,
                'salary_min' => 120000,
                'salary_max' => 160000,
                'status' => 'open',
                'description' => 'Design, build, and maintain high-quality software solutions for the HR platform.',
                'responsibilities' => "Lead feature delivery\nReview code and mentor engineers\nCollaborate with product and design",
                'requirements' => "5+ years of software engineering experience\nReact and API development experience\nStrong problem-solving skills",
                'benefits' => "Competitive salary\nHealth coverage\nFlexible work",
            ],
            [
                'department' => 'Design',
                'title' => 'Product Designer',
                'location' => 'Remote',
                'employment_type' => 'full-time',
                'number_of_positions' => 1,
                'salary_min' => 90000,
                'salary_max' => 120000,
                'status' => 'open',
                'description' => 'Create thoughtful, accessible user experiences for HR workflows.',
                'responsibilities' => "Own product flows\nRun usability reviews\nMaintain design quality",
                'requirements' => "3+ years of product design experience\nStrong Figma portfolio\nExcellent communication",
                'benefits' => "Remote work\nLearning budget\nHealth coverage",
            ],
            [
                'department' => 'Marketing',
                'title' => 'Marketing Manager',
                'location' => 'Hawassa, Ethiopia',
                'employment_type' => 'full-time',
                'number_of_positions' => 1,
                'salary_min' => 100000,
                'salary_max' => 130000,
                'status' => 'open',
                'description' => 'Lead campaigns and growth programs for the company.',
                'responsibilities' => "Plan campaigns\nTrack performance\nCoordinate launches",
                'requirements' => "4+ years in marketing\nDigital marketing expertise\nTeam leadership experience",
                'benefits' => "Performance bonus\nHealth coverage\nPaid leave",
            ],
        ];

        foreach ($jobs as $job) {
            $department = Department::where('company_id', $company->id)
                ->where('name', $job['department'])
                ->first();

            if (! $department) {
                continue;
            }

            $vacancy = JobVacancy::updateOrCreate(
                ['company_id' => $company->id, 'title' => $job['title']],
                [
                    'department_id' => $department->id,
                    'location' => $job['location'],
                    'employment_type' => $job['employment_type'],
                    'number_of_positions' => $job['number_of_positions'],
                    'salary_min' => $job['salary_min'],
                    'salary_max' => $job['salary_max'],
                    'description' => $job['description'],
                    'responsibilities' => $job['responsibilities'],
                    'requirements' => $job['requirements'],
                    'benefits' => $job['benefits'],
                    'opening_date' => now()->subWeeks(2)->toDateString(),
                    'closing_date' => now()->addMonth()->toDateString(),
                    'status' => $job['status'],
                    'created_by' => $creator?->id,
                ]
            );

            $this->seedApplicants($vacancy);
        }
    }

    private function seedApplicants(JobVacancy $vacancy): void
    {
        $samples = [
            ['Abebe', 'Kebede', 'abebe.kebede@email.com', 'shortlisted', '7 years', 'Addis Ababa', 4.5],
            ['Chaltu', 'Tolessa', 'chaltu.tolessa@email.com', 'reviewing', '6 years', 'Remote', 4.0],
            ['Samuel', 'Assefa', 'samuel.assefa@email.com', 'new', '8 years', 'Hawassa', null],
        ];

        foreach ($samples as [$first, $last, $email, $status, $experience, $location, $rating]) {
            Applicant::updateOrCreate(
                ['vacancy_id' => $vacancy->id, 'email' => $email],
                [
                    'first_name' => $first,
                    'last_name' => $last,
                    'phone' => '+1 (555) 123-4567',
                    'location' => $location,
                    'experience' => $experience,
                    'rating' => $rating,
                    'cover_letter' => 'I am excited about this role and believe my experience is a strong match for the team.',
                    'resume_path' => 'resumes/demo.pdf',
                    'status' => $status,
                    'applied_at' => now()->subDays(rand(1, 10)),
                ]
            );
        }
    }
}
