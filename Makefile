.PHONY: up down build logs backup

# Поднять приложение (сборка + старт)
up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=100

# Бэкап БД в ./backups
backup:
	@mkdir -p backups
	docker run --rm -v tutor_tutor-data:/data -v $$PWD/backups:/backups alpine \\
	  sh -c "command -v sqlite3 >/dev/null && sqlite3 /data/tutor.db \".backup /backups/tutor-$$(date +%F-%H%M).db\" || cp /data/tutor.db /backups/tutor-$$(date +%F-%H%M).db"
