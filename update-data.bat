@echo off
chcp 65001 >nul
echo data-source 폴더의 CSV로 모든 노선 데이터를 다시 만듭니다.
call npm run build:data -- --all
echo.
echo 위 출력에서 노선별 역 개수와 경고(⚠)를 확인하세요.
pause
