import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.course.deleteMany();
  await prisma.state.deleteMany();
  await prisma.county.deleteMany();
  await prisma.classReason.deleteMany();
  await prisma.deliveryMethod.deleteMany();
  await prisma.courseProvider.deleteMany();

  // Create States
  const states = await Promise.all([
    prisma.state.create({
      data: {
        name: 'Texas',
        abbreviation: 'TX',
        priority: 1
      }
    }),
    prisma.state.create({
      data: {
        name: 'Oklahoma',
        abbreviation: 'OK',
        priority: 2
      }
    }),
    prisma.state.create({
      data: {
        name: 'Louisiana',
        abbreviation: 'LA',
        priority: 3
      }
    })
  ]);
  console.log(`✓ Created ${states.length} states`);

  // Create Counties
  const counties = await Promise.all([
    prisma.county.create({
      data: {
        name: 'Harris',
        isApproved: 1,
        fk_stateID: states[0].stateID
      }
    }),
    prisma.county.create({
      data: {
        name: 'Dallas',
        isApproved: 1,
        fk_stateID: states[0].stateID
      }
    }),
    prisma.county.create({
      data: {
        name: 'Tarrant',
        isApproved: 1,
        fk_stateID: states[0].stateID
      }
    })
  ]);
  console.log(`✓ Created ${counties.length} counties`);

  // Create Course Provider
  const provider = await prisma.courseProvider.create({
    data: {
      courseProviderNumber: 'CP001',
      name: 'Online Defensive Driving Schools LLC',
      addressLine1: '123 Main Street',
      city: 'Fort Worth',
      fk_stateID: states[0].stateID,
      zipCode: '76102',
      phoneNumber: '(817) 555-0100',
      email: 'info@odds.com',
      contactName: 'Eric Brown',
      perStudentFee: 10
    }
  });
  console.log(`✓ Created course provider: ${provider.name}`);

  // Create Schools
  const schools = await Promise.all([
    prisma.school.create({
      data: {
        fk_courseProviderID: provider.courseProviderID,
        name: 'Fort Worth Driving School',
        shortName: 'FWDS',
        addressLine1: '456 School Lane',
        city: 'Fort Worth',
        fk_stateID: states[0].stateID,
        zipCode: '76102',
        phoneNumber: '(817) 555-0200',
        email: 'contact@fwds.com',
        contactName: 'John Smith'
      }
    }),
    prisma.school.create({
      data: {
        fk_courseProviderID: provider.courseProviderID,
        name: 'Dallas Safety Training',
        shortName: 'DST',
        addressLine1: '789 Training Blvd',
        city: 'Dallas',
        fk_stateID: states[0].stateID,
        zipCode: '75201',
        phoneNumber: '(214) 555-0300',
        email: 'info@dst.com',
        contactName: 'Jane Doe'
      }
    })
  ]);
  console.log(`✓ Created ${schools.length} schools`);

  // Create Users
  const hashedPassword = await bcrypt.hash('password', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        fk_schoolID: schools[0].schoolID,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@odds.com',
        password: hashedPassword,
        role: 'admin',
        hasGlobalPermissions: 1
      }
    }),
    prisma.user.create({
      data: {
        fk_schoolID: schools[0].schoolID,
        firstName: 'John',
        lastName: 'Instructor',
        email: 'instructor@school1.com',
        password: hashedPassword,
        role: 'instructor',
        hasGlobalPermissions: 0
      }
    }),
    prisma.user.create({
      data: {
        fk_schoolID: schools[1].schoolID,
        firstName: 'Jane',
        lastName: 'Teacher',
        email: 'instructor@school2.com',
        password: hashedPassword,
        role: 'instructor',
        hasGlobalPermissions: 0
      }
    })
  ]);
  console.log(`✓ Created ${users.length} users (password: "password")`);

  // Create Courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        name: 'Texas Defensive Driving Course',
        description: '6-hour defensive driving course approved by TDLR',
        isActive: 1,
        priority: 1
      }
    }),
    prisma.course.create({
      data: {
        name: 'Driver Safety Program',
        description: 'Comprehensive driver safety and awareness program',
        isActive: 1,
        priority: 2
      }
    })
  ]);
  console.log(`✓ Created ${courses.length} courses`);

  // Create Class Reasons
  const classReasons = await Promise.all([
    prisma.classReason.create({
      data: {
        name: 'Ticket Dismissal',
        description: 'Taking course to dismiss traffic ticket',
        isDefault: 1,
        isCourtMandated: 1,
        priority: 1
      }
    }),
    prisma.classReason.create({
      data: {
        name: 'Insurance Discount',
        description: 'Taking course for insurance rate reduction',
        isDefault: 0,
        isCourtMandated: 0,
        priority: 2
      }
    })
  ]);
  console.log(`✓ Created ${classReasons.length} class reasons`);

  // Create Delivery Methods
  const deliveryMethods = await Promise.all([
    prisma.deliveryMethod.create({
      data: {
        name: 'Email',
        description: 'Certificate sent via email',
        price: 0,
        cost: 0,
        priority: 1,
        isDefault: 1,
        emailRequired: 1
      }
    }),
    prisma.deliveryMethod.create({
      data: {
        name: 'Mail',
        description: 'Certificate mailed to address',
        price: 5,
        cost: 2,
        priority: 2,
        isDefault: 0,
        emailRequired: 0
      }
    })
  ]);
  console.log(`✓ Created ${deliveryMethods.length} delivery methods`);

  // Create Instructors
  const instructors = await Promise.all([
    prisma.instructor.create({
      data: {
        firstName: 'Michael',
        lastName: 'Johnson',
        addressLine1: '111 Instructor Ave',
        city: 'Fort Worth',
        fk_stateID: states[0].stateID,
        zipCode: '76102',
        phone: '(817) 555-1001',
        email: 'mjohnson@example.com',
        notes: 'Senior instructor with 10 years experience'
      }
    }),
    prisma.instructor.create({
      data: {
        firstName: 'Sarah',
        lastName: 'Williams',
        addressLine1: '222 Teaching Ln',
        city: 'Dallas',
        fk_stateID: states[0].stateID,
        zipCode: '75201',
        phone: '(214) 555-1002',
        email: 'swilliams@example.com',
        notes: 'Certified driver safety specialist'
      }
    }),
    prisma.instructor.create({
      data: {
        firstName: 'Robert',
        lastName: 'Brown',
        addressLine1: '333 Education St',
        city: 'Fort Worth',
        fk_stateID: states[0].stateID,
        zipCode: '76109',
        phone: '(817) 555-1003',
        email: 'rbrown@example.com'
      }
    })
  ]);
  console.log(`✓ Created ${instructors.length} instructors`);

  // Create Locations
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        fk_schoolID: schools[0].schoolID,
        number: '001',
        name: "Joe's Pizza - Hulen Street",
        addressLine1: '5678 Hulen Street',
        city: 'Fort Worth',
        fk_stateID: states[0].stateID,
        zipCode: '76132'
      }
    }),
    prisma.location.create({
      data: {
        fk_schoolID: schools[0].schoolID,
        number: '002',
        name: 'Community Center West',
        addressLine1: '1000 West 7th Street',
        city: 'Fort Worth',
        fk_stateID: states[0].stateID,
        zipCode: '76102'
      }
    }),
    prisma.location.create({
      data: {
        fk_schoolID: schools[1].schoolID,
        number: '001',
        name: 'Dallas Training Facility',
        addressLine1: '2500 Main Street',
        city: 'Dallas',
        fk_stateID: states[0].stateID,
        zipCode: '75201'
      }
    })
  ]);
  console.log(`✓ Created ${locations.length} locations`);

  // Create Classes
  const classes = await Promise.all([
    prisma.class.create({
      data: {
        fk_schoolID: schools[0].schoolID,
        fk_locationID: locations[0].locationID,
        fk_courseID: courses[0].courseID,
        fk_InstructorID: instructors[0].instructorID,
        completionDate: new Date('2025-10-15'),
        amountPaid: 150,
        notes: 'Saturday morning class with lunch'
      }
    }),
    prisma.class.create({
      data: {
        fk_schoolID: schools[0].schoolID,
        fk_locationID: locations[1].locationID,
        fk_courseID: courses[0].courseID,
        fk_InstructorID: instructors[2].instructorID,
        completionDate: new Date('2025-10-22'),
        amountPaid: 0,
        notes: 'Evening class at community center'
      }
    }),
    prisma.class.create({
      data: {
        fk_schoolID: schools[1].schoolID,
        fk_locationID: locations[2].locationID,
        fk_courseID: courses[0].courseID,
        fk_InstructorID: instructors[1].instructorID,
        completionDate: new Date('2025-10-25'),
        amountPaid: 200,
        notes: 'Full day course'
      }
    }),
    prisma.class.create({
      data: {
        fk_schoolID: schools[0].schoolID,
        fk_locationID: locations[0].locationID,
        fk_courseID: courses[0].courseID,
        fk_InstructorID: instructors[0].instructorID,
        completionDate: new Date('2025-11-05'),
        amountPaid: 0,
        notes: 'Upcoming class - open for enrollment'
      }
    })
  ]);
  console.log(`✓ Created ${classes.length} classes`);

  // Create Students
  const students = [];
  
  // Class 1 students (completed)
  const class1Students = [
    {
      fk_schoolID: schools[0].schoolID,
      fk_classID: classes[0].classID,
      fk_classReasonID: classReasons[0].classReasonID,
      firstName: 'James',
      lastName: 'Anderson',
      addressLine1: '123 Oak Street',
      city: 'Fort Worth',
      fk_stateID: states[0].stateID,
      zipCode: '76102',
      phoneNumber: '(817) 555-2001',
      email: 'james.anderson@email.com',
      licenseNumber: 'TX12345678',
      fk_licenseStateID: states[0].stateID,
      ssnLastFour: '1234',
      birthDate: new Date('1985-03-15'),
      dateCompleted: new Date('2025-10-15T16:00:00'),
      dateProcessed: new Date('2025-10-15T17:00:00'),
      certificateNumber: '0000000001',
      isPaid: 1,
      fee: 10
    },
    {
      fk_schoolID: schools[0].schoolID,
      fk_classID: classes[0].classID,
      fk_classReasonID: classReasons[0].classReasonID,
      firstName: 'Emily',
      lastName: 'Martinez',
      addressLine1: '456 Elm Avenue',
      city: 'Fort Worth',
      fk_stateID: states[0].stateID,
      zipCode: '76109',
      phoneNumber: '(817) 555-2002',
      email: 'emily.martinez@email.com',
      licenseNumber: 'TX87654321',
      fk_licenseStateID: states[0].stateID,
      ssnLastFour: '5678',
      birthDate: new Date('1992-07-22'),
      dateCompleted: new Date('2025-10-15T16:00:00'),
      dateProcessed: new Date('2025-10-15T17:00:00'),
      certificateNumber: '0000000002',
      isPaid: 1,
      fee: 10
    },
    {
      fk_schoolID: schools[0].schoolID,
      fk_classID: classes[0].classID,
      fk_classReasonID: classReasons[1].classReasonID,
      firstName: 'David',
      lastName: 'Thompson',
      addressLine1: '789 Pine Road',
      city: 'Fort Worth',
      fk_stateID: states[0].stateID,
      zipCode: '76132',
      phoneNumber: '(817) 555-2003',
      email: 'david.thompson@email.com',
      licenseNumber: 'TX11223344',
      fk_licenseStateID: states[0].stateID,
      ssnLastFour: '9012',
      birthDate: new Date('1988-11-30'),
      dateCompleted: new Date('2025-10-15T16:00:00'),
      dateProcessed: new Date('2025-10-15T17:00:00'),
      certificateNumber: '0000000003',
      isPaid: 1,
      fee: 10
    }
  ];

  // Class 2 students (in progress)
  const class2Students = [
    {
      fk_schoolID: schools[0].schoolID,
      fk_classID: classes[1].classID,
      fk_classReasonID: classReasons[0].classReasonID,
      firstName: 'Lisa',
      lastName: 'Garcia',
      addressLine1: '321 Maple Drive',
      city: 'Fort Worth',
      fk_stateID: states[0].stateID,
      zipCode: '76102',
      phoneNumber: '(817) 555-2004',
      email: 'lisa.garcia@email.com',
      licenseNumber: 'TX55667788',
      fk_licenseStateID: states[0].stateID,
      ssnLastFour: '3456',
      birthDate: new Date('1990-05-18'),
      isPaid: 1,
      fee: 10
    },
    {
      fk_schoolID: schools[0].schoolID,
      fk_classID: classes[1].classID,
      fk_classReasonID: classReasons[0].classReasonID,
      firstName: 'Michael',
      lastName: 'Davis',
      addressLine1: '654 Cedar Lane',
      city: 'Fort Worth',
      fk_stateID: states[0].stateID,
      zipCode: '76109',
      phoneNumber: '(817) 555-2005',
      email: 'michael.davis@email.com',
      licenseNumber: 'TX99887766',
      fk_licenseStateID: states[0].stateID,
      ssnLastFour: '7890',
      birthDate: new Date('1987-09-25'),
      isPaid: 0,
      fee: 10
    }
  ];

  // Class 3 students (Dallas)
  const class3Students = [
    {
      fk_schoolID: schools[1].schoolID,
      fk_classID: classes[2].classID,
      fk_classReasonID: classReasons[0].classReasonID,
      firstName: 'Jennifer',
      lastName: 'Wilson',
      addressLine1: '111 Dallas Parkway',
      city: 'Dallas',
      fk_stateID: states[0].stateID,
      zipCode: '75201',
      phoneNumber: '(214) 555-3001',
      email: 'jennifer.wilson@email.com',
      licenseNumber: 'TX12341234',
      fk_licenseStateID: states[0].stateID,
      ssnLastFour: '2345',
      birthDate: new Date('1991-02-14'),
      dateCompleted: new Date('2025-10-25T17:00:00'),
      dateProcessed: new Date('2025-10-25T18:00:00'),
      certificateNumber: '0000000004',
      isPaid: 1,
      fee: 10
    },
    {
      fk_schoolID: schools[1].schoolID,
      fk_classID: classes[2].classID,
      fk_classReasonID: classReasons[1].classReasonID,
      firstName: 'Christopher',
      lastName: 'Taylor',
      addressLine1: '222 Commerce Street',
      city: 'Dallas',
      fk_stateID: states[0].stateID,
      zipCode: '75201',
      phoneNumber: '(214) 555-3002',
      email: 'christopher.taylor@email.com',
      licenseNumber: 'TX56785678',
      fk_licenseStateID: states[0].stateID,
      ssnLastFour: '6789',
      birthDate: new Date('1989-06-08'),
      dateCompleted: new Date('2025-10-25T17:00:00'),
      dateProcessed: new Date('2025-10-25T18:00:00'),
      certificateNumber: '0000000005',
      isPaid: 1,
      fee: 10
    }
  ];

  for (const studentData of [...class1Students, ...class2Students, ...class3Students]) {
    const student = await prisma.student.create({ data: studentData });
    students.push(student);
  }
  console.log(`✓ Created ${students.length} students`);

  console.log('\n✅ Seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`  - States: ${states.length}`);
  console.log(`  - Counties: ${counties.length}`);
  console.log(`  - Course Providers: 1`);
  console.log(`  - Schools: ${schools.length}`);
  console.log(`  - Users: ${users.length}`);
  console.log(`  - Courses: ${courses.length}`);
  console.log(`  - Class Reasons: ${classReasons.length}`);
  console.log(`  - Delivery Methods: ${deliveryMethods.length}`);
  console.log(`  - Instructors: ${instructors.length}`);
  console.log(`  - Locations: ${locations.length}`);
  console.log(`  - Classes: ${classes.length}`);
  console.log(`  - Students: ${students.length}`);
  console.log('\n🔑 Login credentials:');
  console.log('  Admin: admin@odds.com / password');
  console.log('  Instructor 1: instructor@school1.com / password');
  console.log('  Instructor 2: instructor@school2.com / password');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

