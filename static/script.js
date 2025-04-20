document.addEventListener('DOMContentLoaded', function() {
    // 동적 태그라인 기능
    const taglineElement = document.getElementById('dynamic-tagline');
    const taglines = [
        "AI Powered ITS",
        "AI Soft Engineering",
        "SK Holdings C&C"
    ];
    let currentTaglineIndex = 0;

    function updateTagline() {
        if (taglineElement) {
            taglineElement.textContent = taglines[currentTaglineIndex];
            currentTaglineIndex = (currentTaglineIndex + 1) % taglines.length;
        }
    }

    updateTagline();
    setInterval(updateTagline, 3000);

    // 시작하기 버튼 클릭 이벤트
    const startButton = document.querySelector('.cta-button');
    if (startButton) {
        startButton.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('prize-section').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 확인 버튼 클릭 이벤트
    const confirmButton = document.querySelector('.employee-id-input-container button');
    if (confirmButton) {
        confirmButton.addEventListener('click', checkEmployee);
    }

    // Enter 키 이벤트
    const employeeIdInput = document.getElementById('employeeId');
    if (employeeIdInput) {
        employeeIdInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkEmployee();
            }
        });
    }

    // 사번 확인 함수
    function checkEmployee() {
        const employeeId = document.getElementById('employeeId').value;
        if (!employeeId) {
            alert('사번을 입력해주세요.');
            return;
        }

        fetch('/api/check-employee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ employee_id: employeeId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                drawPrize(employeeId);
            } else {
                alert('사번을 확인해 주세요.');
                document.getElementById('employeeId').value = '';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('서버 오류가 발생했습니다.');
        });
    }

    // 경품 추첨 함수
    function drawPrize(employeeId) {
        fetch('/api/draw-prize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ employee_id: employeeId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`축하합니다. ${data.prize.name} 경품이 당첨되었습니다.`);
                document.getElementById('employeeId').value = '';
            } else {
                alert(data.message || '이미 참여하셨습니다.');
                document.getElementById('employeeId').value = '';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('서버 오류가 발생했습니다.');
            document.getElementById('employeeId').value = '';
        });
    }

    // 관리자 관련 요소
    const adminButton = document.getElementById('adminButton');
    const passwordModal = document.getElementById('passwordModal');
    const adminPassword = document.getElementById('adminPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const cancelPassword = document.getElementById('cancelPassword');

    // 관리자 버튼 클릭 이벤트
    if (adminButton) {
        adminButton.addEventListener('click', function() {
            passwordModal.style.display = 'block';
            adminPassword.focus();
        });

        // Enter 키 이벤트 추가
        adminPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (adminPassword.value === '0108') {
                    window.location.href = '/admin';
                } else {
                    alert('비밀번호가 일치하지 않습니다.');
                    adminPassword.value = '';
                }
            }
        });
    }

    // 비밀번호 확인 버튼 클릭 이벤트
    if (confirmPassword) {
        confirmPassword.addEventListener('click', function() {
            if (adminPassword.value === '0108') {
                window.location.href = '/admin';
            } else {
                alert('비밀번호가 일치하지 않습니다.');
                adminPassword.value = '';
            }
        });
    }

    // 취소 버튼 클릭 이벤트
    if (cancelPassword) {
        cancelPassword.addEventListener('click', function() {
            passwordModal.style.display = 'none';
            adminPassword.value = '';
        });
    }

    // 모달 외부 클릭 시 닫기
    if (passwordModal) {
        window.addEventListener('click', function(event) {
            if (event.target === passwordModal) {
                passwordModal.style.display = 'none';
                adminPassword.value = '';
            }
        });
    }

    // 팀 정보 로드
    function loadTeams() {
        fetch('/api/teams')
            .then(response => response.json())
            .then(teams => {
                console.log('Loaded teams:', teams); // 디버깅을 위한 로그 추가
                const teamsList = document.getElementById('teamsList');
                if (!teamsList) {
                    console.error('teamsList element not found');
                    return;
                }
                teamsList.innerHTML = '';
                
                teams.forEach(team => {
                    const teamCard = document.createElement('div');
                    teamCard.className = 'team-card';
                    
                    let membersHtml = '';
                    if (team.members && team.members.length > 0) {
                        membersHtml = '<ul class="team-members">';
                        team.members.forEach(member => {
                            membersHtml += `<li>${member.name} (${member.employee_id})</li>`;
                        });
                        membersHtml += '</ul>';
                    }
                    
                    teamCard.innerHTML = `
                        <h4>${team.team_name}</h4>
                        <p>팀원 수: ${team.member_count}명</p>
                        ${membersHtml}
                    `;
                    teamsList.appendChild(teamCard);
                });
            })
            .catch(error => {
                console.error('Error loading teams:', error);
            });
    }

    // 경품 정보 로드
    function loadPrizes() {
        fetch('/api/prizes')
            .then(response => response.json())
            .then(prizes => {
                console.log('Loaded prizes:', prizes); // 디버깅을 위한 로그 추가
                const prizesList = document.getElementById('prizesList');
                if (!prizesList) {
                    console.error('prizesList element not found');
                    return;
                }
                prizesList.innerHTML = '';
                
                prizes.forEach(prize => {
                    const prizeCard = document.createElement('div');
                    prizeCard.className = 'prize-card';
                    prizeCard.innerHTML = `
                        <h4>${prize.name}</h4>
                        <p>남은 수량: ${prize.remaining_quantity}개</p>
                    `;
                    prizesList.appendChild(prizeCard);
                });
            })
            .catch(error => {
                console.error('Error loading prizes:', error);
            });
    }

    // 페이지 로드 시 데이터 로드
    console.log('DOM loaded'); // 디버깅을 위한 로그 추가
    loadTeams();
    loadPrizes();
}); 