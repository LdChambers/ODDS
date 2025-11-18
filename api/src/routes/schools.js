import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

const getSchoolFilter = (user) => {
  if (user.hasGlobalPermissions) return {};
  return { schoolID: user.fk_schoolID };
};

// GET /schools - List all schools
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deletedAt: null,
      ...getSchoolFilter(req.user)
    };

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
              students: true,
              classes: true,
              locations: true,
              instructors: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: parseInt(limit)
      }),
      prisma.school.count({ where })
    ]);

    res.json({
      schools,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// GET /schools/:id
router.get('/:id', async (req, res) => {
  try {
    const school = await prisma.school.findFirst({
      where: {
        schoolID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      },
      include: {
        users: {
          where: { deletedAt: null }
        },
        students: {
          where: { deletedAt: null }
        },
        classes: {
          where: { deletedAt: null }
        },
        locations: {
          where: { deletedAt: null }
        },
        instructors: {
          where: { deletedAt: null }
        }
      }
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ error: 'Failed to fetch school' });
  }
});

// POST /schools - Create new school (admin only)
router.post('/', async (req, res) => {
  try {
    if (!req.user.hasGlobalPermissions) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const school = await prisma.school.create({
      data: req.body
    });

    res.status(201).json(school);
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ error: 'Failed to create school' });
  }
});

// PUT /schools/:id - Update school
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.school.findFirst({
      where: {
        schoolID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'School not found' });
    }

    const data = { ...req.body };
    delete data.schoolID;
    delete data.createdAt;

    const school = await prisma.school.update({
      where: { schoolID: parseInt(req.params.id) },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    res.json(school);
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ error: 'Failed to update school' });
  }
});

// DELETE /schools/:id (soft delete, admin only)
router.delete('/:id', async (req, res) => {
  try {
    if (!req.user.hasGlobalPermissions) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const existing = await prisma.school.findFirst({
      where: {
        schoolID: parseInt(req.params.id),
        deletedAt: null
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'School not found' });
    }

    await prisma.school.update({
      where: { schoolID: parseInt(req.params.id) },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ error: 'Failed to delete school' });
  }
});

export default router;

