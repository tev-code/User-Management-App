const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = 3000; // Change to desired port number

app.use(bodyParser.json());

// Database connection URL
const dbURL = 'mongodb://localhost:27017'; // Replace with URL provided when cluster is created
const dbName = 'user_management';
let db;

MongoClient.connect(dbURL, { useUnifiedTopology: true}, (err, client) => {
    if(err) {
        console.error('Error connecting to the database:', err);
        return;
    }
        console.log('Connected successfully to the database');
        db = client.db(dbName);
});

app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
});

// Defining Routes and Implementing CRUD Operations:

// Create a new user
app.post('/users', (req, res) => {
    const userData = req.body;
        db.collection('users').insertOne(userData, (err, result) => {
        if (err) {
        console.error('Error creating a new user:', err);
        res.status(500).json({ error: 'Failed to create a new user'});
        } else {
        res.status(201).json(result.ops[0]);
    }
  });
});

// Get all users
app.get('/users', (req, res) => {
    db.collection('users')
    .find({})
    .toArray((err, users) => {
    if (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users'});
    } else {
        res.json(users);
    }
    });
});

// Get a single user byy ID
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
        db.collection('users').findOne({ _id: new mongodb.ObjectID(userId) }, (err, user) => {
        if (err) {
            console.error('Error fetching user by ID:', err);
            res.status(500).json({ error: 'Failed to fetch user' })
        } else if (!user) {
            res.status(404).json({ error: 'User not found'});
        } else {
            res.json(user)
     }
    });
});

// Update a user by ID
app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const updatedData = req.body;
        db.collection('users').updateOne(
        { _id: new mongodb.ObbjectID(userId) },
        { $set: updatedData },
        (err, result) => {
            if (err) {
            console.error('Error updating user:', err);
            res.status(500).json({ error: 'Failed to update user '});
        } else if (result.modifiedCount === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json({ message: 'User updated successfully'});
        }
    }
    );
});

// Delete a user by ID
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    db.collection('users').deleteOne({ _id: new mongodb.ObjectID(userId) }, (err, result) => {
    if (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user'});
    } else if (result.deletedCount === 0) {
    res.status(404).json({ error: 'User not found' });
    } else {
     res.json({ message: 'UUser deleted successfully'})
    }
    });
});

