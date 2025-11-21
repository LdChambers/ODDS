import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import QRCode from 'qrcode';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

const getSchoolFilter = (user) => {
  if (user.hasGlobalPermissions) return {};
  return { fk_schoolID: user.fk_schoolID };
};

// GET /classes - List all classes
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'completionDate', sortOrder = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deletedAt: null,
      ...getSchoolFilter(req.user)
    };

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: {
          school: true,
          location: true,
          course: true,
          instructor: true,
          students: {
            where: { deletedAt: null }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: parseInt(limit)
      }),
      prisma.class.count({ where })
    ]);

    // Add computed fields
    const classesWithMeta = classes.map(c => ({
      ...c,
      studentCount: c.students.length,
      paidCount: c.students.filter(s => s.isPaid).length,
      processedCount: c.students.filter(s => s.dateProcessed).length
    }));

    res.json({
      classes: classesWithMeta,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// GET /classes/:id
router.get('/:id', async (req, res) => {
  try {
    const classData = await prisma.class.findFirst({
      where: {
        classID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      },
      include: {
        school: true,
        location: true,
        course: true,
        instructor: true,
        students: {
          where: { deletedAt: null },
          include: {
            state: true,
            licenseState: true,
            classReason: true
          }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

// POST /classes - Create new class (UC-1)
router.post('/', async (req, res) => {
  try {
    console.log('=== CREATE CLASS REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', {
      userID: req.user.userID,
      hasGlobalPermissions: req.user.hasGlobalPermissions,
      fk_schoolID: req.user.fk_schoolID
    });

    const data = {
      ...req.body,
      fk_schoolID: req.user.hasGlobalPermissions ? req.body.fk_schoolID : req.user.fk_schoolID,
      completionDate: req.body.completionDate ? new Date(req.body.completionDate) : null
    };

    console.log('Data to be inserted:', JSON.stringify(data, null, 2));

    // Validate required foreign keys exist
    console.log('Validating foreign keys...');
    if (data.fk_schoolID) {
      console.log('Checking school ID:', data.fk_schoolID);
      const schoolExists = await prisma.school.findFirst({
        where: { schoolID: parseInt(data.fk_schoolID), deletedAt: null }
      });
      if (!schoolExists) {
        console.error('School not found:', data.fk_schoolID);
        return res.status(400).json({ error: 'Invalid school ID' });
      }
      console.log('School validated:', schoolExists.name);
    }

    if (data.fk_locationID) {
      console.log('Checking location ID:', data.fk_locationID);
      const locationExists = await prisma.location.findFirst({
        where: { locationID: parseInt(data.fk_locationID), deletedAt: null }
      });
      if (!locationExists) {
        console.error('Location not found:', data.fk_locationID);
        return res.status(400).json({ error: 'Invalid location ID' });
      }
      console.log('Location validated:', locationExists.name);
    }

    if (data.fk_courseID) {
      console.log('Checking course ID:', data.fk_courseID);
      const courseExists = await prisma.course.findFirst({
        where: { courseID: parseInt(data.fk_courseID), deletedAt: null }
      });
      if (!courseExists) {
        console.error('Course not found:', data.fk_courseID);
        return res.status(400).json({ error: 'Invalid course ID' });
      }
      console.log('Course validated:', courseExists.name);
    }

    if (data.fk_InstructorID) {
      console.log('Checking instructor ID:', data.fk_InstructorID);
      const instructorExists = await prisma.instructor.findFirst({
        where: { instructorID: parseInt(data.fk_InstructorID), deletedAt: null }
      });
      if (!instructorExists) {
        console.error('Instructor not found:', data.fk_InstructorID);
        return res.status(400).json({ error: 'Invalid instructor ID' });
      }
      console.log('Instructor validated:', `${instructorExists.firstName} ${instructorExists.lastName}`);
    }

    const classData = await prisma.class.create({
      data,
      include: {
        school: true,
        location: true,
        course: true,
        instructor: true
      }
    });

    console.log('Class created successfully:', classData.classID);
    res.status(201).json(classData);
  } catch (error) {
    console.error('=== ERROR CREATING CLASS ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create class',
      details: error.message,
      code: error.code
    });
  }
});

// PUT /classes/:id - Update class (UC-19)
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.class.findFirst({
      where: {
        classID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const data = { ...req.body };
    if (req.body.completionDate) {
      data.completionDate = new Date(req.body.completionDate);
    }
    delete data.classID;
    delete data.createdAt;

    const classData = await prisma.class.update({
      where: { classID: parseInt(req.params.id) },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        school: true,
        location: true,
        course: true,
        instructor: true
      }
    });

    res.json(classData);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// DELETE /classes/:id
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.class.findFirst({
      where: {
        classID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Class not found' });
    }

    await prisma.class.update({
      where: { classID: parseInt(req.params.id) },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// POST /classes/:id/enroll - Add student to class (UC-7)
router.post('/:id/enroll', async (req, res) => {
  try {
    const classData = await prisma.class.findFirst({
      where: {
        classID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
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
      data: studentData,
      include: {
        class: true,
        school: true
      }
    });

    res.status(201).json(student);
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ error: 'Failed to enroll student' });
  }
});

// GET /classes/:id/qr-code - Generate QR code for self-enrollment
router.get('/:id/qr-code', async (req, res) => {
  try {
    const classData = await prisma.class.findFirst({
      where: {
        classID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      }
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const enrollmentUrl = `${process.env.FRONTEND_URL || 'http://localhost:9000'}/public/enroll/${req.params.id}`;
    
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(enrollmentUrl, {
      width: 400,
      margin: 2
    });

    res.json({
      qrCode: qrDataUrl,
      enrollmentUrl,
      classID: parseInt(req.params.id)
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// POST /classes/:id/process-all - Process all students in class (issue certificates)
router.post('/:id/process-all', async (req, res) => {
  try {
    const classData = await prisma.class.findFirst({
      where: {
        classID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      },
      include: {
        students: {
          where: {
            deletedAt: null,
            dateProcessed: null // Only unprocessed
          }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Get last certificate number
    const lastStudent = await prisma.student.findFirst({
      where: { certificateNumber: { not: null } },
      orderBy: { certificateNumber: 'desc' }
    });

    let certNumber = lastStudent?.certificateNumber 
      ? parseInt(lastStudent.certificateNumber)
      : 0;

    // Process each student
    const processed = [];
    for (const student of classData.students) {
      certNumber++;
      const nextCertNumber = String(certNumber).padStart(10, '0');
      
      const updated = await prisma.student.update({
        where: { studentID: student.studentID },
        data: {
          certificateNumber: nextCertNumber,
          dateProcessed: new Date(),
          updatedAt: new Date()
        }
      });
      processed.push(updated);
    }

    res.json({
      message: `Processed ${processed.length} students`,
      processed
    });
  } catch (error) {
    console.error('Error processing all students:', error);
    res.status(500).json({ error: 'Failed to process students' });
  }
});

// POST /classes/:id/email-certificates - Email certificates to all students
router.post('/:id/email-certificates', async (req, res) => {
  try {
    const classData = await prisma.class.findFirst({
      where: {
        classID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      },
      include: {
        students: {
          where: {
            deletedAt: null,
            certificateNumber: { not: null },
            email: { not: null }
          }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Email sending stub
    res.json({
      message: `Certificates emailed to ${classData.students.length} students (stub)`,
      recipients: classData.students.map(s => ({
        studentID: s.studentID,
        email: s.email,
        certificateNumber: s.certificateNumber
      }))
    });
  } catch (error) {
    console.error('Error emailing certificates:', error);
    res.status(500).json({ error: 'Failed to email certificates' });
  }
});

// POST /classes/:id/record-payment - Record instructor payment to admin (UC-3)
router.post('/:id/record-payment', async (req, res) => {
  try {
    const classData = await prisma.class.findFirst({
      where: {
        classID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      },
      include: {
        students: {
          where: { deletedAt: null, isPaid: 1 }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const { amount, transactionId, notes } = req.body;
    const paidStudentCount = classData.students.length;
    const expectedAmount = paidStudentCount * 10; // $10 per student

    const updated = await prisma.class.update({
      where: { classID: parseInt(req.params.id) },
      data: {
        amountPaid: amount,
        notes: notes || classData.notes,
        updatedAt: new Date()
      }
    });

    res.json({
      class: updated,
      payment: {
        amount,
        expectedAmount,
        paidStudentCount,
        transactionId,
        status: 'recorded'
      }
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

export default router;

