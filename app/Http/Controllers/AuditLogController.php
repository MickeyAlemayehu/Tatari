<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('employee:id,first_name,last_name');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($q) use ($search) {
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('module') && $request->input('module') !== 'all') {
            $query->where('module', $request->input('module'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('user') && $request->input('user') !== 'all') {
            $user = $request->input('user');
            $query->whereHas('employee', function ($q) use ($user) {
                $q->whereRaw("CONCAT(first_name, ' ', last_name) = ?", [$user]);
            });
        }

        if ($request->filled('from') && $request->filled('to')) {
            $query->whereBetween('created_at', [
                $request->input('from') . ' 00:00:00',
                $request->input('to') . ' 23:59:59'
            ]);
        }

        $logs = $query->latest()->paginate($request->input('per_page', 10));

        // Format to match frontend expectations
        $formatted = $logs->map(function ($log) {
            return [
                'id' => $log->id,
                'user' => $log->employee ? $log->employee->first_name . ' ' . $log->employee->last_name : 'System',
                'action' => $log->action,
                'module' => $log->module,
                'details' => $log->description,
                'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
                'status' => $log->status,
                'metadata' => $log->metadata,
            ];
        });

        return response()->json([
            'data' => $formatted,
            'current_page' => $logs->currentPage(),
            'last_page' => $logs->lastPage(),
            'total' => $logs->total(),
            'per_page' => $logs->perPage(),
        ]);
    }

    public function modules(): JsonResponse
    {
        $modules = AuditLog::select('module')
            ->distinct()
            ->pluck('module')
            ->filter()
            ->values();

        return response()->json($modules);
    }
}
