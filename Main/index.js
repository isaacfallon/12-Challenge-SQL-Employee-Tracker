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
                `Update an employee's role`,
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

// Function to handle adding a new department to the employee_db
function addDepartment() {
    inquirer.prompt([
        {
            type: `input`,
            message: `What is the name of the department?`,
            name: `newDepartmentName`,
        }
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

function addRole() {

    pool.query('SELECT ARRAY(SELECT name FROM department) AS department_names_array', (err, res) => {
        if (err) {
          console.error(err);
          return;
        }
      
    const departmentNamesArray = res.rows[0].department_names_array;

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
            choices: departmentNamesArray,
        },
    ]).then((response) => {
        let departmentID = departmentNamesArray.indexOf(response.newRoleDepartment) + 1;
        
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

function addEmployee() {

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
            choices: employeeRolesArray,
        },
        {
            type: `list`,
            message: `Who is the employee's manager?`,
            name: `newEmployeeManager`,
            choices: employeeListArray,
        },
    ]).then((response) => {
        let roleID = employeeRolesArray.indexOf(response.newEmployeeRole) + 1;

        let employeeID = employeeListArray.indexOf(response.newEmployeeManager) + 1;
        
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

function updateEmployee() {

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

