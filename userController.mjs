

import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUserWithLog
} from "../models/userModel.mjs";

export async function handleCreateUser(body) {
  if (!body || typeof body.Correo !== "string" || typeof body.Nombre !== "string") {
    const error = new Error("Datos inválidos. Se requieren 'Correo' y 'Nombre' como cadenas.");
    error.statusCode = 400;
    throw error;
  }

  const newUser = await createUser({
    Correo: body.Correo,
    Nombre: body.Nombre
  });

  return newUser;
}

export async function handleGetAllUsers() {
  return await getAllUsers();
}

export async function handleGetUserById(idParam) {
  const idNumber = Number(idParam);

  if (!Number.isInteger(idNumber) || idNumber <= 0) {
    const error = new Error("El parámetro 'id' debe ser un entero positivo.");
    error.statusCode = 400; 
    throw error;
  }

  const user = await getUserById(idNumber);

  if (!user) {
    const error = new Error("Usuario no encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return user;
}

export async function handleUpdateUser(idParam, body) {
  const idNumber = Number(idParam);

  if (!Number.isInteger(idNumber) || idNumber <= 0) {
    const error = new Error("El parámetro 'id' debe ser un entero positivo.");
    error.statusCode = 400;
    throw error;
  }

  if (!body || typeof body.Correo !== "string" || typeof body.Nombre !== "string") {
    const error = new Error("Datos inválidos. Se requieren 'Correo' y 'Nombre' como cadenas.");
    error.statusCode = 400;
    throw error;
  }

  const updatedUser = await updateUser({
    id: idNumber,
    Correo: body.Correo,
    Nombre: body.Nombre
  });

  if (!updatedUser) {
    const error = new Error("Usuario no encontrado para actualizar.");
    error.statusCode = 404;
    throw error;
  }

  return updatedUser;
}

export async function handleDeleteUser(idParam) {
  const idNumber = Number(idParam);

  if (!Number.isInteger(idNumber) || idNumber <= 0) {
    const error = new Error("El parámetro 'id' debe ser un entero positivo.");
    error.statusCode = 400;
    throw error;
  }

  const result = await deleteUserWithLog(idNumber);

  if (!result) {
    const error = new Error("Usuario no encontrado para borrar.");
    error.statusCode = 404;
    throw error;
  }

  return result;
}
