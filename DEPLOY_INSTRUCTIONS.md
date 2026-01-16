# Инструкция по деплою на GitHub Pages

## Быстрый старт

### 1. Создайте репозиторий на GitHub
- Создайте новый репозиторий (например, `smeta-app`)
- НЕ инициализируйте с README, .gitignore или лицензией

### 2. Закоммитьте и запушьте код

```bash
git init
git add .
git commit -m "Initial commit: Смета Нова Ремонт"
git branch -M main
git remote add origin https://github.com/ВАШ-USERNAME/НАЗВАНИЕ-РЕПОЗИТОРИЯ.git
git push -u origin main
```

### 3. Включите GitHub Pages

1. Перейдите в **Settings** → **Pages** вашего репозитория
2. В разделе **Source** выберите **"GitHub Actions"**
3. Сохраните изменения

### 4. Готово!

После первого push в ветку `main` или `master`:
- GitHub Actions автоматически соберет проект
- Задеплоит на GitHub Pages
- Приложение будет доступно по адресу: `https://ВАШ-USERNAME.github.io/НАЗВАНИЕ-РЕПОЗИТОРИЯ/`

## Важные моменты

- ✅ Используется **HashRouter** - URL будут с `#` (например: `/#/create`)
- ✅ Данные сохраняются в **localStorage** браузера
- ✅ Автоматический деплой при каждом push в `main`/`master`
- ✅ Base path настроен на `/` - работает для любого названия репозитория

## Проверка деплоя

После деплоя проверьте:
1. Откройте `https://ВАШ-USERNAME.github.io/НАЗВАНИЕ-РЕПОЗИТОРИЯ/`
2. Убедитесь, что приложение загружается
3. Проверьте создание сметы
4. Проверьте сохранение данных

## Ручной деплой (если нужно)

Если автоматический деплой не сработал:

1. Соберите проект локально:
```bash
npm run build
```

2. Используйте gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Добавьте в `package.json`:
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

4. Задеплойте:
```bash
npm run deploy
```

Но лучше использовать автоматический деплой через GitHub Actions!
