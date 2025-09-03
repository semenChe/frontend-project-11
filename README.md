[![Actions Status](https://github.com/semenChe/frontend-project-11/workflows/hexlet-check/badge.svg)](https://github.com/semenChe/frontend-project-11/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/6f44c5a956e90533131e/maintainability)](https://codeclimate.com/github/semenChe/frontend-project-11/maintainability)

[RSS агрегатор](https://frontend-project-11-sss.vercel.app/) – сервис для агрегации RSS-потоков, с помощью которых удобно читать разнообразные источники, например, блоги. Он позволяет добавлять неограниченное количество RSS-лент, сам их обновляет и добавляет новые записи в общий поток.

### описания по запуску
Перейдите по [ссылке](https://frontend-project-11-sss.vercel.app/)

Вставьте ссылку rss в поле ввода. Нажмите кнопку «Добавить». RSS поток выведется на экран!
Предварительный просмотр описания постов выводится через модальное окно.
Вы также можете выбирать сразу несколько каналов, добавляя новые ссылки других источников.
Все посты обновляются автоматически в режиме реального времени. 

## Поддержка браузеров

![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png) | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_48x48.png) | ![Edge](https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png) | ![IE](https://raw.githubusercontent.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) |
--- | --- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | 11 ✔ |

## установка для разработчиков
1. Клонируйте репозиторий с помощью следующей команды:
```sh 
git clone https://github.com/semenChe/frontend-project-11
```

2. Установите программу чтения RSS, используя следующие команды:

```sh
make install
```

```sh
npm link
```
Компиляция:

Скомпилируйте пакет с помощью webpack, используя:

```sh
make build
```

## Рекомендуемые минимальные требования к системе:
### Минимальные версии ОС:
* Windows 10
* MacOS 10.14
* Ubuntu 16, либо удобный вам дистрибутив Linux
### Процессор: 
* Intel i3 / AMD Ryzen 3
### Операционная память: 
* от 8GB