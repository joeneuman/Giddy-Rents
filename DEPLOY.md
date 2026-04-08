# Deployment Guide — Giddy Rents

## Server Details

- **Droplet:** projects-server (143.198.105.249)
- **App directory:** `/var/www/giddy-rents`
- **Process manager:** PM2 (process name: `giddy-rents`)
- **Web server:** Nginx reverse proxy
- **Domain:** https://rents.giddydigs.com
- **Port:** 3001 (Nginx proxies to this)
- **SSL:** Let's Encrypt (auto-managed by Certbot)

## Deploy Steps

SSH into the server (or use DigitalOcean console), then run:

```bash
cd /var/www/giddy-rents
git pull
npm install
npx prisma generate
npm run build
pm2 restart giddy-rents
```

## Environment Variables

The `.env` file at `/var/www/giddy-rents/.env` must contain:

```
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
```

## PM2 Commands

```bash
pm2 list                    # Show running processes
pm2 restart giddy-rents     # Restart after deploy
pm2 logs giddy-rents        # View logs
pm2 stop giddy-rents        # Stop the app
pm2 start npm --name giddy-rents -- start  # Start fresh (port 3001)
```

## Nginx Config

Located at `/etc/nginx/sites-enabled/` — proxies `rents.giddydigs.com` to `127.0.0.1:3001`.

## Database

- **Provider:** DigitalOcean Managed PostgreSQL
- **Cluster:** giddy-rents-db (SFO3)
- **Host:** giddy-rents-db-do-user-1727991-0.g.db.ondigitalocean.com:25060

## Auth

- **Provider:** Clerk (clerk.com)
- **Dashboard:** https://dashboard.clerk.com
- **App name:** Giddy Rents
