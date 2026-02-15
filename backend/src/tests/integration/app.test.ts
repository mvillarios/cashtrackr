import request from "supertest";
import server from "../../server";
import { AuthController } from "../../controllers/AuthController";
import { User } from "../../models/User";
import * as authUtils from "../../utils/auth";
import * as jwtUtils from "../../utils/jwt";

describe("Authentication - Create Account", () => {
  it("should display validation errors when form is empty", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({});

    const createAccountMock = jest.spyOn(AuthController, "createAccount");

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(3);

    expect(createAccountMock).toHaveBeenCalledTimes(0);
  });

  it("should return 400 when email is invalid", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
      });

    const createAccountMock = jest.spyOn(AuthController, "createAccount");

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);

    expect(response.body.errors[0].msg).toBe("El email no es válido");

    expect(createAccountMock).toHaveBeenCalledTimes(0);
  });

  it("should return 400 when password is less than 8 characters", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({
        name: "John Doe",
        email: "correo@correo.com",
        password: "short",
      });

    const createAccountMock = jest.spyOn(AuthController, "createAccount");

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);

    expect(response.body.errors[0].msg).toBe(
      "La contraseña debe tener al menos 8 caracteres",
    );

    expect(createAccountMock).toHaveBeenCalledTimes(0);
  });

  it("should register a new user successfully", async () => {
    const userData = {
      name: "John Doe",
      email: "test@test.com",
      password: "password",
    };

    const response = await request(server)
      .post("/api/auth/create-account")
      .send(userData);

    expect(response.statusCode).toBe(201);

    expect(response.body).not.toHaveProperty("errors");
    expect(response.body).toBe("Cuenta creada exitosamente");
  });

  it("should return 409 when email already exists", async () => {
    const userData = {
      name: "John Doe",
      email: "test@test.com",
      password: "password",
    };

    const response = await request(server)
      .post("/api/auth/create-account")
      .send(userData);

    expect(response.statusCode).toBe(409);
    expect(response.body).not.toHaveProperty("errors");
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("El Usuario ya está registrado");
  });
});

describe("Authentication - Account Confirmation", () => {
  it("should display error if token is empty or token is not valid", async () => {
    const response = await request(server)
      .post("/api/auth/confirm-account")
      .send({
        token: "not_valid",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors[0].msg).toBe("Token no válido");
  });

  it("should display error if token doesnt exist", async () => {
    const response = await request(server)
      .post("/api/auth/confirm-account")
      .send({
        token: "123456",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Token no válido");
  });

  it("should confirm account successfully", async () => {
    const token = globalThis.cashTrackrConfirmationToken;
    const response = await request(server)
      .post("/api/auth/confirm-account")
      .send({
        token,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual("Cuenta confirmada exitosamente");
  });
});

describe("Authentication - Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display validation errors when form is empty", async () => {
    const response = await request(server).post("/api/auth/login").send({});

    const loginMock = jest.spyOn(AuthController, "login");

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(2);

    expect(loginMock).not.toHaveBeenCalled();
  });

  it("should return 400 when email is invalid", async () => {
    const response = await request(server).post("/api/auth/login").send({
      email: "invalid-email",
      password: "password123",
    });

    const loginMock = jest.spyOn(AuthController, "login");

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("El email no es válido");

    expect(loginMock).not.toHaveBeenCalled();
  });

  it("should return 404 when user is not found", async () => {
    const response = await request(server).post("/api/auth/login").send({
      email: "nonexistent@test.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("El Usuario no existe");
  });

  it("should return 403 when account is not confirmed", async () => {
    (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({
      id: 1,
      email: "notconfirmed@test.com",
      password: "hashedpassword",
      confirmed: false,
    });

    const response = await request(server).post("/api/auth/login").send({
      email: "notconfirmed@test.com",
      password: "hashedpassword",
    });

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("La cuenta no ha sido confirmada");
  });

  it("should return 403 when account is not confirmed, version with real endpoint", async () => {
    const userData = {
      name: "Not Confirmed",
      email: "notconfirmed@test.com",
      password: "hashedpassword",
      confirmed: false,
    };

    await request(server).post("/api/auth/create-account").send(userData);

    const response = await request(server).post("/api/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("La cuenta no ha sido confirmada");
  });

  it("should return 401 when password is incorrect", async () => {
    const findOne = (
      jest.spyOn(User, "findOne") as jest.Mock
    ).mockResolvedValue({
      id: 1,
      email: "user@test.com",
      password: "hashedpassword",
      confirmed: true,
    });

    const checkPassword = (
      jest.spyOn(authUtils, "checkPassword") as jest.Mock
    ).mockResolvedValue(false);

    const response = await request(server).post("/api/auth/login").send({
      email: "user@test.com",
      password: "wrongpassword",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Contraseña incorrecta");

    expect(findOne).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledTimes(1);
  });

  it("should return a JWT token when login is successful", async () => {
    const findOne = (
      jest.spyOn(User, "findOne") as jest.Mock
    ).mockResolvedValue({
      id: 1,
      confirmed: true,
      password: "hashedpassword",
    });

    const checkPassword = (
      jest.spyOn(authUtils, "checkPassword") as jest.Mock
    ).mockResolvedValue(true);

    const generateJWT = jest
      .spyOn(jwtUtils, "generateJWT")
      .mockReturnValue("jwt_token");

    const response = await request(server).post("/api/auth/login").send({
      email: "user@test.com",
      password: "correctpassword",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("jwt_token");

    expect(findOne).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledWith(
      "correctpassword",
      "hashedpassword",
    );
    expect(generateJWT).toHaveBeenCalledTimes(1);
    expect(generateJWT).toHaveBeenCalledWith(1);
  });
});

let jwt: string;
async function authenticateUser() {
  const response = await request(server).post("/api/auth/login").send({
    email: "test@test.com",
    password: "password",
  });
  jwt = response.body;

  expect(response.statusCode).toBe(200);
}

describe("GET /api/budgets", () => {
  beforeAll(() => {
    jest.restoreAllMocks(); // Restaura las funciones de los jest.spyOn a su implementación original
  });

  beforeAll(async () => {
    await authenticateUser();
  });

  it("should reject unauthenticated access to budgets without a jwt token", async () => {
    const response = await request(server).get("/api/budgets");

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("No autorizado");
  });

  it("should reject unauthenticated access to budgets with an invalid jwt token", async () => {
    const response = await request(server)
      .get("/api/budgets")
      .auth("invalid_jwt_token", { type: "bearer" });

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Error al obtener el usuario");
  });

  it("should allow authenticated access to budgets with a valid jwt", async () => {
    const response = await request(server)
      .get("/api/budgets")
      .auth(jwt, { type: "bearer" });

    expect(response.body).toHaveLength(0);
    expect(response.statusCode).toBe(200);
    expect(response.body).not.toHaveProperty("error");
  });
});

describe("POST /api/budgets", () => {
  beforeAll(() => {
    jest.restoreAllMocks(); // Restaura las funciones de los jest.spyOn a su implementación original
  });

  beforeAll(async () => {
    await authenticateUser();
  });

  it("should reject unauthenticated POST to budgets without a jwt token", async () => {
    const response = await request(server).post("/api/budgets");

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("No autorizado");
  });

  it("should display validation when the form is submitted with invalid data", async () => {
    const response = await request(server)
      .post("/api/budgets")
      .auth(jwt, { type: "bearer" })
      .send({
        name: "",
        amount: -100,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("should create a new budget when the form is submitted with valid data", async () => {
    const response = await request(server)
      .post("/api/budgets")
      .auth(jwt, { type: "bearer" })
      .send({
        name: "Test Budget",
        amount: 4000,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toBe("Presupuesto creado exitosamente");
  });
});

describe("GET /api/budgets/:id", () => {
  beforeAll(() => {
    jest.restoreAllMocks(); // Restaura las funciones de los jest.spyOn a su implementación original
  });

  beforeAll(async () => {
    await authenticateUser();
  });

  it("should reject unauthenticated access to a budget without a jwt token", async () => {
    const response = await request(server).get("/api/budgets/1");

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("No autorizado");
  });

  it("should return 400 bad request when the budget ID is not valid", async () => {
    const response = await request(server)
      .get("/api/budgets/not_valid")
      .auth(jwt, { type: "bearer" });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.statusCode).not.toBe(401);
  });

  it("should return 404 not found when a budget does not exist", async () => {
    const response = await request(server)
      .get("/api/budgets/999999")
      .auth(jwt, { type: "bearer" });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Presupuesto no encontrado");
  });

  it("should return a single budget by id", async () => {
    const response = await request(server)
      .get("/api/budgets/1")
      .auth(jwt, { type: "bearer" });

    expect(response.statusCode).toBe(200);
  });
});

describe("PUT /api/budgets/:id", () => {
  beforeAll(async () => {
    await authenticateUser();
  });

  it("should reject unauthenticated PUT to a budget without a jwt token", async () => {
    const response = await request(server).put("/api/budgets/1");

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("No autorizado");
  });

  it("should display validation errors when if the form is empty", async () => {
    const response = await request(server)
      .put("/api/budgets/1")
      .auth(jwt, { type: "bearer" })
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toBeTruthy();
  });

  it("should update a budget when the form is submitted with valid data", async () => {
    const response = await request(server)
      .put("/api/budgets/1")
      .auth(jwt, { type: "bearer" })
      .send({
        name: "Updated Budget",
        amount: 5000,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("Presupuesto actualizado exitosamente");
  });
});

describe("DELETE /api/budgets/:id", () => {
  beforeAll(async () => {
    await authenticateUser();
  });

  it("should reject unauthenticated DELETE to a budget without a jwt token", async () => {
    const response = await request(server).delete("/api/budgets/1");

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("No autorizado");
  });

  it("should return 404 when a budget does not exist", async () => {
    const response = await request(server)
      .delete("/api/budgets/999999")
      .auth(jwt, { type: "bearer" });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Presupuesto no encontrado");
  });

  it("should delete a budget when the form is submitted with valid data", async () => {
    const response = await request(server)
      .delete("/api/budgets/1")
      .auth(jwt, { type: "bearer" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("Presupuesto eliminado exitosamente");
  });
});
