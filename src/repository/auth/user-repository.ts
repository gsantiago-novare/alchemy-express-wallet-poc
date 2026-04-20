import { DatabaseConnection } from "../../utils/db-connection.ts";
import type IUser from "../../interface/auth/IUser.ts";
import { ServerError } from "../../errors/index.ts";

const UserRepository = {
  registerUser: async (userData: IUser) => {
    const { username, password, mobileNumber } = userData;
    let dbConn;
    try {
      dbConn = await DatabaseConnection.connect();

      const insertQuery =
        "INSERT INTO users (username, password, mobile_number) VALUES ($1, $2, $3) RETURNING *";
      const result = await dbConn.query(insertQuery, [
        username,
        password,
        mobileNumber,
      ]);

      console.log("UserRepository.registerUser:", result.rows[0]);

      return result.rows[0];
    } catch (error) {
      console.error("Error inserting user:", error);
      throw new ServerError("Failed to insert user");
    } finally {
      dbConn?.release();
    }
  },
  findByMobileNumber: async (mobileNumber: string) => {
    let dbConn;
    try {
      dbConn = await DatabaseConnection.connect();

      const selectQuery = "SELECT * FROM users WHERE mobile_number = $1";
      const result = await dbConn.query(selectQuery, [mobileNumber]);

      console.log("UserRepository.findByMobileNumber:", result.rows[0]);

      return result.rows[0];
    } catch (error) {
      console.error("Error finding user:", error);
      throw new ServerError("Failed to find user");
    } finally {
      dbConn?.release();
    }
  },
  findByUserId: async (userId: number) => {
    let dbConn;
    try {
      dbConn = await DatabaseConnection.connect();

      const selectQuery = "SELECT * FROM users WHERE id = $1";
      const result = await dbConn.query(selectQuery, [userId]);

      console.log("UserRepository.findByUserId:", result.rows[0]);

      return result.rows[0];
    } catch (error) {
      console.error("Error finding user:", error);
      throw new ServerError("Failed to find user");
    } finally {
      dbConn?.release();
    }
  },
  findByUsername: async (username: string) => {
    let dbConn;
    try {
      dbConn = await DatabaseConnection.connect();

      const selectQuery = "SELECT * FROM users WHERE username = $1";
      const result = await dbConn.query(selectQuery, [username]);

      console.log("UserRepository.findByUsername:", result.rows[0]);

      return result.rows[0];
    } catch (error) {
      console.error("Error finding user:", error);
      throw new ServerError("Failed to find user");
    } finally {
      dbConn?.release();
    }
  },
  findByUserIdAndNumber: async (userId: number, mobileNumber: string) => {
    let dbConn;
    try {
      dbConn = await DatabaseConnection.connect();

      const selectQuery =
        "SELECT * FROM users WHERE id = $1 AND mobile_number = $2";
      const result = await dbConn.query(selectQuery, [userId, mobileNumber]);

      console.log("UserRepository.findByUserIdAndNumber:", result.rows[0]);

      return result.rows[0];
    } catch (error) {
      console.error("Error finding user:", error);
      throw new ServerError("Failed to find user");
    } finally {
      dbConn?.release();
    }
  },
};

export default UserRepository;
