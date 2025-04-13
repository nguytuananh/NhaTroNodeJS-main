const { ObjectId } = require('mongodb');
var config = require('./../../config/setting.json');
class RoomService {
    databaseConnection = require('./../database/database');
    room = require('./../model/room'); // Sử dụng model Room
    client;
    roomDatabase;
    roomCollection;
    
    constructor() {
        this.client = this.databaseConnection.getMongoClient();
        this.roomDatabase = this.client.db(config.mongodb.database);
        this.roomCollection = this.roomDatabase.collection("room"); // Collection tên là "room"
    }
    
    async deleteRoom(id) {
        return await this.roomCollection.deleteOne({ "_id": new ObjectId(id) });
    }
    
    async updateRoom(room) {
        return await this.roomCollection.updateOne({
            "_id": new ObjectId(room._id)
        }, { $set: room });
    }

    async insertRoom(room) {
        return await this.roomCollection.insertOne(room); // Sửa "insertone" thành "insertOne"
    }

    async getRoom(id) {
        return await this.roomCollection.findOne({
            "_id": new ObjectId(id)
        }, {});
    }

    async getRoomList() {
        const cursor = await this.roomCollection.find({}, {}).skip(0).limit(100);
        return await cursor.toArray();
    }
}

module.exports = RoomService;