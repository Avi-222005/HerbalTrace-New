@echo off
echo ============================================================
echo           HerbalTrace - Push Code to GitHub
echo ============================================================
echo.
echo Target Repository: https://github.com/Avi-222005/HerbalTrace-New.git
echo.
echo Staging and committing any remaining changes...
git add -A
git commit -m "Update HerbalTrace with full Hyperledger Fabric backend and web portal integration" 2>nul
echo.
echo Pushing to GitHub (origin main)...
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ============================================================
    echo [SUCCESS] Code successfully pushed to GitHub!
    echo ============================================================
) else (
    echo ============================================================
    echo [NOTE] If permission was denied, you may need a GitHub 
    echo Personal Access Token or force push if the remote has commits:
    echo     git push -u origin main --force
    echo ============================================================
)
echo.
pause
