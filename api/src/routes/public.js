import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Public enrollment - no auth required (UC-7)
// GET /public/classes/:id - Get public class info for enrollment
router.get('/classes/:id', async (req, res) => {
  try {
    const classData = await prisma.class.findFirst({
      where: {
        classID: parseInt(req.params.id),
        deletedAt: null
      },
      include: {
        school: true,
        location: true,
        course: true,
        instructor: true
      }
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Return limited public info
    res.json({
      classID: classData.classID,
      courseName: classData.course?.name,
      completionDate: classData.completionDate,
      locationName: classData.location?.name,
      locationAddress: {
        addressLine1: classData.location?.addressLine1,
        addressLine2: classData.location?.addressLine2,
        city: classData.location?.city,
        zipCode: classData.location?.zipCode
      },
      instructorName: classData.instructor 
        ? `${classData.instructor.firstName} ${classData.instructor.lastName}`
        : null
    });
  } catch (error) {
    console.error('Error fetching public class:', error);
    res.status(500).json({ error: 'Failed to fetch class information' });
  }
});

// POST /public/classes/:id/students - Public student enrollment
router.post('/classes/:id/students', async (req, res) => {
  try {
    const classData = await prisma.class.findFirst({
      where: {
        classID: parseInt(req.params.id),
        deletedAt: null
      }
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const studentData = {
      ...req.body,
      fk_schoolID: classData.fk_schoolID,
      fk_classID: parseInt(req.params.id),
      birthDate: new Date(req.body.birthDate)
    };

    const student = await prisma.student.create({
      data: studentData
    });

    res.status(201).json({
      message: 'Enrollment successful',
      studentID: student.studentID,
      firstName: student.firstName,
      lastName: student.lastName
    });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ error: 'Failed to enroll student' });
  }
});

export default router;

