# Unit Tests for Wallet API

This directory contains comprehensive unit tests for all endpoints in the Alchemy Hapi Wallet POC project.

## Test Coverage

### Authentication Endpoints

#### Registration Tests (`POST /hapi/authentication/registration`)
- ✅ Successfully register with valid credentials
- ✅ Username validation (required, 3-50 characters)
- ✅ Password validation (minimum 8 characters)
- ✅ Mobile number validation (PH format: 09XXXXXXXXX)
- ✅ Duplicate mobile number check
- ❌ Missing required fields
- ❌ Invalid formats

#### Login Tests (`POST /hapi/authentication/login`)
- ✅ Login with username + password
- ✅ Login with mobile number + password
- ✅ Returns user data with wallet information
- ❌ User not found (404)
- ❌ Invalid password (401)
- ❌ Wallet not found (404)
- ❌ Missing required fields
- ❌ Neither username nor mobile number provided

### Transaction Endpoints

#### Transfer Tests (`POST /hapi/transaction/transfer`)
- ✅ Successfully transfer money between wallets
- ✅ Validates sender and receiver are different wallets
- ✅ Validates amount is positive
- ✅ Handles large transfer amounts
- ✅ Handles small decimal amounts (0.01)
- ❌ Same sender and receiver wallet
- ❌ Zero or negative amounts
- ❌ Missing required fields
- ❌ Insufficient balance
- ❌ Wallet not found scenarios

### Error Handling
- ✅ Proper 404 responses for non-existent routes
- ✅ Formatted error responses with status code and message
- ✅ Custom error messages from services
- ✅ No duplicate error messages

## Running Tests

### Install dependencies
```bash
npm install
```

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Generate coverage report
```bash
npm run test:coverage
```

## Test Structure

The test file is organized into logical groups:

1. **Registration Tests** - User registration scenarios
2. **Login Tests** - User authentication scenarios
3. **Transfer Tests** - Money transfer functionality
4. **Error Handling** - Global error handling and formatting
5. **Edge Cases** - Boundary and unusual input scenarios

## Mocking Strategy

Tests use `vi.spyOn()` to mock service methods, allowing tests to:
- Control service responses
- Test error conditions without database
- Verify API contract without dependencies
- Run tests independently and quickly

## Test Data

Sample test data includes:
- Username: `testuser123`, `alice_wallet`
- Mobile: `09170000001`, `09170000099`
- Wallet IDs: 1, 2, 999
- Amounts: 100, 0, -100, 0.01, 999999999.99

## Adding New Tests

To add new test scenarios:

1. Add the test case to the appropriate `describe` block
2. Use the existing test structure as a template
3. Mock services as needed using `vi.spyOn()`
4. Assert on both status code and response body
5. Run tests to verify they pass

Example:
```typescript
it("should handle [specific scenario]", async () => {
  const payload = { /* test data */ };
  
  vi.spyOn(UserService, "login").mockResolvedValue(/* expected result */);
  
  const res = await server.inject({
    method: "POST",
    url: "/hapi/authentication/login",
    payload,
  });
  
  expect(res.statusCode).toBe(200);
  expect(JSON.parse(res.payload)).toHaveProperty("message");
});
```

## Known Limitations

- Tests use mocked services (no database interactions)
- Integration tests would require a test database
- Some edge cases may vary based on business logic implementation
- Mobile number validation is specific to Philippine format

## Future Improvements

- Add integration tests with test database
- Add performance/load testing with autocannon
- Add JWT token validation tests (if implementing auth)
- Add comprehensive error scenario matrix
- Add fixtures for consistent test data
