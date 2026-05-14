<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::updateOrCreate(
            ['email' => 'hr@tatari.local'],
            [
                'company_name' => 'Tatari Demo Company',
                'phone' => '+251911000000',
                'address' => 'Addis Ababa',
                'expiration_date' => Carbon::now()->addYear()->toDateString(),
            ]
        );

        foreach ([
            'Engineering' => 'Builds and maintains product systems.',
            'Product' => 'Plans product direction and delivery.',
            'Design' => 'Owns user experience and visual design.',
            'Human Resources' => 'Manages people operations.',
            'Marketing' => 'Runs brand and growth programs.',
            'Sales' => 'Manages customer acquisition.',
            'Finance' => 'Handles accounting and payroll support.',
        ] as $name => $description) {
            Department::updateOrCreate(
                ['company_id' => $company->id, 'name' => $name],
                ['description' => $description]
            );
        }
    }
}
