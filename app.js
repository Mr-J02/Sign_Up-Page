const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // to parse JSON data

// Serve the static HTML file
app.use(express.static('public'));

// File path to store user data
const usersFilePath = path.join(__dirname, 'data', 'users.json');

// Helper function to read users from the JSON file
const readUsersFromFile = () => {
  if (fs.existsSync(usersFilePath)) {
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    return usersData ? JSON.parse(usersData) : [];
  }
  return [];
};

// Helper function to write users to the JSON file
const writeUsersToFile = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
};

// POST route to handle user registration
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send('All fields are required.');
  }

  const users = readUsersFromFile();

  // Check if user already exists
  if (users.find(user => user.email === email)) {
    return res.status(400).send('User with this email already exists.');
  }

  // Add the new user
  users.push({ name, email, password });

  // Write updated users array back to the JSON file
  writeUsersToFile(users);

  res.send('User registered successfully!');
});

// PUT route to handle user updates
app.put('/register/:email', (req, res) => {
  const { email } = req.params;
  const { name, password } = req.body;

  if (!name && !password) {
    return res.status(400).send('At least one field (name or password) is required to update.');
  }

  const users = readUsersFromFile();

  // Find the user by email
  const userIndex = users.findIndex(user => user.email === email);
  if (userIndex === -1) {
    return res.status(404).send('User not found.');
  }

  // Update user data
  if (name) users[userIndex].name = name;
  if (password) users[userIndex].password = password;

  // Write updated users array back to the JSON file
  writeUsersToFile(users);

  res.send('User updated successfully!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
