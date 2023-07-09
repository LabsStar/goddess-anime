@echo off
REM Description: Deploy the bot's commands
@REM Get any arguments passed to the script
set args=%*
npm run deploy-commands %args%
