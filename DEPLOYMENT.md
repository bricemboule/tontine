# Déploiement — VPS + Docker Compose

Architecture : **nginx de l'hôte** (TLS + 80/443, mutualisé avec tes autres apps) → **frontend** (nginx conteneur, SPA statique + relais `/api` et `/webhooks`, publié sur `127.0.0.1:8091`) → **api** (FastAPI) + **worker/beat** (Celery) + **postgres** + **redis** + **minio**.

> Le conteneur n'expose **que** `127.0.0.1:${FRONTEND_PORT:-8091}`. C'est le nginx **de l'hôte** qui termine le TLS et proxifie ton domaine vers ce port (voir `deploy/nginx-host.conf.example`). Aucun Caddy : sur un VPS où un nginx détient déjà 80/443, Caddy ne pourrait pas prendre les ports.

## 1. Prérequis

- Un VPS (Ubuntu 22.04+), 2 vCPU / 4 Go conseillés.
- Un **nginx sur l'hôte** (déjà présent ici) avec un certificat pour ton domaine (Certbot).
- Un enregistrement DNS **A** du domaine vers l'IP du VPS.

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

Astuce : nomme le fichier **`.env`** (chargé automatiquement par Compose pour *toutes* les commandes — plus besoin de `--env-file`).

```bash
mv .env.production .env
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
# Le frontend répond en local :
curl -I http://127.0.0.1:8091/login        # -> 200
```

## 4bis. Brancher le nginx de l'hôte

Le conteneur écoute sur `127.0.0.1:8091`. Dans le vhost nginx de ton domaine (celui
qui a déjà le certificat), fais pointer `location /` vers ce port :

```nginx
location / {
    proxy_pass http://127.0.0.1:8091;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Modèle complet dans `deploy/nginx-host.conf.example`. Puis :

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Ouvrir **https://ton-domaine**.

## 5. Premier super-administrateur

Il est **créé automatiquement au 1er démarrage** à partir de `.env.production` :

```
BOOTSTRAP_ADMIN_EMAIL=admin@exemple.cm
BOOTSTRAP_ADMIN_PASSWORD=un_mot_de_passe_fort
```

C'est **idempotent** : au redémarrage, un compte déjà présent n'est jamais modifié
(aucun écrasement de mot de passe). Laisser ces variables vides désactive la création.

Connecte-toi avec ces identifiants, **change le mot de passe**, puis crée les
organisations / tontines / admins depuis l'espace super-admin.

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
