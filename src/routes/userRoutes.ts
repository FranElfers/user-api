import { Router } from "express";
import { getUserById, getActualUser, createUser, updateUser, deleteUser } from "../queries/userQueries";
import { authMiddleware, authorizeAdmin } from "../middleware/authMiddleware";


const router = Router();

/**
   * @openapi
   * /api/users:
   *   get:
   *     summary: Get current user info
   *     description: Returns the authenticated user's profile using the userId from the JWT token.
   *     tags:
   *       - Users
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/getUser'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *       404:
   *         description: User Not Found
   *       500:
   *         description: Internal error
*/
router.get("/users", authMiddleware, getActualUser);

/**
   * @openapi
   * /api/admin/users/{id}:
   *   get:
   *     summary: Get user info by his id (admin only)
   *     description: Returns user's profile using the userId from the query param.
   *     tags:
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *         description: User ID
   *     responses:
   *       200:
   *         description: User profile data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/getUser'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *       404:
   *         description: User Not Found
   *       500:
   *         description: Internal error
*/
router.get("/admin/users/:userId", authMiddleware, authorizeAdmin, getUserById);

/**
 * @openapi
 * /api/admin/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/postUser'
 *     responses:
 *       201:
 *         description: User created successfully, returns user data and JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/getUser'
 *                 token:
 *                   type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Unauthorized - Administrator-only access
 *       500:
 *         description: Error creating user
 */
router.post("/admin/users", authMiddleware, authorizeAdmin, createUser);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update an existing user (admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/postUser'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getUser'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Unauthorized - Administrator-only access
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating user
 */
router.put("/admin/users/:id", authMiddleware, authorizeAdmin, updateUser);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - not an admin
 *       404:
 *         description: User not found
 *       500:
 *         description: Error deleting user
 */
router.delete("/admin/users/:id", authMiddleware, authorizeAdmin, deleteUser);

export default router;