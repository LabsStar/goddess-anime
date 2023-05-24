@echo off
REM Switch to the branch specified in the first argument
REM Check if the first argument is empty
IF "%1"=="" (
    ECHO Please specify a branch name
    EXIT /B 1
)

REM Check if the branch exists
IF NOT EXIST "%~1" (
    ECHO The branch "%~1" does not exist
    EXIT /B 1
)

if "%2" == "-M" (
    REM Merge the branch into the current branch
    git merge "%~1"
    EXIT /B 0
) else (
    REM Switch to the branch
    git checkout "%~1"
    EXIT /B 0
)
