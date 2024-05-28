// This file is used to contain the logic for running the application. 

// We call our relevant dependencies: 'inquirer' and 'pg'.
const inquirer = require(`inquirer`);
const { Pool } = require('pg');

// Create a new instance of the destructured 'Pool' class we use to connect to our postgres account. 
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

// Init function to display a welcome message and call the 'mainSelectionPrompt()' function so the user sees all prompts. 
function init() {
    console.log('');
    console.log('Employee Manager Application by Isaac Fallon');
    console.log('--------------------------------------------');
    mainSelectionPrompt();
}

// Start the application by calling the 'init()' function
init();

// The function to contain the main menu selection when the user either starts the application or enters/views data and is brought back. 
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
                `Update an employee's role`,
                `Exit application`
            ]
        }
        // Depending on the user's choice, call that respective function (see the actual functions further below).
    ]).then((response) => {
        if (response.mainSelection === `View all departments`) {
            viewDepartments();
        } else if (response.mainSelection === `View all roles`) {
            viewRoles();
        } else if (response.mainSelection === `View all employees`) {
            viewEmployees();
        } else if (response.mainSelection === `Add a department`) {
            addDepartment(); 
        } else if (response.mainSelection === `Add a role`) {
            addRole();  
        } else if (response.mainSelection === `Add an employee`) {
            addEmployee();   
        } else if (response.mainSelection === `Update an employee's role`) {
            updateEmployee();   
        } else {
            process.exit();
        }
    })
}

// Function to view a list of all departments
function viewDepartments() {
    // SQL query to our connected 'pool' to select all from the 'department' table. 
    pool.query(
        `SELECT * 
            FROM department;`
    , (err, result) => {
        // If there is an error in the pool.query, log the error parameter in the callback function
        if (err) {
            console.error('Error fetching departments:', err);
            }
            // Otherwise console.table the resulting query rows and call the mainSelectionPrompt() function to return to the main menu. 
            console.table(result.rows);
            mainSelectionPrompt();
    })
}

// Function to view a list of all roles
function viewRoles() {
    // SQL query to our connected 'pool' to select all from the 'role' table and join the respective department based on its ID.  
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

// Function to view a list of all employees
function viewEmployees() {
    // SQL query to our connected 'pool' to select specific parts from the employee table (using 'e' as an alias), the role and department
    // that belongs to that particular employee based on its ID, and a manager name for that employee (using 'm' as an alias) based on its ID.
    pool.query(
        `SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager 
            FROM employee e
                INNER JOIN role 
                    ON e.role_id = role.id 
                INNER JOIN department 
                    ON role.department_id = department.id 
                LEFT JOIN employee m 
                    ON e.manager_id = m.id 
                    ORDER BY e.id;`
    , (err, result) => {
        if (err) {
            console.error('Error fetching employees:', err);
            }
            console.table(result.rows);
            mainSelectionPrompt();
    })
}

// Function to handle adding a new department to the department table in the 'employee_db' database
function addDepartment() {
    // Prompt the user for the department name
    inquirer.prompt([
        {
            type: `input`,
            message: `What is the name of the department?`,
            name: `newDepartmentName`,
        }
        // We capture the 'response' from the promise fulfillment (.then) and make an SQL query to our connected 'pool' 
        // to insert a new department as a row based on the user input.
    ]).then((response) => {
        pool.query(
            `INSERT INTO department(name) VALUES ('${response.newDepartmentName}')`
        , (err, result) => {
            if (err) {
                console.error('Error adding department', err);
                }
                console.log(`${response.newDepartmentName} successfully added as a new department.`);
                mainSelectionPrompt();
        })
    })
}

// Function to handle adding a new role to the role table in the 'employee_db' database
function addRole() {

    // First we create an array based on existing departments in the database to ensure we capture any newly created departments.
    // The SQL query to our connected 'pool' will grab all department names and put them into the array: 'department_names_array'.
    pool.query('SELECT ARRAY(SELECT name FROM department) AS department_names_array', (err, res) => {
        if (err) {
          console.error(err);
          return;
        }
    // We then initialise this array of department names to a variable we can use
    const departmentNamesArray = res.rows[0].department_names_array;

    // Prompt the user for the new role information. 
    inquirer.prompt([
        {
            type: `input`,
            message: `What is the name of the role?`,
            name: `newRoleName`,
        },
        {
            type: `input`,
            message: `What is the salary of the new role?`,
            name: `newRoleSalary`,
        },
        {
            type: `list`,
            message: `Which department does the role belong to?`,
            name: `newRoleDepartment`,
            // Pull the most up to date department list as selectable choices from the array of departments 'departmentNamesArray'
            choices: departmentNamesArray,
        },
    ]).then((response) => {
        // To actually identify the department chosen for our SQL query below, we initialise a variable as the 'index + 1' of whatever that department was. 
        // For example, if 'Development' is chosen, that has an index of 0, but then if we add 1, we get our ID value of 1. 
        let departmentID = departmentNamesArray.indexOf(response.newRoleDepartment) + 1;
        
        // We then make an SQL query to our connected 'pool' to insert a new role as a row based on the user input and calculated ID.
        pool.query(
            `INSERT INTO role(title, salary, department_id) VALUES ('${response.newRoleName}', '${response.newRoleSalary}', ${departmentID})`
        , (err, result) => {
            if (err) {
                console.error('Error adding role', err);
                }
                console.log(`${response.newRoleName} successfully added as a new role.`);
                mainSelectionPrompt();
        })
    })

    });
}
// Function to handle adding a new employee to the employee table in the 'employee_db' database
function addEmployee() {

    // Similar to in the addRole() function, we create arrays based on the existing roles and employees in the database. 
    pool.query('SELECT ARRAY(SELECT title FROM role) AS role_title_array', (err, res) => {
        if (err) {
          console.error(err);
          return;
        }
    const employeeRolesArray = res.rows[0].role_title_array;

    pool.query(`SELECT ARRAY(SELECT CONCAT(first_name, ' ', last_name) FROM employee) AS employee_list_array`, (err, res) => {
        if (err) {
          console.error(err);
          return;
        }
    const employeeListArray = res.rows[0].employee_list_array;

    // We then prompt the user for the new employee's information
    inquirer.prompt([
        {
            type: `input`,
            message: `What is the employee's first name?`,
            name: `newEmployeeFirstName`,
        },
        {
            type: `input`,
            message: `What is the employee's last name?`,
            name: `newEmployeeLastName`,
        },
        {
            type: `list`,
            message: `Which is the employee's role?`,
            name: `newEmployeeRole`,
            // The choices for the roles are set by the newly created 'employeeRolesArray'
            choices: employeeRolesArray,
        },
        {
            type: `list`,
            message: `Who is the employee's manager?`,
            name: `newEmployeeManager`,
            // The choices for the employees to choose as a manager are set by the newly created 'employeeListArray'
            choices: employeeListArray,
        },
    ]).then((response) => {

        // Similar to in the addRole() function, we initialise a variable as the 'index + 1' of whatever the chosen role and employee was. 
        // This way, we can actually identify the ID based on the user selection. 

        let roleID = employeeRolesArray.indexOf(response.newEmployeeRole) + 1;
        let employeeID = employeeListArray.indexOf(response.newEmployeeManager) + 1;
        
        // We then make an SQL query to our connected 'pool' to insert a new employee as a row based on the user input and calculated IDs for role and manager. 
        pool.query(
            `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ('${response.newEmployeeFirstName}', '${response.newEmployeeLastName}', ${roleID}, ${employeeID})`
        , (err, result) => {
            if (err) {
                console.error('Error adding employee', err);
                }
                console.log(`${response.newEmployeeFirstName} ${response.newEmployeeLastName} successfully added as a new employee.`);
                mainSelectionPrompt();
        })
    })

});

    });

}

// Function to handle updating an employee's role 'in the 'employee_db' database

function updateEmployee() {
    // The logic is functionally very similar to the addEmployee() function. 

    // Pull in the most up to date lists of employees and roles and assign them to variables which hold an array of choices to pull from when prompted. 
    pool.query(`SELECT ARRAY(SELECT CONCAT(first_name, ' ', last_name) FROM employee) AS employee_list_array`, (err, res) => {
        if (err) {
          console.error(err);
          return;
        }
    const employeeListArray = res.rows[0].employee_list_array;

    pool.query('SELECT ARRAY(SELECT title FROM role) AS role_title_array', (err, res) => {
        if (err) {
          console.error(err);
          return;
        }
    const employeeRolesArray = res.rows[0].role_title_array;

    inquirer.prompt([
        {
            type: `list`,
            message: `Which employee's role do you want to update?`,
            name: `employeeList`,
            choices: employeeListArray,
        },
        {
            type: `list`,
            message: `Which role do you want to assign to the selected employee?`,
            name: `roleList`,
            choices: employeeRolesArray,
        },

    ]).then((response) => {

        let employeeID = employeeListArray.indexOf(response.employeeList) + 1;
        let roleID = employeeRolesArray.indexOf(response.roleList) + 1;

        // The main difference is this SQL query. 
        // We update the employee by setting their roleID as the one chosen from the inquirer prompt where their ID is equal to that particular employee in the table row. 
        pool.query(
            `UPDATE employee SET role_id = ${roleID} WHERE id = ${employeeID};`
        , (err, result) => {
            if (err) {
                console.error(`Error updating employee's role`, err);
                }
                console.log(`Updated employee's role`);
                mainSelectionPrompt();
        })
    })
})
    })
}