@echo off
echo ========================================================================================
echo         Lancement MSPR1 - PostgreSQL + API Laravel + Grafana + REACT + ETL
echo ========================================================================================

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Docker n'est pas lance. Demarre Docker Desktop puis relance ce script.
    pause
    exit /b 1
)

cd /d "%~dp0"

if not exist "docker-compose.yml" (
    echo [ERREUR] docker-compose.yml introuvable a la racine.
    pause
    exit /b 1
)

echo [INFO] Nettoyage des conteneurs existants...
docker-compose down --remove-orphans -v >nul 2>&1

echo [INFO] Suppression des conteneurs fantomes si necessaire...
docker rm -f mspr1-api >nul 2>&1
docker rm -f postgres >nul 2>&1

echo [INFO] Construction et demarrage des conteneurs...
docker-compose up --build -d

if errorlevel 1 (
    echo [ERREUR] Echec du demarrage.
    pause
    exit /b 1
)

echo.
echo [INFO] Attente que PostgreSQL soit operationnel...
:WAIT_POSTGRES
docker exec postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    timeout /t 2 >nul
    goto WAIT_POSTGRES
)
echo [OK] PostgreSQL est pret.

echo.
echo [INFO] Lancement du restore de la base de donnees...
call "%~dp0start\pg_restore\restore.bat"

if errorlevel 1 (
    echo [ERREUR] Le restore a echoue.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Tout est demarre !
echo   API dispo sur  : http://localhost:8080
echo   Swagger UI     : http://localhost:8080/api/documentation
echo ============================================
echo.
echo [INFO] Logs en direct : docker-compose logs -f
echo [INFO] Pour arreter   : stop.bat
echo.
pause