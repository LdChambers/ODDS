import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

const getSchoolFilter = (user) => {
  if (user.hasGlobalPermissions) return {};
  return { fk_schoolID: user.fk_schoolID };
};

// GET /locations
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deletedAt: null,
      ...getSchoolFilter(req.user)
    };

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        include: {
          school: true
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: parseInt(limit)
      }),
      prisma.location.count({ where })
    ]);

    res.json({
      locations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// GET /locations/:id
router.get('/:id', async (req, res) => {
  try {
    const location = await prisma.location.findFirst({
      where: {
        locationID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      },
      include: {
        school: true,
        classes: {
          where: { deletedAt: null },
          include: {
            course: true,
            instructor: true
          }
        }
      }
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// POST /locations
router.post('/', async (req, res) => {
  try {
    const data = {
      ...req.body,
      fk_schoolID: req.user.hasGlobalPermissions ? req.body.fk_schoolID : req.user.fk_schoolID
    };

    // Remove number field if provided - it will be auto-generated
    delete data.number;

    // Create location first to get the auto-incremented ID
    const location = await prisma.location.create({
      data,
      include: {
        school: true
      }
    });

    // Auto-generate location number based on locationID (padded to 3 digits)
    const generatedNumber = String(location.locationID).padStart(3, '0');
    
    // Update location with generated number
    const updatedLocation = await prisma.location.update({
      where: { locationID: location.locationID },
      data: { number: generatedNumber },
      include: {
        school: true
      }
    });

    res.status(201).json(updatedLocation);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// PUT /locations/:id
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.location.findFirst({
      where: {
        locationID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const data = { ...req.body };
    delete data.locationID;
    delete data.createdAt;
    delete data.number; // Location number is auto-generated, cannot be manually changed

    const location = await prisma.location.update({
      where: { locationID: parseInt(req.params.id) },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        school: true
      }
    });

    res.json(location);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// DELETE /locations/:id
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.location.findFirst({
      where: {
        locationID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Location not found' });
    }

    await prisma.location.update({
      where: { locationID: parseInt(req.params.id) },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

export default router;

