const inquirer = require(`inquirer`);

const { Pool } = require('pg');

const pool = new Pool(
    {
      user: 'postgres',
      password: '',
      host: 'localhost',
      database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
  )

pool.connect();

function init() {
    console.log('');
    console.log('Employee Manager Application by Isaac Fallon');
    console.log('--------------------------------------------');
    mainSelectionPrompt();
}

// Start the application by calling the 'init()' function
init();


function mainSelectionPrompt() {
    inquirer.prompt([
        {
            type: `list`,
            message: `What would you like to do?`,
            name: `mainSelection`,
            choices: [
                `View all departments`, 
                `View all roles`, 
                `View all employees`,
                `Add a department`,
                `Add a role`,
                `Add an employee`,
                `Update an employee role`,
                `Exit application`
            ]
        }
    ]).then((response) => {
        if (response.mainSelection === `View all departments`) {
            viewDepartments();
        } else if (response.mainSelection === `View all roles`) {
            viewRoles();
        } else if (response.mainSelection === `View all employees`) {
            viewEmployees();
        } else {
            process.exit();
        }
    })
}

function viewDepartments() {
    pool.query(
        `SELECT * 
            FROM department;`
    , (err, result) => {
        if (err) {
            console.error('Error fetching departments:', err);
            }
            console.table(result.rows);
            mainSelectionPrompt();
    })
}

function viewRoles() {
    pool.query(
        `SELECT title, role.id, department.name, salary 
            FROM role 
                JOIN department 
                    ON role.department_id = department.id;`
    , (err, result) => {
        if (err) {
            console.error('Error fetching roles:', err);
            }
            console.table(result.rows);
            mainSelectionPrompt();
    })
}

function viewEmployees() {
    pool.query(
        `SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager 
            FROM employee e 
                INNER JOIN role 
                    ON e.role_id = role.id 
                INNER JOIN department 
                    ON role.department_id = department.id 
                LEFT JOIN employee m 
                    ON e.manager_id = m.id;`
    , (err, result) => {
        if (err) {
            console.error('Error fetching employees:', err);
            }
            console.table(result.rows);
            mainSelectionPrompt();
    })
}