@echo off
echo ===============================
echo  Actualizando proyecto en Git
echo ===============================
git status
git add .
git commit -m "Actualización automática"
git push origin main
pause
