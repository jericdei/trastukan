uid := 1000

# Docker
start:
    docker compose up -d
stop:
    docker compose down
restart: stop && start
rebuild:
    docker compose up -d --build --force-recreate

# Bun
bun-fe *command:
    docker compose exec -u {{uid}} frontend bun {{command}}
bun-be *command:
    docker compose exec -u {{uid}} frontend bun {{command}}