@echo off
setlocal

echo ============================================
echo   Restore automatique - MSPR1 PostgreSQL
echo ============================================

:: === Configuration automatique ===
set SCRIPT_DIR=%~dp0
set PG_RESTORE=%SCRIPT_DIR%pg_restore.exe
set DUMP_FILE=%SCRIPT_DIR%db_dump.sql
set HOST=localhost
set PORT=5433
set USER=postgres
set PASSWORD=postgres
set DB=healthai

:: === Vérifications ===
if not exist "%PG_RESTORE%" (
    echo [ERREUR] pg_restore.exe introuvable : %PG_RESTORE%
    pause
    exit /b 1
)

if not exist "%DUMP_FILE%" (
    echo [ERREUR] Fichier dump introuvable : %DUMP_FILE%
    pause
    exit /b 1
)

echo [INFO] Host     : %HOST%:%PORT%
echo [INFO] Base     : %DB%
echo [INFO] User     : %USER%
echo [INFO] Dump     : %DUMP_FILE%
echo.

:: === Lancer le restore ===
set PGPASSWORD=%PASSWORD%

echo [INFO] Lancement du restore...
echo.

"%PG_RESTORE%" ^
  --host "%HOST%" ^
  --port "%PORT%" ^
  --username "%USER%" ^
  --dbname "%DB%" ^
  --verbose ^
  "%DUMP_FILE%"

echo.
echo ============================================
echo   Restore termine avec succes !
echo ============================================
pause
endlocal
