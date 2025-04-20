# AI 해커톤 경품 추첨 시스템

SK C&C AI 해커톤의 경품 추첨을 위한 웹 애플리케이션입니다.

## 기능

- 팀 관리
- 경품 관리
- 추첨 시스템
- 관리자 페이지

## 기술 스택

- Python 3.9
- Flask
- PostgreSQL
- Azure Web App

## 설치 및 실행

1. 가상환경 생성 및 활성화:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. 의존성 설치:
```bash
pip install -r requirements.txt
```

3. 환경 변수 설정:
`.env` 파일을 생성하고 다음 변수들을 설정:
```
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
```

4. 애플리케이션 실행:
```bash
flask run
```

## 배포

이 프로젝트는 Azure Web App에 배포되어 있습니다. GitHub Actions를 통해 자동 배포가 설정되어 있습니다.

## 라이센스

© 2025 SK Holdings C&C. All rights reserved. 