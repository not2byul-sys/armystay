#!/bin/bash -l

# 콘서트 호텔 추천 앱 자동 빌드 및 배포 스크립트
# 작성일: 2026-02-07

echo "========================================================"
echo "🚀 ARMY Stay Hub - 자동 빌드 및 배포 시작"
echo "========================================================"

# 1. 환경 설정 (npm, node 경로 찾기 - 강화됨)
echo "🔍 환경 설정 확인 중..."

# Homebrew 및 시스템 경로 우선 추가
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

# 사용자 프로필 로드 시도 (에러 무시)
[ -s "$HOME/.zshrc" ] && source "$HOME/.zshrc" &> /dev/null
[ -s "$HOME/.bash_profile" ] && source "$HOME/.bash_profile" &> /dev/null
[ -s "$HOME/.bashrc" ] && source "$HOME/.bashrc" &> /dev/null

# NVM 로드 시도 (다양한 경로 확인)
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
elif [ -s "/usr/local/opt/nvm/nvm.sh" ]; then
    . "/usr/local/opt/nvm/nvm.sh"
elif [ -s "/opt/homebrew/opt/nvm/nvm.sh" ]; then
    . "/opt/homebrew/opt/nvm/nvm.sh"
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm 명령어를 찾을 수 없습니다."
    echo "⬇️  Node.js 위치를 수동으로 입력해주세요 (예: /usr/local/bin/node)"
    echo "   터미널에서 'which node'를 실행하여 경로를 확인하세요."
    exit 1
fi

echo "✅ Node.js 환경 확인 완료: $(node -v)"
echo "✅ npm 환경 확인 완료: $(npm -v)"

# 2. Public 폴더 준비 및 데이터 이동
echo "📂 데이터 파일 생성 및 준비 중..."

# Python 스크립트 실행 (데이터 강제 갱신)
if command -v python3 &> /dev/null; then
    echo "🐍 리커멘더 엔진 실행 (최신 데이터 생성)..."
    python3 concert_hotel_recommender.py
else
    echo "⚠️ python3를 찾을 수 없습니다. 기존 데이터를 사용합니다."
fi

if [ ! -d "public" ]; then
    echo "   Running: mkdir -p public"
    mkdir -p public
fi

if [ -f "concert_recommendations.json" ]; then
    echo "   Running: cp concert_recommendations.json public/"
    cp concert_recommendations.json public/
    echo "✅ 데이터 파일 이동 완료"
else
    echo "❌ Error: concert_recommendations.json 파일 생성 실패."
    exit 1
fi

# 3. 빌드 실행
echo "🏗️ 프로젝트 빌드 시작 (npm run build)..."
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 빌드 성공!"
else
    echo "❌ 빌드 실패. 로그를 확인해주세요."
    exit 1
fi

# 4. 배포 실행
echo "🚀 Vercel 배포 시작 (vercel --prod)..."
if command -v vercel &> /dev/null; then
    vercel --prod
else
    echo "⚠️ 'vercel' 명령어를 찾을 수 없습니다."
    echo "   Running: npx vercel --prod"
    npx vercel --prod
fi

echo "========================================================"
echo "🎉 모든 작업이 완료되었습니다!"
echo "========================================================"
