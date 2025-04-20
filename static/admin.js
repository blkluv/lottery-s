document.addEventListener('DOMContentLoaded', function() {
    loadPrizes();
    
    // 상품 추가 폼 제출 처리
    document.getElementById('add-prize-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            image_url: document.getElementById('image_url').value,
            quantity: 1
        };

        try {
            const response = await fetch('/api/prizes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('상품 추가에 실패했습니다.');
            }

            alert('상품이 성공적으로 추가되었습니다.');
            loadPrizes();
            this.reset();
        } catch (error) {
            alert(error.message);
        }
    });

    // 팀 관리 이벤트 리스너
    document.getElementById('addTeamForm').addEventListener('submit', addTeam);
    document.getElementById('addTeamMemberForm').addEventListener('submit', addTeamMember);
    loadTeams();
    loadTeamMembers();
    updateTeamSelects();

    // 당첨자 목록 로드
    loadWinners();
});

// 상품 목록 로드
async function loadPrizes() {
    try {
        const response = await fetch('/api/prizes');
        if (!response.ok) {
            throw new Error('상품 목록을 불러오는데 실패했습니다.');
        }

        const prizes = await response.json();
        const tableBody = document.getElementById('prize-table-body');
        tableBody.innerHTML = '';

        prizes.forEach(prize => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${prize.id}</td>
                <td>${prize.name}</td>
                <td>${prize.description}</td>
                <td><img src="${prize.image_url}" alt="${prize.name}" style="width: 50px;"></td>
                <td>${prize.total_quantity}</td>
                <td>${prize.remaining_quantity}</td>
                <td>${prize.drawn_count}</td>
                <td>
                    <button class="action-button edit-button" onclick="editPrize(${prize.id})">수정</button>
                </td>
                <td>
                    <button class="action-button delete-button" onclick="deletePrize(${prize.id})">삭제</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        alert(error.message);
    }
}

// 상품 수정
async function editPrize(prizeId) {
    const newQuantity = prompt('새로운 수량을 입력하세요:');
    if (newQuantity && !isNaN(newQuantity) && parseInt(newQuantity) > 0) {
        try {
            const response = await fetch(`/api/prizes/${prizeId}/quantity`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ total_quantity: parseInt(newQuantity) })
            });

            if (response.ok) {
                loadPrizes();
            } else {
                throw new Error('수량 업데이트에 실패했습니다.');
            }
        } catch (error) {
            alert(error.message);
        }
    }
}

// 상품 삭제
async function deletePrize(prizeId) {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) {
        return;
    }

    try {
        const response = await fetch(`/api/prizes/${prizeId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('상품 삭제에 실패했습니다.');
        }

        alert('상품이 성공적으로 삭제되었습니다.');
        loadPrizes();
    } catch (error) {
        alert(error.message);
    }
}

// 팀 관리 기능
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
                        <button class="btn-delete-team" onclick="deleteTeam(${team.id})">삭제</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading teams:', error);
            alert('팀 목록을 불러오는데 실패했습니다.');
        });
}

function addTeam(event) {
    event.preventDefault();
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
}

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

// 팀원 관리 기능
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
                        <button class="btn-delete-team" onclick="deleteTeamMember(${member.id})">삭제</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading team members:', error);
            alert('팀원 목록을 불러오는데 실패했습니다.');
        });
}

function updateTeamSelects() {
    fetch('/api/teams')
        .then(response => response.json())
        .then(teams => {
            // 팀원 추가 폼의 팀 선택
            const teamSelect = document.getElementById('teamSelect');
            teamSelect.innerHTML = '<option value="">팀 선택</option>';
            teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = team.team_name;
                teamSelect.appendChild(option);
            });

            // 팀 선택 시 이벤트 리스너 추가
            teamSelect.addEventListener('change', function() {
                const selectedTeamId = this.value;
                if (selectedTeamId) {
                    loadTeamMembersForInput(selectedTeamId);
                } else {
                    clearTeamMemberInputs();
                }
            });

            // 팀원 조회 폼의 팀 선택
            const searchTeamSelect = document.getElementById('searchTeamSelect');
            searchTeamSelect.innerHTML = '<option value="">전체 팀</option>';
            teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = team.team_name;
                searchTeamSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading teams:', error);
            alert('팀 목록을 불러오는데 실패했습니다.');
        });
}

function loadTeamMembersForInput(teamId) {
    fetch(`/api/team-members?team_id=${teamId}`)
        .then(response => response.json())
        .then(members => {
            const memberContainer = document.getElementById('memberInputs');
            memberContainer.innerHTML = ''; // 기존 입력창 초기화
            
            if (members.length > 0) {
                members.forEach(member => {
                    addMemberInput(member.employee_id, member.name);
                });
            } else {
                addMemberInput(); // 팀원이 없는 경우 빈 입력창 추가
            }
        })
        .catch(error => {
            console.error('Error loading team members:', error);
            alert('팀원 목록을 불러오는데 실패했습니다.');
        });
}

function clearTeamMemberInputs() {
    const memberContainer = document.getElementById('memberInputs');
    memberContainer.innerHTML = '';
    addMemberInput(); // 빈 입력창 추가
}

function addTeamMember(event) {
    event.preventDefault();
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
    
    // 모든 팀원 추가
    Promise.all(members.map(member => 
        fetch('/api/team-members', {
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
    ))
    .then(responses => {
        if (responses.some(response => !response.ok)) {
            throw new Error('팀원 추가 실패');
        }
        // 입력 필드 초기화
        employeeIds.forEach(input => input.value = '');
        memberNames.forEach(input => input.value = '');
        loadTeamMembers();
    })
    .catch(error => {
        console.error('Error adding team members:', error);
        alert('팀원 추가에 실패했습니다.');
    });
}

function searchTeamMembers() {
    const teamId = document.getElementById('searchTeamSelect').value;
    const employeeId = document.getElementById('searchEmployeeId').value.trim();
    loadTeamMembers(teamId, employeeId);
}

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

function addMemberInput(employeeId = '', name = '') {
    const memberContainer = document.getElementById('memberInputs');
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member-input';
    memberDiv.innerHTML = `
        <input type="text" class="employee-id" placeholder="사번" value="${employeeId}">
        <input type="text" class="member-name" placeholder="이름" value="${name}">
        <button type="button" class="btn-delete-member" onclick="this.parentElement.remove()">삭제</button>
    `;
    memberContainer.appendChild(memberDiv);
}

// 당첨자 목록 로드
function loadWinners() {
    fetch('/api/winners')
        .then(response => response.json())
        .then(winners => {
            const tbody = document.getElementById('winner-table-body');
            tbody.innerHTML = '';
            
            winners.forEach(winner => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${winner.employee_id}</td>
                    <td>${winner.member_name || '-'}</td>
                    <td>${winner.prize_name}</td>
                    <td>${new Date(winner.won_at).toLocaleString()}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading winners:', error);
        });
} 