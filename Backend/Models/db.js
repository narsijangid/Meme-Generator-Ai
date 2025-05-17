const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_CONN;

mongoose.connect('mongodb+srv://narsijangid01:12345678nj@cluster0.x8tzdfv.mongodb.net/auth-db?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('MongoDB Connected...');
    }).catch((err) => {
        console.log('MongoDB Connection Error: ', err);
    })

