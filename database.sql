-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS hackathon_lottery;
USE hackathon_lottery;

-- 팀 테이블 생성
CREATE TABLE IF NOT EXISTS teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 팀원 테이블 생성
CREATE TABLE IF NOT EXISTS team_members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    employee_id VARCHAR(8) NOT NULL UNIQUE,
    member_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

-- 경품 테이블 생성
CREATE TABLE IF NOT EXISTS prizes (
    prize_id INT AUTO_INCREMENT PRIMARY KEY,
    prize_name VARCHAR(100) NOT NULL,
    prize_description TEXT,
    prize_image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 당첨 테이블 생성
CREATE TABLE IF NOT EXISTS winners (
    winner_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    prize_id INT NOT NULL,
    won_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES team_members(member_id) ON DELETE CASCADE,
    FOREIGN KEY (prize_id) REFERENCES prizes(prize_id) ON DELETE CASCADE
);

-- 샘플 데이터 삽입
INSERT INTO teams (team_name) VALUES 
('이노베이터즈'),
('알파고프렌즈'),
('코드마스터'),
('AI 솔루션');

-- 샘플 경품 데이터 삽입
INSERT INTO prizes (prize_name, prize_description) VALUES 
('특별한 상품', '이 경품은 해커톤 참가자만을 위해 준비된 특별한 아이템입니다.'),
('최신 디바이스', '여러분의 개발 환경을 업그레이드할 수 있는 최신 기술 디바이스입니다.'),
('기프트 세트', '해커톤의 피로를 풀어줄 프리미엄 기프트 세트입니다.'),
('깜짝 선물', '행운의 주인공에게만 공개되는 깜짝 경품입니다!');

-- 샘플 팀원 데이터 삽입
INSERT INTO team_members (team_id, employee_id, member_name) VALUES 
(1, '12345678', '김OO'),
(1, '23456789', '박OO'),
(1, '34567890', '이OO'),
(1, '45678901', '정OO'),
(2, '56789012', '최OO'),
(2, '67890123', '한OO'),
(2, '78901234', '윤OO'),
(2, '89012345', '송OO'),
(3, '90123456', '강OO'),
(3, '01234567', '조OO'),
(3, '11223344', '임OO'),
(3, '22334455', '서OO'),
(4, '33445566', '신OO'),
(4, '44556677', '황OO'),
(4, '55667788', '고OO'),
(4, '66778899', '문OO'); 