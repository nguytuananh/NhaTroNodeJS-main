var express = require("express");
var router = express.Router();
const jwt = require('jsonwebtoken');
var UserService = require("../services/userService");

const userService = new UserService();
const secretKey = 'your-secret-key';

router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ status: false, message: "Dữ liệu gửi lên trống" });
    }
    const { username, password, email } = req.body;
    const user = { username, password, email };

    try {
        await userService.registerUser(user);
        res.redirect('/user/login');
    } catch (err) {
        res.render('register', { error: 'Lỗi khi đăng ký: ' + err.message });
    }
});

router.post("/login", async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.render('login', { error: 'Vui lòng nhập đầy đủ thông tin' });
    }
    const { username, password } = req.body;

    try {
        const user = await userService.findUserByUsername(username);
        if (!user || user.password !== password) {
            return res.render('login', { error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role || 'user'},
            secretKey,
            { expiresIn: '1h' }
        );
        res.cookie('token', token, { httpOnly: true }); 
        res.cookie('username', user.username, { httpOnly: false }); 
        res.cookie('role', user.role || 'user', { httpOnly: false });
        res.redirect('http://localhost:3000'); 
    } catch (err) {
        res.status(500).json({ status: false, message: 'Lỗi khi đăng nhập: ' + err.message });
    }
});

router.get("/logout", (req, res) => {
    res.clearCookie('token');
    res.clearCookie('username');
    res.clearCookie('role');
    res.redirect('/');
});

module.exports = router;