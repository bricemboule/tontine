<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function versementCotis(){
        return $this->hasMany(VersementCotis::class);
    }

    public function versementSoldes(){

        return $this->hasMany(VersementSol::class);
    }

    public function don_entres(){

        return $this->hasMany(DonEntre::class);
    }

    public function epargnes(){

        return $this->hasMany(Epargne::class);
    }
    public function achatCotisations(){

        return $this->hasMany(AchatCotis::class);
    }

    public function annees(){

        return $this->belongsToMany(Annee::class, 'annee_membre', 'user_id','annee_id');
    }

    public function solidarites(){

        return $this->hasMany(Solidarite::class);
    }

    public function roles(){

        return $this->belongsToMany(Role::class, "user_role", "user_id", "role_id");
    }


    public function permissions(){

        return $this->b0elongsTo(Permisson::class, "permission_user", "user_id", "permission_id");
    }


    public function evenements(){

        return $this->belongsToMany(Evenement::class, "evenement_membre", "user_id", "evenement_id");
    }

    public function aide_maladies(){

        return $this->hasMany(AideMaladie::class);
    }

    public function aide_deces(){

        return $this->hasMany(AideDeces::class);
    }

    public function aide_deces_membres(){

        return $this->belongsToMany(AideDecesMembre::class, "designe_pour_voyage","user_id", "aide_deces_membre_id");
    }

}
