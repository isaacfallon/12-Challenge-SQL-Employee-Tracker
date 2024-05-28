-- Creating a new database called 'employee_db' 
DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

-- Selecting the database: 'employee_db' for use
\c employee_db;

-- Creating tables for 'department', 'role' and 'employee' with their own data fields.
CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL NOT NULL,
    -- The 'department_id' property references the 'id' from the table 'department' to link the two tables.
    department_id INTEGER NOT NULL,
    FOREIGN KEY (department_id)
    REFERENCES department(id)
);

CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    -- The 'department_id' property references the 'id' from the table 'role'.
    role_id INTEGER NOT NULL,
    FOREIGN KEY (role_id)
    REFERENCES role(id),
    -- The 'manager_id' property references the 'id' from it's own table, 'employee'.
    manager_id INTEGER,
    FOREIGN KEY (manager_id)
    REFERENCES employee(id)
);