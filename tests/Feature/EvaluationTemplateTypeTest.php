<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EvaluationAssignment;
use App\Models\EvaluationPeriod;
use App\Models\EvaluationQuestion;
use App\Models\EvaluationTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * Covers the migration of `evaluation_type` from question rows up to the
 * parent template row. After CHANGE 2, questions inherit their type from
 * the template they belong to.
 */
class EvaluationTemplateTypeTest extends TestCase
{
    use RefreshDatabase;

    public function test_questions_table_no_longer_has_evaluation_type_column(): void
    {
        $this->assertFalse(
            Schema::hasColumn('evaluation_questions', 'evaluation_type'),
            'evaluation_questions.evaluation_type should have been dropped by migration 2026_05_27_000005.'
        );
    }

    public function test_templates_table_has_evaluation_type_and_department_columns(): void
    {
        $this->assertTrue(Schema::hasColumn('evaluation_templates', 'evaluation_type'));
        $this->assertTrue(Schema::hasColumn('evaluation_templates', 'department_id'));
    }

    public function test_template_create_requires_evaluation_type(): void
    {
        [$company, , $manager] = $this->setupCompany();

        $response = $this->actingAs($manager, 'api')->postJson('/api/evaluation-templates', [
            'company_id' => $company->id,
            'title'      => 'Missing type',
            'weights'    => ['self' => 30, 'peer' => 30, 'manager' => 40],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['evaluation_type']);
    }

    public function test_template_create_persists_evaluation_type_and_department(): void
    {
        [$company, $department, $manager] = $this->setupCompany();

        $response = $this->actingAs($manager, 'api')->postJson('/api/evaluation-templates', [
            'company_id'      => $company->id,
            'title'           => 'Peer template — Engineering',
            'evaluation_type' => 'peer',
            'department_id'   => $department->id,
            'weights'         => ['self' => 30, 'peer' => 30, 'manager' => 40],
        ]);

        $response->assertCreated()
            ->assertJsonPath('evaluationType', 'peer')
            ->assertJsonPath('evaluation_type', 'peer')
            ->assertJsonPath('departmentId', $department->id);

        $this->assertDatabaseHas('evaluation_templates', [
            'title'           => 'Peer template — Engineering',
            'evaluation_type' => 'peer',
            'department_id'   => $department->id,
        ]);
    }

    public function test_template_update_can_change_evaluation_type(): void
    {
        [$company, , $manager] = $this->setupCompany();
        $template = $this->template($company, 'self');

        $response = $this->actingAs($manager, 'api')->patchJson("/api/evaluation-templates/{$template->id}", [
            'evaluation_type' => 'manager',
        ]);

        $response->assertOk()->assertJsonPath('evaluationType', 'manager');
        $this->assertSame('manager', $template->fresh()->evaluation_type);
    }

    public function test_question_create_does_not_accept_evaluation_type(): void
    {
        [$company, , $manager] = $this->setupCompany();
        $template = $this->template($company, 'self');

        $response = $this->actingAs($manager, 'api')->postJson('/api/evaluation-questions', [
            'template_id'     => $template->id,
            'text'            => 'Did you meet your goals this quarter?',
            'type'            => 'rating',
            'evaluation_type' => 'manager', // should be silently ignored
            'category'        => 'Goals',
        ]);

        $response->assertCreated();

        // Verify the question was created without persisting the rejected field.
        // The DB column doesn't exist, so we just check the question exists with
        // a template whose type is unchanged.
        $this->assertDatabaseHas('evaluation_questions', [
            'template_id' => $template->id,
            'text'        => 'Did you meet your goals this quarter?',
        ]);
        $this->assertSame('self', $template->fresh()->evaluation_type);
    }

    public function test_question_list_filter_by_evaluation_type_joins_through_template(): void
    {
        [$company, , $manager] = $this->setupCompany();
        $selfTemplate    = $this->template($company, 'self');
        $peerTemplate    = $this->template($company, 'peer');
        $managerTemplate = $this->template($company, 'manager');

        EvaluationQuestion::create(['template_id' => $selfTemplate->id,    'text' => 'self q',    'type' => 'rating']);
        EvaluationQuestion::create(['template_id' => $peerTemplate->id,    'text' => 'peer q',    'type' => 'rating']);
        EvaluationQuestion::create(['template_id' => $managerTemplate->id, 'text' => 'manager q', 'type' => 'rating']);

        $response = $this->actingAs($manager, 'api')
            ->getJson('/api/evaluation-questions?evaluation_type=peer');

        $response->assertOk();
        $texts = collect($response->json('data'))->pluck('text')->all();

        $this->assertContains('peer q', $texts);
        $this->assertNotContains('self q', $texts);
        $this->assertNotContains('manager q', $texts);
    }

    public function test_question_payload_does_not_expose_evaluation_type(): void
    {
        [$company, , $manager] = $this->setupCompany();
        $template = $this->template($company, 'manager');
        $question = EvaluationQuestion::create([
            'template_id' => $template->id,
            'text'        => 'Manager-level question',
            'type'        => 'rating',
        ]);

        $response = $this->actingAs($manager, 'api')
            ->getJson("/api/evaluation-questions/{$question->id}");

        $response->assertOk();
        $json = $response->json();
        $this->assertArrayNotHasKey('evaluation_type', $json);
        $this->assertArrayNotHasKey('evaluationType', $json);
    }

    public function test_template_index_filter_by_evaluation_type(): void
    {
        [$company, , $manager] = $this->setupCompany();
        $this->template($company, 'self',    ['title' => 'Self T']);
        $this->template($company, 'peer',    ['title' => 'Peer T']);
        $this->template($company, 'manager', ['title' => 'Manager T']);

        $response = $this->actingAs($manager, 'api')
            ->getJson('/api/evaluation-templates?evaluation_type=manager');

        $response->assertOk();
        $titles = collect($response->json('data'))->pluck('title')->all();

        $this->assertContains('Manager T', $titles);
        $this->assertNotContains('Self T', $titles);
        $this->assertNotContains('Peer T', $titles);
    }

    public function test_questions_for_assignment_uses_template_level_type(): void
    {
        [$company, $department, $manager] = $this->setupCompany();
        $employee = Employee::factory()->staff()->create(['department_id' => $department->id]);

        // Two templates — a peer one (matches the assignment) and a manager one (should be ignored).
        $peerTemplate = $this->template($company, 'peer', ['status' => 'active']);
        EvaluationQuestion::create(['template_id' => $peerTemplate->id, 'text' => 'peer q 1', 'type' => 'rating', 'sort_order' => 0]);
        EvaluationQuestion::create(['template_id' => $peerTemplate->id, 'text' => 'peer q 2', 'type' => 'rating', 'sort_order' => 1]);

        $period = EvaluationPeriod::create([
            'company_id' => $company->id,
            'name'       => 'Test',
            'start_date' => now()->toDateString(),
            'end_date'   => now()->addMonth()->toDateString(),
            'status'     => 'active',
        ]);

        $assignment = EvaluationAssignment::create([
            'evaluation_period_id' => $period->id,
            'employee_id'          => $employee->id,
            'evaluator_id'         => $manager->id,
            'evaluator_type'       => 'peer',
            'template_id'          => $peerTemplate->id,
            'assigned_by'          => $manager->id,
            'assigned_at'          => now(),
        ]);

        $response = $this->actingAs($manager, 'api')
            ->getJson("/api/evaluation-questions/for-assignment/{$assignment->id}");

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
        $this->assertSame('peer', $response->json('template.evaluationType'));
    }

    public function test_questions_for_assignment_empty_when_template_type_mismatches_assignment(): void
    {
        [$company, $department, $manager] = $this->setupCompany();
        $employee = Employee::factory()->staff()->create(['department_id' => $department->id]);

        // Template is type=self but the assignment is for type=peer — mismatch → empty.
        $selfTemplate = $this->template($company, 'self', ['status' => 'active']);
        EvaluationQuestion::create(['template_id' => $selfTemplate->id, 'text' => 'self q', 'type' => 'rating']);

        $period = EvaluationPeriod::create([
            'company_id' => $company->id,
            'name'       => 'Test',
            'start_date' => now()->toDateString(),
            'end_date'   => now()->addMonth()->toDateString(),
            'status'     => 'active',
        ]);

        $assignment = EvaluationAssignment::create([
            'evaluation_period_id' => $period->id,
            'employee_id'          => $employee->id,
            'evaluator_id'         => $manager->id,
            'evaluator_type'       => 'peer',
            'template_id'          => $selfTemplate->id,
            'assigned_by'          => $manager->id,
            'assigned_at'          => now(),
        ]);

        $response = $this->actingAs($manager, 'api')
            ->getJson("/api/evaluation-questions/for-assignment/{$assignment->id}");

        $response->assertOk();
        $this->assertSame([], $response->json('data'));
        $this->assertNull($response->json('template'));
    }

    public function test_template_inline_questions_no_longer_carry_their_own_type(): void
    {
        [$company, , $manager] = $this->setupCompany();

        $response = $this->actingAs($manager, 'api')->postJson('/api/evaluation-templates', [
            'company_id'      => $company->id,
            'title'           => 'Mixed payload',
            'evaluation_type' => 'peer',
            'weights'         => ['self' => 30, 'peer' => 30, 'manager' => 40],
            'questions'       => [
                // Even if the caller sends evaluation_type, the server must ignore it.
                ['text' => 'Q1', 'type' => 'rating', 'evaluation_type' => 'self'],
                ['text' => 'Q2', 'type' => 'rating'],
            ],
        ]);

        $response->assertCreated();
        $template = EvaluationTemplate::firstWhere('title', 'Mixed payload');
        $this->assertNotNull($template);
        $this->assertSame('peer', $template->evaluation_type);
        $this->assertSame(2, $template->questions()->count());
    }

    public function test_questions_by_type_helper_returns_questions_only_when_template_matches(): void
    {
        [$company] = $this->setupCompany();
        $peerTemplate = $this->template($company, 'peer');
        EvaluationQuestion::create(['template_id' => $peerTemplate->id, 'text' => 'q', 'type' => 'rating']);

        $this->assertSame(1, $peerTemplate->questionsByType('peer')->count());
        $this->assertSame(0, $peerTemplate->questionsByType('self')->count());
        $this->assertSame(0, $peerTemplate->questionsByType('manager')->count());
    }

    private function setupCompany(): array
    {
        $company = Company::create([
            'company_name'    => 'Acme',
            'email'           => 'acme@example.com',
            'phone'           => '123',
            'expiration_date' => now()->addYear()->toDateString(),
        ]);

        $department = Department::create([
            'company_id'  => $company->id,
            'name'        => 'Engineering',
            'description' => 'Builds products',
        ]);

        $manager = Employee::factory()->manager()->create([
            'department_id'       => $department->id,
            'permission_override' => [
                'performance_create'   => true,
                'performance_evaluate' => true,
            ],
        ]);

        return [$company, $department, $manager];
    }

    private function template(Company $company, string $type, array $overrides = []): EvaluationTemplate
    {
        return EvaluationTemplate::create(array_merge([
            'company_id'      => $company->id,
            'title'           => ucfirst($type).' Template',
            'status'          => 'draft',
            'evaluation_type' => $type,
            'weights'         => ['self' => 30, 'peer' => 30, 'manager' => 40],
        ], $overrides));
    }
}
