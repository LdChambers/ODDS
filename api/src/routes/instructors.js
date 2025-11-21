import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// Helper to apply school-based filtering
const getSchoolFilter = (user) => {
  if (user.hasGlobalPermissions) {
    return {}; // Can see all schools
  }
  return { fk_schoolID: user.fk_schoolID }; // Only their school
};

// GET /instructors
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'lastName', sortOrder = 'asc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { 
      deletedAt: null,
      ...getSchoolFilter(req.user)
    };

    const [instructors, total] = await Promise.all([
      prisma.instructor.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: parseInt(limit)
      }),
      prisma.instructor.count({ where })
    ]);

    res.json({
      instructors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({ error: 'Failed to fetch instructors' });
  }
});

// GET /instructors/:id
router.get('/:id', async (req, res) => {
  try {
    const instructor = await prisma.instructor.findFirst({
      where: {
        instructorID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      },
      include: {
        classes: {
          where: { deletedAt: null },
          include: {
            course: true,
            location: true,
            students: true
          }
        }
      }
    });

    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    res.json(instructor);
  } catch (error) {
    console.error('Error fetching instructor:', error);
    res.status(500).json({ error: 'Failed to fetch instructor' });
  }
});

// POST /instructors
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    
    // If user doesn't have global permissions, force their school
    if (!req.user.hasGlobalPermissions) {
      data.fk_schoolID = req.user.fk_schoolID;
    }
    
    const instructor = await prisma.instructor.create({
      data
    });

    res.status(201).json(instructor);
  } catch (error) {
    console.error('Error creating instructor:', error);
    res.status(500).json({ error: 'Failed to create instructor' });
  }
});

// PUT /instructors/:id
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.instructor.findFirst({
      where: {
        instructorID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    const data = { ...req.body };
    delete data.instructorID;
    delete data.createdAt;
    
    // If user doesn't have global permissions, force their school
    if (!req.user.hasGlobalPermissions) {
      data.fk_schoolID = req.user.fk_schoolID;
    }

    const instructor = await prisma.instructor.update({
      where: { instructorID: parseInt(req.params.id) },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    res.json(instructor);
  } catch (error) {
    console.error('Error updating instructor:', error);
    res.status(500).json({ error: 'Failed to update instructor' });
  }
});

// DELETE /instructors/:id
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.instructor.findFirst({
      where: {
        instructorID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    await prisma.instructor.update({
      where: { instructorID: parseInt(req.params.id) },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Instructor deleted successfully' });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    res.status(500).json({ error: 'Failed to delete instructor' });
  }
});

export default router;

