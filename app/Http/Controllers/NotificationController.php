<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $employee = $request->user('api') ?? $request->user();

        $query = Notification::query()
            ->whereMorphedTo('recipient', $employee)
            ->latest();

        if ($request->boolean('unread')) {
            $query->where('is_read', false);
        }

        if ($request->filled('category')) {
            $query->where('notification_type', $request->string('category'));
        }

        return response()->json($query->paginate($request->integer('per_page', 15))
            ->through(fn (Notification $notification) => $notification->toPayload()));
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $employee = $request->user('api') ?? $request->user();

        return response()->json([
            'unreadCount' => Notification::query()
                ->whereMorphedTo('recipient', $employee)
                ->where('is_read', false)
                ->count(),
        ]);
    }

    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        $this->authorizeNotification($request, $notification);

        $notification->update(['is_read' => true]);

        return response()->json($notification->fresh()->toPayload());
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $employee = $request->user('api') ?? $request->user();

        $updated = Notification::query()
            ->whereMorphedTo('recipient', $employee)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'message' => 'Notifications marked as read.',
            'updated' => $updated,
        ]);
    }

    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        $this->authorizeNotification($request, $notification);

        $notification->delete();

        return response()->json(['message' => 'Notification deleted.']);
    }

    public function clearRead(Request $request): JsonResponse
    {
        $employee = $request->user('api') ?? $request->user();

        $deleted = Notification::query()
            ->whereMorphedTo('recipient', $employee)
            ->where('is_read', true)
            ->delete();

        return response()->json([
            'message' => 'Read notifications cleared.',
            'deleted' => $deleted,
        ]);
    }

    private function authorizeNotification(Request $request, Notification $notification): void
    {
        $employee = $request->user('api') ?? $request->user();

        if (
            $notification->recipient_type !== $employee::class
            || (int) $notification->recipient_id !== (int) $employee->id
        ) {
            abort(Response::HTTP_FORBIDDEN, 'Not allowed to manage this notification.');
        }
    }

}
