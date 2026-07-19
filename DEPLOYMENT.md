# Déploiement — VPS + Docker Compose

Architecture : **Caddy** (HTTPS auto) → **frontend** (nginx, SPA statique + relais `/api` et `/webhooks`) → **api** (FastAPI) + **worker/beat** (Celery) + **postgres** + **redis** + **minio**. Seul Caddy est exposé (80/443).

## 1. Prérequis

- Un VPS (Ubuntu 22.04+), 2 vCPU / 4 Go conseillés.
- Un nom de domaine dont l'enregistrement **A** pointe vers l'IP du VPS.
- Ports **80** et **443** ouverts.

## 2. Installer Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # puis se reconnecter
docker compose version          # doit répondre
```

## 3. Récupérer le code + configurer

```bash
git clone <votre-repo> tontine && cd tontine
cp .env.production.example .env.production
# Générer une clé secrète :
openssl rand -hex 32
# Éditer .env.production : DOMAIN, ACME_EMAIL, SECRET_KEY, POSTGRES_PASSWORD,
# AWS_SECRET_ACCESS_KEY, et les clés Mobile Money / SMTP si utilisées.
nano .env.production
```

## 4. Démarrer

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f caddy   # voit l'émission du certificat TLS
```

Caddy obtient automatiquement le certificat Let's Encrypt. Ouvrir **https://votre-domaine**.

## 5. Créer le premier super-administrateur

En production `ENABLE_DEMO_DATA=false` : aucun compte n'existe. Créer le super-admin (adapter email / mot de passe) :

```bash
docker compose -f docker-compose.prod.yml exec api python - <<'PY'
import asyncio
from sqlalchemy import text
from app.core.database import get_central_engine
from app.core.security import hash_password

EMAIL = "admin@exemple.cm"
PASSWORD = "ChangeMoi!"   # à modifier immédiatement après connexion

async def main():
    eng = get_central_engine()
    async with eng.begin() as c:
        await c.execute(text("""
            INSERT INTO users (email, phone, hashed_password, first_name, last_name,
                               global_role, is_active, is_verified)
            VALUES (:e, '+000000000', :p, 'Super', 'Admin', 'superadmin', true, true)
            ON CONFLICT (email) DO NOTHING
        """), {"e": EMAIL, "p": hash_password(PASSWORD)})
    print("super-admin créé :", EMAIL)

asyncio.run(main())
PY
```

Se connecter, puis créer les organisations / tontines / admins depuis l'espace super-admin.

## 6. Sauvegardes

```bash
# Base de données (à mettre en cron quotidien)
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U postgres tontine_central | gzip > backup_$(date +%F).sql.gz

# Volumes Docker importants : pgdata (Postgres), miniodata (fichiers/reçus), caddy_data (certificats)
```

## 7. Mise à jour

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Les migrations de schéma s'exécutent automatiquement au démarrage de l'API (idempotentes).

## Notes

- **Rate-limiter** : `--proxy-headers` est activé côté uvicorn pour lire la vraie IP client (via `X-Forwarded-For`) derrière Caddy/nginx.
- **Mobile Money** : les fournisseurs appellent `https://votre-domaine/webhooks/mtn` et `/webhooks/orange` (déjà routés vers l'API). `API_BASE_URL` est fixé à `https://${DOMAIN}`.
- **Montée en charge** : l'API tourne en un seul process (les migrations de démarrage s'exécutent une fois). Pour plus de trafic, augmenter le VPS ou répliquer le service `api` derrière le proxy (et externaliser les migrations).
- **S3 externe** : pour remplacer MinIO par un S3 managé, pointer `S3_ENDPOINT` / `AWS_*` vers le fournisseur et retirer le service `minio`.
