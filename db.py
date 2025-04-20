import sqlite3
import os
from datetime import datetime
import random

class Database:
    def __init__(self, db_name='hackathon.db'):
        self.db_name = db_name
        self.init_db()

    def get_db(self):
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        with self.get_db() as conn:
            cursor = conn.cursor()
            
            # 팀 테이블 생성
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS teams (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    team_name TEXT NOT NULL
                )
            ''')
            
            # 팀원 테이블 생성
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS team_members (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_id TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    team_id INTEGER,
                    FOREIGN KEY (team_id) REFERENCES teams (id)
                )
            ''')
            
            # 경품 테이블 생성
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS prizes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    image_url TEXT,
                    total_quantity INTEGER DEFAULT 1,
                    remaining_quantity INTEGER DEFAULT 1
                )
            ''')
            
            # 당첨자 테이블 생성
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS winners (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_id TEXT NOT NULL,
                    prize_id INTEGER NOT NULL,
                    won_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (employee_id) REFERENCES team_members (employee_id),
                    FOREIGN KEY (prize_id) REFERENCES prizes (id)
                )
            ''')
            
            conn.commit()

    def get_team_member(self, employee_id):
        with self.get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM team_members WHERE employee_id = ?', (employee_id,))
            return cursor.fetchone()

    def get_random_prize(self):
        with self.get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT p.* FROM prizes p
                WHERE p.remaining_quantity > 0
                ORDER BY RANDOM()
                LIMIT 1
            ''')
            return cursor.fetchone()

    def add_winner(self, employee_id, prize_id):
        with self.get_db() as conn:
            cursor = conn.cursor()
            # 먼저 남은 수량이 있는지 확인
            cursor.execute('SELECT remaining_quantity FROM prizes WHERE id = ?', (prize_id,))
            remaining = cursor.fetchone()[0]
            if remaining <= 0:
                raise ValueError("남은 경품이 없습니다.")
            
            cursor.execute('''
                INSERT INTO winners (employee_id, prize_id)
                VALUES (?, ?)
            ''', (employee_id, prize_id))
            cursor.execute('''
                UPDATE prizes 
                SET remaining_quantity = remaining_quantity - 1 
                WHERE id = ?
            ''', (prize_id,))
            conn.commit()

    def get_winner(self, employee_id):
        with self.get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM winners WHERE employee_id = ?', (employee_id,))
            return cursor.fetchone()

    def get_all_prizes(self):
        with self.get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT p.*, 
                       (SELECT COUNT(*) FROM winners w WHERE w.prize_id = p.id) as drawn_count
                FROM prizes p
            ''')
            return cursor.fetchall()

    def add_prize(self, name, description, image_url, total_quantity):
        with self.get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO prizes (name, description, image_url, total_quantity, remaining_quantity)
                VALUES (?, ?, ?, ?, ?)
            ''', (name, description, image_url, total_quantity, total_quantity))
            conn.commit()
            return cursor.lastrowid

    def update_prize_quantity(self, prize_id, total_quantity):
        with self.get_db() as conn:
            cursor = conn.cursor()
            # 현재 당첨된 수량을 가져옵니다
            cursor.execute('SELECT COUNT(*) FROM winners WHERE prize_id = ?', (prize_id,))
            drawn_count = cursor.fetchone()[0]
            
            # 총 수량이 당첨된 수량보다 작을 수 없습니다
            if total_quantity < drawn_count:
                raise ValueError("총 수량은 당첨된 수량보다 작을 수 없습니다.")
            
            # 남은 수량을 계산합니다 (총 수량 - 당첨된 수량)
            remaining_quantity = total_quantity - drawn_count
            
            cursor.execute('''
                UPDATE prizes 
                SET total_quantity = ?,
                    remaining_quantity = ?
                WHERE id = ?
            ''', (total_quantity, remaining_quantity, prize_id))
            conn.commit()

    def delete_prize(self, prize_id):
        with self.get_db() as conn:
            cursor = conn.cursor()
            # 당첨자 정보 먼저 삭제
            cursor.execute('DELETE FROM winners WHERE prize_id = ?', (prize_id,))
            # 경품 삭제
            cursor.execute('DELETE FROM prizes WHERE id = ?', (prize_id,))
            conn.commit()

    def get_all_teams(self):
        with self.get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT t.id, t.team_name, COUNT(tm.id) as member_count 
                FROM teams t 
                LEFT JOIN team_members tm ON t.id = tm.team_id 
                GROUP BY t.id, t.team_name
            ''')
            teams = []
            for row in cursor.fetchall():
                team = {
                    'id': row[0],
                    'team_name': row[1],
                    'member_count': row[2],
                    'members': []
                }
                cursor.execute('''
                    SELECT employee_id, name 
                    FROM team_members 
                    WHERE team_id = ?
                ''', (team['id'],))
                for member_row in cursor.fetchall():
                    team['members'].append({
                        'employee_id': member_row[0],
                        'name': member_row[1]
                    })
                teams.append(team)
            return teams

    def add_team(self, team_name):
        with self.get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO teams (team_name) VALUES (?)', (team_name,))
            conn.commit()
            return cursor.lastrowid

    def delete_team(self, team_id):
        with self.get_db() as conn:
            cursor = conn.cursor()
            # 팀 삭제 전에 해당 팀의 모든 팀원 삭제
            cursor.execute('DELETE FROM team_members WHERE team_id = ?', (team_id,))
            cursor.execute('DELETE FROM teams WHERE id = ?', (team_id,))
            conn.commit()

    def get_all_team_members(self):
        with self.get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT tm.*, t.team_name 
                FROM team_members tm 
                JOIN teams t ON tm.team_id = t.id
            ''')
            return cursor.fetchall()

    def add_team_member(self, team_id, employee_id, name):
        try:
            conn = self.get_db()
            cursor = conn.cursor()
            
            # 팀 존재 여부 확인
            cursor.execute('SELECT id FROM teams WHERE id = ?', (team_id,))
            if not cursor.fetchone():
                raise ValueError('존재하지 않는 팀입니다.')
            
            # 중복 사번 체크
            cursor.execute('SELECT id FROM team_members WHERE employee_id = ?', (employee_id,))
            if cursor.fetchone():
                raise ValueError('이미 등록된 사번입니다.')
            
            # 팀원 추가
            cursor.execute('''
                INSERT INTO team_members (team_id, employee_id, name)
                VALUES (?, ?, ?)
            ''', (team_id, employee_id, name))
            
            conn.commit()
            return cursor.lastrowid
            
        except ValueError as ve:
            raise ve
        except Exception as e:
            print('팀원 추가 중 DB 오류:', str(e))
            raise Exception('팀원 추가 중 데이터베이스 오류가 발생했습니다.')
        finally:
            if 'conn' in locals():
                conn.close()

    def delete_team_member(self, member_id):
        with self.get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM team_members WHERE id = ?', (member_id,))
            conn.commit()

    def get_team_members(self, team_id='', employee_id=''):
        with self.get_db() as conn:
            cursor = conn.cursor()
            query = '''
                SELECT tm.*, t.team_name 
                FROM team_members tm 
                JOIN teams t ON tm.team_id = t.id
                WHERE 1=1
            '''
            params = []
            
            if team_id:
                query += ' AND tm.team_id = ?'
                params.append(team_id)
            
            if employee_id:
                query += ' AND tm.employee_id LIKE ?'
                params.append(f'%{employee_id}%')
            
            cursor.execute(query, params)
            return cursor.fetchall()

    def get_all_winners(self):
        with self.get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT 
                    w.id,
                    w.employee_id,
                    w.prize_id,
                    datetime(w.won_at) as won_at,
                    tm.name as member_name,
                    t.team_name,
                    p.name as prize_name
                FROM winners w
                LEFT JOIN team_members tm ON w.employee_id = tm.employee_id
                LEFT JOIN teams t ON tm.team_id = t.id
                LEFT JOIN prizes p ON w.prize_id = p.id
                ORDER BY w.won_at DESC
            ''')
            return cursor.fetchall()

    def get_team(self, team_id):
        with self.get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM teams WHERE id = ?', (team_id,))
            return cursor.fetchone()

# 데이터베이스 인스턴스 생성
db = Database() 