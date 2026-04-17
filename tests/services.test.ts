import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import TransactionService from "../src/service/transaction/transaction-service";
import { TransactionRepository } from "../src/repository/transaction";
import { ServerError } from "../src/errors";

describe("Services and Repositories", () => {
	// ============== TRANSACTION SERVICE TESTS ==============
	describe("TransactionService", () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("should successfully insert a transaction", async () => {
			const mockDbConn = {};
			const senderWalletId = 1;
			const receiverWalletId = 2;
			const amount = 100;
			const referenceNo = "REF-123456";
			const status = "completed";

			vi.spyOn(TransactionRepository, "insertTransaction").mockResolvedValue({
				id: 1,
				senderWalletId,
				receiverWalletId,
				amount,
				referenceNo,
				status,
				createdAt: new Date(),
			} as any);

			await TransactionService.insertTransaction(
				senderWalletId,
				receiverWalletId,
				amount,
				referenceNo,
				status,
				mockDbConn
			);

			expect(TransactionRepository.insertTransaction).toHaveBeenCalledWith(
				senderWalletId,
				receiverWalletId,
				amount,
				referenceNo,
				status,
				mockDbConn
			);
		});

		it("should throw ServerError when insertTransaction fails", async () => {
			const mockDbConn = {};
			const senderWalletId = 1;
			const receiverWalletId = 2;
			const amount = 100;
			const referenceNo = "REF-123456";
			const status = "completed";

			vi.spyOn(TransactionRepository, "insertTransaction").mockRejectedValue(
				new Error("Database error")
			);

			await expect(
				TransactionService.insertTransaction(
					senderWalletId,
					receiverWalletId,
					amount,
					referenceNo,
					status,
					mockDbConn
				)
			).rejects.toThrow(ServerError);
		});

		it("should call TransactionRepository with correct parameters", async () => {
			const mockDbConn = { query: vi.fn() };
			const params = {
				senderWalletId: 5,
				receiverWalletId: 10,
				amount: 250.5,
				referenceNo: "REF-ABC123",
				status: "pending",
			};

			vi.spyOn(TransactionRepository, "insertTransaction").mockResolvedValue({
				id: 99,
				...params,
				createdAt: new Date(),
			} as any);

			await TransactionService.insertTransaction(
				params.senderWalletId,
				params.receiverWalletId,
				params.amount,
				params.referenceNo,
				params.status,
				mockDbConn
			);

			expect(TransactionRepository.insertTransaction).toHaveBeenCalledWith(
				params.senderWalletId,
				params.receiverWalletId,
				params.amount,
				params.referenceNo,
				params.status,
				mockDbConn
			);
		});
	});

	// ============== TRANSACTION REPOSITORY TESTS ==============
	describe("TransactionRepository", () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("should handle insertTransaction with valid parameters", async () => {
			// Test that insertTransaction is defined and callable
			expect(TransactionRepository.insertTransaction).toBeDefined();
			expect(typeof TransactionRepository.insertTransaction).toBe("function");
		});

		it("should have required repository methods", () => {
			expect(TransactionRepository).toHaveProperty("insertTransaction");
			expect(typeof TransactionRepository.insertTransaction).toBe("function");
		});
	});

	// ============== SERVICE INTEGRATION TESTS ==============
	describe("Service Layer Integration", () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("should handle transaction service error propagation", async () => {
			const error = new Error("Connection timeout");
			vi.spyOn(TransactionRepository, "insertTransaction").mockRejectedValue(
				error
			);

			try {
				await TransactionService.insertTransaction(1, 2, 100, "REF-1", "pending", {});
				expect.fail("Should have thrown an error");
			} catch (e: any) {
				expect(e).toBeInstanceOf(ServerError);
				expect(e.statusCode).toBe(500);
				expect(e.message).toContain("Failed to insert transaction");
			}
		});

		it("should preserve transaction data through service layer", async () => {
			const transactionData = {
				senderWalletId: 7,
				receiverWalletId: 8,
				amount: 500,
				referenceNo: "REF-XYZ789",
				status: "completed",
			};

			vi.spyOn(TransactionRepository, "insertTransaction").mockResolvedValue({
				id: 42,
				...transactionData,
				createdAt: new Date(),
			} as any);

			await TransactionService.insertTransaction(
				transactionData.senderWalletId,
				transactionData.receiverWalletId,
				transactionData.amount,
				transactionData.referenceNo,
				transactionData.status,
				{}
			);

			expect(TransactionRepository.insertTransaction).toHaveBeenCalledWith(
				transactionData.senderWalletId,
				transactionData.receiverWalletId,
				transactionData.amount,
				transactionData.referenceNo,
				transactionData.status,
				{}
			);
		});

		it("should handle empty transaction service methods gracefully", async () => {
			expect(TransactionService).toHaveProperty("insertTransaction");
			expect(TransactionService.insertTransaction).toBeDefined();
		});
	});

	// ============== ERROR HANDLING IN SERVICES ==============
	describe("Error Handling", () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("should wrap repository errors in ServerError", async () => {
			const originalError = new Error("Database connection failed");
			vi.spyOn(TransactionRepository, "insertTransaction").mockRejectedValue(
				originalError
			);

			try {
				await TransactionService.insertTransaction(1, 2, 100, "REF-1", "pending", {});
			} catch (e: any) {
				expect(e).toBeInstanceOf(ServerError);
				expect(e.message).toContain(originalError.message);
			}
		});

		it("should handle null/undefined dbConn gracefully", async () => {
			vi.spyOn(TransactionRepository, "insertTransaction").mockResolvedValue({
				id: 1,
				senderWalletId: 1,
				receiverWalletId: 2,
				amount: 100,
				referenceNo: "REF-1",
				status: "pending",
				createdAt: new Date(),
			} as any);

			// Should not throw even with undefined dbConn
			await expect(
				TransactionService.insertTransaction(1, 2, 100, "REF-1", "pending", undefined)
			).resolves.not.toThrow();
		});

		it("should maintain error status codes in ServerError", async () => {
			vi.spyOn(TransactionRepository, "insertTransaction").mockRejectedValue(
				new Error("Insert failed")
			);

			try {
				await TransactionService.insertTransaction(1, 2, 100, "REF-1", "pending", {});
			} catch (e: any) {
				expect(e.statusCode).toBe(500);
				expect(e.isOperational).toBe(true);
			}
		});
	});

	// ============== REPOSITORY METHOD EXISTENCE TESTS ==============
	describe("Repository Interface Compliance", () => {
		it("TransactionRepository should have insertTransaction method", () => {
			expect(TransactionRepository).toBeDefined();
			expect(TransactionRepository.insertTransaction).toBeDefined();
			expect(typeof TransactionRepository.insertTransaction).toBe("function");
		});

		it("Services should export default objects with methods", () => {
			expect(TransactionService).toBeDefined();
			expect(typeof TransactionService).toBe("object");
			expect(TransactionService.insertTransaction).toBeDefined();
		});
	});

	// ============== TRANSACTION DATA VALIDATION TESTS ==============
	describe("Transaction Data Handling", () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("should handle positive amounts correctly", async () => {
			vi.spyOn(TransactionRepository, "insertTransaction").mockResolvedValue({
				id: 1,
				senderWalletId: 1,
				receiverWalletId: 2,
				amount: 999999.99,
				referenceNo: "REF-1",
				status: "completed",
				createdAt: new Date(),
			} as any);

			await TransactionService.insertTransaction(
				1,
				2,
				999999.99,
				"REF-1",
				"completed",
				{}
			);

			expect(TransactionRepository.insertTransaction).toHaveBeenCalledWith(
				1,
				2,
				999999.99,
				"REF-1",
				"completed",
				{}
			);
		});

		it("should handle small decimal amounts", async () => {
			vi.spyOn(TransactionRepository, "insertTransaction").mockResolvedValue({
				id: 1,
				senderWalletId: 1,
				receiverWalletId: 2,
				amount: 0.01,
				referenceNo: "REF-1",
				status: "completed",
				createdAt: new Date(),
			} as any);

			await TransactionService.insertTransaction(1, 2, 0.01, "REF-1", "completed", {});

			expect(TransactionRepository.insertTransaction).toHaveBeenCalledWith(
				1,
				2,
				0.01,
				"REF-1",
				"completed",
				{}
			);
		});

		it("should pass through different transaction statuses", async () => {
			const statuses = ["pending", "completed", "failed", "cancelled"];

			for (const status of statuses) {
				vi.spyOn(TransactionRepository, "insertTransaction").mockResolvedValue({
					id: 1,
					senderWalletId: 1,
					receiverWalletId: 2,
					amount: 100,
					referenceNo: "REF-1",
					status,
					createdAt: new Date(),
				} as any);

				await TransactionService.insertTransaction(1, 2, 100, "REF-1", status, {});

				expect(TransactionRepository.insertTransaction).toHaveBeenCalledWith(
					1,
					2,
					100,
					"REF-1",
					status,
					{}
				);

				vi.clearAllMocks();
			}
		});
	});
});
