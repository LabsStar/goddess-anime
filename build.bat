@echo off
REM Description: Build the project

REM Remove old build
if exist dist (
    rmdir /s /q dist
)

REM Build
npm run build