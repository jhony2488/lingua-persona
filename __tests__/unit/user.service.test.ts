/** @jest-environment <rootDir>/jest.node-env.ts */
import type { User } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { userRepository } from "@/modules/users/user.repository";
import { userService } from "@/modules/users/user.service";

jest.mock("@/modules/users/user.repository");

const repo = jest.mocked(userRepository);

const user: User = {
  id: "u_1",
  email: "ana@example.com",
  name: "Ana",
  englishLevel: "A1",
  preferredDialect: "US",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("userService", () => {
  afterEach(() => jest.clearAllMocks());

  it("lists users", async () => {
    repo.findMany.mockResolvedValue([user]);
    expect(await userService.list()).toEqual([user]);
  });

  it("returns a user by id", async () => {
    repo.findById.mockResolvedValue(user);
    expect(await userService.get("u_1")).toEqual(user);
  });

  it("throws 404 when user does not exist", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(userService.get("missing")).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("creates a user when email is free", async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockResolvedValue(user);
    const input = {
      email: "ana@example.com",
      name: "Ana",
      englishLevel: "A1" as const,
      preferredDialect: "US" as const,
    };
    expect(await userService.create(input)).toEqual(user);
    expect(repo.create).toHaveBeenCalledWith(input);
  });

  it("rejects duplicate email on create", async () => {
    repo.findByEmail.mockResolvedValue(user);
    await expect(
      userService.create({
        email: "ana@example.com",
        name: "Outra Ana",
        englishLevel: "A1",
        preferredDialect: "US",
      }),
    ).rejects.toMatchObject({ statusCode: 409, code: "CONFLICT" });
  });

  it("rejects duplicate email on update from another user", async () => {
    repo.findById.mockResolvedValue(user);
    repo.findByEmail.mockResolvedValue({ ...user, id: "u_2" });
    await expect(
      userService.update("u_1", { email: "ana@example.com" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("allows updating with same email", async () => {
    repo.findById.mockResolvedValue(user);
    repo.findByEmail.mockResolvedValue(user);
    repo.update.mockResolvedValue(user);
    await expect(
      userService.update("u_1", { email: "ana@example.com" }),
    ).resolves.toEqual(user);
  });

  it("propagates AppError instances", async () => {
    repo.findById.mockRejectedValue(AppError.notFound("gone"));
    await expect(userService.get("x")).rejects.toBeInstanceOf(AppError);
  });
});
