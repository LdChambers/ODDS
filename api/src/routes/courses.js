import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// GET /courses
router.get('/', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        deletedAt: null,
        isActive: 1
      },
      orderBy: { priority: 'asc' }
    });

    res.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /courses/:id
router.get('/:id', async (req, res) => {
  try {
    const course = await prisma.course.findFirst({
      where: {
        courseID: parseInt(req.params.id),
        deletedAt: null
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// POST /courses
router.post('/', async (req, res) => {
  try {
    const course = await prisma.course.create({
      data: req.body
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// PUT /courses/:id
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.course.findFirst({
      where: {
        courseID: parseInt(req.params.id),
        deletedAt: null
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const data = { ...req.body };
    delete data.courseID;

    const course = await prisma.course.update({
      where: { courseID: parseInt(req.params.id) },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    res.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

export default router;

