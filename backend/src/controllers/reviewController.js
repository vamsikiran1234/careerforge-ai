const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createNotificationHelper } = require('./notificationController');

// @desc    Create a review for a mentor after a session
// @route   POST /api/v1/reviews
// @access  Private (student only)
const createReview = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const {
      mentorId,
      sessionId,
      overallRating,
      communicationRating,
      knowledgeRating,
      helpfulnessRating,
      comment,
      isPublic = true,
    } = req.body;

    // Validation
    if (!mentorId || !overallRating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mentor ID and overall rating',
      });
    }

    if (overallRating < 1 || overallRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Verify mentor exists
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    // If sessionId provided, verify session exists and is completed
    if (sessionId) {
      const session = await prisma.mentorSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      if (session.studentId !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'You can only review your own sessions',
        });
      }

      if (session.status !== 'COMPLETED') {
        return res.status(400).json({
          success: false,
          message: 'You can only review completed sessions',
        });
      }

      // Check if review already exists for this session
      const existingReview = await prisma.mentorReview.findUnique({
        where: {
          mentorId_studentId_sessionId: {
            mentorId,
            studentId,
            sessionId,
          },
        },
      });

      if (existingReview) {
        return res.status(409).json({
          success: false,
          message: 'You have already reviewed this session',
        });
      }
    }

    // Check if there's an active connection
    const connection = await prisma.mentorConnection.findFirst({
      where: {
        mentorId,
        studentId: studentId,
        status: 'ACCEPTED',
      },
    });

    if (!connection && !sessionId) {
      return res.status(403).json({
        success: false,
        message: 'You must have an active connection with this mentor to leave a review',
      });
    }

    // Create the review
    const review = await prisma.mentorReview.create({
      data: {
        mentorId,
        studentId,
        sessionId: sessionId || null,
        overallRating,
        communicationRating: communicationRating || null,
        knowledgeRating: knowledgeRating || null,
        helpfulnessRating: helpfulnessRating || null,
        comment: comment || null,
        isPublic,
      },
      include: {
        mentor: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Recalculate mentor's average rating
    await updateMentorAverageRating(mentorId);

    // Create notification for mentor
    try {
      await createNotificationHelper({
        userId: mentorProfile.userId,
        type: 'NEW_REVIEW',
        title: 'New Review Received',
        message: `You received a ${overallRating}-star review`,
        actionUrl: '/mentor/reviews',
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Don't fail the entire request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message,
    });
  }
};

// Helper function to update mentor's average rating
const updateMentorAverageRating = async (mentorId) => {
  try {
    // Get all public reviews for the mentor
    const reviews = await prisma.mentorReview.findMany({
      where: {
        mentorId,
        isPublic: true,
      },
      select: {
        overallRating: true,
      },
    });

    if (reviews.length === 0) {
      await prisma.mentorProfile.update({
        where: { id: mentorId },
        data: {
          averageRating: 0,
        },
      });
      return;
    }

    // Calculate average
    const totalRating = reviews.reduce((sum, review) => sum + review.overallRating, 0);
    const averageRating = totalRating / reviews.length;

    // Update mentor profile
    await prisma.mentorProfile.update({
      where: { id: mentorId },
      data: {
        averageRating: parseFloat(averageRating.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('Update average rating error:', error);
  }
};

// @desc    Get all reviews for a mentor
// @route   GET /api/v1/reviews/mentor/:mentorId
// @access  Public
const getMentorReviews = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Verify mentor exists
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      select: {
        id: true,
        averageRating: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    // Get total count
    const totalReviews = await prisma.mentorReview.count({
      where: {
        mentorId,
        isPublic: true,
      },
    });

    // Get paginated reviews
    const reviews = await prisma.mentorReview.findMany({
      where: {
        mentorId,
        isPublic: true,
      },
      include: {
        mentor: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    // Calculate rating distribution
    const allReviews = await prisma.mentorReview.findMany({
      where: {
        mentorId,
        isPublic: true,
      },
      select: {
        overallRating: true,
      },
    });

    const ratingDistribution = {
      5: allReviews.filter(r => r.overallRating === 5).length,
      4: allReviews.filter(r => r.overallRating === 4).length,
      3: allReviews.filter(r => r.overallRating === 3).length,
      2: allReviews.filter(r => r.overallRating === 2).length,
      1: allReviews.filter(r => r.overallRating === 1).length,
    };

    res.status(200).json({
      success: true,
      data: {
        mentor: mentorProfile,
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasMore: parseInt(page) * parseInt(limit) < totalReviews,
        },
        statistics: {
          averageRating: mentorProfile.averageRating,
          totalReviews,
          ratingDistribution,
        },
      },
    });
  } catch (error) {
    console.error('Get mentor reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// @desc    Update a review
// @route   PUT /api/v1/reviews/:id
// @access  Private (review author only)
const updateReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const {
      overallRating,
      communicationRating,
      knowledgeRating,
      helpfulnessRating,
      comment,
      isPublic,
    } = req.body;

    // Find the review
    const review = await prisma.mentorReview.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user is the author
    if (review.studentId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews',
      });
    }

    // Validate rating if provided
    if (overallRating && (overallRating < 1 || overallRating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Update the review
    const updatedReview = await prisma.mentorReview.update({
      where: { id },
      data: {
        ...(overallRating !== undefined && { overallRating }),
        ...(communicationRating !== undefined && { communicationRating }),
        ...(knowledgeRating !== undefined && { knowledgeRating }),
        ...(helpfulnessRating !== undefined && { helpfulnessRating }),
        ...(comment !== undefined && { comment }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        mentor: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Recalculate mentor's average rating if overall rating changed
    if (overallRating !== undefined || isPublic !== undefined) {
      await updateMentorAverageRating(review.mentorId);
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview,
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message,
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private (review author only)
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Find the review
    const review = await prisma.mentorReview.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user is the author
    if (review.studentId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews',
      });
    }

    // Delete the review
    await prisma.mentorReview.delete({
      where: { id },
    });

    // Recalculate mentor's average rating
    await updateMentorAverageRating(review.mentorId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
};

// @desc    Mentor responds to a review
// @route   POST /api/v1/reviews/:id/respond
// @access  Private (mentor only)
const mentorRespondToReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { mentorResponse } = req.body;

    if (!mentorResponse || mentorResponse.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a response',
      });
    }

    // Find the review
    const review = await prisma.mentorReview.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user is the mentor
    if (review.mentor.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the mentor can respond to this review',
      });
    }

    // Update review with mentor response
    const updatedReview = await prisma.mentorReview.update({
      where: { id },
      data: {
        mentorResponse: mentorResponse.trim(),
        respondedAt: new Date(),
      },
      include: {
        mentor: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Create notification for student
    try {
      await createNotificationHelper({
        userId: review.studentId,
        type: 'REVIEW_RESPONSE',
        title: 'Mentor Responded to Your Review',
        message: `${updatedReview.mentor.user.name} responded to your review`,
        actionUrl: `/mentor/${review.mentorId}`,
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Response submitted successfully',
      data: updatedReview,
    });
  } catch (error) {
    console.error('Mentor respond to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to review',
      error: error.message,
    });
  }
};

// @desc    Get user's reviews (as a student)
// @route   GET /api/v1/reviews/my-reviews
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.userId;

    const reviews = await prisma.mentorReview.findMany({
      where: {
        studentId: userId,
      },
      include: {
        mentor: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            company: true,
            jobTitle: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your reviews',
      error: error.message,
    });
  }
};

// @desc    Get reviews received by mentor (for mentor dashboard)
// @route   GET /api/v1/reviews/received
// @access  Private (mentor only)
const getReceivedReviews = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get mentor profile
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found',
      });
    }

    const reviews = await prisma.mentorReview.findMany({
      where: {
        mentorId: mentorProfile.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: mentorProfile.averageRating,
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    console.error('Get received reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch received reviews',
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getMentorReviews,
  updateReview,
  deleteReview,
  mentorRespondToReview,
  getMyReviews,
  getReceivedReviews,
};
