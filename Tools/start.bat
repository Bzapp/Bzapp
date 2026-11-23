@echo off
cd /d "%~dp0"
where php >nul 2>&1
if errorlevel 1 (
  echo PHP nao encontrado no PATH.
  echo Instala XAMPP/WAMP ou PHP e volta a tentar.
  pause
  exit /b 1
)
if not exist "data" mkdir data
if not exist "data\manuais" mkdir data\manuais
echo A abrir http://localhost:8080 ...
start "" http://localhost:8080
php -S localhost:8080 router.php
pause
