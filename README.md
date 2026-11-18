# Film!

Сервис бронирования билетов в кинотеатр.

Фронтенд: React и Vite.
Бэкенд: NestJS, TypeORM и PostgreSQL.

Фильмы хранятся в таблице films, сеансы — в schedules.
Один фильм связан с несколькими сеансами.
Занятые места сохраняются в поле taken соответствующего сеанса.

## Подготовка

Понадобятся Node.js, npm и запущенный Docker Desktop.

Выполните команды из корня проекта:

```bash
npm ci --prefix backend
```

```bash
npm ci --prefix frontend
```

Создайте локальные файлы настроек:

```bash
cp backend/.env.example backend/.env
```

```bash
cp frontend/.env.example frontend/.env
```

Пример настроек бэкенда:

```dotenv
DATABASE_DRIVER=postgres
DATABASE_URL=postgres://127.0.0.1:5433/prac
DATABASE_USERNAME=prac
DATABASE_PASSWORD=prac
PORT=3101
DEBUG=
```

Пример настроек фронтенда:

```dotenv
VITE_API_URL=http://127.0.0.1:3101/api/afisha
VITE_CDN_URL=http://127.0.0.1:3101/content/afisha
```

## База данных

Запустите PostgreSQL:

```bash
docker compose up -d --wait
```

При первом запуске создайте пользователя, базу и таблицы:

```bash
docker exec -i postgres_container psql -v ON_ERROR_STOP=1 -U postgres -d postgres < backend/test/prac.init.sql
```

Загрузите тестовые данные:

```bash
docker exec -i postgres_container psql -v ON_ERROR_STOP=1 -U prac -d prac < backend/test/prac.films.sql
```

```bash
docker exec -i postgres_container psql -v ON_ERROR_STOP=1 -U prac -d prac < backend/test/prac.shedules.sql
```

Инициализация и импорт выполняются один раз для новой базы.
Данные PostgreSQL сохраняются в Docker volume.

## Запуск приложения

В первом терминале:

```bash
cd backend
```

```bash
npm run start:dev
```

Во втором терминале, начиная из корня проекта:

```bash
cd frontend
```

```bash
npm run dev
```

Откройте адрес, который Vite выведет в строке Local.
Обычно это http://localhost:5173.

## Проверки

Из корня проекта:

```bash
npm run lint --prefix backend
```

```bash
npm run build --prefix backend
```

```bash
npm run lint --prefix frontend
```

```bash
npm run build --prefix frontend
```

## API

- GET /api/afisha/films — список фильмов.
- GET /api/afisha/films/:id/schedule — расписание фильма.
- POST /api/afisha/order — бронирование билетов.
- GET /content/afisha/* — статические изображения.

Описание API находится в film.yml.
Коллекция Postman находится в film.postman.json.
