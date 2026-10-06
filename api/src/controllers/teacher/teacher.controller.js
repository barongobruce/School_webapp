const mongoose = require('mongoose');

const ClassModel = require('../../models/class.model.js');
const StudentModel = require('../../models/student.model.js');
const GuardianModel = require('../../models/guardian.model.js');
const { populateUser, USER_PUBLIC_SELECT } = require('../../utils/userHelpers.js');

const CLASS_SELECT =
    '-assignments -announcements -events -resources -notifications -exams -quizzes -complaints';

const classPopulate = [
    {
        path: 'students',
        select: '-assignments -announcements -events -resources -exams -quizzes',
        populate: [
            populateUser,
            {
                path: 'guardian',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            },
        ],
    },
    {
        path: 'courses',
        select: 'courseName courseCode courseType courseStatus',
    },
];

const guardianPopulate = [
    {
        path: 'user',
        select: `${USER_PUBLIC_SELECT} isDeleted`,
    },
    {
        path: 'students',
        select: 'class user',
        populate: [
            {
                path: 'user',
                select: 'firstName lastName email photo isActive isDeleted',
            },
            {
                path: 'class',
                select: 'className classCode grade academicYear isActive',
            },
        ],
    },
];

const filterVisibleStudents = (classItem) => {
    if (!classItem) return classItem;

    const students = (classItem.students || []).filter(
        (student) => student?.user && !student.user.isDeleted,
    );

    return {
        ...classItem,
        students,
    };
};

const teacherOwnsClass = (classItem, teacherId) => {
    const id = teacherId.toString();
    return (classItem.teachers || []).some(
        (teacher) => (teacher._id || teacher).toString() === id,
    );
};

const getTeacherStudentIds = async (teacher) => {
    const teacherId = teacher._id;
    const linkedClassIds = teacher.classes || [];

    const classes = await ClassModel.find({
        $or: [{ teachers: teacherId }, { _id: { $in: linkedClassIds } }],
    })
        .select('students')
        .lean();

    const fromClasses = classes.flatMap((classItem) =>
        (classItem.students || []).map((studentId) => studentId.toString()),
    );
    const fromTeacher = (teacher.students || []).map((studentId) =>
        studentId.toString(),
    );

    return [...new Set([...fromClasses, ...fromTeacher])];
};

const getTeacherClasses = async (req, res, next) => {
    try {
        const teacherId = req.teacher._id;
        const linkedClassIds = req.teacher.classes || [];

        const classes = await ClassModel.find({
            $or: [{ teachers: teacherId }, { _id: { $in: linkedClassIds } }],
        })
            .select(CLASS_SELECT)
            .populate(classPopulate)
            .sort({ createdAt: -1 })
            .lean();

        const visibleClasses = classes.map(filterVisibleStudents);

        res.json({
            count: visibleClasses.length,
            classes: visibleClasses,
        });
    } catch (error) {
        next(error);
    }
};

const getTeacherClassById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid class ID' });
        }

        const teacherId = req.teacher._id;
        const linkedClassIds = (req.teacher.classes || []).map((classId) =>
            classId.toString(),
        );

        const classItem = await ClassModel.findById(id)
            .select(CLASS_SELECT)
            .populate(classPopulate)
            .lean();

        if (!classItem) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const isAssigned =
            teacherOwnsClass(classItem, teacherId) ||
            linkedClassIds.includes(classItem._id.toString());

        if (!isAssigned) {
            return res.status(403).json({
                message: 'Access denied. This class is not assigned to you.',
            });
        }

        res.json({ class: filterVisibleStudents(classItem) });
    } catch (error) {
        next(error);
    }
};

const getTeacherGuardianScope = async (teacher) => {
    const teacherStudentIds = await getTeacherStudentIds(teacher);

    if (teacherStudentIds.length === 0) {
        return { visibleStudentIds: new Set(), guardianIds: [] };
    }

    const students = await StudentModel.find({
        _id: { $in: teacherStudentIds },
        guardian: { $ne: null },
    })
        .select('guardian user')
        .populate({ path: 'user', select: 'isDeleted' })
        .lean();

    const visibleStudentIds = new Set(
        students
            .filter((student) => student?.user && !student.user.isDeleted)
            .map((student) => student._id.toString()),
    );

    const guardianIds = [
        ...new Set(
            students
                .filter(
                    (student) =>
                        visibleStudentIds.has(student._id.toString()) &&
                        student.guardian,
                )
                .map((student) => student.guardian.toString()),
        ),
    ];

    return { visibleStudentIds, guardianIds };
};

const filterGuardianForTeacher = (guardian, visibleStudentIds) => {
    if (!guardian?.user || guardian.user.isDeleted) return null;

    return {
        ...guardian,
        students: (guardian.students || []).filter((student) => {
            if (!student?._id) return false;
            if (!visibleStudentIds.has(student._id.toString())) return false;
            return student.user && !student.user.isDeleted;
        }),
    };
};

const getTeacherGuardians = async (req, res, next) => {
    try {
        const { visibleStudentIds, guardianIds } = await getTeacherGuardianScope(
            req.teacher,
        );

        if (guardianIds.length === 0) {
            return res.json({ count: 0, guardians: [] });
        }

        const guardians = await GuardianModel.find({ _id: { $in: guardianIds } })
            .populate(guardianPopulate)
            .sort({ createdAt: -1 })
            .lean();

        const visibleGuardians = guardians
            .map((guardian) =>
                filterGuardianForTeacher(guardian, visibleStudentIds),
            )
            .filter(Boolean);

        res.json({
            count: visibleGuardians.length,
            guardians: visibleGuardians,
        });
    } catch (error) {
        next(error);
    }
};

const getTeacherGuardianById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid guardian ID' });
        }

        const { visibleStudentIds, guardianIds } = await getTeacherGuardianScope(
            req.teacher,
        );

        if (!guardianIds.includes(id)) {
            return res.status(403).json({
                message:
                    'Access denied. This guardian is not linked to your students.',
            });
        }

        const guardian = await GuardianModel.findById(id)
            .populate(guardianPopulate)
            .lean();

        const visibleGuardian = filterGuardianForTeacher(
            guardian,
            visibleStudentIds,
        );

        if (!visibleGuardian) {
            return res.status(404).json({ message: 'Guardian not found' });
        }

        res.json({ guardian: visibleGuardian });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTeacherClasses,
    getTeacherClassById,
    getTeacherGuardians,
    getTeacherGuardianById,
};
