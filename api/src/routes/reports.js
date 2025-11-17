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

// Helper to convert to CSV
const toCSV = (data, headers) => {
  const rows = [headers.join(',')];
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    rows.push(values.join(','));
  });
  return rows.join('\n');
};

// GET /reports/income - Income by date range
router.get('/income', async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required' });
    }

    const classes = await prisma.class.findMany({
      where: {
        deletedAt: null,
        completionDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        ...getSchoolFilter(req.user)
      },
      include: {
        school: true,
        course: true,
        students: {
          where: { deletedAt: null, isPaid: 1 }
        }
      }
    });

    const report = classes.map(c => ({
      classID: c.classID,
      schoolName: c.school?.name,
      courseName: c.course?.name,
      completionDate: c.completionDate,
      studentCount: c.students.length,
      amountPaid: c.amountPaid,
      expectedRevenue: c.students.length * 10
    }));

    const totalRevenue = report.reduce((sum, r) => sum + r.expectedRevenue, 0);
    const totalPaid = report.reduce((sum, r) => sum + r.amountPaid, 0);

    if (format === 'csv') {
      const csv = toCSV(report, ['classID', 'schoolName', 'courseName', 'completionDate', 'studentCount', 'amountPaid', 'expectedRevenue']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="income-report-${startDate}-to-${endDate}.csv"`);
      return res.send(csv);
    }

    res.json({
      report,
      summary: {
        totalClasses: classes.length,
        totalRevenue,
        totalPaid,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Error generating income report:', error);
    res.status(500).json({ error: 'Failed to generate income report' });
  }
});

// GET /reports/students - Students by date range
router.get('/students', async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required' });
    }

    const students = await prisma.student.findMany({
      where: {
        deletedAt: null,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        ...getSchoolFilter(req.user)
      },
      include: {
        school: true,
        class: {
          include: {
            course: true
          }
        },
        state: true
      }
    });

    const report = students.map(s => ({
      studentID: s.studentID,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      licenseNumber: s.licenseNumber,
      certificateNumber: s.certificateNumber,
      schoolName: s.school?.name,
      courseName: s.class?.course?.name,
      isPaid: s.isPaid ? 'Yes' : 'No',
      dateProcessed: s.dateProcessed,
      createdAt: s.createdAt
    }));

    if (format === 'csv') {
      const csv = toCSV(report, ['studentID', 'firstName', 'lastName', 'email', 'licenseNumber', 'certificateNumber', 'schoolName', 'courseName', 'isPaid', 'dateProcessed', 'createdAt']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="students-report-${startDate}-to-${endDate}.csv"`);
      return res.send(csv);
    }

    res.json({
      report,
      summary: {
        totalStudents: students.length,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Error generating students report:', error);
    res.status(500).json({ error: 'Failed to generate students report' });
  }
});

// GET /reports/students-by-class - Students grouped by class
router.get('/students-by-class', async (req, res) => {
  try {
    const { classID, format = 'json' } = req.query;

    const where = {
      deletedAt: null,
      ...getSchoolFilter(req.user)
    };

    if (classID) {
      where.classID = parseInt(classID);
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        school: true,
        course: true,
        location: true,
        instructor: true,
        students: {
          where: { deletedAt: null },
          include: {
            state: true
          }
        }
      }
    });

    const report = [];
    classes.forEach(c => {
      c.students.forEach(s => {
        report.push({
          classID: c.classID,
          courseName: c.course?.name,
          completionDate: c.completionDate,
          locationName: c.location?.name,
          instructorName: c.instructor ? `${c.instructor.firstName} ${c.instructor.lastName}` : '',
          studentID: s.studentID,
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          licenseNumber: s.licenseNumber,
          certificateNumber: s.certificateNumber,
          isPaid: s.isPaid ? 'Yes' : 'No'
        });
      });
    });

    if (format === 'csv') {
      const csv = toCSV(report, ['classID', 'courseName', 'completionDate', 'locationName', 'instructorName', 'studentID', 'firstName', 'lastName', 'email', 'licenseNumber', 'certificateNumber', 'isPaid']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="students-by-class-report.csv"`);
      return res.send(csv);
    }

    res.json({
      report,
      summary: {
        totalClasses: classes.length,
        totalStudents: report.length
      }
    });
  } catch (error) {
    console.error('Error generating students by class report:', error);
    res.status(500).json({ error: 'Failed to generate students by class report' });
  }
});

// GET /reports/certificates - Certificate export for state (UC-16)
router.get('/certificates', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      deletedAt: null,
      certificateNumber: { not: null },
      ...getSchoolFilter(req.user)
    };

    if (startDate && endDate) {
      where.dateProcessed = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        school: true,
        class: {
          include: {
            course: true,
            location: true
          }
        },
        state: true,
        licenseState: true
      }
    });

    const report = students.map(s => ({
      certificateNumber: s.certificateNumber,
      firstName: s.firstName,
      lastName: s.lastName,
      licenseNumber: s.licenseNumber,
      licenseState: s.licenseState?.abbreviation,
      birthDate: s.birthDate,
      completionDate: s.dateCompleted || s.class?.completionDate,
      courseName: s.class?.course?.name,
      locationName: s.class?.location?.name,
      schoolName: s.school?.name
    }));

    const csv = toCSV(report, ['certificateNumber', 'firstName', 'lastName', 'licenseNumber', 'licenseState', 'birthDate', 'completionDate', 'courseName', 'locationName', 'schoolName']);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="state-certificate-report-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error generating certificate export:', error);
    res.status(500).json({ error: 'Failed to generate certificate export' });
  }
});

export default router;

