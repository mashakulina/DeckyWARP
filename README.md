# DeckyWARP

ㅤ
# EN
Auto-installing of Cloudflare WARP and its management from the plugins menu. Using WARP on a steam deck has never been so easy!

WARP works best in conjunction with [Zapret DPI Manager](https://github.com/mashakulina/Zapret-DPI-for-Steam-Deck).

The plugin has a built‑in ability to switch between 3 modes:

**WARP Mode**
 - All your traffic is wrapped in an encrypted Cloudflare tunnel (based on WireGuard).
 - To websites, you appear as a Cloudflare IP.
 - DNS also automatically goes through the tunnel.

 In essence:
 - It's almost like a VPN, but not for changing your country – rather for protection and route optimization.
 - It can alter the route to servers (sometimes ping is better, sometimes worse).

**DNS over HTTPS only (no VPN)**
 - Only DNS queries ("what IP does a site have") are encrypted.
 - Traffic is NOT tunneled – your IP remains your regular one.
 - Works as a secure Cloudflare DNS server (1.1.1.1 over HTTPS).

 In essence:
 - This is not a VPN
 - Only protects against DNS spoofing and DNS‑based blocks
 - Does not bypass IP‑based blocks

**WARP + DNS over HTTPS**
 - Full WARP tunnel is enabled
 - DNS is additionally forced through DoH
 - Maximum encryption, minimum trust in the ISP

 In essence:
 - Almost the same as WARP mode
 - Just stricter and more explicit DNS protection
 - May conflict with some games/launchers

ㅤ
# RU
Автоматическая установка Cloudflare WARP и управление им из меню плагинов. Использование WARP на Steam deck никогда не было таким простым!

WARP лучше всего работает совместно с [Zapret DPI Manager](https://github.com/mashakulina/Zapret-DPI-for-Steam-Deck) 

В плагин встроена возможность переключение между 3 режима:

**Режим WARP**
  -  Весь твой трафик заворачивается в зашифрованный туннель Cloudflare (на базе WireGuard).
  -  Для сайтов ты выглядишь как IP Cloudflare.
  -  DNS тоже идёт внутри туннеля автоматически.
  
  По сути:
  - Это почти VPN, но не для смены страны, а для защиты и оптимизации маршрута.
  - Может менять маршрут до серверов (иногда лучше пинг, иногда хуже).

**Только DNS over HTTPS (без VPN)**
  - Шифруется только DNS (запросы «какой IP у сайта»).
  - Трафик НЕ туннелируется, IP остаётся твоим обычным.
  - Работает как защищённый DNS-сервер Cloudflare (1.1.1.1 по HTTPS).
  
  По сути:
  - Это не VPN
  - Только защита от подмены DNS и блокировок по DNS
  - Не обходит блокировки по IP

**WARP + DNS over HTTPS**
  - Включён полный WARP-туннель
  - DNS дополнительно форсируется через DoH
  - Максимум шифрования, минимум доверия к провайдеру
  
  По сути:
  -  Почти то же самое, что warp
  -  Просто более жёсткая и явная защита DNS
  -  Может конфликтовать с некоторыми играми/лаунчерами
ㅤ

# Screenshots/Скриншоты
![screenshot](https://i.ibb.co/M56xtTtW/20260125143122-1.jpg)
![screenshot](https://i.ibb.co/pvLgC565/20260125143139-1.jpg)
![screenshot](https://i.ibb.co/0Vyrr8B2/20260125133338-1.jpg)
![screenshot](https://i.ibb.co/LDJtG04P/20260125141615-1.jpg)
![screenshot](https://i.ibb.co/wNb7kKb7/20260125141626-1.jpg)
![screenshot](https://i.ibb.co/gkj1F3g/20260125141853-1.jpg)
![screenshot](https://i.ibb.co/Wvcc3GFM/20260125141540-1.jpg)
![screenshot](https://i.ibb.co/KxSyJ5r3/20260125141548-1.jpg)
![screenshot](https://i.ibb.co/dspr9dDW/20260125141556-1.jpg)
