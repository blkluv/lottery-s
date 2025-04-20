import sqlite3

def check_database():
    conn = sqlite3.connect('hackathon.db')
    cursor = conn.cursor()
    
    # 모든 테이블 조회
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("\n=== 데이터베이스 테이블 목록 ===")
    for table in tables:
        table_name = table[0]
        print(f"\n테이블: {table_name}")
        print("-" * 50)
        
        # 테이블 구조 조회
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        print("컬럼 정보:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        # 테이블 데이터 조회
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        print("\n데이터:")
        for row in rows:
            print(f"  {row}")
    
    conn.close()

if __name__ == '__main__':
    check_database() 