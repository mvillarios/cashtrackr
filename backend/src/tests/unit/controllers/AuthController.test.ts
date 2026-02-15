import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthController";
import { User } from "../../../models/User";
import { checkPassword, hashPassword } from "../../../utils/auth";
import { generateToken } from "../../../utils/token";
import { AuthEmail } from "../../../emails/AuthEmail";
import { generateJWT } from "../../../utils/jwt";

jest.mock("../../../models/User");
jest.mock("../../../utils/auth");
jest.mock("../../../utils/token");
jest.mock("../../../utils/jwt");

describe("AuthController.createAccount", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return a 409 status and an error message if the email is already registered", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(true);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/create-account",
      body: {
        email: "test@test.com",
        password: "password123",
      },
    });
    const res = createResponse();

    await AuthController.createAccount(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(409);
    expect(data).toHaveProperty("error", "El Usuario ya está registrado");
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });

  it("should return a 201 status and a success message if the account is created successfully", async () => {
    const req = createRequest({
      method: "POST",
      url: "/api/auth/create-account",
      body: {
        email: "test@test.com",
        password: "password123",
        name: "Test User",
      },
    });
    const res = createResponse();

    const mockUser = { ...req.body, save: jest.fn() };

    (User.create as jest.Mock).mockResolvedValue(mockUser);
    (hashPassword as jest.Mock).mockResolvedValue("hashedPassword");
    (generateToken as jest.Mock).mockReturnValue("generatedToken");
    jest
      .spyOn(AuthEmail, "sendConfirmationEmail")
      .mockImplementation(() => Promise.resolve());

    await AuthController.createAccount(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(201);
    expect(data).toBe("Cuenta creada exitosamente");

    expect(User.create).toHaveBeenCalledWith(req.body);
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(mockUser.save).toHaveBeenCalledTimes(1);
    expect(mockUser.password).toBe("hashedPassword");
    expect(mockUser.token).toBe("generatedToken");
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
      name: req.body.name,
      email: req.body.email,
      token: "generatedToken",
    });
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1);
  });
});

describe("AuthController.login", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return 404 if user is not found", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "password123",
      },
    });
    const res = createResponse();

    await AuthController.login(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(404);
    expect(data).toHaveProperty("error", "El Usuario no existe");
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });

  it("should return 403 if account is not verified", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      email: "test@test.com",
      password: "hashedPassword",
      confirmed: false,
    });

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "password123",
      },
    });
    const res = createResponse();

    await AuthController.login(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(403);
    expect(data).toHaveProperty("error", "La cuenta no ha sido confirmada");
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });

  it("should return 401 if password is incorrect", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      email: "test@test.com",
      password: "hashedPassword",
      confirmed: true,
    });

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "password123",
      },
    });
    const res = createResponse();

    (checkPassword as jest.Mock).mockResolvedValue(false);

    await AuthController.login(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(401);
    expect(data).toHaveProperty("error", "Contraseña incorrecta");
    expect(checkPassword).toHaveBeenCalledWith("password123", "hashedPassword");
  });

  it("should return a JWT if auth is successful", async () => {
    const userMock = {
      id: 1,
      email: "test@test.com",
      password: "hashedPassword",
      confirmed: true,
    };

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "hashedPassword",
      },
    });
    const res = createResponse();

    const fakejwt = "123456789abcdef";

    (User.findOne as jest.Mock).mockResolvedValue(userMock);
    (checkPassword as jest.Mock).mockResolvedValue(true);
    (generateJWT as jest.Mock).mockReturnValue(fakejwt);

    await AuthController.login(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data).toEqual(fakejwt);
    expect(generateJWT).toHaveBeenCalledTimes(1);
    expect(generateJWT).toHaveBeenCalledWith(userMock.id);
  });
});
