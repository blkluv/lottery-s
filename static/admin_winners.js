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

// 페이지 로드 시 당첨자 목록 로드
document.addEventListener('DOMContentLoaded', loadWinners); 