# Деплой на сервер (1 CPU / 1 GB RAM)

## Один раз на новом сервере
```bash
git clone <ваш-репо> tutor && cd tutor   # или скопировать файлы rsync/scp
mkdir -p data && cp .env.example .env    # заполнить ключи
nano .env                                # OPENROUTER_API_KEY, YANDEX_*, APP_URL
docker compose up -d --build             # поднять и собрать
```
Готово: приложение на порту 3000 (behind nginx/caddy/Traefik по желанию).

## Перенос на другой сервер (данные не теряются)
Данные живут в **named docker volume `tutor-data`** (SQLite внутри).

Вариант A — копировать файл БД:
```bash
# старый сервер
docker run --rm -v tutor-data:/data alpine tar czf - -C /data tutor.db | gzip > tutor_db.tar.gz
scp tutor_db.tar.gz new-server:~

# новый сервер (после docker compose up)
docker compose down
gunzip -c tutor_db.tar.gz | docker run --rm -i -v tutor-data:/data alpine sh -c 'tar xzf - -C /data'
docker compose up -d
```

Вариант B — как compose volume (проще): скопируйте весь каталог volume
`/var/lib/docker/volumes/tutor_tutor-data` командой rsync между серверами, затем `docker compose up -d`.

## Бэкапы
```bash
# разовый бэкап
docker run --rm -v tutor-data:/data alpine sqlite3 /data/tutor.db ".backup /data/backup-$(date +%F).db"
# восстановить
docker compose down && cp data/backup-... /var/lib/docker/volumes/tutor_tutor-data/_data/tutor.db && docker compose up -d
```
Авто-бэкап: добавьте на хосте cron
`0 3 * * * docker run --rm -v tutor-data:/data alpine sqlite3 /data/tutor.db ".backup /backups/..."` c проброшеным `/backups`.

## Обновление версии
```bash
git pull && docker compose up -d --build
```
Данные в volume не трогаются.

## Переменные окружения
См. `.env.example`. Ключи OpenRouter и Yandex ID конфиденциальны — только на сервере.

## Админ-панель
`https://твой-домен/admin` — креды из env `ADMIN_LOGIN` / `ADMIN_PASSWORD`
(дефолт: **admin / Tutor#Admin-2026** — смените на проде!). Возможности: обзор
(счетчики, график роста, средние статистики), управление юзерами (удаление с
каскадом), SQL-консоль (read-only SELECT/PRAGMA), глобальные модели по умолчанию.

## Ручной запуск без docker (если docker недоступен)
```bash
npm ci && npm run build && PORT=3000 npm start
```
БД при этом лежит в `./data/`.
