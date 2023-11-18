/*
Aplicação Lista de Recados
● Vamos criar um back-end que contém
as seguintes funcionalidades:
○ Criação de conta
○ Login
○ CRUD* de recados

● Dados de um usuário:
○ Identificador
○ Nome
○ E-mail
○ Senha

● Dados de um recado:
○ Identificador
○ Título
○ Descrição

Regras
● Não pode ter mais de um usuário com o mesmo e-mail.
● O login deve ser feito com e-mail e senha.
● Cada recado deve ser de um único usuário.


{
    "name": "g",
    "email": "infoNewUser.emailfff",
    "password": 12345,
    "notes": [],
    "title": "hhhh",
    "description": "infoNewNote.description",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImciLCJpYXQiOjE3MDAzNDUwNzYsImV4cCI6MTcwMDM1NTA3Nn0.tdpj9DbtlRhIa9PXc9LtgCv1fuxEYdBqw5901amr5VY"
}

*/

//fazer ajustes recados..
//fazer o crud apenas para os recados.
//criar rota post para login.

import { randomUUID } from "node:crypto";
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

let counter = 0;

//Users

const users = [];

const verification = function (req, res, next) {
  const body = req.body;
  const emailExist = users.find((user) => user.email === body.email);

  if (emailExist) {
    return res.status(401).json("This email alredy exist!");
  }

  next();
};

const verificaJWT = function (request, response, next) {
  const body = request.body;

  jwt.verify(body.accessToken, "growdev", (err, user) => {
    if (err) {
      return response.status(403).json(err);
    }

    request.user = user;

    next();
  });
};

app.post("/users/login", (request, response) => {
  const infoRequest = request.body;

  const existEmail = users.find(
    (usuario) => usuario.email === infoRequest.email
  );

  if (existEmail === undefined) {
    return response.status(400).json("verifique suas credenciais!");
  }

  const existeSenha = users.find(
    (usuario) => usuario.password === infoRequest.password
  );

  if (existeSenha === undefined) {
    return response.status(400).json("verifique suas credenciais!");
  }

  const accessToken = jwt.sign({ username: existEmail.name }, "growdev", {
    expiresIn: "10000s",
  });

  return response.status(201).json({
    accessToken,
  });
});

app.get("/users", (req, res) => {
  return res.json(users);
});

app.get("/users/:id", (req, res) => {
  const id = req.params.id;
  const user = users.find((user) => user.id === id);

  if (!user) {
    return res.status(404).json("User with specified ID not found!");
  }

  return res.status(200).json(user);
});

app.post("/newuser", verification, (req, res) => {
  const infoNewUser = req.body;

  const newuser = {
    id: randomUUID(),
    name: infoNewUser.name,
    email: infoNewUser.email,
    password: infoNewUser.password,
    notes: infoNewUser.notes,
  };

  users.push(newuser);
  return res.status(201).json(newuser);
});

app.put("/updateuser/:id", (req, res) => {
  const infoUpdateUser = req.body;
  const params = req.params;

  const userToUpdate = users.findIndex((user) => user.id === params.id);

  users[userToUpdate].name = infoUpdateUser.name;
  users[userToUpdate].password = infoUpdateUser.password;

  return res.status(201).json(users[userToUpdate]);
});

app.delete("/deleteuser/:id", (req, res) => {
  const params = req.params;
  const userToDelete = users.findIndex((user) => user.id === params.id);

  users.splice(userToDelete, 1);
  return res.status(201).json("User deleted successfully");
});

//Notes

app.get("/notes/:id", (req, res) => {
  const id = req.params.id;
  const user = users.find((user) => user.id === id);

  if (!user) {
    return res.status(404).json("User not found!");
  }

  const notes = user.notes;
  if (!notes) {
    return res.status(404).json("Notes for specified user not found!");
  }

  return res.status(200).json(notes);
});

app.post("/newnote/:id", verificaJWT, (req, res) => {
  const id = req.params.id;
  const user = users.find((user) => user.id === id);
  const infoNewNote = req.body;

  if (!user) {
    return res.status(404).json("User not found!");
  }

  const newnote = {
    id: counter++,
    title: infoNewNote.title,
    description: infoNewNote.description,
  };

  user.notes.push(newnote);
  return res.status(201).json(newnote);
});

app.put("/updatenote/:userID/:noteID", (req, res) => {
  const infoUpdateNote = req.body;
  const { userID, noteID } = req.params;

  const user = users.find((user) => user.id === userID);
  if (!user) {
    return res.status(404).json("User not found!");
  }

  const noteIndex = user.notes.findIndex((note) => note.id - 0 === noteID - 0);
  if (noteIndex === -1) {
    return res.status(404).json("Note not found!");
  }

  user.notes[noteIndex] = {
    id: noteID - 0,
    title: infoUpdateNote.title,
    description: infoUpdateNote.description,
  };

  return res.status(200).json(user.notes[noteIndex]);
});

app.delete("/deletenote/:userID/:noteID", (req, res) => {
  const { userID, noteID } = req.params;

  const user = users.find((user) => user.id === userID);
  if (!user) {
    return res.status(404).json("User not found!");
  }

  const noteIndex = user.notes.findIndex((note) => note.id - 0 === noteID - 0);
  if (noteIndex === -1) {
    return res.status(404).json("Note not found!");
  }

  user.notes.splice(noteIndex, 1);
  return res.status(201).json("Note deleted successfully");
});

app.listen(8080, () => console.log("Server Started"));
