from flask import Flask, render_template, request, jsonify
from db import Database

app = Flask(__name__)
db = Database()

@app.route('/')
def index():
    prizes = db.get_all_prizes()
    return render_template('hackathon_lottery.html', prizes=prizes)

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/admin/prizes')
def admin_prizes():
    return render_template('admin_prizes.html')

@app.route('/admin/winners')
def admin_winners():
    return render_template('admin_winners.html')

@app.route('/admin/teams')
def admin_teams():
    return render_template('admin_teams.html')

@app.route('/guide')
def guide():
    return render_template('guide.html')

@app.route('/api/check-employee', methods=['POST'])
def check_employee():
    try:
        data = request.get_json()
        employee_id = data.get('employee_id')
        
        if not employee_id:
            return jsonify({'exists': False, 'message': '사번이 필요합니다.'}), 400
        
        team_member = db.get_team_member(employee_id)
        
        if team_member:
            return jsonify({'exists': True})
        else:
            return jsonify({'exists': False, 'message': '유효하지 않은 사번입니다.'}), 404
            
    except Exception as e:
        print(f"Error in check_employee: {str(e)}")
        return jsonify({'exists': False, 'message': '서버 오류가 발생했습니다.'}), 500

@app.route('/api/draw-prize', methods=['POST'])
def draw_prize():
    try:
        data = request.get_json()
        employee_id = data.get('employee_id')
        
        if not employee_id:
            return jsonify({'success': False, 'message': '사번이 필요합니다.'}), 400
        
        # 이미 당첨된 사원인지 확인
        if db.get_winner(employee_id):
            return jsonify({'success': False, 'message': '이미 참여하셨습니다.'}), 400
        
        # 경품 뽑기
        prize = db.get_random_prize()
        if not prize:
            return jsonify({'success': False, 'message': '남은 경품이 없습니다.'}), 400
        
        # 당첨자 추가
        db.add_winner(employee_id, prize['id'])
        
        return jsonify({
            'success': True,
            'prize': {
                'name': prize['name'],
                'description': prize['description'],
                'image_url': prize['image_url']
            }
        })
    except Exception as e:
        print(f"Error in draw_prize: {str(e)}")
        return jsonify({'success': False, 'message': '서버 오류가 발생했습니다.'}), 500

@app.route('/api/prizes', methods=['GET'])
def get_prizes():
    prizes = db.get_all_prizes()
    return jsonify([dict(prize) for prize in prizes])

@app.route('/api/prizes', methods=['POST'])
def add_prize():
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        image_url = data.get('image_url')
        total_quantity = data.get('total_quantity', 1)
        
        if not all([name, description, image_url]):
            return jsonify({'error': '필수 정보가 누락되었습니다.'}), 400
            
        prize_id = db.add_prize(name, description, image_url, total_quantity)
        return jsonify({'id': prize_id}), 201
    except Exception as e:
        print(f"Error in add_prize: {str(e)}")
        return jsonify({'error': '상품 추가에 실패했습니다.'}), 500

@app.route('/api/prizes/<int:prize_id>', methods=['DELETE'])
def delete_prize(prize_id):
    try:
        db.delete_prize(prize_id)
        return '', 204
    except Exception as e:
        print(f"Error in delete_prize: {str(e)}")
        return jsonify({'error': '상품 삭제에 실패했습니다.'}), 500

@app.route('/api/prizes/<int:prize_id>/quantity', methods=['PUT'])
def update_prize_quantity(prize_id):
    try:
        data = request.get_json()
        total_quantity = data.get('total_quantity')
        
        if total_quantity is None:
            return jsonify({'error': '수량이 필요합니다.'}), 400
            
        db.update_prize_quantity(prize_id, total_quantity)
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error in update_prize_quantity: {str(e)}")
        return jsonify({'error': '수량 업데이트에 실패했습니다.'}), 500

@app.route('/api/teams', methods=['GET'])
def get_teams():
    try:
        teams = db.get_all_teams()
        print('Teams data:', teams)  # 디버깅을 위한 로그 추가
        return jsonify(teams)
    except Exception as e:
        print(f"Error in get_teams: {str(e)}")
        return jsonify({'error': '팀 목록을 불러오는데 실패했습니다.'}), 500

@app.route('/api/teams', methods=['POST'])
def add_team():
    try:
        data = request.get_json()
        team_name = data.get('team_name')
        
        if not team_name:
            return jsonify({'error': '팀 이름이 필요합니다.'}), 400
            
        team_id = db.add_team(team_name)
        return jsonify({'id': team_id}), 201
    except Exception as e:
        print(f"Error in add_team: {str(e)}")
        return jsonify({'error': '팀 추가에 실패했습니다.'}), 500

@app.route('/api/teams/<int:team_id>', methods=['DELETE'])
def delete_team(team_id):
    try:
        db.delete_team(team_id)
        return '', 204
    except Exception as e:
        print(f"Error in delete_team: {str(e)}")
        return jsonify({'error': '팀 삭제에 실패했습니다.'}), 500

@app.route('/api/team-members', methods=['GET'])
def get_team_members():
    try:
        team_id = request.args.get('team_id', '')
        employee_id = request.args.get('employee_id', '')
        
        members = db.get_team_members(team_id, employee_id)
        return jsonify([dict(member) for member in members])
    except Exception as e:
        print(f"Error in get_team_members: {str(e)}")
        return jsonify({'error': '팀원 목록을 불러오는데 실패했습니다.'}), 500

@app.route('/api/team-members', methods=['POST'])
def add_team_member():
    try:
        data = request.get_json()
        print('팀원 추가 요청 데이터:', data)  # 디버깅 로그 추가
        
        employee_id = data.get('employee_id')
        name = data.get('name')
        team_id = data.get('team_id')
        
        if not all([employee_id, name, team_id]):
            missing_fields = []
            if not employee_id:
                missing_fields.append('사번')
            if not name:
                missing_fields.append('이름')
            if not team_id:
                missing_fields.append('팀 ID')
            error_msg = f'다음 필수 정보가 누락되었습니다: {", ".join(missing_fields)}'
            print('필수 데이터 누락:', error_msg)
            return jsonify({'error': error_msg}), 400
            
        # 팀 존재 여부 확인
        team = db.get_team(team_id)
        if not team:
            error_msg = f'ID가 {team_id}인 팀이 존재하지 않습니다.'
            print('팀이 존재하지 않음:', error_msg)
            return jsonify({'error': error_msg}), 404
            
        # 팀원 추가
        try:
            member_id = db.add_team_member(team_id, employee_id, name)
            print('팀원 추가 성공:', {'member_id': member_id})
            return jsonify({'id': member_id}), 201
        except ValueError as ve:
            error_msg = str(ve)
            if '이미 등록된 사번입니다' in error_msg:
                error_msg = f'사번 {employee_id}는 이미 다른 팀에 등록되어 있습니다.'
            print('팀원 추가 중 유효성 검사 오류:', error_msg)
            return jsonify({'error': error_msg}), 400
        except Exception as e:
            error_msg = f'팀원 추가 중 데이터베이스 오류가 발생했습니다: {str(e)}'
            print('팀원 추가 중 DB 오류:', error_msg)
            return jsonify({'error': error_msg}), 500
        
    except Exception as e:
        error_msg = f'팀원 추가 중 예상치 못한 오류가 발생했습니다: {str(e)}'
        print('팀원 추가 중 예상치 못한 오류:', error_msg)
        return jsonify({'error': error_msg}), 500

@app.route('/api/team-members/<int:member_id>', methods=['DELETE'])
def delete_team_member(member_id):
    try:
        db.delete_team_member(member_id)
        return '', 204
    except Exception as e:
        print(f"Error in delete_team_member: {str(e)}")
        return jsonify({'error': '팀원 삭제에 실패했습니다.'}), 500

@app.route('/api/winners', methods=['GET'])
def get_winners():
    try:
        winners = db.get_all_winners()
        return jsonify([{
            'id': winner['id'],
            'employee_id': winner['employee_id'],
            'prize_id': winner['prize_id'],
            'won_at': winner['won_at'],
            'member_name': winner['member_name'],
            'team_name': winner['team_name'],
            'prize_name': winner['prize_name']
        } for winner in winners])
    except Exception as e:
        print(f"Error getting winners: {e}")
        return jsonify({'error': '당첨자 목록을 가져오는데 실패했습니다.'}), 500

if __name__ == '__main__':
    app.run(debug=True) 