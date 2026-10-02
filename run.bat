@echo off
chcp 65001 >nul
echo [1/2] 패키지 설치 중... (처음 한 번만 오래 걸려요)
call npm install
echo [2/2] 앱 실행! 에뮬레이터를 먼저 켜 두고, 아래에서 a 키를 누르세요.
call npx expo start -c
