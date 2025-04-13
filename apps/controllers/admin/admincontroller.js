var express = require("express");
var router = express.Router();
const jwt = require('jsonwebtoken');
const DatabaseConnection = require('../../database/database');
const { ObjectId } = require('mongodb');

const secretKey = 'your-secret-key';

function isAuthenticated(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/user/login');
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (err) {
        return res.redirect('/user/login');
    }
}

function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).send("Bạn không có quyền truy cập trang này");
    }
    next();
}

router.get("/dashboard", isAuthenticated, isAdmin, async (req, res) => {
    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const postsCollection = db.collection('posts');
        const usersCollection = db.collection('users');

        const totalPosts = await postsCollection.countDocuments();
        const totalUsers = await usersCollection.countDocuments();
        const recentPosts = await postsCollection.find().sort({ createdAt: -1 }).limit(5).toArray();

        res.render("admin/dashboard", { 
            totalPosts, 
            totalUsers, 
            recentPosts, 
            error: null,
            user: req.user 
        });
    } catch (err) {
        res.render("admin/dashboard", { 
            totalPosts: 0, 
            totalUsers: 0, 
            recentPosts: [], 
            error: 'Lỗi khi tải dashboard',
            user: req.user
        });
    } finally {
        await client.close();
    }
});

router.get("/posts", isAuthenticated, async (req, res) => {
    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const postsCollection = db.collection('posts');
        const usersCollection = db.collection('users');

        let posts;
        if (req.user.role === 'admin') {
            posts = await postsCollection.find().toArray();
        } else {
            posts = await postsCollection.find({ userId: req.user.id }).toArray();
        }

        for (let post of posts) {
            const user = await usersCollection.findOne({ _id: new ObjectId(post.userId) });
            post.username = user ? user.username : 'Không xác định';
        }

        res.render("admin/postmanager", { 
            posts, 
            error: null, 
            user: req.user
        });
    } catch (err) {
        res.render("admin/postmanager", { 
            posts: [], 
            error: 'Lỗi khi tải danh sách bài đăng', 
            user: req.user 
        });
    } finally {
        await client.close();
    }
});

router.get("/posts/edit/:id", isAuthenticated, async (req, res) => {
    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const postsCollection = db.collection('posts');
        const post = await postsCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!post || (req.user.role !== 'admin' && post.userId !== req.user.id)) {
            return res.status(403).send("Bạn không có quyền sửa bài đăng này");
        }
        res.render("editpost", { post, user: req.user, error: null });
    } catch (err) {
        res.render("admin/postmanager", { posts: [], error: 'Lỗi khi tải bài đăng', user: req.user });
    } finally {
        await client.close();
    }
});

router.post("/posts/edit/:id", isAuthenticated, async (req, res) => {
    const { title, location, price, area, description } = req.body;
    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const postsCollection = db.collection('posts');
        const post = await postsCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!post || (req.user.role !== 'admin' && post.userId !== req.user.id)) {
            return res.status(403).send("Bạn không có quyền sửa bài đăng này");
        }
        await postsCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { title, location, price: parseFloat(price), area: parseInt(area), description } }
        );
        res.redirect('/admin/posts');
    } catch (err) {
        res.render("editpost", { post: req.body, user: req.user, error: 'Lỗi khi cập nhật bài đăng' });
    } finally {
        await client.close();
    }
});

router.post("/posts/delete/:id", isAuthenticated, async (req, res) => {
    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const postsCollection = db.collection('posts');
        const post = await postsCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!post || (req.user.role !== 'admin' && post.userId !== req.user.id)) {
            return res.status(403).send("Bạn không có quyền xóa bài đăng này");
        }
        await postsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.redirect('/admin/posts');
    } catch (err) {
        res.render("admin/postmanager", { posts: [], error: 'Lỗi khi xóa bài đăng', user: req.user });
    } finally {
        await client.close();
    }
});

router.get("/users", isAuthenticated, isAdmin, async (req, res) => {
    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const collection = db.collection('users');
        const users = await collection.find().toArray();
        res.render("admin/usermanager", { 
            users, 
            error: null, 
            user: req.user 
        });
    } catch (err) {
        res.render("admin/usermanager", { 
            users: [], 
            error: 'Lỗi khi tải danh sách người dùng', 
            user: req.user 
        });
    } finally {
        await client.close();
    }
});

router.get("/users/edit/:id", isAuthenticated, isAdmin, async (req, res) => {
    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const usersCollection = db.collection('users');
        const userToEdit = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!userToEdit) return res.status(404).send("Không tìm thấy người dùng");
        res.render("edituser", { userToEdit, user: req.user, error: null });
    } catch (err) {
        res.render("admin/usermanager", { users: [], error: 'Lỗi khi tải người dùng', user: req.user });
    } finally {
        await client.close();
    }
});

router.post("/users/edit/:id", isAuthenticated, isAdmin, async (req, res) => {
    const { username, email, password, role } = req.body;
    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const usersCollection = db.collection('users');
        let updateData = { username, email, role };
        if (password) updateData.password = await bcrypt.hash(password, 10);
        await usersCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData }
        );
        res.redirect('/admin/users');
    } catch (err) {
        res.render("edituser", { userToEdit: req.body, user: req.user, error: 'Lỗi khi cập nhật người dùng' });
    } finally {
        await client.close();
    }
});

router.post("/users/delete/:id", isAuthenticated, isAdmin, async (req, res) => {
    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const usersCollection = db.collection('users');
        await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.redirect('/admin/users');
    } catch (err) {
        res.render("admin/usermanager", { users: [], error: 'Lỗi khi xóa người dùng', user: req.user });
    } finally {
        await client.close();
    }
});

router.get("/profile", isAuthenticated, async (req, res) => {
    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
        if (!user) {
            return res.status(404).send("Không tìm thấy thông tin người dùng");
        }

        res.render("admin/profile", { 
            userProfile: user, 
            user: req.user, 
            error: null, 
            success: null 
        });
    } catch (err) {
        res.render("admin/profile", { 
            userProfile: null, 
            user: req.user, 
            error: 'Lỗi khi tải thông tin profile', 
            success: null 
        });
    } finally {
        await client.close();
    }
});

router.post("/profile", isAuthenticated, async (req, res) => {
    const { username, email, password } = req.body;
    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const usersCollection = db.collection('users');

        let updateData = { username, email };
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(req.user.id) },
            { $set: updateData }
        );

        if (result.modifiedCount === 0) {
            throw new Error("Không có thay đổi nào được cập nhật");
        }

        const updatedUser = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
        res.render("admin/profile", { 
            userProfile: updatedUser, 
            user: req.user, 
            error: null, 
            success: 'Cập nhật thông tin thành công!' 
        });
    } catch (err) {
        res.render("admin/profile", { 
            userProfile: { username, email }, 
            user: req.user, 
            error: 'Lỗi khi cập nhật thông tin: ' + err.message, 
            success: null 
        });
    } finally {
        await client.close();
    }
});

module.exports = router;