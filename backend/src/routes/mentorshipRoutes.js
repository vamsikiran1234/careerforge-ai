const express = require('express');
const {
  registerMentor,
  verifyMentorEmail,
  getMyMentorProfile,
  updateMentorProfile,
  getAllMentors,
  getMentorById,
  sendConnectionRequest,
  getMyConnections,
  acceptConnectionRequest,
  declineConnectionRequest,
  deleteConnection,
  getPendingMentors,
  approveMentor,
  rejectMentor,
} = require('../controllers/mentorshipController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');

const router = express.Router();

// Public Routes

/**
 * @swagger
 * /mentorship/verify/{token}:
 *   get:
 *     summary: Verify mentor email
 *     description: Verify mentor registration via email token
 *     tags: [Mentorship]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify/:token', verifyMentorEmail);

// Protected Routes - Mentor Registration & Profile Management

/**
 * @swagger
 * /mentorship/register:
 *   post:
 *     summary: Register as a mentor
 *     description: Register the authenticated user as a mentor
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [expertise, yearsOfExperience, bio]
 *             properties:
 *               expertise:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Software Engineering, Career Development]
 *               yearsOfExperience:
 *                 type: integer
 *                 example: 5
 *               bio:
 *                 type: string
 *                 example: Experienced software engineer helping others grow
 *               company:
 *                 type: string
 *                 example: Google
 *               linkedIn:
 *                 type: string
 *                 example: https://linkedin.com/in/johndoe
 *     responses:
 *       201:
 *         description: Mentor registration submitted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/register', authenticateToken, registerMentor);

/**
 * @swagger
 * /mentorship/profile:
 *   get:
 *     summary: Get my mentor profile
 *     description: Retrieve the authenticated user's mentor profile
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mentor profile retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Mentor profile not found
 */
router.get('/profile', authenticateToken, getMyMentorProfile);

/**
 * @swagger
 * /mentorship/profile:
 *   put:
 *     summary: Update mentor profile
 *     description: Update the authenticated user's mentor profile information
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expertise:
 *                 type: array
 *                 items:
 *                   type: string
 *               yearsOfExperience:
 *                 type: integer
 *               bio:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/profile', authenticateToken, updateMentorProfile);

// Protected Routes - Mentor Discovery

/**
 * @swagger
 * /mentorship/mentors:
 *   get:
 *     summary: Get all mentors
 *     description: Retrieve list of all verified mentors with filtering options
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: expertise
 *         schema:
 *           type: string
 *         description: Filter by expertise area
 *       - in: query
 *         name: yearsOfExperience
 *         schema:
 *           type: integer
 *         description: Minimum years of experience
 *     responses:
 *       200:
 *         description: Mentors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     mentors:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/mentors', authenticateToken, getAllMentors);

/**
 * @swagger
 * /mentorship/mentors/{id}:
 *   get:
 *     summary: Get mentor details
 *     description: Get detailed information about a specific mentor
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mentor details retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/mentors/:id', authenticateToken, getMentorById);

// Protected Routes - Connection Requests

/**
 * @swagger
 * /mentorship/connections/request:
 *   post:
 *     summary: Send connection request
 *     description: Send a mentorship connection request to a mentor
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mentorId, message]
 *             properties:
 *               mentorId:
 *                 type: string
 *               message:
 *                 type: string
 *                 example: I would love to learn from your experience
 *     responses:
 *       201:
 *         description: Connection request sent successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/connections/request', authenticateToken, sendConnectionRequest);

/**
 * @swagger
 * /mentorship/connections:
 *   get:
 *     summary: Get my connections
 *     description: Retrieve all mentorship connections (both as student and mentor)
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connections retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/connections', authenticateToken, getMyConnections);

/**
 * @swagger
 * /mentorship/connections/{id}/accept:
 *   post:
 *     summary: Accept connection request
 *     description: Accept a pending mentorship connection request
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection request accepted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/connections/:id/accept', authenticateToken, acceptConnectionRequest);

/**
 * @swagger
 * /mentorship/connections/{id}/decline:
 *   post:
 *     summary: Decline connection request
 *     description: Decline a pending mentorship connection request
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection request declined
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/connections/:id/decline', authenticateToken, declineConnectionRequest);

/**
 * @swagger
 * /mentorship/connections/{id}:
 *   delete:
 *     summary: Delete connection
 *     description: Delete an existing mentorship connection
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/connections/:id', authenticateToken, deleteConnection);

// Admin Routes - Mentor Verification

/**
 * @swagger
 * /mentorship/admin/mentors/pending:
 *   get:
 *     summary: Get pending mentor registrations
 *     description: Retrieve all pending mentor registrations (Admin only)
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending mentors retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/admin/mentors/pending', authenticateToken, isAdmin, getPendingMentors);

/**
 * @swagger
 * /mentorship/admin/mentors/{id}/approve:
 *   post:
 *     summary: Approve mentor registration
 *     description: Approve a pending mentor registration (Admin only)
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mentor approved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/admin/mentors/:id/approve', authenticateToken, isAdmin, approveMentor);

/**
 * @swagger
 * /mentorship/admin/mentors/{id}/reject:
 *   post:
 *     summary: Reject mentor registration
 *     description: Reject a pending mentor registration (Admin only)
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mentor rejected successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/admin/mentors/:id/reject', authenticateToken, isAdmin, rejectMentor);


module.exports = router;
