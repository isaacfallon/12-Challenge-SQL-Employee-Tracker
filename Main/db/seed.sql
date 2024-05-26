\c employee_db;

INSERT INTO department(name)
VALUES  ('Development'), -- 1
        ('Marketing'), -- 2
        ('Finance'), -- 3
        ('Legal'); -- 4

INSERT INTO role(title, salary, department_id)
VALUES  ('Web Developer', 80000, 1), -- 1
        ('UX Designer', 90000, 1), -- 2
        ('Technology Lead', 100000, 1), -- 3
        ('Social Media Manager', 70000, 2), -- 4
        ('Marketing Manager', 100000, 2), -- 5
        ('Accountant', 90000, 3), -- 6
        ('Finance Manager', 90000, 3), -- 7
        ('Legal Clerk', 70000, 4), -- 8
        ('Head of Legal', 100000, 4); -- 9

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES  ('Fardan', 'Dado', 1, 4),               -- 1
        ('Zeimur', 'Rhahlor', 1, 4),            -- 2
        ('Ralolm', 'Hazeash', 2, 4),            -- 3
        ('Mem', 'Fogscream', 3, NULL),          -- 4
        ('Gabref', 'Nuv', 4, 4),                -- 5
        ('Or', 'Grolaz', 5, 4),                 -- 6
        ('Vomanth', 'Stagmantle', 6, 10),       -- 7
        ('Sindat', 'Triviro', 7, 10),                -- 8
        ('Deja', 'Mokrut', 8, 10),              --9
        ('Jetvas', 'Vrivulzi', 9, NULL);        --10