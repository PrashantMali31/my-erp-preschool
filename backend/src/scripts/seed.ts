import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Teacher, Class, Student, Attendance, Fee, Announcement, School } from '../models';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/preschool-erp';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await School.deleteMany({});
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    await Fee.deleteMany({});
    await Announcement.deleteMany({});
    console.log('Cleared existing data');

    const school = await School.create({
      name: 'Little Stars Preschool',
      phone: '+91 98765 43210',
      email: 'contact@littlestars.com',
      address: '123 Galaxy Road, New Delhi',
      city: 'New Delhi',
      status: 'active',
      subscriptionPlan: 'premium',
      settings: {
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        academicYear: '2025-2026'
      }
    });
    console.log('Created school');

    const adminUser = await User.create({
      email: 'admin@littlestars.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      schoolId: school._id,
    });
    console.log('Created admin user');

    const teachers = await Teacher.create([
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@littlestars.com',
        phone: '+91 98765 43210',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'female',
        joinDate: new Date('2020-06-01'),
        qualification: 'M.Ed. Early Childhood Education',
        specialization: 'Early Childhood Education',
        address: '123 Teacher Lane, New Delhi',
        salary: 45000,
        status: 'active',
        schoolId: school._id,
      },
      {
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@littlestars.com',
        phone: '+91 98765 43211',
        dateOfBirth: new Date('1990-07-20'),
        gender: 'female',
        joinDate: new Date('2021-01-15'),
        qualification: 'B.Ed. Primary Education',
        specialization: 'Arts & Crafts',
        address: '456 Education Street, New Delhi',
        salary: 38000,
        status: 'active',
        schoolId: school._id,
      },
      {
        firstName: 'Rahul',
        lastName: 'Verma',
        email: 'rahul.verma@littlestars.com',
        phone: '+91 98765 43212',
        dateOfBirth: new Date('1988-11-10'),
        gender: 'male',
        joinDate: new Date('2019-08-01'),
        qualification: 'M.A. Child Psychology',
        specialization: 'Physical Education',
        address: '789 Sports Complex, New Delhi',
        salary: 42000,
        status: 'active',
        schoolId: school._id,
      },
    ]);
    console.log('Created teachers');

    const teacherUser1 = await User.create({
      email: 'sarah.johnson@littlestars.com',
      password: 'teacher123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'teacher',
      status: 'active',
      linkedId: teachers[0]._id.toString(),
      schoolId: school._id,
    });

    const teacherUser2 = await User.create({
      email: 'priya.sharma@littlestars.com',
      password: 'teacher123',
      firstName: 'Priya',
      lastName: 'Sharma',
      role: 'teacher',
      status: 'active',
      linkedId: teachers[1]._id.toString(),
      schoolId: school._id,
    });
    console.log('Created teacher users');

    const classes = await Class.create([
      {
        name: 'Nursery',
        section: 'A',
        teacherId: teachers[0]._id,
        capacity: 20,
        academicYear: '2025-2026',
        status: 'active',
        schoolId: school._id,
      },
      {
        name: 'Nursery',
        section: 'B',
        teacherId: teachers[1]._id,
        capacity: 20,
        academicYear: '2025-2026',
        status: 'active',
        schoolId: school._id,
      },
      {
        name: 'LKG',
        section: 'A',
        teacherId: teachers[2]._id,
        capacity: 25,
        academicYear: '2025-2026',
        status: 'active',
        schoolId: school._id,
      },
      {
        name: 'UKG',
        section: 'A',
        teacherId: teachers[0]._id,
        capacity: 25,
        academicYear: '2025-2026',
        status: 'active',
        schoolId: school._id,
      },
    ]);
    console.log('Created classes');

    const studentData = [
      { firstName: 'Aarav', lastName: 'Patel', gender: 'male', parentName: 'Raj Patel', classIndex: 0 },
      { firstName: 'Ananya', lastName: 'Gupta', gender: 'female', parentName: 'Amit Gupta', classIndex: 0 },
      { firstName: 'Arjun', lastName: 'Singh', gender: 'male', parentName: 'Vikram Singh', classIndex: 0 },
      { firstName: 'Diya', lastName: 'Kumar', gender: 'female', parentName: 'Suresh Kumar', classIndex: 1 },
      { firstName: 'Ishaan', lastName: 'Mehta', gender: 'male', parentName: 'Rohit Mehta', classIndex: 1 },
      { firstName: 'Kavya', lastName: 'Sharma', gender: 'female', parentName: 'Anil Sharma', classIndex: 1 },
      { firstName: 'Vihaan', lastName: 'Reddy', gender: 'male', parentName: 'Krishna Reddy', classIndex: 2 },
      { firstName: 'Aisha', lastName: 'Khan', gender: 'female', parentName: 'Imran Khan', classIndex: 2 },
      { firstName: 'Reyansh', lastName: 'Joshi', gender: 'male', parentName: 'Deepak Joshi', classIndex: 2 },
      { firstName: 'Myra', lastName: 'Agarwal', gender: 'female', parentName: 'Sanjay Agarwal', classIndex: 3 },
      { firstName: 'Advait', lastName: 'Chopra', gender: 'male', parentName: 'Ravi Chopra', classIndex: 3 },
      { firstName: 'Saanvi', lastName: 'Mishra', gender: 'female', parentName: 'Pankaj Mishra', classIndex: 3 },
    ];

    const students = await Student.create(
      studentData.map((s, index) => ({
        firstName: s.firstName,
        lastName: s.lastName,
        dateOfBirth: new Date(2021 - (s.classIndex > 1 ? s.classIndex : 0), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: s.gender,
        admissionDate: new Date('2024-04-01'),
        classId: classes[s.classIndex]._id,
        parentName: s.parentName,
        parentEmail: `${s.parentName.toLowerCase().replace(' ', '.')}@email.com`,
        parentPhone: `+91 98765 ${43200 + index}`,
        address: `${100 + index} Residential Area, New Delhi`,
        bloodGroup: ['A+', 'B+', 'O+', 'AB+'][Math.floor(Math.random() * 4)],
        emergencyContact: `+91 98765 ${43300 + index}`,
        status: 'active',
        schoolId: school._id,
      }))
    );
    console.log('Created students');

    const parentUser1 = await User.create({
      email: 'raj.patel@email.com',
      password: 'parent123',
      firstName: 'Raj',
      lastName: 'Patel',
      role: 'parent',
      status: 'active',
      linkedId: students[0]._id.toString(),
      schoolId: school._id,
    });

    const parentUser2 = await User.create({
      email: 'amit.gupta@email.com',
      password: 'parent123',
      firstName: 'Amit',
      lastName: 'Gupta',
      role: 'parent',
      status: 'active',
      linkedId: students[1]._id.toString(),
      schoolId: school._id,
    });

    const parentUser3 = await User.create({
      email: 'vikram.singh@email.com',
      password: 'parent123',
      firstName: 'Vikram',
      lastName: 'Singh',
      role: 'parent',
      status: 'active',
      linkedId: students[2]._id.toString(),
      schoolId: school._id,
    });
    console.log('Created parent users');

    const today = new Date();
    const attendanceRecords = [];
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const student of students) {
        const rand = Math.random();
        let status: 'present' | 'absent' | 'late' = 'present';
        if (rand > 0.9) status = 'absent';
        else if (rand > 0.8) status = 'late';

        attendanceRecords.push({
          studentId: student._id,
          classId: student.classId,
          date: new Date(date),
          status,
          markedBy: adminUser._id,
          schoolId: school._id,
        });
      }
    }
    await Attendance.create(attendanceRecords);
    console.log('Created attendance records');

    const feeRecords = [];
    const feeTypes: ('tuition' | 'transport' | 'meals' | 'activities')[] = ['tuition', 'transport', 'meals', 'activities'];
    const feeAmounts = { tuition: 5000, transport: 2000, meals: 1500, activities: 1000 };

    for (const student of students) {
      for (const feeType of feeTypes) {
        const dueDate = new Date('2026-01-15');
        const isPaid = Math.random() > 0.3;

        feeRecords.push({
          studentId: student._id,
          classId: student.classId,
          feeType,
          amount: feeAmounts[feeType],
          dueDate,
          status: isPaid ? 'paid' : (dueDate < today ? 'overdue' : 'pending'),
          paidDate: isPaid ? new Date(dueDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
          paymentMethod: isPaid ? (['cash', 'card', 'bank_transfer', 'online'][Math.floor(Math.random() * 4)] as 'cash' | 'card' | 'bank_transfer' | 'online') : undefined,
          createdBy: adminUser._id,
          schoolId: school._id,
        });
      }
    }
    await Fee.create(feeRecords);
    console.log('Created fee records');

    await Announcement.create([
      {
        title: 'Welcome to New Academic Year 2025-2026',
        content: 'We are excited to welcome all our little stars to the new academic year. Looking forward to a year full of learning and fun!',
        type: 'general',
        targetAudience: 'all',
        priority: 'high',
        publishDate: new Date(),
        status: 'published',
        createdBy: adminUser._id,
        schoolId: school._id,
      },
      {
        title: 'Republic Day Celebration',
        content: 'Join us for the Republic Day celebration on January 26th. Children will participate in cultural activities and flag hoisting ceremony.',
        type: 'event',
        targetAudience: 'all',
        priority: 'high',
        publishDate: new Date('2026-01-20'),
        expiryDate: new Date('2026-01-27'),
        status: 'published',
        createdBy: adminUser._id,
        schoolId: school._id,
      },
      {
        title: 'Parent-Teacher Meeting',
        content: 'The monthly PTM will be held on January 25th from 10 AM to 1 PM. Please collect your child\'s progress report.',
        type: 'reminder',
        targetAudience: 'parents',
        priority: 'medium',
        publishDate: new Date('2026-01-18'),
        expiryDate: new Date('2026-01-26'),
        status: 'published',
        createdBy: adminUser._id,
        schoolId: school._id,
      },
    ]);
    console.log('Created announcements');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('\n👑 ADMIN:');
    console.log('   Email: admin@littlestars.com');
    console.log('   Password: admin123');
    console.log('\n👩‍🏫 TEACHER:');
    console.log('   Email: sarah.johnson@littlestars.com');
    console.log('   Password: teacher123');
    console.log('   Email: priya.sharma@littlestars.com');
    console.log('   Password: teacher123');
    console.log('\n👨‍👩‍👧 PARENT:');
    console.log('   Email: raj.patel@email.com');
    console.log('   Password: parent123');
    console.log('   Email: amit.gupta@email.com');
    console.log('   Password: parent123');
    console.log('   Email: vikram.singh@email.com');
    console.log('   Password: parent123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();

