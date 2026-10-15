/**
 * Demo seed for presentation — realistic school data with known logins.
 *
 * Run:  npm run seed
 * Reset: npm run seed -- --force
 *
 * Shared password for @achiever.demo users: Demo@1234
 * VIP accounts (egatorever / afluant) keep their existing passwords when present.
 */

const bcrypt = require('bcryptjs');
const { UserModel } = require('../models/user.model.js');
const TeacherModel = require('../models/teacher.model.js');
const GuardianModel = require('../models/guardian.model.js');
const StudentModel = require('../models/student.model.js');
const ClassModel = require('../models/class.model.js');
const CourseModel = require('../models/course.model.js');
const LessonModel = require('../models/lesson.model.js');
const HomeworkModel = require('../models/homework.model.js');
const ExamModel = require('../models/exam.model.js');
const AttendanceModel = require('../models/attendance.model.js');
const PaymentModel = require('../models/payment.model.js');
const AnnouncementModel = require('../models/announcement.model.js');
const ComplaintModel = require('../models/complaint.model.js');

const DEMO_PASSWORD = 'Demo@1234';
const DEMO_EMAIL_DOMAIN = 'achiever.demo';
const ACADEMIC_YEAR = '2025/26';
const SEED_MARKER_EMAIL = `sarah.mensah@${DEMO_EMAIL_DOMAIN}`;
const SEED_TAG = '[demo-seed]';

const CLASS_CODES = ['G7A', 'G8B', 'G9A', 'G10B'];

const VIP = {
    studentEmail: 'egatorever@gmail.com',
    guardianEmail: 'afluant@gmail.com',
};

const ANNOUNCEMENT_TITLES = [
    'Welcome Back Assembly',
    'Midterm Exam Timetable',
    'PTA Meeting Notice',
    'Sports Day Reminder',
    'Library Week Activities',
    'Fee Payment Deadline',
    'Career Guidance Week',
    'Health Screening Day',
];

const VIP_COMPLAINT_TITLES = [
    'Bus Safety Concern',
    'Lab Equipment Request',
    'Homework Workload Review',
];

const PLACEHOLDER_DOC = 'https://placehold.co/600x400/png?text=Document';
const PLACEHOLDER_MATERIAL = 'https://placehold.co/800x1100/png?text=Worksheet';

const portrait = (gender, id) =>
    `https://randomuser.me/api/portraits/${gender === 'female' ? 'women' : 'men'}/${id}.jpg`;

const daysFromNow = (days, hours = 9) => {
    const d = new Date();
    d.setHours(hours, 0, 0, 0);
    d.setDate(d.getDate() + days);
    return d;
};

const letterGrade = (pct) => {
    if (pct >= 90) return 'A';
    if (pct >= 80) return 'B';
    if (pct >= 70) return 'C';
    if (pct >= 60) return 'D';
    return 'F';
};

const address = (street, city = 'Accra', state = 'Greater Accra', zip = '00233') => ({
    street,
    city,
    state,
    zip,
    country: 'Ghana',
});

const contact = (phone, altPhone = '') => ({
    phone,
    altPhone,
    whatsapp: phone,
});

const scoreFor = (totalMarks, index, bias = 0.78) => {
    const wave = [0.92, 0.84, 0.76, 0.68, 0.88, 0.71, 0.95, 0.8];
    const pct = Math.min(0.98, Math.max(0.45, wave[index % wave.length] + bias - 0.78));
    return Math.round(totalMarks * pct);
};

async function clearDemoData() {
    const demoUsers = await UserModel.find({
        email: { $regex: `@${DEMO_EMAIL_DOMAIN}$`, $options: 'i' },
    }).select('_id');
    const userIds = demoUsers.map((u) => u._id);

    const teachers = await TeacherModel.find({ user: { $in: userIds } }).select('_id');
    const guardians = await GuardianModel.find({ user: { $in: userIds } }).select('_id');
    const students = await StudentModel.find({ user: { $in: userIds } }).select('_id');
    const classes = await ClassModel.find({ classCode: { $in: CLASS_CODES } }).select('_id');

    const teacherIds = teachers.map((t) => t._id);
    const guardianIds = guardians.map((g) => g._id);
    const studentIds = students.map((s) => s._id);
    const classIds = classes.map((c) => c._id);

    const vipGuardianUser = await UserModel.findOne({ email: VIP.guardianEmail }).select('_id');
    const vipStudentUser = await UserModel.findOne({ email: VIP.studentEmail }).select('_id');
    const vipGuardian = vipGuardianUser
        ? await GuardianModel.findOne({ user: vipGuardianUser._id }).select('_id')
        : null;
    const vipStudent = vipStudentUser
        ? await StudentModel.findOne({ user: vipStudentUser._id }).select('_id')
        : null;

    await Promise.all([
        AttendanceModel.deleteMany({
            $or: [{ teacher: { $in: teacherIds } }, { class: { $in: classIds } }],
        }),
        LessonModel.deleteMany({
            $or: [{ teacher: { $in: teacherIds } }, { class: { $in: classIds } }],
        }),
        HomeworkModel.deleteMany({
            $or: [{ teacher: { $in: teacherIds } }, { class: { $in: classIds } }],
        }),
        ExamModel.deleteMany({
            $or: [{ teacher: { $in: teacherIds } }, { class: { $in: classIds } }],
        }),
        PaymentModel.deleteMany({
            $or: [
                { student: { $in: studentIds } },
                { guardian: { $in: guardianIds } },
                ...(vipGuardian ? [{ guardian: vipGuardian._id, notes: { $regex: SEED_TAG } }] : []),
                ...(vipStudent ? [{ student: vipStudent._id, notes: { $regex: SEED_TAG } }] : []),
            ],
        }),
        ComplaintModel.deleteMany({
            $or: [
                { reporter: { $in: [...studentIds, ...teacherIds, ...guardianIds] } },
                { title: { $in: VIP_COMPLAINT_TITLES } },
            ],
        }),
        AnnouncementModel.deleteMany({ title: { $in: ANNOUNCEMENT_TITLES } }),
        CourseModel.deleteMany({ courseClass: { $in: classIds } }),
        StudentModel.deleteMany({ _id: { $in: studentIds } }),
        TeacherModel.deleteMany({ _id: { $in: teacherIds } }),
        GuardianModel.deleteMany({ _id: { $in: guardianIds } }),
        ClassModel.deleteMany({ _id: { $in: classIds } }),
        UserModel.deleteMany({ _id: { $in: userIds } }),
    ]);

    // Detach VIP profiles from wiped demo classes without deleting their accounts
    if (vipStudent) {
        await StudentModel.findByIdAndUpdate(vipStudent._id, {
            $unset: { class: 1 },
        });
        await ClassModel.updateMany({}, { $pull: { students: vipStudent._id } });
        await TeacherModel.updateMany({}, { $pull: { students: vipStudent._id } });
        await CourseModel.updateMany({}, { $pull: { courseStudents: vipStudent._id } });
    }
    if (vipGuardian) {
        await GuardianModel.findByIdAndUpdate(vipGuardian._id, { students: [] });
    }

    console.log('🧹 Cleared previous demo data');
}

async function createUser(data, hashedPassword) {
    return UserModel.create({
        ...data,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        isActive: true,
        isDeleted: false,
    });
}

async function upsertUser(email, data, hashedPassword, { resetPassword = false } = {}) {
    const existing = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
    if (existing) {
        const updates = {
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
            contactInfo: data.contactInfo,
            address: data.address,
            isActive: true,
            isDeleted: false,
        };
        // Keep Cloudinary / custom photos; only fill when empty
        if (!existing.photo && data.photo) updates.photo = data.photo;
        if (resetPassword) updates.password = hashedPassword;
        Object.assign(existing, updates);
        await existing.save();
        return existing;
    }
    return createUser({ ...data, email }, hashedPassword);
}

async function buildExamResults(roster, totalMarks) {
    return roster.map((entry, i) => {
        const marks = scoreFor(totalMarks, i);
        const pct = (marks / totalMarks) * 100;
        return {
            student: entry.student._id,
            marksObtained: marks,
            grade: letterGrade(pct),
            remarks:
                pct >= 85
                    ? 'Excellent work'
                    : pct >= 70
                      ? 'Good effort'
                      : pct >= 60
                        ? 'Satisfactory — keep practising'
                        : 'Needs improvement',
            isAbsent: false,
        };
    });
}

async function seedAttendanceForLessons(lessons, studentsByClass, teachers) {
    const statuses = ['present', 'present', 'present', 'present', 'late', 'absent', 'excused'];
    let attendanceCount = 0;

    for (const { lesson, def } of lessons) {
        if (def.daysAgo <= 0) continue;
        const roster = studentsByClass[def.classCode] || [];
        for (let i = 0; i < roster.length; i++) {
            const status = statuses[(i + Math.abs(def.daysAgo) + def.title.length) % statuses.length];
            const exists = await AttendanceModel.exists({
                lesson: lesson._id,
                student: roster[i].student._id,
            });
            if (exists) continue;

            await AttendanceModel.create({
                lesson: lesson._id,
                student: roster[i].student._id,
                class: lesson.class,
                teacher: teachers[def.teacherKey].teacher._id,
                status,
                note:
                    status === 'absent'
                        ? 'Parent notified'
                        : status === 'late'
                          ? 'Arrived 10 minutes late'
                          : status === 'excused'
                            ? 'Medical excuse submitted'
                            : '',
                markedBy: teachers[def.teacherKey].teacher._id,
                markedAt: lesson.scheduledAt,
                date: lesson.scheduledAt,
            });
            attendanceCount += 1;
        }
    }
    return attendanceCount;
}

async function seedDemoSchool(hashedPassword) {
    console.log('🌱 Seeding demo school data...');

    // ── Classes ──────────────────────────────────────────────
    const classDefs = [
        {
            className: 'Grade 7A',
            classCode: 'G7A',
            grade: 7,
            description: 'Junior high foundation class focusing on core subjects.',
        },
        {
            className: 'Grade 8B',
            classCode: 'G8B',
            grade: 8,
            description: 'Intermediate class preparing students for senior high entry.',
        },
        {
            className: 'Grade 9A',
            classCode: 'G9A',
            grade: 9,
            description: 'BECE preparation stream with strong science focus.',
        },
        {
            className: 'Grade 10B',
            classCode: 'G10B',
            grade: 10,
            description: 'Senior high science class — WASSCE track.',
        },
    ];

    const classes = {};
    for (const def of classDefs) {
        const doc = await ClassModel.create({
            ...def,
            academicYear: ACADEMIC_YEAR,
            isActive: true,
        });
        classes[def.classCode] = doc;
    }
    console.log(`   ✓ ${classDefs.length} classes`);

    // ── Teachers ─────────────────────────────────────────────
    const teacherDefs = [
        {
            key: 'sarah',
            firstName: 'Sarah',
            lastName: 'Mensah',
            email: SEED_MARKER_EMAIL,
            gender: 'female',
            photo: portrait('female', 44),
            phone: '+233241000001',
            dob: '1988-03-14',
            street: '12 Independence Ave',
            classes: ['G7A', 'G8B'],
            qualification: 'B.Ed Mathematics — University of Cape Coast',
            idType: 'National ID',
        },
        {
            key: 'kwame',
            firstName: 'Kwame',
            lastName: 'Owusu',
            email: `kwame.owusu@${DEMO_EMAIL_DOMAIN}`,
            gender: 'male',
            photo: portrait('male', 32),
            phone: '+233241000002',
            dob: '1985-07-22',
            street: '45 Liberation Rd',
            classes: ['G9A', 'G10B'],
            qualification: 'M.Sc Physics — KNUST',
            idType: 'Passport',
        },
        {
            key: 'ama',
            firstName: 'Ama',
            lastName: 'Boateng',
            email: `ama.boateng@${DEMO_EMAIL_DOMAIN}`,
            gender: 'female',
            photo: portrait('female', 68),
            phone: '+233241000003',
            dob: '1990-11-05',
            street: '8 Ring Road East',
            classes: ['G7A', 'G9A'],
            qualification: 'B.A English — University of Ghana',
            idType: 'National ID',
        },
        {
            key: 'daniel',
            firstName: 'Daniel',
            lastName: 'Asante',
            email: `daniel.asante@${DEMO_EMAIL_DOMAIN}`,
            gender: 'male',
            photo: portrait('male', 52),
            phone: '+233241000004',
            dob: '1987-01-30',
            street: '22 Airport Residential',
            classes: ['G8B', 'G10B'],
            qualification: 'B.Sc Biology — University of Ghana',
            idType: "Driver's License",
        },
    ];

    const teachers = {};
    for (const def of teacherDefs) {
        const user = await createUser(
            {
                firstName: def.firstName,
                lastName: def.lastName,
                email: def.email,
                role: 'teacher',
                gender: def.gender,
                photo: def.photo,
                dateOfBirth: new Date(def.dob),
                contactInfo: contact(def.phone),
                address: address(def.street),
            },
            hashedPassword
        );

        const classIds = def.classes.map((code) => classes[code]._id);
        const teacher = await TeacherModel.create({
            user: user._id,
            classes: classIds,
            students: [],
            qualifications: [
                { title: def.qualification, document: PLACEHOLDER_DOC },
                {
                    title: 'Teaching Certificate — GES',
                    document: PLACEHOLDER_DOC,
                },
            ],
            identification: {
                type: def.idType,
                front: PLACEHOLDER_DOC,
                back: def.idType === 'Passport' ? '' : PLACEHOLDER_DOC,
            },
        });

        await ClassModel.updateMany(
            { _id: { $in: classIds } },
            { $addToSet: { teachers: teacher._id } }
        );

        teachers[def.key] = { user, teacher, def };
    }
    console.log(`   ✓ ${teacherDefs.length} teachers`);

    // ── Guardians ────────────────────────────────────────────
    const guardianDefs = [
        {
            key: 'akosua',
            firstName: 'Akosua',
            lastName: 'Addo',
            email: `akosua.addo@${DEMO_EMAIL_DOMAIN}`,
            gender: 'female',
            photo: portrait('female', 21),
            phone: '+233501000001',
            dob: '1978-05-12',
            street: '3 Labone Crescent',
            idType: 'National ID',
        },
        {
            key: 'kofi',
            firstName: 'Kofi',
            lastName: 'Darko',
            email: `kofi.darko@${DEMO_EMAIL_DOMAIN}`,
            gender: 'male',
            photo: portrait('male', 75),
            phone: '+233501000002',
            dob: '1975-09-18',
            street: '17 East Legon Hills',
            idType: 'Passport',
        },
        {
            key: 'efua',
            firstName: 'Efua',
            lastName: 'Sarpong',
            email: `efua.sarpong@${DEMO_EMAIL_DOMAIN}`,
            gender: 'female',
            photo: portrait('female', 33),
            phone: '+233501000003',
            dob: '1980-12-03',
            street: '9 Cantonments Road',
            idType: 'National ID',
        },
        {
            key: 'yaw',
            firstName: 'Yaw',
            lastName: 'Agyeman',
            email: `yaw.agyeman@${DEMO_EMAIL_DOMAIN}`,
            gender: 'male',
            photo: portrait('male', 11),
            phone: '+233501000004',
            dob: '1972-04-27',
            street: '55 Dansoman Estates',
            idType: "Driver's License",
        },
    ];

    const guardians = {};
    for (const def of guardianDefs) {
        const user = await createUser(
            {
                firstName: def.firstName,
                lastName: def.lastName,
                email: def.email,
                role: 'guardian',
                gender: def.gender,
                photo: def.photo,
                dateOfBirth: new Date(def.dob),
                contactInfo: contact(def.phone, def.phone.replace('501', '502')),
                address: address(def.street),
            },
            hashedPassword
        );

        const guardian = await GuardianModel.create({
            user: user._id,
            students: [],
            idType: def.idType,
            identification: {
                front: PLACEHOLDER_DOC,
                back: def.idType === 'Passport' ? '' : PLACEHOLDER_DOC,
            },
        });

        guardians[def.key] = { user, guardian, def };
    }
    console.log(`   ✓ ${guardianDefs.length} guardians`);

    // ── Students ─────────────────────────────────────────────
    const studentDefs = [
        // Grade 7A
        { firstName: 'Abena', lastName: 'Addo', email: `abena.addo@${DEMO_EMAIL_DOMAIN}`, gender: 'female', photo: portrait('female', 12), dob: '2013-02-11', phone: '+233551000001', classCode: 'G7A', guardianKey: 'akosua', street: '3 Labone Crescent' },
        { firstName: 'Kojo', lastName: 'Addo', email: `kojo.addo@${DEMO_EMAIL_DOMAIN}`, gender: 'male', photo: portrait('male', 15), dob: '2013-08-19', phone: '+233551000002', classCode: 'G7A', guardianKey: 'akosua', street: '3 Labone Crescent' },
        { firstName: 'Adwoa', lastName: 'Nkrumah', email: `adwoa.nkrumah@${DEMO_EMAIL_DOMAIN}`, gender: 'female', photo: portrait('female', 26), dob: '2013-05-03', phone: '+233551000003', classCode: 'G7A', guardianKey: 'kofi', street: '17 East Legon Hills' },
        // Grade 8B
        { firstName: 'Kwesi', lastName: 'Darko', email: `kwesi.darko@${DEMO_EMAIL_DOMAIN}`, gender: 'male', photo: portrait('male', 22), dob: '2012-01-25', phone: '+233551000004', classCode: 'G8B', guardianKey: 'kofi', street: '17 East Legon Hills' },
        { firstName: 'Afia', lastName: 'Sarpong', email: `afia.sarpong@${DEMO_EMAIL_DOMAIN}`, gender: 'female', photo: portrait('female', 47), dob: '2012-06-14', phone: '+233551000005', classCode: 'G8B', guardianKey: 'efua', street: '9 Cantonments Road' },
        { firstName: 'Fiifi', lastName: 'Mensah', email: `fiifi.mensah@${DEMO_EMAIL_DOMAIN}`, gender: 'male', photo: portrait('male', 36), dob: '2012-10-08', phone: '+233551000006', classCode: 'G8B', guardianKey: 'efua', street: '9 Cantonments Road' },
        // Grade 9A
        { firstName: 'Akua', lastName: 'Agyeman', email: `akua.agyeman@${DEMO_EMAIL_DOMAIN}`, gender: 'female', photo: portrait('female', 55), dob: '2011-03-21', phone: '+233551000007', classCode: 'G9A', guardianKey: 'yaw', street: '55 Dansoman Estates' },
        { firstName: 'Kweku', lastName: 'Agyeman', email: `kweku.agyeman@${DEMO_EMAIL_DOMAIN}`, gender: 'male', photo: portrait('male', 41), dob: '2011-09-02', phone: '+233551000008', classCode: 'G9A', guardianKey: 'yaw', street: '55 Dansoman Estates' },
        { firstName: 'Esi', lastName: 'Boateng', email: `esi.boateng@${DEMO_EMAIL_DOMAIN}`, gender: 'female', photo: portrait('female', 63), dob: '2011-12-17', phone: '+233551000009', classCode: 'G9A', guardianKey: 'akosua', street: '3 Labone Crescent' },
        // Grade 10B
        { firstName: 'Yaw', lastName: 'Owusu', email: `yaw.owusu@${DEMO_EMAIL_DOMAIN}`, gender: 'male', photo: portrait('male', 61), dob: '2010-04-09', phone: '+233551000010', classCode: 'G10B', guardianKey: 'kofi', street: '17 East Legon Hills' },
        { firstName: 'Maame', lastName: 'Asante', email: `maame.asante@${DEMO_EMAIL_DOMAIN}`, gender: 'female', photo: portrait('female', 89), dob: '2010-07-28', phone: '+233551000011', classCode: 'G10B', guardianKey: 'efua', street: '9 Cantonments Road' },
        { firstName: 'Nana', lastName: 'Kufuor', email: `nana.kufuor@${DEMO_EMAIL_DOMAIN}`, gender: 'male', photo: portrait('male', 83), dob: '2010-11-15', phone: '+233551000012', classCode: 'G10B', guardianKey: 'yaw', street: '55 Dansoman Estates' },
    ];

    const students = [];
    const studentsByClass = { G7A: [], G8B: [], G9A: [], G10B: [] };

    for (const def of studentDefs) {
        const user = await createUser(
            {
                firstName: def.firstName,
                lastName: def.lastName,
                email: def.email,
                role: 'student',
                gender: def.gender,
                photo: def.photo,
                dateOfBirth: new Date(def.dob),
                contactInfo: contact(def.phone),
                address: address(def.street),
            },
            hashedPassword
        );

        const classDoc = classes[def.classCode];
        const guardianDoc = guardians[def.guardianKey].guardian;

        const student = await StudentModel.create({
            user: user._id,
            idType: 'National ID',
            identification: { front: PLACEHOLDER_DOC, back: PLACEHOLDER_DOC },
            class: classDoc._id,
            guardian: guardianDoc._id,
            emergencyContact: guardians[def.guardianKey].def.phone,
        });

        await ClassModel.findByIdAndUpdate(classDoc._id, {
            $addToSet: { students: student._id },
        });
        await GuardianModel.findByIdAndUpdate(guardianDoc._id, {
            $addToSet: { students: student._id },
        });

        const classTeachers = await TeacherModel.find({ classes: classDoc._id }).select('_id');
        await TeacherModel.updateMany(
            { _id: { $in: classTeachers.map((t) => t._id) } },
            { $addToSet: { students: student._id } }
        );

        const entry = { user, student, def };
        students.push(entry);
        studentsByClass[def.classCode].push(entry);
    }
    console.log(`   ✓ ${studentDefs.length} students`);

    // ── Courses ──────────────────────────────────────────────
    const courseDefs = [
        { courseName: 'Mathematics', courseCode: 'MATH7', classCode: 'G7A', teacherKey: 'sarah', type: 'Core', description: 'Number systems, fractions, and basic algebra.' },
        { courseName: 'English Language', courseCode: 'ENG7', classCode: 'G7A', teacherKey: 'ama', type: 'Core', description: 'Grammar, comprehension, and composition.' },
        { courseName: 'Mathematics', courseCode: 'MATH8', classCode: 'G8B', teacherKey: 'sarah', type: 'Core', description: 'Algebra, geometry, and problem solving.' },
        { courseName: 'Integrated Science', courseCode: 'SCI8', classCode: 'G8B', teacherKey: 'daniel', type: 'Core', description: 'Intro to biology, chemistry, and physics.' },
        { courseName: 'English Literature', courseCode: 'LIT9', classCode: 'G9A', teacherKey: 'ama', type: 'Core', description: 'African literature and poetry analysis.' },
        { courseName: 'Physics', courseCode: 'PHY9', classCode: 'G9A', teacherKey: 'kwame', type: 'Core', description: 'Mechanics, heat, and electricity basics.' },
        { courseName: 'Chemistry', courseCode: 'CHEM10', classCode: 'G10B', teacherKey: 'kwame', type: 'Core', description: 'Organic chemistry and stoichiometry.' },
        { courseName: 'Biology', courseCode: 'BIO10', classCode: 'G10B', teacherKey: 'daniel', type: 'Core', description: 'Cell biology, genetics, and ecology.' },
        { courseName: 'Mathematics', courseCode: 'MATH10', classCode: 'G10B', teacherKey: 'sarah', type: 'Core', description: 'Functions, trigonometry, and calculus intro.' },
        { courseName: 'Chemistry Prep', courseCode: 'CHEM9', classCode: 'G9A', teacherKey: 'kwame', type: 'Elective', description: 'BECE chemistry booster sessions.' },
    ];

    // Sarah also teaches MATH10 — ensure class + student links
    await ClassModel.findByIdAndUpdate(classes.G10B._id, {
        $addToSet: { teachers: teachers.sarah.teacher._id },
    });
    await TeacherModel.findByIdAndUpdate(teachers.sarah.teacher._id, {
        $addToSet: {
            classes: classes.G10B._id,
            students: { $each: studentsByClass.G10B.map((s) => s.student._id) },
        },
    });

    const courses = {};
    for (const def of courseDefs) {
        const classDoc = classes[def.classCode];
        const teacher = teachers[def.teacherKey].teacher;
        const classStudents = studentsByClass[def.classCode].map((s) => s.student._id);

        const course = await CourseModel.create({
            courseName: def.courseName,
            courseCode: def.courseCode,
            courseDescription: def.description,
            courseType: def.type,
            courseStatus: 'Active',
            courseClass: classDoc._id,
            courseTeachers: [teacher._id],
            courseStudents: classStudents,
        });

        await ClassModel.findByIdAndUpdate(classDoc._id, {
            $addToSet: { courses: course._id },
        });

        courses[def.courseCode] = { course, def };
    }
    console.log(`   ✓ ${courseDefs.length} courses`);

    // ── Lessons (past + this week + upcoming) ─────────────────
    const lessonDefs = [
        // G7A Math / English
        { title: 'Fractions and Decimals', subject: 'Mathematics', courseCode: 'MATH7', classCode: 'G7A', teacherKey: 'sarah', daysAgo: 14, duration: 60, notes: 'Covered equivalent fractions and converting to decimals.', materials: true },
        { title: 'Algebraic Expressions', subject: 'Mathematics', courseCode: 'MATH7', classCode: 'G7A', teacherKey: 'sarah', daysAgo: 7, duration: 60, notes: 'Simplifying expressions and collecting like terms.' },
        { title: 'Word Problems Clinic', subject: 'Mathematics', courseCode: 'MATH7', classCode: 'G7A', teacherKey: 'sarah', daysAgo: 3, duration: 60, notes: 'Applied fractions to market and travel word problems.' },
        { title: 'Introduction to Poetry', subject: 'English Language', courseCode: 'ENG7', classCode: 'G7A', teacherKey: 'ama', daysAgo: 10, duration: 45, notes: 'Read selected Ghanaian poems and discussed imagery.' },
        { title: 'Paragraph Writing', subject: 'English Language', courseCode: 'ENG7', classCode: 'G7A', teacherKey: 'ama', daysAgo: 2, duration: 45, notes: 'Topic sentences and supporting details.' },
        { title: 'Reading Comprehension Drill', subject: 'English Language', courseCode: 'ENG7', classCode: 'G7A', teacherKey: 'ama', daysAgo: -1, duration: 45, notes: 'Timed comprehension practice.' },
        // G8B
        { title: 'Linear Equations', subject: 'Mathematics', courseCode: 'MATH8', classCode: 'G8B', teacherKey: 'sarah', daysAgo: 12, duration: 60, notes: 'Solving one-variable linear equations.', materials: true },
        { title: 'Geometry: Triangles', subject: 'Mathematics', courseCode: 'MATH8', classCode: 'G8B', teacherKey: 'sarah', daysAgo: 5, duration: 60, notes: 'Properties of triangles and angle sums.' },
        { title: 'Coordinate Plane', subject: 'Mathematics', courseCode: 'MATH8', classCode: 'G8B', teacherKey: 'sarah', daysAgo: -2, duration: 60, notes: 'Plotting points and reading graphs.' },
        { title: 'The Human Digestive System', subject: 'Integrated Science', courseCode: 'SCI8', classCode: 'G8B', teacherKey: 'daniel', daysAgo: 8, duration: 60, notes: 'Organs of digestion and enzyme functions.' },
        { title: 'Photosynthesis Basics', subject: 'Integrated Science', courseCode: 'SCI8', classCode: 'G8B', teacherKey: 'daniel', daysAgo: 1, duration: 60, notes: 'Light and dark reactions overview.' },
        { title: 'Lab Safety Briefing', subject: 'Integrated Science', courseCode: 'SCI8', classCode: 'G8B', teacherKey: 'daniel', daysAgo: -4, duration: 45, notes: 'Rules before practical week.' },
        // G9A
        { title: 'Forces and Motion', subject: 'Physics', courseCode: 'PHY9', classCode: 'G9A', teacherKey: 'kwame', daysAgo: 11, duration: 75, notes: "Newton's laws with classroom demos.", materials: true },
        { title: 'Work, Energy and Power', subject: 'Physics', courseCode: 'PHY9', classCode: 'G9A', teacherKey: 'kwame', daysAgo: 4, duration: 75, notes: 'Calculations with joules and watts.' },
        { title: 'Electric Circuits Intro', subject: 'Physics', courseCode: 'PHY9', classCode: 'G9A', teacherKey: 'kwame', daysAgo: -3, duration: 75, notes: 'Series vs parallel circuits.' },
        { title: 'African Short Stories', subject: 'English Literature', courseCode: 'LIT9', classCode: 'G9A', teacherKey: 'ama', daysAgo: 9, duration: 60, notes: 'Character and theme analysis.' },
        { title: 'Essay Writing Workshop', subject: 'English Literature', courseCode: 'LIT9', classCode: 'G9A', teacherKey: 'ama', daysAgo: 2, duration: 60, notes: 'Argumentative essay structure and thesis statements.' },
        { title: 'Poetry for BECE', subject: 'English Literature', courseCode: 'LIT9', classCode: 'G9A', teacherKey: 'ama', daysAgo: -5, duration: 60, notes: 'Unseen poem practice.' },
        { title: 'Acids and Bases', subject: 'Chemistry Prep', courseCode: 'CHEM9', classCode: 'G9A', teacherKey: 'kwame', daysAgo: 6, duration: 60, notes: 'pH scale and everyday examples.' },
        // G10B — dense for VIP student demos
        { title: 'Cell Structure and Function', subject: 'Biology', courseCode: 'BIO10', classCode: 'G10B', teacherKey: 'daniel', daysAgo: 13, duration: 75, notes: 'Microscope lab — onion epidermis cells.', materials: true },
        { title: 'Mendelian Genetics', subject: 'Biology', courseCode: 'BIO10', classCode: 'G10B', teacherKey: 'daniel', daysAgo: 6, duration: 75, notes: 'Punnett squares and inheritance patterns.' },
        { title: 'Ecology Field Notes', subject: 'Biology', courseCode: 'BIO10', classCode: 'G10B', teacherKey: 'daniel', daysAgo: 1, duration: 75, notes: 'Food chains and ecosystems around campus.' },
        { title: 'Genetics Review Clinic', subject: 'Biology', courseCode: 'BIO10', classCode: 'G10B', teacherKey: 'daniel', daysAgo: -2, duration: 60, notes: 'Past-question drill before unit test.' },
        { title: 'Stoichiometry Practice', subject: 'Chemistry', courseCode: 'CHEM10', classCode: 'G10B', teacherKey: 'kwame', daysAgo: 10, duration: 75, notes: 'Mole calculations and limiting reagents.', materials: true },
        { title: 'Organic Chemistry Intro', subject: 'Chemistry', courseCode: 'CHEM10', classCode: 'G10B', teacherKey: 'kwame', daysAgo: 3, duration: 75, notes: 'Alkanes, alkenes, and functional groups.' },
        { title: 'Titration Practical', subject: 'Chemistry', courseCode: 'CHEM10', classCode: 'G10B', teacherKey: 'kwame', daysAgo: -1, duration: 90, notes: 'Acid-base titration lab session.' },
        { title: 'Trigonometric Ratios', subject: 'Mathematics', courseCode: 'MATH10', classCode: 'G10B', teacherKey: 'sarah', daysAgo: 8, duration: 60, notes: 'SOH-CAH-TOA applications.' },
        { title: 'Quadratic Functions', subject: 'Mathematics', courseCode: 'MATH10', classCode: 'G10B', teacherKey: 'sarah', daysAgo: 2, duration: 60, notes: 'Graphs and completing the square.' },
        { title: 'Sequences and Series', subject: 'Mathematics', courseCode: 'MATH10', classCode: 'G10B', teacherKey: 'sarah', daysAgo: -4, duration: 60, notes: 'Arithmetic and geometric sequences.' },
    ];

    const lessons = [];
    for (const def of lessonDefs) {
        const lesson = await LessonModel.create({
            title: def.title,
            subject: def.subject,
            course: courses[def.courseCode].course._id,
            class: classes[def.classCode]._id,
            teacher: teachers[def.teacherKey].teacher._id,
            scheduledAt: daysFromNow(-def.daysAgo, def.daysAgo % 2 === 0 ? 9 : 11),
            durationMinutes: def.duration,
            notes: def.notes,
            teacherNotes: def.daysAgo > 0 ? 'Lesson completed as planned.' : 'Prepare slides and worksheet.',
            materials: def.materials ? [PLACEHOLDER_MATERIAL] : [],
            isActive: true,
        });
        lessons.push({ lesson, def });
    }
    console.log(`   ✓ ${lessonDefs.length} lessons`);

    const attendanceCount = await seedAttendanceForLessons(lessons, studentsByClass, teachers);
    console.log(`   ✓ ${attendanceCount} attendance records`);

    // ── Homework ─────────────────────────────────────────────
    const homeworkDefs = [
        { title: 'Fraction Word Problems', subject: 'Mathematics', courseCode: 'MATH7', classCode: 'G7A', teacherKey: 'sarah', dueIn: 3, instructions: 'Complete exercises 1–15 from Chapter 4. Show all working.', materials: true },
        { title: 'Comprehension Passage', subject: 'English Language', courseCode: 'ENG7', classCode: 'G7A', teacherKey: 'ama', dueIn: 5, instructions: 'Read the attached passage and answer questions A–E in complete sentences.', materials: true },
        { title: 'Spelling and Vocabulary', subject: 'English Language', courseCode: 'ENG7', classCode: 'G7A', teacherKey: 'ama', dueIn: 8, instructions: 'Learn the 20 weekly words and write one sentence each.' },
        { title: 'Linear Equations Practice', subject: 'Mathematics', courseCode: 'MATH8', classCode: 'G8B', teacherKey: 'sarah', dueIn: 2, instructions: 'Solve worksheet Set B. Submit neat handwritten solutions.', materials: true },
        { title: 'Digestive System Diagram', subject: 'Integrated Science', courseCode: 'SCI8', classCode: 'G8B', teacherKey: 'daniel', dueIn: 7, instructions: 'Draw and label the human digestive system. Write a short note on each organ.' },
        { title: "Newton's Laws Summary", subject: 'Physics', courseCode: 'PHY9', classCode: 'G9A', teacherKey: 'kwame', dueIn: 4, instructions: "Summarize Newton's three laws with one everyday example each.", materials: true },
        { title: 'Literature Essay Draft', subject: 'English Literature', courseCode: 'LIT9', classCode: 'G9A', teacherKey: 'ama', dueIn: 6, instructions: 'Write a 400-word essay on theme in the assigned short story.' },
        { title: 'Cell Organelles Chart', subject: 'Biology', courseCode: 'BIO10', classCode: 'G10B', teacherKey: 'daniel', dueIn: 3, instructions: 'Create a comparison chart of plant vs animal cell organelles.', materials: true },
        { title: 'Genetics Problem Set', subject: 'Biology', courseCode: 'BIO10', classCode: 'G10B', teacherKey: 'daniel', dueIn: 9, instructions: 'Complete Punnett square problems 1–12. Show genotypes and phenotypes.' },
        { title: 'Mole Calculation Sheet', subject: 'Chemistry', courseCode: 'CHEM10', classCode: 'G10B', teacherKey: 'kwame', dueIn: 5, instructions: 'Solve stoichiometry questions A–H. Include units in every answer.', materials: true },
        { title: 'Trigonometry Applications', subject: 'Mathematics', courseCode: 'MATH10', classCode: 'G10B', teacherKey: 'sarah', dueIn: 4, instructions: 'Word problems involving heights and distances. Diagrams required.' },
        { title: 'Organic Naming Drill', subject: 'Chemistry', courseCode: 'CHEM10', classCode: 'G10B', teacherKey: 'kwame', dueIn: 11, instructions: 'Name the given hydrocarbons using IUPAC rules.' },
    ];

    for (const def of homeworkDefs) {
        await HomeworkModel.create({
            title: def.title,
            subject: def.subject,
            course: courses[def.courseCode].course._id,
            class: classes[def.classCode]._id,
            teacher: teachers[def.teacherKey].teacher._id,
            dueDate: daysFromNow(def.dueIn, 23),
            instructions: def.instructions,
            materials: def.materials ? [PLACEHOLDER_MATERIAL] : [],
            isActive: true,
        });
    }
    console.log(`   ✓ ${homeworkDefs.length} homework assignments`);

    // ── Exams ────────────────────────────────────────────────
    const examDefs = [
        { title: 'Mathematics Midterm', subject: 'Mathematics', courseCode: 'MATH7', classCode: 'G7A', teacherKey: 'sarah', examType: 'midterm', daysAgo: 10, startTime: '09:00', endTime: '11:00', duration: 120, venue: 'Hall A', totalMarks: 100, passingMarks: 50, status: 'completed', withResults: true },
        { title: 'English Language Quiz', subject: 'English Language', courseCode: 'ENG7', classCode: 'G7A', teacherKey: 'ama', examType: 'quiz', daysAgo: 4, startTime: '10:00', endTime: '10:45', duration: 45, venue: 'Room 3', totalMarks: 40, passingMarks: 20, status: 'completed', withResults: true },
        { title: 'Mathematics Unit Test', subject: 'Mathematics', courseCode: 'MATH8', classCode: 'G8B', teacherKey: 'sarah', examType: 'unit_test', daysAgo: 7, startTime: '09:00', endTime: '10:30', duration: 90, venue: 'Hall A', totalMarks: 60, passingMarks: 30, status: 'completed', withResults: true },
        { title: 'Science Practical Test', subject: 'Integrated Science', courseCode: 'SCI8', classCode: 'G8B', teacherKey: 'daniel', examType: 'unit_test', daysAgo: 3, startTime: '11:00', endTime: '12:00', duration: 60, venue: 'Lab 1', totalMarks: 50, passingMarks: 25, status: 'completed', withResults: true },
        { title: 'Physics Unit Test', subject: 'Physics', courseCode: 'PHY9', classCode: 'G9A', teacherKey: 'kwame', examType: 'unit_test', daysAgo: 5, startTime: '10:00', endTime: '11:30', duration: 90, venue: 'Lab 2', totalMarks: 50, passingMarks: 25, status: 'completed', withResults: true },
        { title: 'English Literature Midterm', subject: 'English Literature', courseCode: 'LIT9', classCode: 'G9A', teacherKey: 'ama', examType: 'midterm', daysAgo: -12, startTime: '09:00', endTime: '11:00', duration: 120, venue: 'Hall B', totalMarks: 100, passingMarks: 50, status: 'scheduled', withResults: false },
        { title: 'Biology Midterm', subject: 'Biology', courseCode: 'BIO10', classCode: 'G10B', teacherKey: 'daniel', examType: 'midterm', daysAgo: 9, startTime: '08:30', endTime: '10:30', duration: 120, venue: 'Hall B', totalMarks: 100, passingMarks: 50, status: 'completed', withResults: true },
        { title: 'Chemistry Unit Test', subject: 'Chemistry', courseCode: 'CHEM10', classCode: 'G10B', teacherKey: 'kwame', examType: 'unit_test', daysAgo: 4, startTime: '09:00', endTime: '10:30', duration: 90, venue: 'Lab 3', totalMarks: 60, passingMarks: 30, status: 'completed', withResults: true },
        { title: 'Mathematics Midterm', subject: 'Mathematics', courseCode: 'MATH10', classCode: 'G10B', teacherKey: 'sarah', examType: 'midterm', daysAgo: 6, startTime: '09:00', endTime: '11:00', duration: 120, venue: 'Hall A', totalMarks: 100, passingMarks: 50, status: 'completed', withResults: true },
        { title: 'Biology Final Prep Quiz', subject: 'Biology', courseCode: 'BIO10', classCode: 'G10B', teacherKey: 'daniel', examType: 'quiz', daysAgo: -8, startTime: '08:30', endTime: '09:15', duration: 45, venue: 'Room 12', totalMarks: 40, passingMarks: 20, status: 'scheduled', withResults: false },
        { title: 'Chemistry Mock Exam', subject: 'Chemistry', courseCode: 'CHEM10', classCode: 'G10B', teacherKey: 'kwame', examType: 'final', daysAgo: -15, startTime: '09:00', endTime: '12:00', duration: 180, venue: 'Hall A', totalMarks: 100, passingMarks: 50, status: 'scheduled', withResults: false },
    ];

    for (const def of examDefs) {
        const roster = studentsByClass[def.classCode];
        const studentIds = roster.map((s) => s.student._id);
        const results = def.withResults ? await buildExamResults(roster, def.totalMarks) : [];

        const exam = await ExamModel.create({
            title: def.title,
            description: `${def.title} for ${classes[def.classCode].className}`,
            subject: def.subject,
            examType: def.examType,
            class: classes[def.classCode]._id,
            teacher: teachers[def.teacherKey].teacher._id,
            students: studentIds,
            examDate: daysFromNow(-def.daysAgo),
            startTime: def.startTime,
            endTime: def.endTime,
            duration: def.duration,
            venue: def.venue,
            totalMarks: def.totalMarks,
            passingMarks: def.passingMarks,
            instructions: 'Bring your student ID. No electronic devices allowed.',
            status: def.status,
            results,
            isActive: true,
        });

        await ClassModel.findByIdAndUpdate(classes[def.classCode]._id, {
            $addToSet: { exams: exam._id },
        });
    }
    console.log(`   ✓ ${examDefs.length} exams`);

    // ── Payments — every student has a realistic fee trail ───
    const paymentDefs = [];
    for (const entry of students) {
        const grade = classes[entry.def.classCode].grade;
        const tuition = grade >= 10 ? 1500 : grade >= 9 ? 1350 : 1200;
        paymentDefs.push(
            {
                studentEmail: entry.def.email,
                title: 'Term 1 Tuition Fee',
                purpose: 'tuition',
                amount: tuition,
                amountPaid: tuition,
                status: 'paid',
                method: 'stripe',
                daysDue: -45,
                term: 'Term 1',
            },
            {
                studentEmail: entry.def.email,
                title: 'Term 2 Tuition Fee',
                purpose: 'tuition',
                amount: tuition,
                amountPaid: entry.def.classCode === 'G8B' ? tuition / 2 : entry.def.classCode === 'G7A' ? 0 : tuition,
                status:
                    entry.def.classCode === 'G8B'
                        ? 'partial'
                        : entry.def.classCode === 'G7A'
                          ? 'pending'
                          : 'paid',
                method: 'stripe',
                daysDue: 18,
                term: 'Term 2',
            }
        );
    }

    // Extra purpose variety
    paymentDefs.push(
        { studentEmail: `afia.sarpong@${DEMO_EMAIL_DOMAIN}`, title: 'School Uniform Kit', purpose: 'uniform', amount: 180, amountPaid: 180, status: 'paid', method: 'cash', daysDue: -10, term: 'Term 2' },
        { studentEmail: `akua.agyeman@${DEMO_EMAIL_DOMAIN}`, title: 'BECE Exam Fee', purpose: 'exam_fee', amount: 250, amountPaid: 0, status: 'pending', method: 'stripe', daysDue: 25, term: 'Term 2' },
        { studentEmail: `yaw.owusu@${DEMO_EMAIL_DOMAIN}`, title: 'Science Lab Materials', purpose: 'activity', amount: 95, amountPaid: 0, status: 'pending', method: 'stripe', daysDue: 10, term: 'Term 2' },
        { studentEmail: `nana.kufuor@${DEMO_EMAIL_DOMAIN}`, title: 'Library Membership', purpose: 'library', amount: 40, amountPaid: 0, status: 'pending', method: 'stripe', daysDue: 7, term: 'Term 2' },
        { studentEmail: `kwesi.darko@${DEMO_EMAIL_DOMAIN}`, title: 'Transport Fee — Term 2', purpose: 'transport', amount: 320, amountPaid: 320, status: 'paid', method: 'mobile_money', daysDue: -8, term: 'Term 2' },
        { studentEmail: `maame.asante@${DEMO_EMAIL_DOMAIN}`, title: 'Textbook Bundle', purpose: 'books', amount: 210, amountPaid: 100, status: 'partial', method: 'bank_transfer', daysDue: 12, term: 'Term 2' },
        { studentEmail: `esi.boateng@${DEMO_EMAIL_DOMAIN}`, title: 'Sports Day Kit', purpose: 'activity', amount: 55, amountPaid: 55, status: 'paid', method: 'cash', daysDue: -3, term: 'Term 2' },
        { studentEmail: `abena.addo@${DEMO_EMAIL_DOMAIN}`, title: 'Boarding Deposit', purpose: 'hostel', amount: 400, amountPaid: 0, status: 'pending', method: 'stripe', daysDue: 30, term: 'Term 2' }
    );

    for (const def of paymentDefs) {
        const studentEntry = students.find((s) => s.def.email === def.studentEmail);
        if (!studentEntry) continue;

        const dueDate = daysFromNow(def.daysDue);
        const paidDate =
            def.status === 'paid' || def.status === 'partial'
                ? daysFromNow(def.daysDue - 5)
                : undefined;

        await PaymentModel.create({
            student: studentEntry.student._id,
            guardian: studentEntry.student.guardian,
            class: studentEntry.student.class,
            title: def.title,
            purpose: def.purpose,
            description: `${def.title} — Academic Year ${ACADEMIC_YEAR}`,
            amount: def.amount,
            amountPaid: def.amountPaid,
            currency: 'USD',
            method: def.method,
            status: def.status,
            term: def.term,
            academicYear: ACADEMIC_YEAR,
            dueDate,
            paidDate,
            notes: SEED_TAG,
            isActive: true,
        });
    }
    console.log(`   ✓ ${paymentDefs.length} payments`);

    // ── Announcements ────────────────────────────────────────
    const announcementDefs = [
        {
            title: 'Welcome Back Assembly',
            description:
                'All students and staff are invited to the welcome assembly on Monday at 8:00 AM in the main hall. Uniform inspection will follow.',
            category: ['general'],
            severity: ['low'],
            targetAudience: ['all'],
        },
        {
            title: 'Midterm Exam Timetable',
            description:
                'Midterm examinations begin next week. Please check the notice board for your class schedule. Arrive 15 minutes early with your student ID.',
            category: ['academic'],
            severity: ['high'],
            targetAudience: ['students', 'guardians', 'teachers'],
        },
        {
            title: 'PTA Meeting Notice',
            description:
                'The Parent-Teacher Association meeting is scheduled for Saturday at 10:00 AM. Agenda includes fee structure review and sports day planning.',
            category: ['general'],
            severity: ['medium'],
            targetAudience: ['guardians', 'teachers'],
        },
        {
            title: 'Sports Day Reminder',
            description:
                'Inter-house sports day is coming up. Students should wear house colours. Guardians are welcome to attend from 9:00 AM.',
            category: ['general'],
            severity: ['low'],
            targetAudience: ['all'],
        },
        {
            title: 'Library Week Activities',
            description:
                'Library Week runs Monday to Friday. Book fair, reading competitions, and author visits. All classes encouraged to participate.',
            category: ['academic'],
            severity: ['low'],
            targetAudience: ['students', 'teachers'],
        },
        {
            title: 'Fee Payment Deadline',
            description:
                'Term 2 tuition balances are due within three weeks. Guardians can pay online via the Payments page or at the accounts office.',
            category: ['general'],
            severity: ['high'],
            targetAudience: ['guardians', 'students'],
        },
        {
            title: 'Career Guidance Week',
            description:
                'Grade 9 and 10 students will meet counsellors for senior-track planning. Sign-up sheets are with class teachers.',
            category: ['academic'],
            severity: ['medium'],
            targetAudience: ['students', 'guardians', 'teachers'],
        },
        {
            title: 'Health Screening Day',
            description:
                'School nurse will run basic health checks on Thursday. Bring your student health card if you have one.',
            category: ['general'],
            severity: ['medium'],
            targetAudience: ['students', 'guardians'],
        },
    ];

    await AnnouncementModel.insertMany(announcementDefs);
    console.log(`   ✓ ${announcementDefs.length} announcements`);

    // ── Complaints ───────────────────────────────────────────
    const complaintDefs = [
        {
            title: 'Classroom Disruption',
            description:
                'A student repeatedly interrupts lessons during Mathematics class. Request for counselling support.',
            category: ['other'],
            severity: ['medium'],
            status: ['in_progress'],
            reporterKey: 'sarah',
            reporterType: 'teacher',
            reportedParty: 'Student in Grade 7A',
            witnesses: 'Class prefect',
            daysAgo: 14,
        },
        {
            title: 'Bullying on School Bus',
            description:
                'My child reported being teased repeatedly on the morning bus route. Asking administration to investigate.',
            category: ['bullying'],
            severity: ['high'],
            status: ['pending'],
            reporterKey: 'efua',
            reporterType: 'guardian',
            reportedParty: 'Unidentified older students',
            witnesses: 'Bus attendant',
            daysAgo: 8,
        },
        {
            title: 'Uneven Marking Concern',
            description:
                'I believe my last quiz was graded inconsistently compared to classmates. Requesting a review of the scripts.',
            category: ['other'],
            severity: ['low'],
            status: ['resolved'],
            reporterEmail: `akua.agyeman@${DEMO_EMAIL_DOMAIN}`,
            reporterType: 'student',
            reportedParty: 'Physics department',
            witnesses: '',
            resolutionNotes:
                'Scripts rechecked. Marks confirmed correct. Student counselled on marking scheme.',
            daysAgo: 18,
        },
        {
            title: 'Lab Coat Shortage',
            description:
                'Several students in Grade 10B lack lab coats for chemistry practicals. Requesting store restock.',
            category: ['other'],
            severity: ['medium'],
            status: ['in_progress'],
            reporterKey: 'kwame',
            reporterType: 'teacher',
            reportedParty: 'School store',
            witnesses: 'Lab technician',
            daysAgo: 5,
        },
        {
            title: 'Late Report Cards',
            description:
                'Term 1 report cards for my wards have not arrived. Kindly advise on distribution date.',
            category: ['other'],
            severity: ['low'],
            status: ['resolved'],
            reporterKey: 'kofi',
            reporterType: 'guardian',
            reportedParty: 'Academic office',
            witnesses: '',
            resolutionNotes: 'Reports released; guardian collected copies from office.',
            daysAgo: 20,
        },
    ];

    for (const def of complaintDefs) {
        let reporterId;
        let reporterUserId;

        if (def.reporterType === 'teacher') {
            reporterId = teachers[def.reporterKey].teacher._id;
            reporterUserId = teachers[def.reporterKey].user._id;
        } else if (def.reporterType === 'guardian') {
            reporterId = guardians[def.reporterKey].guardian._id;
            reporterUserId = guardians[def.reporterKey].user._id;
        } else {
            const s = students.find((x) => x.def.email === def.reporterEmail);
            reporterId = s.student._id;
            reporterUserId = s.user._id;
        }

        const complaint = await ComplaintModel.create({
            title: def.title,
            description: def.description,
            category: def.category,
            severity: def.severity,
            status: def.status,
            reporter: reporterId,
            witnesses: def.witnesses,
            reportedParty: def.reportedParty,
            dateFiled: daysFromNow(-(def.daysAgo || 14)),
            dateResolved: def.status.includes('resolved') ? daysFromNow(-3) : undefined,
            resolutionNotes: def.resolutionNotes || '',
            resolutionDate: def.status.includes('resolved') ? daysFromNow(-3) : undefined,
        });

        await UserModel.findByIdAndUpdate(reporterUserId, {
            $addToSet: { complaints: complaint._id },
        });
    }
    console.log(`   ✓ ${complaintDefs.length} complaints`);

    return { classes, teachers, guardians, students, studentsByClass, courses, lessons };
}

/**
 * First-class demo accounts used for presentations / YouTube.
 * Preserves existing passwords & photos; rewires into the demo school.
 */
async function seedVipAccounts(ctx, hashedPassword) {
    console.log('🌟 Seeding VIP presentation accounts...');
    const { classes, teachers, courses, lessons } = ctx;
    let { studentsByClass } = ctx;

    const vipGuardianUser = await upsertUser(
        VIP.guardianEmail,
        {
            firstName: 'Ada',
            lastName: 'Fluant',
            role: 'guardian',
            gender: 'female',
            photo: portrait('female', 28),
            dateOfBirth: new Date('1979-06-18'),
            contactInfo: contact('+233244880001', '+233244880011'),
            address: address('14 Airport West Hills'),
        },
        hashedPassword,
        { resetPassword: false }
    );

    let vipGuardian = await GuardianModel.findOne({ user: vipGuardianUser._id });
    if (!vipGuardian) {
        vipGuardian = await GuardianModel.create({
            user: vipGuardianUser._id,
            students: [],
            idType: 'Passport',
            identification: { front: PLACEHOLDER_DOC, back: '' },
        });
    } else {
        vipGuardian.idType = 'Passport';
        vipGuardian.identification = {
            front: vipGuardian.identification?.front || PLACEHOLDER_DOC,
            back: vipGuardian.identification?.back || '',
        };
        await vipGuardian.save();
    }

    const vipStudentUser = await upsertUser(
        VIP.studentEmail,
        {
            firstName: 'Barongo',
            lastName: 'Bruce',
            role: 'student',
            gender: 'male',
            photo: portrait('male', 45),
            dateOfBirth: new Date('2010-05-16'),
            contactInfo: contact('+233551880001'),
            address: address('14 Airport West Hills'),
        },
        hashedPassword,
        { resetPassword: false }
    );

    let vipStudent = await StudentModel.findOne({ user: vipStudentUser._id });
    if (!vipStudent) {
        vipStudent = await StudentModel.create({
            user: vipStudentUser._id,
            idType: 'National ID',
            identification: { front: PLACEHOLDER_DOC, back: PLACEHOLDER_DOC },
            class: classes.G10B._id,
            guardian: vipGuardian._id,
            emergencyContact: '+233244880001',
        });
    } else {
        // Move into rich demo class; keep profile docs
        if (vipStudent.class && String(vipStudent.class) !== String(classes.G10B._id)) {
            await ClassModel.findByIdAndUpdate(vipStudent.class, {
                $pull: { students: vipStudent._id },
            });
            await CourseModel.updateMany(
                { courseClass: vipStudent.class },
                { $pull: { courseStudents: vipStudent._id } }
            );
        }
        vipStudent.class = classes.G10B._id;
        vipStudent.guardian = vipGuardian._id;
        vipStudent.emergencyContact = '+233244880001';
        vipStudent.idType = vipStudent.idType || 'National ID';
        vipStudent.identification = {
            front: vipStudent.identification?.front || PLACEHOLDER_DOC,
            back: vipStudent.identification?.back || PLACEHOLDER_DOC,
        };
        await vipStudent.save();
    }

    // Siblings under the same guardian for a full guardian dashboard
    const siblingDefs = [
        {
            key: 'mia',
            firstName: 'Mia',
            lastName: 'Egator',
            email: `mia.egator@${DEMO_EMAIL_DOMAIN}`,
            gender: 'female',
            photo: portrait('female', 18),
            dob: '2012-09-04',
            phone: '+233551880002',
            classCode: 'G8B',
        },
        {
            key: 'leo',
            firstName: 'Leo',
            lastName: 'Egator',
            email: `leo.egator@${DEMO_EMAIL_DOMAIN}`,
            gender: 'male',
            photo: portrait('male', 19),
            dob: '2013-01-22',
            phone: '+233551880003',
            classCode: 'G7A',
        },
    ];

    const vipWards = [
        {
            user: vipStudentUser,
            student: vipStudent,
            def: {
                email: VIP.studentEmail,
                classCode: 'G10B',
                firstName: 'Barongo',
                lastName: 'Bruce',
            },
        },
    ];

    for (const def of siblingDefs) {
        const user = await upsertUser(
            def.email,
            {
                firstName: def.firstName,
                lastName: def.lastName,
                role: 'student',
                gender: def.gender,
                photo: def.photo,
                dateOfBirth: new Date(def.dob),
                contactInfo: contact(def.phone),
                address: address('14 Airport West Hills'),
            },
            hashedPassword,
            { resetPassword: true }
        );

        let student = await StudentModel.findOne({ user: user._id });
        const classDoc = classes[def.classCode];
        if (!student) {
            student = await StudentModel.create({
                user: user._id,
                idType: 'National ID',
                identification: { front: PLACEHOLDER_DOC, back: PLACEHOLDER_DOC },
                class: classDoc._id,
                guardian: vipGuardian._id,
                emergencyContact: '+233244880001',
            });
        } else {
            if (student.class && String(student.class) !== String(classDoc._id)) {
                await ClassModel.findByIdAndUpdate(student.class, {
                    $pull: { students: student._id },
                });
            }
            student.class = classDoc._id;
            student.guardian = vipGuardian._id;
            student.emergencyContact = '+233244880001';
            await student.save();
        }

        vipWards.push({ user, student, def: { ...def } });
    }

    // Reset guardian ward list cleanly
    const wardIds = vipWards.map((w) => w.student._id);
    vipGuardian.students = wardIds;
    await vipGuardian.save();

    for (const ward of vipWards) {
        const classDoc = classes[ward.def.classCode];
        await ClassModel.findByIdAndUpdate(classDoc._id, {
            $addToSet: { students: ward.student._id },
        });
        await CourseModel.updateMany(
            { courseClass: classDoc._id },
            { $addToSet: { courseStudents: ward.student._id } }
        );
        await TeacherModel.updateMany(
            { classes: classDoc._id },
            { $addToSet: { students: ward.student._id } }
        );

        // Keep in-memory roster current for attendance / exam patching
        const roster = studentsByClass[ward.def.classCode];
        if (!roster.some((s) => String(s.student._id) === String(ward.student._id))) {
            roster.push(ward);
        }
    }

    // Patch completed exams so VIP wards appear in results
    for (const code of CLASS_CODES) {
        const roster = studentsByClass[code];
        const exams = await ExamModel.find({
            class: classes[code]._id,
            status: 'completed',
        });
        for (const exam of exams) {
            const studentIds = roster.map((s) => s.student._id);
            exam.students = studentIds;
            exam.results = await buildExamResults(roster, exam.totalMarks);
            await exam.save();
        }
        const upcoming = await ExamModel.find({
            class: classes[code]._id,
            status: { $ne: 'completed' },
        });
        for (const exam of upcoming) {
            exam.students = roster.map((s) => s.student._id);
            await exam.save();
        }
    }

    // Attendance for VIP wards on existing past lessons
    const attendanceCount = await seedAttendanceForLessons(lessons, studentsByClass, teachers);
    console.log(`   ✓ VIP attendance top-up: ${attendanceCount}`);

    // Clear prior VIP seed payments / complaints then recreate richly
    await PaymentModel.deleteMany({
        $or: [
            { guardian: vipGuardian._id, notes: { $regex: SEED_TAG } },
            { student: { $in: wardIds }, notes: { $regex: SEED_TAG } },
        ],
    });
    await ComplaintModel.deleteMany({ title: { $in: VIP_COMPLAINT_TITLES } });

    const vipPaymentDefs = [
        // Ernest (G10B) — full fee history across purposes
        { wardEmail: VIP.studentEmail, title: 'Term 1 Tuition Fee', purpose: 'tuition', amount: 1500, amountPaid: 1500, status: 'paid', method: 'stripe', daysDue: -50, term: 'Term 1' },
        { wardEmail: VIP.studentEmail, title: 'Term 2 Tuition Fee', purpose: 'tuition', amount: 1500, amountPaid: 750, status: 'partial', method: 'stripe', daysDue: 14, term: 'Term 2' },
        { wardEmail: VIP.studentEmail, title: 'Science Lab Materials', purpose: 'activity', amount: 120, amountPaid: 120, status: 'paid', method: 'mobile_money', daysDue: -12, term: 'Term 2' },
        { wardEmail: VIP.studentEmail, title: 'WASSCE Exam Fee', purpose: 'exam_fee', amount: 280, amountPaid: 0, status: 'pending', method: 'stripe', daysDue: 28, term: 'Term 2' },
        { wardEmail: VIP.studentEmail, title: 'Textbook Bundle — Science', purpose: 'books', amount: 240, amountPaid: 240, status: 'paid', method: 'bank_transfer', daysDue: -20, term: 'Term 2' },
        { wardEmail: VIP.studentEmail, title: 'Transport Fee — Term 2', purpose: 'transport', amount: 350, amountPaid: 175, status: 'partial', method: 'mobile_money', daysDue: 9, term: 'Term 2' },
        { wardEmail: VIP.studentEmail, title: 'Library Membership', purpose: 'library', amount: 40, amountPaid: 0, status: 'pending', method: 'stripe', daysDue: 6, term: 'Term 2' },
        { wardEmail: VIP.studentEmail, title: 'Sports Day Kit', purpose: 'activity', amount: 60, amountPaid: 60, status: 'paid', method: 'cash', daysDue: -4, term: 'Term 2' },
        // Mia (G8B)
        { wardEmail: `mia.egator@${DEMO_EMAIL_DOMAIN}`, title: 'Term 1 Tuition Fee', purpose: 'tuition', amount: 1200, amountPaid: 1200, status: 'paid', method: 'stripe', daysDue: -48, term: 'Term 1' },
        { wardEmail: `mia.egator@${DEMO_EMAIL_DOMAIN}`, title: 'Term 2 Tuition Fee', purpose: 'tuition', amount: 1200, amountPaid: 0, status: 'pending', method: 'stripe', daysDue: 16, term: 'Term 2' },
        { wardEmail: `mia.egator@${DEMO_EMAIL_DOMAIN}`, title: 'School Uniform Kit', purpose: 'uniform', amount: 180, amountPaid: 180, status: 'paid', method: 'cash', daysDue: -15, term: 'Term 2' },
        { wardEmail: `mia.egator@${DEMO_EMAIL_DOMAIN}`, title: 'Transport Fee — Term 2', purpose: 'transport', amount: 320, amountPaid: 320, status: 'paid', method: 'mobile_money', daysDue: -6, term: 'Term 2' },
        // Leo (G7A)
        { wardEmail: `leo.egator@${DEMO_EMAIL_DOMAIN}`, title: 'Term 1 Tuition Fee', purpose: 'tuition', amount: 1200, amountPaid: 1200, status: 'paid', method: 'stripe', daysDue: -47, term: 'Term 1' },
        { wardEmail: `leo.egator@${DEMO_EMAIL_DOMAIN}`, title: 'Term 2 Tuition Fee', purpose: 'tuition', amount: 1200, amountPaid: 400, status: 'partial', method: 'bank_transfer', daysDue: 20, term: 'Term 2' },
        { wardEmail: `leo.egator@${DEMO_EMAIL_DOMAIN}`, title: 'Boarding Deposit', purpose: 'hostel', amount: 400, amountPaid: 0, status: 'pending', method: 'stripe', daysDue: 32, term: 'Term 2' },
        { wardEmail: `leo.egator@${DEMO_EMAIL_DOMAIN}`, title: 'Activity Club Fee', purpose: 'activity', amount: 75, amountPaid: 75, status: 'paid', method: 'cash', daysDue: -9, term: 'Term 2' },
    ];

    for (const def of vipPaymentDefs) {
        const ward = vipWards.find((w) => w.def.email === def.wardEmail);
        if (!ward) continue;
        const dueDate = daysFromNow(def.daysDue);
        await PaymentModel.create({
            student: ward.student._id,
            guardian: vipGuardian._id,
            class: ward.student.class,
            title: def.title,
            purpose: def.purpose,
            description: `${def.title} — Academic Year ${ACADEMIC_YEAR}`,
            amount: def.amount,
            amountPaid: def.amountPaid,
            currency: 'USD',
            method: def.method,
            status: def.status,
            term: def.term,
            academicYear: ACADEMIC_YEAR,
            dueDate,
            paidDate:
                def.status === 'paid' || def.status === 'partial'
                    ? daysFromNow(def.daysDue - 4)
                    : undefined,
            notes: `${SEED_TAG} VIP family account`,
            isActive: true,
        });
    }
    console.log(`   ✓ ${vipPaymentDefs.length} VIP payments`);

    const vipComplaints = [
        {
            title: 'Bus Safety Concern',
            description:
                'My children reported overcrowding on the morning bus. Please review capacity on the Airport West route.',
            category: ['other'],
            severity: ['medium'],
            status: ['in_progress'],
            reporter: vipGuardian._id,
            reporterUser: vipGuardianUser._id,
            reportedParty: 'Transport office',
            witnesses: 'Bus attendant',
            daysAgo: 6,
        },
        {
            title: 'Lab Equipment Request',
            description:
                'Microscopes in Biology lab 2 are blurry during practicals. Requesting maintenance before the next unit test.',
            category: ['other'],
            severity: ['low'],
            status: ['pending'],
            reporter: vipStudent._id,
            reporterUser: vipStudentUser._id,
            reportedParty: 'Science department',
            witnesses: 'Lab partner',
            daysAgo: 3,
        },
        {
            title: 'Homework Workload Review',
            description:
                'Combined homework from Biology, Chemistry and Maths has been heavy this fortnight. Asking teachers to stagger deadlines.',
            category: ['other'],
            severity: ['low'],
            status: ['resolved'],
            reporter: vipGuardian._id,
            reporterUser: vipGuardianUser._id,
            reportedParty: 'Grade 10B teachers',
            witnesses: '',
            resolutionNotes:
                'Teachers agreed to stagger major submissions. Guardian updated.',
            daysAgo: 16,
        },
    ];

    for (const def of vipComplaints) {
        const complaint = await ComplaintModel.create({
            title: def.title,
            description: def.description,
            category: def.category,
            severity: def.severity,
            status: def.status,
            reporter: def.reporter,
            witnesses: def.witnesses,
            reportedParty: def.reportedParty,
            dateFiled: daysFromNow(-def.daysAgo),
            dateResolved: def.status.includes('resolved') ? daysFromNow(-2) : undefined,
            resolutionNotes: def.resolutionNotes || '',
            resolutionDate: def.status.includes('resolved') ? daysFromNow(-2) : undefined,
        });
        await UserModel.findByIdAndUpdate(def.reporterUser, {
            $addToSet: { complaints: complaint._id },
        });
    }
    console.log(`   ✓ ${vipComplaints.length} VIP complaints`);
    console.log(`   ✓ VIP guardian wards: ${vipWards.map((w) => w.def.email).join(', ')}`);

    return { vipGuardian, vipStudent, vipWards, studentsByClass };
}

/**
 * Repair / enrich non-demo accounts already in the database so every
 * teacher, guardian, and student has usable real-world links & activity.
 */
async function enrichLegacyAccounts(ctx, hashedPassword) {
    console.log('🔧 Enriching existing (non-demo) accounts...');
    const { classes, teachers } = ctx;

    const excludedEmails = [
        VIP.studentEmail,
        VIP.guardianEmail,
        ...(
            await UserModel.find({
                email: { $regex: `@${DEMO_EMAIL_DOMAIN}$`, $options: 'i' },
            }).select('email')
        ).map((u) => u.email),
    ];

    const legacyUsers = await UserModel.find({
        isDeleted: { $ne: true },
        email: { $nin: excludedEmails },
    });

    // Pair orphan teachers to demo classes in rotation
    const classCycle = CLASS_CODES;
    let teacherIdx = 0;
    let linkedTeachers = 0;

    for (const user of legacyUsers) {
        if (user.role !== 'teacher') continue;
        const profile = await TeacherModel.findOne({ user: user._id });
        if (!profile) continue;

        if (!profile.classes?.length) {
            const code = classCycle[teacherIdx % classCycle.length];
            teacherIdx += 1;
            await TeacherModel.findByIdAndUpdate(profile._id, {
                $addToSet: { classes: classes[code]._id },
            });
            await ClassModel.findByIdAndUpdate(classes[code]._id, {
                $addToSet: { teachers: profile._id },
            });
            const classStudentIds = (await StudentModel.find({ class: classes[code]._id }).select('_id')).map(
                (s) => s._id
            );
            await TeacherModel.findByIdAndUpdate(profile._id, {
                $addToSet: { students: { $each: classStudentIds } },
            });
            linkedTeachers += 1;
        }

        // Normalize placeholder contact junk into plausible Ghana numbers when invalid
        if (!/^\+?\d{8,15}$/.test(String(user.contactInfo?.phone || '').replace(/\s/g, ''))) {
            user.contactInfo = contact(`+23324${String(1000000 + teacherIdx).slice(0, 7)}`);
            if (!user.address?.country || user.address.country.length < 3) {
                user.address = address(`${10 + teacherIdx} Liberation Rd`);
            }
            if (!user.gender) user.gender = teacherIdx % 2 === 0 ? 'male' : 'female';
            await user.save();
        }
    }
    console.log(`   ✓ Linked ${linkedTeachers} orphan teachers to demo classes`);

    // Enrich legacy university-style classes (GH284 / GH440) with academic activity
    const legacyClasses = await ClassModel.find({
        classCode: { $nin: CLASS_CODES },
    });

    let legacyLessons = 0;
    let legacyPayments = 0;

    for (const classDoc of legacyClasses) {
        const classStudents = await StudentModel.find({ class: classDoc._id });
        if (!classStudents.length) continue;

        let classTeachers = await TeacherModel.find({ classes: classDoc._id });
        if (!classTeachers.length) {
            // Borrow a demo teacher so lessons have a valid teacher ref
            classTeachers = [teachers.kwame.teacher];
            await ClassModel.findByIdAndUpdate(classDoc._id, {
                $addToSet: { teachers: teachers.kwame.teacher._id },
            });
            await TeacherModel.findByIdAndUpdate(teachers.kwame.teacher._id, {
                $addToSet: {
                    classes: classDoc._id,
                    students: { $each: classStudents.map((s) => s._id) },
                },
            });
        }

        const teacher = classTeachers[0];
        let course = await CourseModel.findOne({ courseClass: classDoc._id });
        if (!course) {
            course = await CourseModel.create({
                courseName: `${classDoc.className} Core`,
                courseCode: `${classDoc.classCode}C`.slice(0, 10),
                courseDescription: `Core coursework for ${classDoc.className}`,
                courseType: 'Core',
                courseStatus: 'Active',
                courseClass: classDoc._id,
                courseTeachers: [teacher._id],
                courseStudents: classStudents.map((s) => s._id),
            });
            await ClassModel.findByIdAndUpdate(classDoc._id, {
                $addToSet: { courses: course._id },
            });
        } else {
            await CourseModel.findByIdAndUpdate(course._id, {
                $addToSet: {
                    courseTeachers: teacher._id,
                    courseStudents: { $each: classStudents.map((s) => s._id) },
                },
            });
        }

        const existingLessonCount = await LessonModel.countDocuments({ class: classDoc._id });
        if (existingLessonCount < 3) {
            const legacyLessonDefs = [
                { title: 'Orientation & Course Outline', daysAgo: 12 },
                { title: 'Core Concepts Workshop', daysAgo: 5 },
                { title: 'Project Kickoff Session', daysAgo: -3 },
            ];
            for (const def of legacyLessonDefs) {
                const exists = await LessonModel.exists({
                    class: classDoc._id,
                    title: def.title,
                });
                if (exists) continue;
                const lesson = await LessonModel.create({
                    title: def.title,
                    subject: course.courseName,
                    course: course._id,
                    class: classDoc._id,
                    teacher: teacher._id,
                    scheduledAt: daysFromNow(-def.daysAgo),
                    durationMinutes: 90,
                    notes: `${def.title} for ${classDoc.className}`,
                    teacherNotes: def.daysAgo > 0 ? 'Completed' : 'Upcoming',
                    materials: [PLACEHOLDER_MATERIAL],
                    isActive: true,
                });
                legacyLessons += 1;

                if (def.daysAgo > 0) {
                    for (let i = 0; i < classStudents.length; i++) {
                        const status = i % 5 === 0 ? 'late' : 'present';
                        const dup = await AttendanceModel.exists({
                            lesson: lesson._id,
                            student: classStudents[i]._id,
                        });
                        if (dup) continue;
                        await AttendanceModel.create({
                            lesson: lesson._id,
                            student: classStudents[i]._id,
                            class: classDoc._id,
                            teacher: teacher._id,
                            status,
                            note: '',
                            markedBy: teacher._id,
                            markedAt: lesson.scheduledAt,
                            date: lesson.scheduledAt,
                        });
                    }
                }
            }
        }

        const hwExists = await HomeworkModel.exists({ class: classDoc._id });
        if (!hwExists) {
            await HomeworkModel.create({
                title: `${classDoc.classCode} Weekly Assignment`,
                subject: course.courseName,
                course: course._id,
                class: classDoc._id,
                teacher: teacher._id,
                dueDate: daysFromNow(5, 23),
                instructions:
                    'Complete the weekly reading and submit a one-page summary with two discussion questions.',
                materials: [PLACEHOLDER_MATERIAL],
                isActive: true,
            });
        }

        const examExists = await ExamModel.exists({ class: classDoc._id });
        if (!examExists) {
            const rosterEntries = classStudents.map((student) => ({ student }));
            const exam = await ExamModel.create({
                title: `${classDoc.classCode} Progress Test`,
                description: `Progress assessment for ${classDoc.className}`,
                subject: course.courseName,
                examType: 'unit_test',
                class: classDoc._id,
                teacher: teacher._id,
                students: classStudents.map((s) => s._id),
                examDate: daysFromNow(-7),
                startTime: '10:00',
                endTime: '11:30',
                duration: 90,
                venue: 'Main Campus',
                totalMarks: 50,
                passingMarks: 25,
                instructions: 'Bring student ID. Calculators allowed where specified.',
                status: 'completed',
                results: await buildExamResults(rosterEntries, 50),
                isActive: true,
            });
            await ClassModel.findByIdAndUpdate(classDoc._id, {
                $addToSet: { exams: exam._id },
            });
        }

        for (const student of classStudents) {
            if (!student.guardian) continue;
            const paidCount = await PaymentModel.countDocuments({
                student: student._id,
                notes: { $regex: SEED_TAG },
            });
            if (paidCount >= 2) continue;

            await PaymentModel.create({
                student: student._id,
                guardian: student.guardian,
                class: classDoc._id,
                title: 'Term 1 Tuition Fee',
                purpose: 'tuition',
                description: `Term 1 tuition — ${classDoc.className}`,
                amount: 800,
                amountPaid: 800,
                currency: 'USD',
                method: 'stripe',
                status: 'paid',
                term: 'Term 1',
                academicYear: ACADEMIC_YEAR,
                dueDate: daysFromNow(-40),
                paidDate: daysFromNow(-42),
                notes: `${SEED_TAG} legacy enrichment`,
                isActive: true,
            });
            await PaymentModel.create({
                student: student._id,
                guardian: student.guardian,
                class: classDoc._id,
                title: 'Term 2 Tuition Fee',
                purpose: 'tuition',
                description: `Term 2 tuition — ${classDoc.className}`,
                amount: 800,
                amountPaid: 0,
                currency: 'USD',
                method: 'stripe',
                status: 'pending',
                term: 'Term 2',
                academicYear: ACADEMIC_YEAR,
                dueDate: daysFromNow(21),
                notes: `${SEED_TAG} legacy enrichment`,
                isActive: true,
            });
            legacyPayments += 2;
        }

        // Light profile cleanup for students in this class
        for (const student of classStudents) {
            const user = await UserModel.findById(student.user);
            if (!user || excludedEmails.includes(user.email)) continue;
            if (!/^\+?\d{8,15}$/.test(String(user.contactInfo?.phone || '').replace(/\s/g, ''))) {
                user.contactInfo = contact(
                    `+23355${String(2000000 + legacyPayments).slice(0, 7)}`
                );
            }
            if (!user.address?.country || user.address.country.length < 3) {
                user.address = address('Campus Residences');
            }
            await user.save();
        }
    }

    // Normalize sparse guardian contact details
    const legacyGuardianUsers = await UserModel.find({
        role: 'guardian',
        email: { $nin: excludedEmails },
    });
    for (const user of legacyGuardianUsers) {
        if (!/^\+?\d{8,15}$/.test(String(user.contactInfo?.phone || '').replace(/\s/g, ''))) {
            user.contactInfo = contact('+233501880099');
            if (!user.address?.country || user.address.country.length < 3) {
                user.address = address('7 Oxford Street');
            }
            if (!user.gender) user.gender = 'female';
            await user.save();
        }
    }

    console.log(`   ✓ Legacy lessons added: ${legacyLessons}`);
    console.log(`   ✓ Legacy payments added: ${legacyPayments}`);
    // hashedPassword reserved for future legacy password resets (unused on purpose)
    void hashedPassword;
}

async function loadExistingDemoContext() {
    const classes = {};
    for (const code of CLASS_CODES) {
        const doc = await ClassModel.findOne({ classCode: code });
        if (!doc) return null;
        classes[code] = doc;
    }

    const teacherEmailMap = {
        sarah: SEED_MARKER_EMAIL,
        kwame: `kwame.owusu@${DEMO_EMAIL_DOMAIN}`,
        ama: `ama.boateng@${DEMO_EMAIL_DOMAIN}`,
        daniel: `daniel.asante@${DEMO_EMAIL_DOMAIN}`,
    };

    const teachers = {};
    for (const [key, email] of Object.entries(teacherEmailMap)) {
        const user = await UserModel.findOne({ email });
        if (!user) return null;
        const teacher = await TeacherModel.findOne({ user: user._id });
        if (!teacher) return null;
        teachers[key] = { user, teacher, def: { email } };
    }

    const courses = {};
    const courseDocs = await CourseModel.find({
        courseClass: { $in: CLASS_CODES.map((c) => classes[c]._id) },
    });
    for (const course of courseDocs) {
        courses[course.courseCode] = {
            course,
            def: { courseCode: course.courseCode },
        };
    }

    const lessonDocs = await LessonModel.find({
        class: { $in: CLASS_CODES.map((c) => classes[c]._id) },
    });
    const lessons = lessonDocs.map((lesson) => {
        const classDoc = Object.values(classes).find(
            (c) => String(c._id) === String(lesson.class)
        );
        const teacherEntry = Object.entries(teachers).find(
            ([, t]) => String(t.teacher._id) === String(lesson.teacher)
        );
        const daysAgo = Math.round(
            (Date.now() - new Date(lesson.scheduledAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
            lesson,
            def: {
                title: lesson.title,
                classCode: classDoc?.classCode,
                teacherKey: teacherEntry?.[0] || 'sarah',
                daysAgo,
            },
        };
    });

    const studentsByClass = { G7A: [], G8B: [], G9A: [], G10B: [] };
    for (const code of CLASS_CODES) {
        const classStudents = await StudentModel.find({ class: classes[code]._id }).populate(
            'user'
        );
        studentsByClass[code] = classStudents.map((student) => ({
            student,
            user: student.user,
            def: {
                email: student.user?.email,
                classCode: code,
                firstName: student.user?.firstName,
                lastName: student.user?.lastName,
            },
        }));
    }

    return { classes, teachers, courses, lessons, studentsByClass, students: [] };
}

function printCredentials() {
    console.log('\n✅ Demo data seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  PRESENTATION LOGIN CREDENTIALS');
    console.log(`  Demo password (@achiever.demo): ${DEMO_PASSWORD}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Admin:             achiever@gmail.com / achiev123');
    console.log(`  VIP Student:       ${VIP.studentEmail}  (existing password kept)`);
    console.log(`  VIP Guardian:      ${VIP.guardianEmail}     (existing password kept)`);
    console.log('  VIP siblings:      mia.egator@achiever.demo / leo.egator@achiever.demo');
    console.log('  Teacher:           sarah.mensah@achiever.demo');
    console.log('  Teacher:           kwame.owusu@achiever.demo');
    console.log('  Guardian:          akosua.addo@achiever.demo');
    console.log('  Guardian:          efua.sarpong@achiever.demo');
    console.log('  Student:           abena.addo@achiever.demo');
    console.log('  Student:           yaw.owusu@achiever.demo');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

const seedDemo = async ({ force = false } = {}) => {
    const alreadySeeded = await UserModel.exists({ email: SEED_MARKER_EMAIL });
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    if (alreadySeeded && !force) {
        console.log('🌱 Demo school already exists — refreshing VIP + legacy enrichment.');
        console.log(`   Demo password for @achiever.demo users: ${DEMO_PASSWORD}`);
        const ctx = await loadExistingDemoContext();
        if (!ctx) {
            console.log('⚠️  Demo marker found but classes incomplete. Re-run with --force.');
            return { skipped: true };
        }
        await seedVipAccounts(ctx, hashedPassword);
        await enrichLegacyAccounts(ctx, hashedPassword);
        printCredentials();
        return { skipped: false, enrichedOnly: true };
    }

    if (alreadySeeded && force) {
        await clearDemoData();
    }

    const ctx = await seedDemoSchool(hashedPassword);
    await seedVipAccounts(ctx, hashedPassword);
    await enrichLegacyAccounts(ctx, hashedPassword);
    printCredentials();

    return { skipped: false };
};

module.exports = seedDemo;
module.exports.DEMO_PASSWORD = DEMO_PASSWORD;
module.exports.DEMO_EMAIL_DOMAIN = DEMO_EMAIL_DOMAIN;
module.exports.VIP = VIP;