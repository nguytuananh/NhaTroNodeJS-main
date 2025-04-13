const DatabaseConnection = require('../database/database');

class UserService {
    async registerUser(user) {
        const client = DatabaseConnection.getMongoClient();
        try {
            await client.connect();
            // console.log('Connected to MongoDB (register)');
            const db = client.db('nhatro_db');
            // console.log('Using database:', db.databaseName);
            const collection = db.collection('users');
            const newUser = { role: 'user', ...user };
            // console.log('Inserting user:', newUser);
            const result = await collection.insertOne(newUser);
            // console.log('User inserted with _id:', result.insertedId);

            // Truy vấn lại để kiểm tra
            const insertedUser = await collection.findOne({ _id: result.insertedId });
            // console.log('Inserted user from DB:', insertedUser);

            return result;
        } catch (error) {
            // console.error('Database error (register):', error);
            throw error;
        } finally {
            await client.close();
        }
    }

    async findUserByUsername(username) {
        const client = DatabaseConnection.getMongoClient();
        try {
            await client.connect();
            // console.log('Connected to MongoDB (login)');
            const db = client.db('nhatro_db');
            // console.log('Using database:', db.databaseName);
            const collection = db.collection('users');
            const user = await collection.findOne({ username: username });
            // console.log('User found in DB:', user);
            return user;
        } catch (error) {
            // console.error('Database error (login):', error);
            throw error;
        } finally {
            await client.close();
        }
    }
}

module.exports = UserService;