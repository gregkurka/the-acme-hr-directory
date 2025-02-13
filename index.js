const pg = require("pg");
const express = require("express");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const client = new pg.Client();

app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/api/departments", async (req, res, next) => {
  try {
    const SQL = `SELECT * FROM departments;`;
    const { rows } = await client.query(SQL);
    console.log(rows);
    res.send(rows);
  } catch (err) {
    next(err);
  }
});

app.get("/api/employees", async (req, res, next) => {
  try {
    const SQL = `SELECT * FROM employees;`;
    const { rows } = await client.query(SQL);
    console.log(rows);
    res.send(rows);
  } catch (err) {
    next(err);
  }
});
app.post("/api/employees", async (req, res, next) => {
  try {
    console.log(req.body);
    const SQL = `INSERT INTO employees(name,job_title,department_id) VALUES($1, $2, $3) RETURNING *;`;
    const { rows } = await client.query(SQL, [
      req.body.name,
      req.body.job_title,
      req.body.department_id,
    ]);
    console.log(rows);
    res.send({ message: "created successfully", result: rows[0] });
  } catch (err) {
    next(err);
  }
});

app.put("/api/employees/:id", async (req, res, next) => {
  try {
    console.log(req.body);
    console.log(req.params);
    const SQL = `UPDATE employees SET name=$1, job_title=$2 WHERE id=$3 RETURNING *;`;
    const { rows } = await client.query(SQL, [
      req.body.name,
      req.body.job_title,
      req.params.id,
    ]);
    console.log(rows);
    res.send({ message: "successfully updated", result: rows[0] });
  } catch (err) {
    next(err);
  }
});

app.delete("/api/employees/:id", async (req, res, next) => {
  try {
    const SQL = `DELETE FROM employees WHERE id=$1`;
    await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

const init = async () => {
  try {
    await client.connect();
    let SQL = `
    DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS departments;
    CREATE TABLE departments(id SERIAL PRIMARY KEY,
         name VARCHAR(127));
    CREATE TABLE employees(id SERIAL PRIMARY KEY,
        name VARCHAR(127),
        job_title VARCHAR(255) NOT NULL,
        department_id INTEGER REFERENCES departments(id) NOT NULL);
    `;
    console.log("CREATING TABLES...");
    await client.query(SQL);
    console.log("COMPLETE!");
    SQL = `
    INSERT INTO departments(name) VALUES('Macrodata Refinement');
    INSERT INTO departments(name) VALUES('Optics & Design');
    INSERT INTO departments(name) VALUES('Administration');
    INSERT INTO employees(name,job_title,department_id) VALUES('Dougie Cool', 'Tech Lead',
    (SELECT id FROM departments WHERE name='Macrodata Refinement'));
    INSERT INTO employees(name,job_title,department_id) VALUES('Veronica Hildeberry', 'Calculations Specialist', 
    (SELECT id FROM departments WHERE name='Macrodata Refinement'));
    INSERT INTO employees(name,job_title,department_id) VALUES('Ferris Andokopin', 'Lens Design', 
    (SELECT id FROM departments WHERE name='Optics & Design'));
    INSERT INTO employees(name,job_title,department_id) VALUES('Charlize Bopelkinson', 'Laser Management',
    (SELECT id FROM departments WHERE name='Optics & Design'));
    INSERT INTO employees(name,job_title,department_id) VALUES('Chelsea Rubenbucks', 'Chief Project Lead', 
    (SELECT id FROM departments WHERE name='Administration'));`;
    console.log("Seeding data...");
    await client.query(SQL);
    console.log("seeded!");

    app.listen(PORT, () => {
      console.log(`Server alive on PORT ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

init();
