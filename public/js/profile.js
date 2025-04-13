const editBtn = document.getElementById('edit-btn');
const updateBtn = document.getElementById('update-btn');
const cancelBtn = document.getElementById('cancel-btn');
const inputs = document.querySelectorAll('.profile-form input');

// Lấy giá trị ban đầu từ các input sau khi trang tải
const originalValues = {
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
};

console.log('Original values:', originalValues); // Debug giá trị ban đầu

editBtn.addEventListener('click', () => {
    inputs.forEach(input => input.disabled = false);
    editBtn.style.display = 'none';
    updateBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
});

cancelBtn.addEventListener('click', () => {
    // Khôi phục giá trị ban đầu
    document.getElementById('username').value = originalValues.username;
    document.getElementById('email').value = originalValues.email;
    document.getElementById('password').value = originalValues.password;

    // Vô hiệu hóa input và cập nhật giao diện
    inputs.forEach(input => input.disabled = true);
    editBtn.style.display = 'inline-block';
    updateBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
});