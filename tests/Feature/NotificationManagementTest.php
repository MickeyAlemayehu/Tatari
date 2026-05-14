<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_list_only_their_notifications(): void
    {
        [$employee, $other] = Employee::factory()->staff()->count(2)->create();

        Notification::create([
            'recipient_type' => Employee::class,
            'recipient_id' => $employee->id,
            'title' => 'New Leave Request',
            'message' => 'Your request is pending.',
            'notification_type' => 'leave',
            'is_read' => false,
        ]);

        Notification::create([
            'recipient_type' => Employee::class,
            'recipient_id' => $other->id,
            'title' => 'Private Notice',
            'message' => 'Only another user should see this.',
            'notification_type' => 'system',
            'is_read' => false,
        ]);

        $response = $this->actingAs($employee, 'api')->getJson('/api/notifications');

        $response->assertOk()
            ->assertJsonPath('data.0.title', 'New Leave Request')
            ->assertJsonPath('data.0.category', 'Leave')
            ->assertJsonPath('data.0.read', false);

        $this->assertCount(1, $response->json('data'));
    }

    public function test_unread_count_and_mark_all_read(): void
    {
        $employee = Employee::factory()->staff()->create();

        $this->notificationFor($employee, 'One', false);
        $this->notificationFor($employee, 'Two', false);
        $this->notificationFor($employee, 'Read', true);

        $this->actingAs($employee, 'api')->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('unreadCount', 2);

        $this->actingAs($employee, 'api')->postJson('/api/notifications/mark-all-read')
            ->assertOk()
            ->assertJsonPath('updated', 2);

        $this->assertSame(0, Notification::where('recipient_id', $employee->id)->where('is_read', false)->count());
    }

    public function test_employee_can_mark_single_notification_as_read(): void
    {
        $employee = Employee::factory()->staff()->create();
        $notification = $this->notificationFor($employee, 'Please Read', false);

        $this->actingAs($employee, 'api')->postJson("/api/notifications/{$notification->id}/read")
            ->assertOk()
            ->assertJsonPath('read', true);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'is_read' => true,
        ]);
    }

    public function test_employee_cannot_manage_another_users_notification(): void
    {
        [$employee, $other] = Employee::factory()->staff()->count(2)->create();
        $notification = $this->notificationFor($other, 'Not Yours', false);

        $this->actingAs($employee, 'api')->postJson("/api/notifications/{$notification->id}/read")
            ->assertForbidden();
    }

    public function test_employee_can_delete_own_notification(): void
    {
        $employee = Employee::factory()->staff()->create();
        $notification = $this->notificationFor($employee, 'Delete Me', true);

        $this->actingAs($employee, 'api')->deleteJson("/api/notifications/{$notification->id}")
            ->assertOk();

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    private function notificationFor(Employee $employee, string $title, bool $read): Notification
    {
        return Notification::create([
            'recipient_type' => Employee::class,
            'recipient_id' => $employee->id,
            'title' => $title,
            'message' => 'Notification message',
            'notification_type' => 'leave',
            'is_read' => $read,
        ]);
    }
}
