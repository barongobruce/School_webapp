const mongoose = require('mongoose');
const CourseModel = require('../../models/course.model.js');
const ClassModel = require('../../models/class.model.js');

const parseObjectIds = (value) => {
    if (!value) return [];

    let items = value;
    if (typeof value === 'string') {
        try {
            items = JSON.parse(value);
        } catch {
            items = value.split(',').map((item) => item.trim()).filter(Boolean);
        }
    }

    if (!Array.isArray(items)) return [];

    return items
        .map((item) => String(item).trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
};










const addCourse = async (req, res, next) => {
    try {
        const {
            courseName,
            courseCode,
            courseDescription,
            courseType,
            courseStatus,
            courseTeachers,
        } = req.body;

        if (!courseName?.trim() || !courseCode?.trim()) {
            return res.status(400).json({
                message: 'Course name and course code are required',
            });
        }

        const normalizedCode = courseCode.trim().toUpperCase();

        const existing = await CourseModel.findOne({ courseCode: normalizedCode });
        if (existing) {
            return res.status(409).json({
                message: 'A course with this code already exists',
            });
        }

        // Courses are school-wide. Keep the legacy courseClass field empty
        // for newly created courses; Class.courses stores shared references.

        const course = await CourseModel.create({
            courseName: courseName.trim(),
            courseCode: normalizedCode,
            courseDescription: courseDescription?.trim() || '',
            courseType: courseType || 'Core',
            courseStatus: courseStatus || 'Active',
            courseClass: null,
            courseTeachers: parseObjectIds(courseTeachers),
        });

        await ClassModel.updateMany({}, {
            $addToSet: { courses: course._id },
        });

        res.status(201).json({
            message: 'Course created successfully',
            course,
        });
    } catch (error) {
        next(error);
    }
}












const getCourses = async (req, res, next) => {
    try {
        const { search, courseStatus, courseType } = req.query;
        const filter = {};

        if (courseStatus) filter.courseStatus = courseStatus;
        if (courseType) filter.courseType = courseType;

        if (search?.trim()) {
            const term = search.trim();
            const regex = new RegExp(
                term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                'i'
            );

            filter.$or = [
                { courseName: regex },
                { courseCode: regex },
                { courseDescription: regex },
            ];
        }

        const courses = await CourseModel.find(filter)
            .populate('courseClass', 'className classCode')
            .populate({
                path: 'courseTeachers',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            count: courses.length,
            courses,
        });
    } catch (error) {
        next(error);
    }
}















const getCourseById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }

        const course = await CourseModel.findById(id)
            .populate('courseClass', 'className classCode grade academicYear isActive')
            .populate({
                path: 'courseTeachers',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            })
            .populate({
                path: 'courseStudents',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            })
            .lean();

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({ course });
    } catch (error) {
        next(error);
    }
}















const updateCourseStudents = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }
        const course = await CourseModel.findById(id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const rawIds = req.body?.studentIds;
        if (!Array.isArray(rawIds)) {
            return res.status(400).json({ message: 'Student IDs must be provided as an array' });
        }
        const studentIds = parseObjectIds(rawIds);
        if (studentIds.length !== rawIds.length) {
            return res.status(400).json({ message: 'One or more student IDs are invalid' });
        }
        const StudentModel = require('../../models/student.model.js');
        const found = studentIds.length
            ? await StudentModel.find({ _id: { $in: studentIds } }).select('_id')
            : [];
        if (found.length !== studentIds.length) {
            return res.status(404).json({ message: 'One or more students were not found' });
        }

        course.courseStudents = studentIds;
        await course.save();
        const populated = await CourseModel.findById(course._id)
            .populate({ path: 'courseStudents', populate: { path: 'user', select: 'firstName lastName email photo isActive' } })
            .populate({ path: 'courseTeachers', populate: { path: 'user', select: 'firstName lastName email photo isActive' } })
            .lean();
        res.json({ message: 'Course student enrolment updated successfully', course: populated });
    } catch (error) {
        next(error);
    }
};

const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }

        const course = await CourseModel.findById(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const {
            courseName,
            courseCode,
            courseDescription,
            courseType,
            courseStatus,
            courseTeachers,
        } = req.body;

        if (!courseName?.trim() || !courseCode?.trim()) {
            return res.status(400).json({
                message: 'Course name and course code are required',
            });
        }

        const normalizedCode = courseCode.trim().toUpperCase();

        const duplicate = await CourseModel.findOne({
            _id: { $ne: id },
            courseCode: normalizedCode,
        });

        if (duplicate) {
            return res.status(409).json({
                message: 'A course with this code already exists',
            });
        }

        // Class assignment is no longer exclusive; class arrays may safely
        // reference this shared course from multiple classes.

        course.courseName = courseName.trim();
        course.courseCode = normalizedCode;
        course.courseDescription = courseDescription?.trim() || '';
        if (courseType !== undefined) course.courseType = courseType;
        if (courseStatus !== undefined) course.courseStatus = courseStatus;
        if (courseTeachers !== undefined) {
            course.courseTeachers = parseObjectIds(courseTeachers);
        }

        await course.save();
        if (course.courseStatus === 'Active') {
            await ClassModel.updateMany({}, {
                $addToSet: { courses: course._id },
            });
        }

        const populated = await CourseModel.findById(course._id)
            .populate('courseClass', 'className classCode grade academicYear isActive')
            .populate({
                path: 'courseTeachers',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            })
            .populate({
                path: 'courseStudents',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            })
            .lean();

        res.json({
            message: 'Course updated successfully',
            course: populated,
        });
    } catch (error) {
        next(error);
    }
}


module.exports = { addCourse, getCourses, getCourseById, updateCourse, updateCourseStudents };