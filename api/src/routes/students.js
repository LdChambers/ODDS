import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Helper to apply row-level visibility
const getSchoolFilter = (user) => {
  if (user.hasGlobalPermissions) {
    return {}; // Can see all schools
  }
  return { fk_schoolID: user.fk_schoolID }; // Only their school
};

// GET /students - List with search filters (UC-2)
router.get('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      address,
      email,
      classId,
      licenseNumber,
      ssnLastFour,
      certificateNumber,
      isPaid,
      sortBy = 'lastName',
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    const where = {
      deletedAt: null,
      ...getSchoolFilter(req.user)
    };

    // Apply search filters
    if (firstName) where.firstName = { contains: firstName };
    if (lastName) where.lastName = { contains: lastName };
    if (phone) where.phoneNumber = { contains: phone };
    if (address) where.addressLine1 = { contains: address };
    if (email) where.email = { contains: email };
    if (classId) where.fk_classID = parseInt(classId);
    if (licenseNumber) where.licenseNumber = { contains: licenseNumber };
    if (ssnLastFour) where.ssnLastFour = ssnLastFour;
    if (certificateNumber) where.certificateNumber = { contains: certificateNumber };
    if (isPaid !== undefined) where.isPaid = isPaid === 'true' ? 1 : 0;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          class: {
            include: {
              course: true,
              location: true
            }
          },
          school: true,
          state: true,
          licenseState: true,
          classReason: true
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: parseInt(limit)
      }),
      prisma.student.count({ where })
    ]);

    res.json({
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /students/:id
router.get('/:id', async (req, res) => {
  try {
    const student = await prisma.student.findFirst({
      where: {
        studentID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      },
      include: {
        class: {
          include: {
            course: true,
            location: true,
            instructor: true
          }
        },
        school: true,
        state: true,
        licenseState: true,
        classReason: true
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// POST /students
router.post('/', async (req, res) => {
  try {
    const data = {
      ...req.body,
      fk_schoolID: req.user.hasGlobalPermissions ? req.body.fk_schoolID : req.user.fk_schoolID,
      birthDate: new Date(req.body.birthDate)
    };

    const student = await prisma.student.create({
      data,
      include: {
        class: true,
        school: true
      }
    });

    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// PUT /students/:id
router.put('/:id', async (req, res) => {
  try {
    // Verify student belongs to user's school (if not global)
    const existing = await prisma.student.findFirst({
      where: {
        studentID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const data = { ...req.body };
    if (req.body.birthDate) {
      data.birthDate = new Date(req.body.birthDate);
    }
    delete data.studentID;
    delete data.createdAt;

    const student = await prisma.student.update({
      where: { studentID: parseInt(req.params.id) },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        class: true,
        school: true
      }
    });

    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// DELETE /students/:id (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.student.findFirst({
      where: {
        studentID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await prisma.student.update({
      where: { studentID: parseInt(req.params.id) },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// POST /students/:id/process-certificate (UC-16)
router.post('/:id/process-certificate', async (req, res) => {
  try {
    const student = await prisma.student.findFirst({
      where: {
        studentID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Generate certificate number (stub - sequential for now)
    const lastStudent = await prisma.student.findFirst({
      where: { certificateNumber: { not: null } },
      orderBy: { certificateNumber: 'desc' }
    });

    const nextCertNumber = lastStudent?.certificateNumber 
      ? String(parseInt(lastStudent.certificateNumber) + 1).padStart(10, '0')
      : '0000000001';

    // Update student with certificate info
    const updated = await prisma.student.update({
      where: { studentID: parseInt(req.params.id) },
      data: {
        certificateNumber: nextCertNumber,
        dateProcessed: new Date(),
        updatedAt: new Date()
      },
      include: {
        class: {
          include: {
            course: true,
            location: true,
            instructor: true
          }
        },
        school: true
      }
    });

    res.json({
      student: updated,
      certificate: {
        number: nextCertNumber,
        generated: true,
        pdfUrl: `/api/certificates/${nextCertNumber}.pdf` // Placeholder
      }
    });
  } catch (error) {
    console.error('Error processing certificate:', error);
    res.status(500).json({ error: 'Failed to process certificate' });
  }
});

// POST /students/:id/email-certificate
router.post('/:id/email-certificate', async (req, res) => {
  try {
    const student = await prisma.student.findFirst({
      where: {
        studentID: parseInt(req.params.id),
        deletedAt: null,
        ...getSchoolFilter(req.user)
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!student.certificateNumber) {
      return res.status(400).json({ error: 'Certificate not yet generated' });
    }

    // Email sending stub
    res.json({
      message: 'Certificate email sent (stub)',
      recipient: student.email,
      certificateNumber: student.certificateNumber
    });
  } catch (error) {
    console.error('Error emailing certificate:', error);
    res.status(500).json({ error: 'Failed to email certificate' });
  }
});

export default router;

