@echo off
cd /d "%~dp0"
echo Isto apaga data\app.sqlite para poderes criar um admin novo no setup.php
echo Os PDFs em data\manuais NAO sao apagados.
set /p OK=Escreve SIM para continuar: 
if /I not "%OK%"=="SIM" (
  echo Cancelado.
  pause
  exit /b 0
)
if exist "data\app.sqlite" del /f "data\app.sqlite"
echo Base apagada. Corre start.bat e abre http://localhost:8080/setup.php
pause
