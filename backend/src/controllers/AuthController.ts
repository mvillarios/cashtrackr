import { Request, Response } from "express";
import { User } from "../models/User";
import { hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";

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
}
