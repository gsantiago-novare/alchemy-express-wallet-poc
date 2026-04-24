import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { DatabaseConnection } from "../src/utils/db-connection";
import UserRepository from "../src/repository/auth/user-repository";
import WalletRepository from "../src/repository/wallet/wallet-repository";
import TransactionRepository from "../src/repository/transaction/transaction-repository";
import UserService from "../src/service/auth/user-service";
import * as argon2 from "argon2";

describe("Integration Tests - Database", () => {
	let dbConn: any;
	const testUserId = Math.floor(Math.random() * 999999);
	const testUser = {
		username: `testuser_${testUserId}`,
		password: "password123",
		mobileNumber: `0917${Math.floor(Math.random() * 10000000)}`,
	};

	beforeAll(async () => {
		// Verify database connection is available
		try {
			dbConn = await DatabaseConnection.connect();
			expect(dbConn).toBeDefined();
			dbConn.release();
		} catch (error: any) {
			console.error("Database connection failed:", error.message);
			throw error;
		}
	});

	afterAll(async () => {
		// Cleanup test data - be careful not to duplicate
		try {
			const conn = await DatabaseConnection.connect();
			// Delete wallets by user_id
			const userIdResult = await conn.query(
				"SELECT id FROM users WHERE username LIKE $1 LIMIT 1",
				[testUser.username]
			);
			if (userIdResult.rows.length > 0) {
				const userId = userIdResult.rows[0].id;
				await conn.query("DELETE FROM wallets WHERE user_id = $1", [userId]);
				await conn.query("DELETE FROM users WHERE id = $1", [userId]);
			}
			conn.release();
		} catch (error) {
			console.error("Cleanup error:", error);
		}
	});

	// ============== USER REPOSITORY INTEGRATION TESTS ==============
	describe("UserRepository - Database Integration", () => {
		it("should successfully register a new user in database", async () => {
			const hashedPassword = await argon2.hash(testUser.password);
			const userData = {
				username: testUser.username,
				password: hashedPassword,
				mobileNumber: testUser.mobileNumber,
			};

			const result = await UserRepository.registerUser(userData as any);

			expect(result).toBeDefined();
			expect(result.id).toBeGreaterThan(0);
			expect(result.username).toBe(testUser.username);
			expect(result.mobile_number).toBe(testUser.mobileNumber);
		});

		it("should find user by mobile number", async () => {
			// First register a user
			const hashedPassword = await argon2.hash(testUser.password);
			const userData = {
				username: testUser.username,
				password: hashedPassword,
				mobileNumber: testUser.mobileNumber,
			};

			await UserRepository.registerUser(userData as any);

			// Then find by mobile number
			const foundUser = await UserRepository.findByMobileNumber(testUser.mobileNumber);

			expect(foundUser).toBeDefined();
			expect(foundUser!.username).toBe(testUser.username);
			expect(foundUser!.mobile_number).toBe(testUser.mobileNumber);
		});

		it("should find user by user ID", async () => {
			// First register a user
			const hashedPassword = await argon2.hash(testUser.password);
			const userData = {
				username: testUser.username,
				password: hashedPassword,
				mobileNumber: testUser.mobileNumber,
			};

			const registeredUser = await UserRepository.registerUser(userData as any);

			// Then find by user ID
			const foundUser = await UserRepository.findByUserId(registeredUser.id);

			expect(foundUser).toBeDefined();
			expect(foundUser!.id).toBe(registeredUser.id);
			expect(foundUser!.username).toBe(testUser.username);
		});

		it("should return undefined for non-existent mobile number", async () => {
			const nonExistentMobile = `0917${Math.random() * 10000000}`;
			const result = await UserRepository.findByMobileNumber(nonExistentMobile);

			expect(result).toBeUndefined();
		});

		it("should return undefined for non-existent user ID", async () => {
			const nonExistentId = 999999999;
			const result = await UserRepository.findByUserId(nonExistentId);

			expect(result).toBeUndefined();
		});
	});

	// ============== WALLET REPOSITORY INTEGRATION TESTS ==============
	describe("WalletRepository - Database Integration", () => {
		let createdUserId: number;

		beforeEach(async () => {
			// Create a test user before each test
			const hashedPassword = await argon2.hash(testUser.password);
			const userData = {
				username: `testuser_${Date.now()}`,
				password: hashedPassword,
				mobileNumber: `0917${Date.now() % 100000000}`,
			};

			const user = await UserRepository.registerUser(userData as any);
			createdUserId = user.id;
		});

		it("should successfully register a wallet for a user", async () => {
			const wallet = await WalletRepository.registerWallet(createdUserId);

			expect(wallet).toBeDefined();
			expect(Number(wallet.id)).toBeGreaterThan(0);
			expect(Number(wallet.user_id)).toBe(createdUserId);
		});

		it("should find wallet by user ID", async () => {
			// Register wallet first
			const registeredWallet = await WalletRepository.registerWallet(createdUserId);

			// Find wallet
			const wallet = await WalletRepository.findWalletById(createdUserId);

			expect(wallet).toBeDefined();
			expect(wallet!.user_id).toBe(createdUserId);
			expect(Number(wallet!.id)).toBe(Number(registeredWallet.id));
		});

		it("should return undefined for non-existent wallet", async () => {
			const nonExistentUserId = 999999999;
			const result = await WalletRepository.findWalletById(nonExistentUserId);

			expect(result).toBeUndefined();
		});

		it("should return wallet with balance and currency properties", async () => {
			const wallet = await WalletRepository.registerWallet(createdUserId);

			expect(wallet).toHaveProperty("balance");
			expect(wallet).toHaveProperty("currency");
		});
	});

	// ============== TRANSACTION REPOSITORY INTEGRATION TESTS ==============
	describe("TransactionRepository - Database Integration", () => {
		let senderWalletId: number;
		let receiverWalletId: number;

		beforeEach(async () => {
			// Create two users with wallets
			const senderData = {
				username: `sender_${Date.now()}`,
				password: await argon2.hash("password123"),
				mobileNumber: `0917${Date.now() % 100000000}`,
			};

			const receiverData = {
				username: `receiver_${Date.now() + 1}`,
				password: await argon2.hash("password123"),
				mobileNumber: `0917${(Date.now() + 1) % 100000000}`,
			};

			const sender = await UserRepository.registerUser(senderData as any);
			const receiver = await UserRepository.registerUser(receiverData as any);

			const senderWallet = await WalletRepository.registerWallet(sender.id);
			const receiverWallet = await WalletRepository.registerWallet(receiver.id);

			senderWalletId = Number(senderWallet.id);
			receiverWalletId = Number(receiverWallet.id);
		});

		it("should successfully insert a transaction", async () => {
			const referenceNo = `REF-${Date.now()}`;
			const amount = 100;

			const conn = await DatabaseConnection.connect();
			const transaction = await TransactionRepository.insertTransaction(
				senderWalletId,
				receiverWalletId,
				amount,
				referenceNo,
				"completed",
				conn
			);
			conn.release();

			expect(transaction).toBeDefined();
			expect(Number(transaction.sender_wallet_id)).toBe(senderWalletId);
			expect(Number(transaction.receiver_wallet_id)).toBe(receiverWalletId);
			expect(Number(transaction.amount)).toBe(amount);
			expect(transaction.reference_no).toBe(referenceNo);
		});

		it("should verify transaction exists in database", async () => {
			const referenceNo = `REF-${Date.now()}-verify`;
			const amount = 250.5;

			const conn = await DatabaseConnection.connect();
			await TransactionRepository.insertTransaction(
				senderWalletId,
				receiverWalletId,
				amount,
				referenceNo,
				"completed",
				conn
			);

			// Verify transaction exists
			const result = await conn.query(
				"SELECT * FROM transactions WHERE reference_no = $1",
				[referenceNo]
			);
			conn.release();

			expect(result.rows).toHaveLength(1);
			expect(Number(result.rows[0].amount)).toBe(amount);
		});

		it("should store transaction with correct details", async () => {
			const referenceNo = `REF-${Date.now()}-details`;
			const amount = 500;
			const status = "completed";

			const conn = await DatabaseConnection.connect();
			const transaction = await TransactionRepository.insertTransaction(
				senderWalletId,
				receiverWalletId,
				amount,
				referenceNo,
				status,
				conn
			);
			conn.release();

			expect(transaction.status).toBe(status);
			expect(transaction.reference_no).toBe(referenceNo);
		});
	});

	// ============== FULL FLOW INTEGRATION TESTS ==============
	describe("Complete Authentication Flow - Database Integration", () => {
		const uniqueUser = {
			username: `fullflow_${Date.now()}`,
			password: "password123",
			mobileNumber: `0917${Date.now() % 100000000}`,
		};

		afterAll(async () => {
			// Cleanup this test's data
			try {
				const conn = await DatabaseConnection.connect();
				const result = await conn.query(
					"SELECT id FROM users WHERE username = $1",
					[uniqueUser.username]
				);
				if (result.rows.length > 0) {
					const userId = result.rows[0].id;
					await conn.query("DELETE FROM wallets WHERE user_id = $1", [userId]);
					await conn.query("DELETE FROM users WHERE id = $1", [userId]);
				}
				conn.release();
			} catch (error) {
				console.error("Cleanup error:", error);
			}
		});

		it("should register user and create wallet in database", async () => {
			const userData = {
				username: uniqueUser.username,
				password: uniqueUser.password,
				mobileNumber: uniqueUser.mobileNumber,
			};

			// Register user
			await UserService.registerUser(userData as any);

			// Verify user exists
			const user = await UserRepository.findByMobileNumber(uniqueUser.mobileNumber);
			expect(user).toBeDefined();
			expect(user!.username).toBe(uniqueUser.username);

			// Verify wallet exists
			const wallet = await WalletRepository.findWalletById(user!.id);
			expect(wallet).toBeDefined();
			expect(Number(wallet!.user_id)).toBe(user!.id);
		});

		it("should login user and retrieve wallet", async () => {
			const userData = {
				username: `fullflow_login_${Date.now()}`,
				password: "password123",
				mobileNumber: `0917${Date.now() % 100000000}`,
			};

			// Register first with plain password (service will hash it)
			await UserService.registerUser(userData as any);

			// Get the registered user to verify
			const registeredUser = await UserRepository.findByMobileNumber(userData.mobileNumber);
			expect(registeredUser).toBeDefined();

			// Login with plain password (service will verify hash)
			const loginData = {
				mobileNumber: userData.mobileNumber,
				password: userData.password,
			};

			const loginResult = await UserService.login(loginData as any);

			expect(loginResult).toBeDefined();
			expect(loginResult.id).toBeGreaterThan(0);
			expect(loginResult.wallet).toBeDefined();

			// Cleanup
			const conn = await DatabaseConnection.connect();
			await conn.query("DELETE FROM wallets WHERE user_id = $1", [loginResult.id]);
			await conn.query("DELETE FROM users WHERE id = $1", [loginResult.id]);
			conn.release();
		});

		it("should prevent duplicate user registration", async () => {
			const userData = {
				username: `fullflow_dup_${Date.now()}`,
				password: "password123",
				mobileNumber: `0917${Date.now() % 100000000}`,
			};

			// First registration
			await UserService.registerUser(userData as any);

			// Second registration with same mobile should fail
			try {
				await UserService.registerUser(userData as any);
				expect.fail("Should have thrown an error for duplicate mobile number");
			} catch (error: any) {
				expect(error).toBeDefined();
				expect(error.statusCode).toBe(400);
			}

			// Cleanup
			const conn = await DatabaseConnection.connect();
			const result = await conn.query("SELECT id FROM users WHERE mobile_number = $1", [
				userData.mobileNumber,
			]);
			if (result.rows.length > 0) {
				const userId = result.rows[0].id;
				await conn.query("DELETE FROM wallets WHERE user_id = $1", [userId]);
				await conn.query("DELETE FROM users WHERE id = $1", [userId]);
			}
			conn.release();
		});
	});

	// ============== DATABASE STATE TESTS ==============
	describe("Database Constraints and State", () => {
		it("should enforce database connection pooling", async () => {
			const conn1 = await DatabaseConnection.connect();
			const conn2 = await DatabaseConnection.connect();

			expect(conn1).toBeDefined();
			expect(conn2).toBeDefined();

			conn1.release();
			conn2.release();
		});

		it("should handle concurrent operations", async () => {
			const user1Data = {
				username: `concurrent_1_${Date.now()}`,
				password: await argon2.hash("password123"),
				mobileNumber: `0917${Date.now() % 100000000}`,
			};

			const user2Data = {
				username: `concurrent_2_${Date.now() + 1}`,
				password: await argon2.hash("password123"),
				mobileNumber: `0917${(Date.now() + 1) % 100000000}`,
			};

			// Register both users concurrently
			const [user1, user2] = await Promise.all([
				UserRepository.registerUser(user1Data as any),
				UserRepository.registerUser(user2Data as any),
			]);

			expect(user1.id).toBeDefined();
			expect(user2.id).toBeDefined();
			expect(user1.id).not.toBe(user2.id);

			// Cleanup
			const conn = await DatabaseConnection.connect();
			await conn.query("DELETE FROM users WHERE id IN ($1, $2)", [user1.id, user2.id]);
			conn.release();
		});

		it("should maintain data integrity across operations", async () => {
			const userData = {
				username: `integrity_${Date.now()}`,
				password: await argon2.hash("password123"),
				mobileNumber: `0917${Date.now() % 100000000}`,
			};

			// Register user
			const user = await UserRepository.registerUser(userData as any);

			// Register wallet
			const wallet = await WalletRepository.registerWallet(user.id);

			// Retrieve user and verify wallet relationship
			const retrievedUser = await UserRepository.findByUserId(user.id);
			const retrievedWallet = await WalletRepository.findWalletById(user.id);

			expect(retrievedUser!.id).toBe(user.id);
			expect(Number(retrievedWallet!.user_id)).toBe(user.id);
			expect(Number(retrievedWallet!.id)).toBe(Number(wallet.id));

			// Cleanup
			const conn = await DatabaseConnection.connect();
			await conn.query("DELETE FROM wallets WHERE id = $1", [wallet.id]);
			await conn.query("DELETE FROM users WHERE id = $1", [user.id]);
			conn.release();
		});
	});

	// ============== ERROR SCENARIOS ==============
	describe("Error Handling in Integration Tests", () => {
		it("should handle invalid database operations gracefully", async () => {
			// Attempt to find user with invalid ID (should return undefined, not error)
			const result = await UserRepository.findByUserId(-1);
			expect(result).toBeUndefined();
		});

		it("should handle connection release properly", async () => {
			let conn1: any;
			let conn2: any;
			let conn3: any;

			conn1 = await DatabaseConnection.connect();
			conn2 = await DatabaseConnection.connect();

			expect(conn1).toBeDefined();
			expect(conn2).toBeDefined();

			conn1.release();
			conn2.release();

			// Should be able to get new connections
			conn3 = await DatabaseConnection.connect();
			expect(conn3).toBeDefined();
			conn3.release();
		});

		it("should handle password hashing consistently", async () => {
			const password = "testpassword123";

			const hash1 = await argon2.hash(password);
			const hash2 = await argon2.hash(password);

			// Hashes should be different but both should verify
			expect(hash1).not.toBe(hash2);
			expect(await argon2.verify(hash1, password)).toBe(true);
			expect(await argon2.verify(hash2, password)).toBe(true);
		});

		it("should persist user and wallet data after insertion", async () => {
			const userData = {
				username: `persist_${Date.now()}`,
				password: await argon2.hash("password123"),
				mobileNumber: `0917${Date.now() % 100000000}`,
			};

			// Register user and wallet
			const user = await UserRepository.registerUser(userData as any);
			const wallet = await WalletRepository.registerWallet(user.id);

			// Verify they can be retrieved immediately
			const retrievedUser = await UserRepository.findByUserId(user.id);
			const retrievedWallet = await WalletRepository.findWalletById(user.id);

			expect(retrievedUser).toBeDefined();
			expect(retrievedWallet).toBeDefined();

			// Cleanup
			const conn = await DatabaseConnection.connect();
			await conn.query("DELETE FROM wallets WHERE id = $1", [wallet.id]);
			await conn.query("DELETE FROM users WHERE id = $1", [user.id]);
			conn.release();
		});
	});
});
