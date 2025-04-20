// 팀 목록 로드
function loadTeams() {
    fetch('/api/teams')
        .then(response => response.json())
        .then(teams => {
            const tbody = document.querySelector('#teamTable tbody');
            tbody.innerHTML = '';
            
            teams.forEach(team => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${team.team_name}</td>
                    <td>${team.member_count}</td>
                    <td>
                        <button class="action-button delete-button" onclick="deleteTeam(${team.id})">삭제</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            // 팀 선택 드롭다운 업데이트
            updateTeamSelects(teams);
        })
        .catch(error => {
            console.error('Error loading teams:', error);
        });
}

// 팀 선택 드롭다운 업데이트
function updateTeamSelects(teams) {
    const teamSelect = document.getElementById('teamSelect');
    const searchTeamSelect = document.getElementById('searchTeamSelect');
    
    // 팀원 추가 폼의 팀 선택
    teamSelect.innerHTML = '<option value="">팀 선택</option>';
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.team_name;
        teamSelect.appendChild(option);
    });
    
    // 팀원 조회 폼의 팀 선택
    searchTeamSelect.innerHTML = '<option value="">전체 팀</option>';
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.team_name;
        searchTeamSelect.appendChild(option);
    });
}

// 팀 추가
document.getElementById('addTeamForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const teamName = document.getElementById('teamName').value;
    
    fetch('/api/teams', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team_name: teamName })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('팀 추가 실패');
        }
        document.getElementById('teamName').value = '';
        loadTeams();
    })
    .catch(error => {
        console.error('Error adding team:', error);
        alert('팀 추가에 실패했습니다.');
    });
});

// 팀 삭제
function deleteTeam(teamId) {
    if (!confirm('정말로 이 팀을 삭제하시겠습니까? 팀에 속한 모든 팀원도 함께 삭제됩니다.')) {
        return;
    }
    
    fetch(`/api/teams/${teamId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('팀 삭제 실패');
        }
        loadTeams();
    })
    .catch(error => {
        console.error('Error deleting team:', error);
        alert('팀 삭제에 실패했습니다.');
    });
}

// 팀원 입력창 추가
function addMemberInput() {
    const memberContainer = document.getElementById('memberInputs');
    memberContainer.innerHTML = ''; // 기존 입력창 초기화
    
    // 4개의 팀원 입력창 추가
    for (let i = 0; i < 4; i++) {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'member-input';
        memberDiv.innerHTML = `
            <input type="text" class="employee-id" placeholder="사번" required>
            <input type="text" class="member-name" placeholder="이름" required>
        `;
        memberContainer.appendChild(memberDiv);
    }
}

// 팀원 추가
document.getElementById('addTeamMemberForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const teamId = document.getElementById('teamSelect').value;
    if (!teamId) {
        alert('팀을 선택해주세요.');
        return;
    }
    
    const employeeIds = document.querySelectorAll('.employee-id');
    const memberNames = document.querySelectorAll('.member-name');
    const members = [];
    
    for (let i = 0; i < employeeIds.length; i++) {
        const employeeId = employeeIds[i].value.trim();
        const name = memberNames[i].value.trim();
        
        if (employeeId && name) {
            members.push({ employee_id: employeeId, name: name });
        }
    }
    
    if (members.length === 0) {
        alert('최소 한 명의 팀원 정보를 입력해주세요.');
        return;
    }
    
    if (members.length > 4) {
        alert('팀원은 최대 4명까지만 추가할 수 있습니다.');
        return;
    }
    
    console.log('추가할 팀원 정보:', members);
    
    // 기존 팀원 삭제
    fetch(`/api/team-members?team_id=${teamId}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(existingMembers => {
        console.log('기존 팀원 정보:', existingMembers);
        // 기존 팀원이 있는 경우에만 삭제
        if (existingMembers && existingMembers.length > 0) {
            return Promise.all(existingMembers.map(member => 
                fetch(`/api/team-members/${member.id}`, {
                    method: 'DELETE'
                })
            ));
        }
        return Promise.resolve(); // 기존 팀원이 없는 경우 바로 다음 단계로 진행
    })
    .then(() => {
        // 새로운 팀원 추가
        const addPromises = members.map(member => {
            console.log('팀원 추가 시도:', member);
            return fetch('/api/team-members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    team_id: teamId,
                    employee_id: member.employee_id,
                    name: member.name
                })
            })
            .then(response => {
                if (!response.ok) {
                    console.error('팀원 추가 실패:', member, response.status);
                    throw new Error(`팀원 추가 실패: ${response.status}`);
                }
                return response;
            });
        });
        
        return Promise.all(addPromises);
    })
    .then(responses => {
        console.log('팀원 추가 완료:', responses);
        // 입력 필드 초기화
        employeeIds.forEach(input => input.value = '');
        memberNames.forEach(input => input.value = '');
        loadTeamMembers(teamId);
        alert('팀원이 성공적으로 추가되었습니다.');
    })
    .catch(error => {
        console.error('Error adding team members:', error);
        alert('팀원 추가에 실패했습니다. 콘솔 로그를 확인해주세요.');
    });
});

// 팀원 목록 로드
function loadTeamMembers(teamId = '', employeeId = '') {
    let url = '/api/team-members';
    if (teamId || employeeId) {
        url += `?team_id=${teamId}&employee_id=${employeeId}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(members => {
            const tbody = document.querySelector('#teamMemberTable tbody');
            tbody.innerHTML = '';
            
            members.forEach(member => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${member.team_name}</td>
                    <td>${member.employee_id}</td>
                    <td>${member.name}</td>
                    <td>
                        <button class="action-button delete-button" onclick="deleteTeamMember(${member.id})">삭제</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // 팀원 입력창에 기존 팀원 정보 표시
            if (teamId) {
                const memberContainer = document.getElementById('memberInputs');
                memberContainer.innerHTML = '';
                
                // 기졸 팀원 수만큼 입력창 생성
                members.forEach((member, index) => {
                    const memberDiv = document.createElement('div');
                    memberDiv.className = 'member-input';
                    memberDiv.innerHTML = `
                        <input type="text" class="employee-id" placeholder="사번" value="${member.employee_id}" required>
                        <input type="text" class="member-name" placeholder="이름" value="${member.name}" required>
                    `;
                    memberContainer.appendChild(memberDiv);
                });

                // 남은 입력창 추가 (최대 4개)
                const remainingSlots = 4 - members.length;
                for (let i = 0; i < remainingSlots; i++) {
                    const memberDiv = document.createElement('div');
                    memberDiv.className = 'member-input';
                    memberDiv.innerHTML = `
                        <input type="text" class="employee-id" placeholder="사번" required>
                        <input type="text" class="member-name" placeholder="이름" required>
                    `;
                    memberContainer.appendChild(memberDiv);
                }
            }
        })
        .catch(error => {
            console.error('Error loading team members:', error);
        });
}

// 팀원 삭제
function deleteTeamMember(memberId) {
    if (!confirm('정말로 이 팀원을 삭제하시겠습니까?')) {
        return;
    }
    
    fetch(`/api/team-members/${memberId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('팀원 삭제 실패');
        }
        loadTeamMembers();
    })
    .catch(error => {
        console.error('Error deleting team member:', error);
        alert('팀원 삭제에 실패했습니다.');
    });
}

// 팀원 검색
function searchTeamMembers() {
    const teamId = document.getElementById('searchTeamSelect').value;
    const employeeId = document.getElementById('searchEmployeeId').value.trim();
    loadTeamMembers(teamId, employeeId);
}

// 팀 선택 시 팀원 정보 로드
document.getElementById('teamSelect').addEventListener('change', function() {
    const teamId = this.value;
    if (teamId) {
        loadTeamMembers(teamId);
    } else {
        addMemberInput(); // 팀이 선택되지 않았을 때 빈 입력창 표시
    }
});

// 페이지 로드 시 초기 데이터 로드
document.addEventListener('DOMContentLoaded', () => {
    loadTeams();
    loadTeamMembers();
    addMemberInput(); // 초기 팀원 입력창 추가
}); 