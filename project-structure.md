# 📁 Детальная структура проекта

## Корневая директория

activity-telegram-app/
├── README.md                    # Основная документация
├── project-structure.md         # Этот файл
├── .gitignore                   # Игнорируемые файлы для Git
│
├── frontend/                    # React приложение
│   ├── public/                  # Статические файлы
│   ├── src/                     # Исходный код React
│   │   ├── components/          # React компоненты
│   │   │   ├── AgeSelector/     # Выбор возраста
│   │   │   ├── CategorySelector/ # Выбор категории
│   │   │   ├── ResultsList/     # Список результатов
│   │   │   ├── ActivityDetails/ # Детали активности
│   │   │   └── common/          # Общие компоненты
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API сервисы
│   │   ├── utils/               # Утилиты
│   │   └── styles/              # Стили
│   ├── package.json
│   └── .env                     # Переменные окружения
│
├── backend/                     # Node.js API сервер
│   ├── models/                  # MongoDB модели
│   ├── routes/                  # API маршруты
│   ├── middleware/              # Express middleware
│   ├── utils/                   # Утилиты
│   ├── scripts/                 # Скрипты (импорт данных и др.)
│   ├── server.js                # Главный файл сервера
│   ├── package.json
│   └── .env                     # Переменные окружения
│
├── content/                     # Контент приложения
│   ├── activities/              # Файлы с активностями
│   │   ├── active-games.json    # Активные игры
│   │   ├── creativity.json      # Творчество
│   │   ├── learn-new.json       # Изучение нового
│   │   ├── cooking.json         # Кулинария
│   │   ├── gifts.json           # Подарки
│   │   ├── experiments.json     # Эксперименты
│   │   └── reading-stories.json # Чтение и истории
│   ├── categories/              # Справочники
│   │   └── categories.json      # Список категорий
│   ├── age-groups/              # Возрастные группы
│   │   └── age-groups.json      # Список возрастных групп
│   ├── activity-schema.json     # Схема данных активности
│   └── validate-content.js      # Скрипт валидации
│
├── assets/                      # Ресурсы проекта
│   ├── images/                  # Изображения
│   ├── icons/                   # Иконки
│   └── mockups/                 # Макеты дизайна
│
└── docs/                        # Документация
├── requirements.md          # Требования к проекту
├── api-docs.md             # Документация API
└── deployment.md           # Инструкции по деплою

## 🎯 Назначение каждой папки

### Frontend (`/frontend`)
Содержит React приложение, которое будет работать как Telegram Mini App. Здесь весь пользовательский интерфейс.

### Backend (`/backend`)
Node.js сервер, который предоставляет API для получения активностей, работает с базой данных и обрабатывает запросы от Telegram.

### Content (`/content`)
Все данные приложения: активности, категории, возрастные группы. Хранится в JSON формате для легкого редактирования.

### Assets (`/assets`)
Медиа-файлы: изображения для активностей, иконки, логотипы, макеты дизайна.

### Docs (`/docs`)
Техническая документация проекта, инструкции по развертыванию, описание API.