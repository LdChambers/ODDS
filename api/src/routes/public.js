import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Public enrollment - no auth required (UC-7)

// GET /public/states - Get list of states for forms
router.get('/states', async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      where: { deletedAt: null },
      orderBy: { priority: 'asc' },
      select: {
        stateID: true,
        name: true,
        abbreviation: true
      }
    });

    res.json({ states });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

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

// GET /public/classes/:id/students - Get list of students enrolled in class (public roster)
router.get('/classes/:id/students', async (req, res) => {
  try {
    const classData = await prisma.class.findFirst({
      where: {
        classID: parseInt(req.params.id),
        deletedAt: null
      },
      include: {
        students: {
          where: { deletedAt: null },
          select: {
            studentID: true,
            firstName: true,
            lastName: true
            // Only return basic info for privacy
          }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({
      students: classData.students,
      count: classData.students.length
    });
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
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

    // Get first available state (or create a default if none exists)
    let defaultState = await prisma.state.findFirst({
      where: { deletedAt: null },
      orderBy: { priority: 'asc' }
    });

    // If no states exist, create a default one
    if (!defaultState) {
      defaultState = await prisma.state.create({
        data: {
          name: 'Texas',
          abbreviation: 'TX',
          priority: 1
        }
      });
    }

    // Get first available class reason (or create default)
    let defaultClassReason = await prisma.classReason.findFirst({
      where: { deletedAt: null }
    });

    if (!defaultClassReason) {
      defaultClassReason = await prisma.classReason.create({
        data: {
          name: 'Ticket Dismissal',
          description: 'Taking course to dismiss traffic ticket',
          isDefault: 1,
          isCourtMandated: 1,
          priority: 1
        }
      });
    }

    const studentData = {
      ...req.body,
      fk_schoolID: classData.fk_schoolID,
      fk_classID: parseInt(req.params.id),
      fk_stateID: req.body.fk_stateID || defaultState.stateID,
      fk_licenseStateID: req.body.fk_licenseStateID || defaultState.stateID,
      fk_classReasonID: req.body.fk_classReasonID || defaultClassReason.classReasonID,
      birthDate: new Date(req.body.birthDate)
    };

    console.log('Attempting to create student with data:', studentData);

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
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    res.status(500).json({ 
      error: 'Failed to enroll student',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

