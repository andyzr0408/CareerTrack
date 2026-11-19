# Xdebug: depurar el backend

Sirve para poner un punto de parada en el código PHP, ejecutar una petición o un test y ver las variables paso a paso.

## 1. Instalar la extensión (Windows)

1. En `backend`, ejecuta `php -i > info.txt` y copia el contenido.
2. Pégalo en <https://xdebug.org/wizard>. Te dice qué DLL descargar (debe coincidir con tu PHP: versión, x64 y ZTS/NTS).
3. Guarda la DLL en la carpeta `ext` de PHP con el nombre `php_xdebug.dll`.
4. Añade al final de `php.ini` (`php --ini` muestra cuál es):

```ini
zend_extension=xdebug
xdebug.mode=debug
xdebug.start_with_request=yes
xdebug.client_host=127.0.0.1
xdebug.client_port=9003
```

5. Comprueba con `php -v`: debe aparecer "with Xdebug".

`start_with_request=yes` hace que PHP intente conectar siempre; vuelve más lento el CLI. Si te molesta, usa `trigger` y activa solo cuando quieras (variable `XDEBUG_TRIGGER=1`), o comenta `zend_extension` cuando no depures.

## 2. VS Code

1. Instala la extensión **PHP Debug** (xdebug.php-debug).
2. Ya hay un `.vscode/launch.json` en el repositorio con la configuración **Listen for Xdebug** (puerto 9003).
3. Abre la carpeta raíz del repositorio en VS Code.

## 3. Depurar una petición a la API

1. Pon un punto rojo (clic a la izquierda del número de línea), por ejemplo en `AuthController::login`.
2. Run and Debug → **Listen for Xdebug** (F5).
3. En una terminal: `cd backend` y `php artisan serve`.
4. Haz la petición desde el frontend o Postman. VS Code se detiene en el punto y deja ver variables, pila de llamadas y avanzar con F10/F11.

## 4. Depurar un test

1. Deja activo **Listen for Xdebug**.
2. Pon el punto de parada en el controlador o en el test.
3. `cd backend` y `php artisan test --filter=CookieAuthTest`.

## Problemas comunes

- **No se detiene:** el puerto 9003 está ocupado o bloqueado por el firewall, o el `php.ini` editado no es el que usa la terminal (`php --ini`).
- **"Could not connect to debugging client":** VS Code no está escuchando; pulsa F5 antes de lanzar la petición.
- **Se detiene en `vendor` o en archivos raros:** desmarca "Everything" en Breakpoints (Exceptions) de VS Code.
