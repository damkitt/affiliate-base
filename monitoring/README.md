# Prometheus + Grafana Monitoring

Система мониторинга для AffiliateBase с дашбордами и алертами.

## 🚀 Быстрый старт

### На дедике (production)

```bash
# 1. Перейди в папку monitoring
cd /path/to/affiliatebase/monitoring

# 2. Настрой IP в prometheus.yml (замени YOUR_SERVER_IP)
nano prometheus.yml

# 3. Запусти контейнеры
docker compose up -d

# 4. Проверь статус
docker compose ps
```

### Доступ

| Сервис | URL | Логин |
|--------|-----|-------|
| **Grafana** | http://YOUR_IP:3001 | admin / affiliatebase123 |
| **Prometheus** | http://YOUR_IP:9090 | - |
| **Metrics API** | http://YOUR_IP:3000/api/metrics | - |

⚠️ **Смени пароль Grafana после первого входа!**

---

## 📊 Доступные метрики

### Business Metrics

| Метрика | Описание |
|---------|----------|
| `affiliatebase_page_views_total` | Уникальные просмотры страниц |
| `affiliatebase_clicks_total` | Клики на affiliate ссылки |
| `affiliatebase_fraud_blocked_total` | Заблокированные фрод-попытки |
| `affiliatebase_active_programs` | Активные программы |
| `affiliatebase_programs_created_total` | Всего создано программ |

### Technical Metrics

| Метрика | Описание |
|---------|----------|
| `affiliatebase_http_request_duration_seconds` | Время ответа API |
| `affiliatebase_api_errors_total` | Ошибки API |
| `affiliatebase_nodejs_*` | Node.js метрики (CPU, RAM, GC) |

---

## 📈 Grafana Dashboard

Dashboard "AffiliateBase" создаётся автоматически и включает:

- **Total Page Views** - общее количество просмотров
- **Total Clicks** - общее количество кликов
- **Fraud Blocked** - заблокированный фрод
- **Active Programs** - активные программы
- **Views by Program** - график просмотров по программам
- **Clicks by Program** - график кликов по программам

---

## 🔍 PromQL примеры

```promql
# Просмотры за последний час
increase(affiliatebase_page_views_total[1h])

# Топ-5 программ по просмотрам
topk(5, affiliatebase_page_views_total)

# Rate кликов в минуту
rate(affiliatebase_clicks_total[1m])

# Фрод за последние 24 часа
increase(affiliatebase_fraud_blocked_total[24h])

# Среднее время ответа API
rate(affiliatebase_http_request_duration_seconds_sum[5m]) 
  / rate(affiliatebase_http_request_duration_seconds_count[5m])
```

---

## 🔒 Production Security

### 1. Смени пароль Grafana

В `docker-compose.yml`:
```yaml
- GF_SECURITY_ADMIN_PASSWORD=ТВОЙ_СЛОЖНЫЙ_ПАРОЛЬ
```

### 2. Firewall (UFW)

```bash
# Разреши доступ только с твоего IP
ufw allow from YOUR_IP to any port 9090
ufw allow from YOUR_IP to any port 3001

# Или закрой полностью и используй VPN/SSH tunnel
ufw deny 9090
ufw deny 3001
```

### 3. Retention (хранение данных)

В `docker-compose.yml`:
```yaml
command:
  - '--storage.tsdb.retention.time=90d'  # 90 дней вместо 30
```

---

## 🛠 Troubleshooting

### Prometheus не получает метрики

```bash
# Проверь target в Prometheus UI
# http://YOUR_IP:9090/targets

# Проверь что Next.js отдаёт метрики
curl http://localhost:3000/api/metrics
```

### Grafana не показывает данные

1. Проверь datasource: Settings → Data Sources → Prometheus
2. URL должен быть `http://prometheus:9090`
3. Нажми "Test" - должно быть зелёное

### Перезапуск контейнеров

```bash
docker compose restart
# или полный ребилд
docker compose down && docker compose up -d
```

---

## 📁 Структура файлов

```
monitoring/
├── docker-compose.yml      # Конфигурация контейнеров
├── prometheus.yml          # Конфигурация Prometheus
├── README.md               # Эта документация
└── grafana/
    └── provisioning/
        ├── dashboards/
        │   ├── dashboards.yml      # Провижен дашбордов
        │   └── affiliatebase.json # Готовый дашборд
        └── datasources/
            └── prometheus.yml      # Datasource конфиг
```

## Обновление

```bash
cd monitoring
docker-compose pull
docker-compose up -d
```

---

## Остановка

```bash
docker-compose down
```

Данные сохранятся в volumes.
