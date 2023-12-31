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

// Get a single user by ID
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

// Implement the frontend logic to interact with the backend server using the Fetch API
const userForm = document.getElementById('userForm');
const userList = document.getElementById('userList');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('submitbutton');

const apiUrl = 'http://localhost:3000/users';

// Function to display the list of users
function displayUsers(users) {
    userList.innerHTML = '';

    users.forEach(user => {
    const userDiv = document.createElement('div');
    userDiv.classList.add('user');
    userDiv.innerHTML = `
     <p><strong>Name:</strong> ${user.name}</p>
     <p><strong>Email:</strong> ${user.email}</p>
     <button onclick="editUser('${user._id}', '${user.name}', '${user.email}')">Edit</button>
     <button onclick="deleteUser('${user._id}')">Delete</button>
    `;
    userList.appendChild(userDiv);
    });
}

// Function to create/update a user
async function submitUser(event) {
 event.preventDefault();

 const name = nameInput.value;
 const email = emailInput.value;

 try {
    let response;

    if (submitButton.innerText === 'Create User') {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
    } else {
        const userId = submitButton.dataset.id;
        response = await fetch(`${apiUrl}/${userId}`, {
           method: 'PUT',
           headers: {
            'Content-Type': 'application/json'
           },
           body: JSON.stringify({ name, email}),
        });

        submitButton.innerText = 'Create User';
    }

    nameInput.value = '';
    emailInput.value = '';
    submitButton.dataset.id = '';

    getUsers();
 } catch (error) {
    console.error('Error creating/updating user:', error);
 }
}

// Function to delete user
async function deleteUser(userId) {
    try {
        await fetch(`${apiUrl}/${userId}`, { method: 'DELETE'});
        getUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

// Function to populate the form for editing a user
function editUser(userId, userName, userEmail) {
    nameInput.value = userName;
    emailInput.value = userEmail;
    submitButton.innerText = 'Update User';
    submitButton.dataset.id = userId;
}

// Event listeners
userForm.addEventListener('submit', submitUser);

// Fetch and display users when the page loads
getUsers();

