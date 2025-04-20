// 경품 목록 로드
function loadPrizes() {
    fetch('/api/prizes')
        .then(response => response.json())
        .then(prizes => {
            const tbody = document.getElementById('prize-table-body');
            tbody.innerHTML = '';
            
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
                        <button class="action-button" onclick="updatePrizeQuantity(${prize.id})">수정</button>
                    </td>
                    <td>
                        <button class="action-button delete-button" onclick="deletePrize(${prize.id})">삭제</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading prizes:', error);
        });
}

// 경품 추가
document.getElementById('add-prize-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        image_url: document.getElementById('image_url').value,
        total_quantity: parseInt(document.getElementById('quantity').value)
    };

    fetch('/api/prizes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('경품 추가 실패');
        }
        this.reset();
        loadPrizes();
    })
    .catch(error => {
        console.error('Error adding prize:', error);
        alert('경품 추가에 실패했습니다.');
    });
});

// 경품 수량 수정
function updatePrizeQuantity(prizeId) {
    const newQuantity = prompt('새로운 수량을 입력하세요:');
    if (newQuantity && !isNaN(newQuantity) && parseInt(newQuantity) > 0) {
        fetch(`/api/prizes/${prizeId}/quantity`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ total_quantity: parseInt(newQuantity) })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('수량 업데이트 실패');
            }
            loadPrizes();
        })
        .catch(error => {
            console.error('Error updating prize quantity:', error);
            alert('수량 업데이트에 실패했습니다.');
        });
    }
}

// 경품 삭제
function deletePrize(prizeId) {
    if (!confirm('정말로 이 경품을 삭제하시겠습니까?')) {
        return;
    }

    fetch(`/api/prizes/${prizeId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('경품 삭제 실패');
        }
        loadPrizes();
    })
    .catch(error => {
        console.error('Error deleting prize:', error);
        alert('경품 삭제에 실패했습니다.');
    });
}

// 페이지 로드 시 경품 목록 로드
document.addEventListener('DOMContentLoaded', loadPrizes); 