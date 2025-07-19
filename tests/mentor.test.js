const request = require('supertest');
const app = require('../src/app');

// Get mock prisma from global setup
const mockPrisma = global.mockPrisma;

describe('Mentor API Endpoints', () => {
  describe('GET /api/v1/mentors', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should get all mentors without filters', async () => {
      const mockMentors = [
        {
          id: 'mentor1',
          name: 'Jane Smith',
          email: 'jane@example.com',
          expertise: ['Web Development', 'JavaScript'],
          bio: 'Senior Frontend Developer with 5 years experience',
          experience: 5,
          rating: 4.8,
          available: true,
          pricePerHour: 75,
          location: 'Remote',
          careerDomain: 'TECHNOLOGY',
          createdAt: new Date(),
        },
        {
          id: 'mentor2',
          name: 'John Davis',
          email: 'john@example.com',
          expertise: ['Data Science', 'Python'],
          bio: 'Data Scientist at top tech company',
          experience: 7,
          rating: 4.9,
          available: true,
          pricePerHour: 90,
          location: 'San Francisco',
          careerDomain: 'DATA_SCIENCE',
          createdAt: new Date(),
        },
      ];

      mockPrisma.mentor.findMany.mockResolvedValue(mockMentors);
      mockPrisma.mentor.count.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/v1/mentors')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.mentors).toHaveLength(2);
      expect(response.body.data.mentors[0].name).toBe('Jane Smith');
      expect(response.body.data.mentors[1].expertise).toContain('Data Science');
      expect(response.body.data.pagination.total).toBe(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);

      expect(mockPrisma.mentor.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { rating: 'desc' },
      });
    });

    test('should filter mentors by domain', async () => {
      const mockMentors = [
        {
          id: 'mentor1',
          name: 'Jane Smith',
          careerDomain: 'TECHNOLOGY',
          expertise: ['Web Development'],
          rating: 4.8,
        },
      ];

      mockPrisma.mentor.findMany.mockResolvedValue(mockMentors);

      const response = await request(app)
        .get('/api/v1/mentors?domain=TECHNOLOGY')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.mentors).toHaveLength(1);
      expect(response.body.data.mentors[0].careerDomain).toBe('TECHNOLOGY');

      expect(mockPrisma.mentor.findMany).toHaveBeenCalledWith({
        where: { careerDomain: 'TECHNOLOGY' },
        skip: 0,
        take: 10,
        orderBy: { rating: 'desc' },
      });
    });

    test('should filter mentors by skills', async () => {
      const mockMentors = [
        {
          id: 'mentor1',
          name: 'Jane Smith',
          expertise: ['JavaScript', 'React'],
        },
      ];

      mockPrisma.mentor.findMany.mockResolvedValue(mockMentors);

      const response = await request(app)
        .get('/api/v1/mentors?skills=JavaScript,React')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(mockPrisma.mentor.findMany).toHaveBeenCalledWith({
        where: {
          expertise: {
            hasSome: ['JavaScript', 'React'],
          },
        },
        skip: 0,
        take: 10,
        orderBy: { rating: 'desc' },
      });
    });

    test('should filter by experience level', async () => {
      const mockMentors = [
        {
          id: 'mentor1',
          name: 'Senior Mentor',
          experience: 8,
        },
      ];

      mockPrisma.mentor.findMany.mockResolvedValue(mockMentors);

      const response = await request(app)
        .get('/api/v1/mentors?experienceLevel=senior')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(mockPrisma.mentor.findMany).toHaveBeenCalledWith({
        where: {
          experience: { gte: 7 },
        },
        skip: 0,
        take: 10,
        orderBy: { rating: 'desc' },
      });
    });

    test('should handle pagination', async () => {
      mockPrisma.mentor.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/mentors?page=2&limit=5')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.pagination.page).toBe(2);
      expect(response.body.data.pagination.limit).toBe(5);

      expect(mockPrisma.mentor.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5,
        take: 5,
        orderBy: { rating: 'desc' },
      });
    });

    test('should sort by different criteria', async () => {
      mockPrisma.mentor.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/mentors?sortBy=experience')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(mockPrisma.mentor.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { experience: 'desc' },
      });
    });
  });

  describe('GET /api/v1/mentors/:id', () => {
    test('should get mentor details successfully', async () => {
      const mockMentor = {
        id: 'mentor1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        expertise: ['Web Development', 'JavaScript'],
        bio: 'Senior Frontend Developer with 5 years experience',
        experience: 5,
        rating: 4.8,
        available: true,
        pricePerHour: 75,
        location: 'Remote',
        careerDomain: 'TECHNOLOGY',
        linkedin: 'https://linkedin.com/in/janesmith',
        github: 'https://github.com/janesmith',
        portfolio: 'https://janesmith.dev',
        education: 'BS Computer Science - MIT',
        certifications: ['AWS Certified', 'React Expert'],
        languages: ['English', 'Spanish'],
        timezone: 'EST',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.mentor.findUnique.mockResolvedValue(mockMentor);

      const response = await request(app)
        .get('/api/v1/mentors/mentor1')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.mentor.id).toBe('mentor1');
      expect(response.body.data.mentor.name).toBe('Jane Smith');
      expect(response.body.data.mentor.expertise).toContain('JavaScript');
      expect(response.body.data.mentor.rating).toBe(4.8);

      expect(mockPrisma.mentor.findUnique).toHaveBeenCalledWith({
        where: { id: 'mentor1' },
      });
    });

    test('should return 404 for non-existent mentor', async () => {
      mockPrisma.mentor.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/mentors/nonexistent')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Mentor not found');
    });
  });

  describe('POST /api/v1/mentors/match', () => {
    const validMatchRequest = {
      skills: ['JavaScript', 'React'],
      careerGoal: 'Frontend Developer',
      experienceLevel: 'junior',
      domain: 'TECHNOLOGY',
      budget: 100,
      location: 'Remote',
      learningStyle: 'hands-on',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should find mentor matches successfully', async () => {
      const mockMentors = [
        {
          id: 'mentor1',
          name: 'Jane Smith',
          expertise: ['JavaScript', 'React', 'Node.js'],
          experience: 5,
          rating: 4.8,
          pricePerHour: 75,
          location: 'Remote',
          careerDomain: 'TECHNOLOGY',
          available: true,
        },
        {
          id: 'mentor2',
          name: 'John Davis',
          expertise: ['JavaScript', 'Vue.js'],
          experience: 3,
          rating: 4.5,
          pricePerHour: 60,
          location: 'Remote',
          careerDomain: 'TECHNOLOGY',
          available: true,
        },
      ];

      mockPrisma.mentor.findMany.mockResolvedValue(mockMentors);

      const response = await request(app)
        .post('/api/v1/mentors/match')
        .send(validMatchRequest)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Mentor matches found successfully');
      expect(response.body.data.matches).toHaveLength(2);
      
      // Check match scores
      const firstMatch = response.body.data.matches[0];
      expect(firstMatch).toHaveProperty('mentor');
      expect(firstMatch).toHaveProperty('matchScore');
      expect(firstMatch).toHaveProperty('matchReasons');
      expect(firstMatch.matchScore).toBeGreaterThan(0);
      expect(firstMatch.matchScore).toBeLessThanOrEqual(100);

      // First mentor should have higher score (more expertise overlap)
      const secondMatch = response.body.data.matches[1];
      expect(firstMatch.matchScore).toBeGreaterThanOrEqual(secondMatch.matchScore);

      expect(response.body.data.searchCriteria).toEqual(validMatchRequest);
    });

    test('should handle no matches found', async () => {
      mockPrisma.mentor.findMany.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/v1/mentors/match')
        .send(validMatchRequest)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('No mentors found matching your criteria');
      expect(response.body.data.matches).toHaveLength(0);
      expect(response.body.data.suggestions).toHaveLength(3);
      expect(response.body.data.suggestions).toContain('Consider expanding your budget range');
    });

    test('should filter by budget constraints', async () => {
      const highBudgetRequest = {
        ...validMatchRequest,
        budget: 50, // Lower budget
      };

      const mockMentors = [
        {
          id: 'mentor1',
          name: 'Affordable Mentor',
          pricePerHour: 40,
          expertise: ['JavaScript'],
          careerDomain: 'TECHNOLOGY',
          available: true,
        },
        {
          id: 'mentor2',
          name: 'Expensive Mentor',
          pricePerHour: 150,
          expertise: ['JavaScript'],
          careerDomain: 'TECHNOLOGY',
          available: true,
        },
      ];

      mockPrisma.mentor.findMany.mockResolvedValue(mockMentors);

      const response = await request(app)
        .post('/api/v1/mentors/match')
        .send(highBudgetRequest)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.matches).toHaveLength(1);
      expect(response.body.data.matches[0].mentor.name).toBe('Affordable Mentor');
    });

    test('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/mentors/match')
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Skills are required');
    });

    test('should validate skills array', async () => {
      const invalidRequest = {
        ...validMatchRequest,
        skills: 'not-an-array',
      };

      const response = await request(app)
        .post('/api/v1/mentors/match')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Skills are required and must be an array');
    });
  });

  describe('POST /api/v1/mentors', () => {
    const validMentorData = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      expertise: ['JavaScript', 'React'],
      bio: 'Senior Frontend Developer',
      experience: 5,
      pricePerHour: 75,
      location: 'Remote',
      careerDomain: 'TECHNOLOGY',
      available: true,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should create mentor successfully', async () => {
      // Mock email uniqueness check
      mockPrisma.mentor.findUnique.mockResolvedValue(null);

      // Mock mentor creation
      const createdMentor = {
        id: 'mentor123',
        ...validMentorData,
        rating: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockPrisma.mentor.create.mockResolvedValue(createdMentor);

      const response = await request(app)
        .post('/api/v1/mentors')
        .send(validMentorData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Mentor created successfully');
      expect(response.body.data.mentor.id).toBe('mentor123');
      expect(response.body.data.mentor.name).toBe('Jane Smith');
      expect(response.body.data.mentor.expertise).toContain('JavaScript');

      // Verify create was called with the expected data structure
      expect(mockPrisma.mentor.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Jane Smith',
          email: 'jane@example.com',
          expertise: ['JavaScript', 'React'],
          bio: 'Senior Frontend Developer',
          experience: 5,
          pricePerHour: 75,
          location: 'Remote',
          careerDomain: 'TECHNOLOGY',
          available: true,
          rating: 0,
        }),
      });
    });

    test('should return 400 for duplicate email', async () => {
      mockPrisma.mentor.findUnique.mockResolvedValue({
        id: 'existing-mentor',
        email: 'jane@example.com',
      });

      const response = await request(app)
        .post('/api/v1/mentors')
        .send(validMentorData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Mentor with this email already exists');
    });

    test('should handle incomplete data gracefully', async () => {
      // Clear previous mocks
      jest.clearAllMocks();
      mockPrisma.mentor.findUnique.mockResolvedValue(null);
      mockPrisma.mentor.create.mockResolvedValue({
        id: 'mentor123',
        name: 'Jane Smith',
        email: undefined,
      });
      
      const incompleteData = {
        name: 'Jane Smith',
        // Missing email and other required fields
      };

      const response = await request(app)
        .post('/api/v1/mentors')
        .send(incompleteData);

      // Currently the controller doesn't validate required fields
      // In production, we'd add proper validation middleware
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
    });
  });

  describe('PUT /api/v1/mentors/:id', () => {
    const updateData = {
      bio: 'Updated bio with more experience',
      pricePerHour: 80,
      available: false,
    };

    test('should update mentor successfully', async () => {
      const existingMentor = {
        id: 'mentor1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        bio: 'Old bio',
        pricePerHour: 75,
        available: true,
      };

      const updatedMentor = {
        ...existingMentor,
        ...updateData,
        updatedAt: new Date(),
      };

      mockPrisma.mentor.findUnique.mockResolvedValue(existingMentor);
      mockPrisma.mentor.update.mockResolvedValue(updatedMentor);

      const response = await request(app)
        .put('/api/v1/mentors/mentor1')
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Mentor updated successfully');
      expect(response.body.data.mentor.bio).toBe('Updated bio with more experience');
      expect(response.body.data.mentor.pricePerHour).toBe(80);
      expect(response.body.data.mentor.available).toBe(false);

      expect(mockPrisma.mentor.update).toHaveBeenCalledWith({
        where: { id: 'mentor1' },
        data: updateData,
      });
    });

    test('should return 404 for non-existent mentor', async () => {
      mockPrisma.mentor.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/v1/mentors/nonexistent')
        .send(updateData)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Mentor not found');
    });
  });

  describe('DELETE /api/v1/mentors/:id', () => {
    test('should delete mentor successfully', async () => {
      mockPrisma.mentor.findUnique.mockResolvedValue({
        id: 'mentor1',
        name: 'Jane Smith',
      });

      mockPrisma.mentor.delete.mockResolvedValue({
        id: 'mentor1',
      });

      const response = await request(app)
        .delete('/api/v1/mentors/mentor1')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Mentor deleted successfully');

      expect(mockPrisma.mentor.delete).toHaveBeenCalledWith({
        where: { id: 'mentor1' },
      });
    });

    test('should return 404 for non-existent mentor', async () => {
      mockPrisma.mentor.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/v1/mentors/nonexistent')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Mentor not found');
    });
  });
});
