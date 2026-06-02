<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $adminRole = Role::create(['name' => 'Administrator']);
        $userRole = Role::create(['name' => 'User']);

        $tables = [
            'exercises',
            'foods',
            'food_categories',
            'meal_logs',
            'metrics',
            'sessions',
            'users',
        ];

        $actions = ['view', 'create', 'update', 'delete'];

        $permissions = [];


        foreach ($tables as $table) {
            foreach ($actions as $action) {
                $permissionName = "{$action} {$table}";
                $permissions[$table][$action] = Permission::create([
                    'name' => $permissionName
                ]);
            }
        }

        $adminRole->givePermissionTo(Permission::all());

        foreach ($tables as $table) {
            $userRole->givePermissionTo($permissions[$table]['view']);
        }

        $crudTables = ['sessions', 'metrics', 'meal_logs'];

        foreach ($crudTables as $table) {
            foreach ($actions as $action) {
                $userRole->givePermissionTo($permissions[$table][$action]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles_and_permissions');
    }
};
