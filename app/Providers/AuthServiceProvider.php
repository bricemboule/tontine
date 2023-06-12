<?php

namespace App\Providers;

// use Illuminate\Support\Facades\Gate;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot()
    {
        $this->registerPolicies();

        Gate::define("admin", function(User $user){
            return $user->hasRole("admin");
        });

        Gate::define("president", function(User $user){
            return $user->hasRole("president");
        });
        Gate::define("vicePresident", function(User $user){
            return $user->hasRole("vicePresident");
        });

        Gate::define("secretaire", function(User $user){
            return $user->hasRole("secretaire");
        });
        Gate::define("tresorier", function(User $user){
            return $user->hasRole("tresorier");
        });
        Gate::define("commissaire", function(User $user){
            return $user->hasRole("commissaire");
        });
        Gate::define("censeur", function(User $user){
            return $user->hasRole("censeur");
        });
    }
}
