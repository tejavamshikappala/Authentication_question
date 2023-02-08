const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
let db = null;
app.use(express.json());
const path = require("path");
const filepath = path.join(__dirname, "userData.db");
const Initializer = async () => {
  try {
    db = await open({
      filename: filepath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (e) {
    process.exit(1);
    console.log("error found");
  }
};
Initializer();

///Post
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const GettingQuery = `SELECT * FROM user WHERE username='${username}'`;
  const hashedPassword = await bcrypt.hash(password, 10);
  const dbUser = await db.get(GettingQuery);
  console.log(password);
  if (dbUser === undefined) {
    if (password.length >= 5) {
      const inserting = `INSERT INTO user (username,name,password,gender,location)
       VALUES ("${username}",
       "${name}",
       "${hashedPassword}",
       "${gender}",
       "${location}");`;
      await db.run(inserting);
      response.status(200);
      response.send("User created successfully");
      console.log("Executed");
    } else {
      response.status(400);
      response.send("Password is too short");
    }

    // const inserting = `INSERT INTO user (username,name,password,gender,location)
    //    VALUES ("${username}",
    //     "${name}",
    //     "${hashedPassword}",
    //   "${gender}",
    // "${location}");`;
    //   await db.run(inserting);
    // response.status(200);
    // response.send("User created successfully");
    // console.log("Executed");
  } else {
    response.status(400);
    response.send("User already exists");
  }

  // if (password.length < 5) {
  //  response.status(400);
  //  response.send("Password is too short");
  // } else {
  //  response.status(400);
  //  response.send("User already exists");
  // }
});
///login
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const gettingQuery = `SELECT * FROM user WHERE username="${username}";`;
  const dbUser = await db.get(gettingQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const verifiedPassword = await bcrypt.compare(password, dbUser.password);
    if (verifiedPassword === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

////change password
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const forQuery = `SELECT * FROM user WHERE username="${username}";`;
  const dbUser = await db.get(forQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("User not registered");
  } else {
    const validPassword = await bcrypt.compare(oldPassword, dbUser.password);
    if (validPassword) {
      const lengthPassword = newPassword.length;
      if (lengthPassword < 5) {
        response.status(400);
        response.send("Password is too short");
      } else {
        const validPassword2 = await bcrypt.hash(newPassword, 10);
        const updateQuery = `UPDATE user SET password="${validPassword2}"
                WHERE username="${username}"
                ;`;
        await db.run(updateQuery);
        response.send("Password updated");
      }
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  }
});

module.exports = app;
