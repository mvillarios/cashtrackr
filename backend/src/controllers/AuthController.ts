import { Request, Response } from "express";
import { User } from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
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
      const user = await User.create(req.body);
      user.password = await hashPassword(password);
      const token = generateToken();
      user.token = token;

      if (process.env.NODE_ENV !== "production") {
        globalThis.cashTrackrConfirmationToken = token;
      }

      await user.save();

      await AuthEmail.sendConfirmationEmail({
        name: user.name,
        email: user.email,
        token: user.token,
      });
      res.status(201).json("Cuenta creada exitosamente");
    } catch (error) {
      //console.log(error);
      res.status(500).json({ error: "Error al crear la cuenta" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    const { token } = req.body;

    const user = await User.findOne({ where: { token } });
    if (!user) {
      const error = new Error("Token no válido");
      return res.status(401).json({ error: error.message });
    }

    user.confirmed = true;
    user.token = null;
    await user.save();

    res.json("Cuenta confirmada exitosamente");
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

  static forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("El Usuario no existe");
      return res.status(404).json({ error: error.message });
    }

    user.token = generateToken();
    await user.save();

    await AuthEmail.sendPasswordResetToken({
      name: user.name,
      email: user.email,
      token: user.token,
    });

    res.json("Email de restablecimiento enviado exitosamente");
  };

  static validateToken = async (req: Request, res: Response) => {
    const { token } = req.body;

    const tokenExists = await User.findOne({ where: { token } });
    if (!tokenExists) {
      const error = new Error("Token no valido");
      return res.status(404).json({ error: error.message });
    }

    res.json("Token válido");
  };

  static resetPasswordWithToken = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ where: { token } });
    if (!user) {
      const error = new Error("Token no valido");
      return res.status(404).json({ error: error.message });
    }

    // Actualizar la contraseña del usuario
    user.password = await hashPassword(password);
    user.token = null;

    await user.save();

    res.json("Contraseña restablecida exitosamente");
  };

  static user = async (req: Request, res: Response) => {
    res.json(req.user);
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;
    const { id } = req.user;

    const user = await User.findByPk(id);

    const isPasswordCorrect = await checkPassword(
      current_password,
      user.password,
    );

    if (!isPasswordCorrect) {
      const error = new Error("La contraseña actual es incorrecta");
      return res.status(401).json({ error: error.message });
    }

    user.password = await hashPassword(password);
    await user.save();

    res.json("Contraseña actualizada exitosamente");
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const { id } = req.user;

    const user = await User.findByPk(id);

    const isPasswordCorrect = await checkPassword(password, user.password);

    if (!isPasswordCorrect) {
      const error = new Error("La contraseña es incorrecta");
      return res.status(401).json({ error: error.message });
    }

    res.json("Contraseña correcta");
  };
}
