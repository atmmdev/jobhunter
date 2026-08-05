# Backup & Restore

How to back up and restore the Job Hunter MySQL database and local artifacts.

---

## What to back up

| Asset | Location | Notes |
| ----- | -------- | ----- |
| MySQL data | Docker volume / DB dump | Jobs, applications, sources, vault ciphertext |
| `.env` | project root | **Never commit**; store securely offline |
| Resume files | paths referenced in DB (`Resume.filePath`) | If you store uploads locally |
| Apply artifacts | `storage/artifacts/` | Screenshots/HTML from auto-apply (optional) |

Vault secrets are AES-GCM ciphertext in MySQL — restore needs the same `ENCRYPTION_KEY`.

---

## Backup (Docker Compose MySQL)

With the stack running:

```bash
docker compose exec -T mysql mysqldump -u jobhunter -pjobhunter jobhunter > backup-$(date +%Y%m%d).sql
```

Adjust user/password/database to match your `.env` / `docker-compose.yml`.

Optional artifacts:

```bash
tar -czf artifacts-$(date +%Y%m%d).tar.gz storage/artifacts
```

---

## Restore

1. Start MySQL: `docker compose up -d`
2. Restore dump:

```bash
docker compose exec -T mysql mysql -u jobhunter -pjobhunter jobhunter < backup-YYYYMMDD.sql
```

3. Confirm `ENCRYPTION_KEY` matches the backup era (otherwise vault decrypt fails).
4. Run `npm run db:migrate` only if schema drifted; prefer restoring a dump taken after migrations.

---

## Schedule suggestion

- Daily dump to encrypted disk / object storage
- Keep at least 7 daily + 4 weekly copies
- Test a restore on a throwaway DB monthly

---

## Related

- Env template: [`.env.example`](../.env.example)
- Getting started: [`GETTING_STARTED.md`](./GETTING_STARTED.md)
- Database model: [`DATABASE.md`](./DATABASE.md)
