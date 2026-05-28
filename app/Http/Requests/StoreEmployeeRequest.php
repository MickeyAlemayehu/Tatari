<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return self::rulesFor();
    }

    /**
     * Validation rules shared by single-create and bulk-import (per-row).
     *
     * @return array<string, array<int, mixed>>
     */
    public static function rulesFor(): array
    {
        return [
            'first_name'       => ['required', 'string', 'max:100'],
            'last_name'        => ['required', 'string', 'max:100'],
            'email'            => ['required', 'email', 'max:255', 'unique:employees,email'],
            'password'         => ['required', 'string', 'min:8'],
            'position'         => ['required', 'string', 'max:150'],
            'department_id'    => ['nullable', 'integer', 'exists:departments,id'],
            'manager_id'       => ['nullable', 'integer', 'exists:employees,id'],
            'permission_level' => ['nullable', 'integer', 'between:1,3'],
            'status'           => ['nullable', Rule::in(['active', 'inactive'])],
            'phone'            => ['nullable', 'string', 'max:32'],
            'date_of_birth'    => ['nullable', 'date'],
            'address'          => ['nullable', 'string', 'max:255'],
            'city'             => ['nullable', 'string', 'max:100'],
            'state'            => ['nullable', 'string', 'max:100'],
            'zip_code'         => ['nullable', 'string', 'max:20'],
        ];
    }
}
