import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // Limitar a 5 solicitudes por ventana
  message: {
    error: "Demasiadas solicitudes, por favor intenta nuevamente más tarde",
  },
});
