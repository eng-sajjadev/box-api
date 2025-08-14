import Elysia, { t } from "elysia";
import db from "../db/init";
import { UserPlain } from "../../generated/prismabox/User";
import { generateRandomHex } from "../utils/hex";
import jwt from "@elysiajs/jwt";
import { sendVerificationEmail } from "../utils/email";
import { rateLimit } from "elysia-rate-limit";
import bearer from "@elysiajs/bearer";

const auth = new Elysia({ prefix: "/auth" })
  .use(bearer())
  .use(jwt({ name: "jwt", secret: Bun.env.AUTH_SECRET_KEY! }))
  .use(
    rateLimit({
      duration: 60_000, // 1 minute window
      max: 3, // Max 3 requests per window
      errorResponse: "Too many requests. Try again later.",
      // Optional: Skip rate limiting for certain conditions
      skip: (request) => {
        // Example: Don't rate limit in test environment
        return process.env.NODE_ENV === "test";
      },
    })
  )
  .post(
    "/createUserWithEmail",
    async ({ body, set, jwt }) => {
      try {
        // 1. Parallelize existence checks
        const [emailExists, usernameExists] = await Promise.all([
          db.user.findUnique({
            where: { email: body.email },
            select: { id: true },
          }),
          db.user.findUnique({
            where: { username: body.username },
            select: { id: true },
          }),
        ]);

        // 2. Early return with specific error messages
        if (emailExists) {
          set.status = 400;
          return { error: "Email already in use" };
        }
        if (usernameExists) {
          set.status = 400;
          return { error: "Username already taken" };
        }

        // 3. Generate verification code and hash password in parallel
        const [verificationCode, hashedPassword] = await Promise.all([
          generateRandomHex(),
          Bun.password.hash(body.password, {
            algorithm: "argon2id", // More secure than default
            memoryCost: 4, // Adjust based on your server capabilities
            timeCost: 3, // Balance between security and performance
          }),
        ]);

        // 4. Single database transaction for atomic operations
        const newUser = await db.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email: body.email,
              username: body.username,
              password: hashedPassword,
              status: "offline",
              verificationCode,
              verificationCodeExpires: new Date(
                Date.now() + 2 * 24 * 60 * 60 * 1000
              ),
              // Include other default fields to avoid extra queries
              verified: false,
              bio: null,
              avatar: null,
              phone: null,
            },
            select: {
              // Only return what's needed
              id: true,
              email: true,
              username: true,
              status: true,
              createdAt: true,
            },
          });

          // Here you could add related operations that should be atomic:
          // await tx.profile.create({...});
          // await tx.notification.create({...});

          return user;
        });

        // 5. Generate JWT with minimal claims
        const token = await jwt.sign({
          id: newUser.id,
          username: newUser.username,
          // Avoid including sensitive data
        });

        // 6. Set appropriate headers
        set.headers["X-Auth-Method"] = "email";

        // 7. Send  Verification Email
        sendVerificationEmail({
          email: newUser.email!,
          username: newUser.username,
          verificationCode: verificationCode,
        });

        return {
          success: true,
          data: newUser,
          token,
        };
      } catch (error) {
        console.error("User creation error:", error);
        set.status = 500;
        return { error: "Account creation failed. Please try again." };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.RegExp(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/,
          {
            default: {
              code: "WEAK_PASSWORD",
              message:
                "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
            },
          }
        ),
        username: t.RegExp(/^[a-zA-Z0-9_]{3,20}$/, {
          default: {
            code: "INVALID_USERNAME",
            message:
              "Username must be 3-20 characters with only letters, numbers, and underscores",
          },
        }),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Partial(UserPlain),
          token: t.String(),
        }),
        400: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
    }
  )
  .post(
    "/login",
    async ({ body, set, jwt, cookie: { auth } }) => {
      try {
        // 1. Find user by email OR username
        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: body.login }, // login can be email
              { username: body.login }, // or username
            ],
          },
          select: {
            id: true,
            email: true,
            username: true,
            password: true,
            status: true,
            verified: true,
          },
        });

        // 2. Early exit if user not found or invalid credentials
        if (!user) {
          set.status = 401;
          return { error: "Invalid credentials" };
        }

        // 3. Verify password (timing-safe comparison)
        const passwordValid = await Bun.password.verify(
          body.password,
          user.password
        );

        if (!passwordValid) {
          set.status = 401;
          return { error: "Invalid credentials" };
        }

        // 4. Generate JWT token (short-lived access token + refresh token)
        const [accessToken, refreshToken] = await Promise.all([
          jwt.sign({
            id: user.id,
            username: user.username,
          }),
          jwt.sign({
            id: user.id,
            purpose: "refresh",
          }),
        ]);

        // 5. Set HTTP-only cookie for refresh token (secure in production)
        auth.value = refreshToken;
        auth.httpOnly = true;
        auth.secure = Bun.env.NODE_ENV === "production";
        auth.sameSite = "strict";
        auth.maxAge = 7 * 24 * 60 * 60; // 7 days

        // 6. Update user status to "online" (optional)
        await db.user.update({
          where: { id: user.id },
          data: { status: "online", lastSeen: new Date() },
        });

        // 7. Return success response (exclude sensitive data)
        return {
          success: true,
          data: {
            id: user.id,
            email: user.email,
            username: user.username,
            status: "online",
            verified: user.verified,
          },
          token: accessToken, // Return access token in response body
        };
      } catch (error) {
        console.error("Login error:", error);
        set.status = 500;
        return { error: "Login failed. Please try again." };
      }
    },
    {
      body: t.Object({
        login: t.String({ minLength: 3 }), // Can be email or username
        password: t.String({ minLength: 8 }),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            email: t.Nullable(t.String()),
            username: t.String(),
            status: t.String(),
            verified: t.Boolean(),
          }),
          token: t.String(), // Access token
        }),
        401: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
    }
  )
  .post(
    "/activate",
    async ({ body, set }) => {
      const user = await db.user.findUnique({
        where: { email: body.email },
        select: {
          id: true,
          verificationCode: true,
          verificationCodeExpires: true,
          verified: true,
        },
      });

      if (!user) {
        set.status = 404;
        return { error: "User not found" };
      }

      if (user.verified) {
        set.status = 400;
        return { error: "Account already verified" };
      }

      if (user.verificationCode !== body.code) {
        set.status = 400;
        return { error: "Invalid verification code" };
      }

      if (new Date() > user.verificationCodeExpires!) {
        set.status = 400;
        return { error: "Verification code expired" };
      }

      await db.user.update({
        where: { id: user.id },
        data: {
          verified: true,
          verificationCode: null,
          verificationCodeExpires: null,
        },
      });

      return { success: true, message: "Account activated" };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        code: t.String({ minLength: 5, maxLength: 5 }),
      }),
    }
  )
  .post(
    "/resend-verification",
    async ({ body, set }) => {
      // 1. Find user with verification status
      const user = await db.user.findUnique({
        where: { email: body.email },
        select: {
          id: true,
          username: true,
          email: true,
          verified: true,
          verificationCodeExpires: true,
        },
      });

      // 2. Silent return for non-existent or already verified accounts
      if (!user || user.verified) {
        set.status = 200;
        return {
          success: true,
          message:
            "If your email requires verification, a new code has been sent",
        };
      }

      // 3. Only regenerate if previous code is expired (optional)
      const shouldRegenerate =
        !user.verificationCodeExpires ||
        new Date() > user.verificationCodeExpires;

      const newCode = shouldRegenerate ? generateRandomHex(5) : undefined;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      // 4. Update only if regenerating
      if (shouldRegenerate) {
        await db.user.update({
          where: { id: user.id },
          data: {
            verificationCode: newCode,
            verificationCodeExpires: expiresAt,
          },
        });
      }

      // 5. Send email only if regenerated
      if (shouldRegenerate) {
        await sendVerificationEmail({
          email: user.email!,
          username: user.username,
          verificationCode: newCode!,
        });
      }

      // 6. Same response regardless of regeneration
      return {
        success: true,
        message:
          "If your email requires verification, a new code has been sent",
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
      }),
    }
  )
  .patch(
    "/update-profile",
    async ({ body, bearer, set, jwt }) => {
      try {
        // 1. Verify JWT
        const payload = await jwt.verify(bearer);
        if (!payload || typeof payload.id !== "string") {
          set.status = 401;
          return { error: "Invalid token" };
        }

        // 2. Check username availability
        if (body.username) {
          const usernameExists = await db.user.findFirst({
            where: {
              username: body.username,
              NOT: { id: payload.id },
            },
            select: { id: true },
          });

          if (usernameExists) {
            set.status = 400;
            return { error: "Username already taken" };
          }
        }

        // 3. Prepare update data
        const updatableFields = [
          "username",
          "avatar",
          "status",
          "bio",
        ] as const;
        const updateData: Partial<{
          username?: string;
          avatar?: string;
          status?: string;
          bio?: string;
        }> = {};

        Object.entries(body).forEach(([key, value]) => {
          if (
            updatableFields.includes(key as (typeof updatableFields)[number]) &&
            value !== undefined
          ) {
            updateData[key as keyof typeof updateData] = value;
          }
        });

        // 🚨 4. If no updatable fields were provided
        if (Object.keys(updateData).length === 0) {
          set.status = 400;
          return { error: "No changes provided" };
        }
        // 5. Perform update
        const updatedUser = await db.user.update({
          where: { id: payload.id },
          data: updateData,
          select: {
            id: true,
            username: true,
            avatar: true,
            status: true,
            bio: true,
            updatedAt: true,
          },
        });

        // Map null → undefined for schema compatibility
        return {
          success: true,
          data: {
            ...updatedUser,
            avatar: updatedUser.avatar ?? undefined,
            status: updatedUser.status ?? undefined,
            bio: updatedUser.bio ?? undefined,
            updatedAt: updatedUser.updatedAt.toISOString(),
          },
        };
      } catch (error) {
        console.error("Update error:", error);
        set.status = 500;
        return { error: "Profile update failed" };
      }
    },
    {
      beforeHandle: [
        ({ bearer, set }) => {
          if (!bearer) {
            set.status = 401;
            return { error: "Bearer token required" };
          }
        },
      ],
      body: t.Partial(
        t.Object({
          username: t.RegExp(/^[a-zA-Z0-9_]{3,20}$/, {
            error:
              "Username must be 3-20 chars (letters, numbers, underscores)",
          }),
          avatar: t.Optional(t.String({ format: "url" })),
          status: t.Optional(t.String()),
          bio: t.Optional(t.String({ maxLength: 200 })),
        })
      ),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            username: t.String(),
            avatar: t.Optional(t.String()),
            status: t.Optional(t.String()),
            bio: t.Optional(t.String()),
            updatedAt: t.String(),
          }),
        }),
        400: t.Object({ error: t.String() }),
        401: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  );

export default auth;
