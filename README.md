download this file and run below command
npm install
goto .env file change database details
DB_HOST=localhost   ///hostname
DB_USER=root     ///user name
DB_PASSWORD=######    ///password of mysql
DB_NAME=auth_system    ////data base name 
JWT_SECRET=your_secret_key

and run below sql query in mysql workbench

CREATE DATABASE auth_system;
USE auth_system;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

then run next command
node server.js
