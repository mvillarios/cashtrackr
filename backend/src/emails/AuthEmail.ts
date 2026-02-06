import { transport } from "../config/nodemailer";

type EmailType = {
  name: string;
  email: string;
  token: string;
};

export class AuthEmail {
  static sendConfirmationEmail = async (user: EmailType) => {
    const email = await transport.sendMail({
      from: '"CashTrackr" <admin@cashtrackr.com>',
      to: user.email,
      subject: "CashTrackr - Confirma tu cuenta",
      html: `<p>Hola ${user.name}, haz creado tu cuenta en CashTrackr.</p>
      <p>Para confirmar tu cuenta, haz click en el siguiente enlace:</p>
      <a href="#">Confirmar Cuenta</a>
      <p>e ingresa el codigo: ${user.token}</p>
      `,
    });

    console.log("Email enviado: %s", email.messageId);
  };
}
