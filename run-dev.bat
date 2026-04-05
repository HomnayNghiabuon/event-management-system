@echo off
setlocal enabledelayedexpansion

REM Chay server dev - tu dong load bien tu .env
REM PowerShell : .\run-dev.bat
REM CMD        : run-dev.bat

set "SCRIPT_DIR=%~dp0"
set "ENV_FILE=%SCRIPT_DIR%.env"

if not exist "%ENV_FILE%" (
    echo [ERROR] Khong tim thay file .env
    echo   --^> Chay: copy "%SCRIPT_DIR%.env.example" "%ENV_FILE%"  roi dien thong tin vao
    exit /b 1
)

echo [INFO] Loading %ENV_FILE% ...
for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
    if not "%%A"=="" if not "%%B"=="" (
        set "%%A=%%B"
    )
)

echo [INFO] Starting server on port %SERVER_PORT% ...
call "%SCRIPT_DIR%mvnw.cmd" spring-boot:run
