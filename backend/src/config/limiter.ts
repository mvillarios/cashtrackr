import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: process.env.NODE_ENV === "production" ? 5 : 100, // Limitar a 5 solicitudes por ventana en producción
  message: {
    error: "Demasiadas solicitudes, por favor intenta nuevamente más tarde",
  },
});
