import { Request, Response } from "express";
import { User } from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { check } from "express-validator";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // Verificar si el email ya existe en la base de datos
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      const error = new Error("El Usuario ya está registrado");
      return res.status(409).json({ error: error.message });
    }

    try {
      const user = new User(req.body);
      user.password = await hashPassword(password);
      user.token = generateToken();
      await user.save();

      await AuthEmail.sendConfirmationEmail({
        name: user.name,
        email: user.email,
        token: user.token,
      });
      res.status(201).json("Cuenta creada exitosamente");
    } catch (error) {
      //console.log(error);
      res.status(500).json({ errror: "Error al crear la cuenta" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    const { token } = req.body;

    const user = await User.findOne({ where: { token } });
    if (!user) {
      const error = new Error("Token no valido");
      return res.status(400).json({ error: error.message });
    }

    user.confirmed = true;
    user.token = null;
    await user.save();

    res.json({ message: "Cuenta confirmada exitosamente" });
  };

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("El Usuario no existe");
      return res.status(404).json({ error: error.message });
    }

    if (!user.confirmed) {
      const error = new Error("La cuenta no ha sido confirmada");
      return res.status(403).json({ error: error.message });
    }

    const isPasswordValid = await checkPassword(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Contraseña incorrecta");
      return res.status(401).json({ error: error.message });
    }

    const token = generateJWT(user.id);
    res.json(token);
  };
}
