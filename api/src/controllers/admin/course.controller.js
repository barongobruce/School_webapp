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
            courseClass,
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

        let classId;
        if (courseClass) {
            if (!mongoose.Types.ObjectId.isValid(courseClass)) {
                return res.status(400).json({ message: 'Invalid class ID' });
            }

            const linkedClass = await ClassModel.findById(courseClass).select('_id');
            if (!linkedClass) {
                return res.status(404).json({ message: 'Class not found' });
            }

            classId = linkedClass._id;
        }

        const course = await CourseModel.create({
            courseName: courseName.trim(),
            courseCode: normalizedCode,
            courseDescription: courseDescription?.trim() || '',
            courseType: courseType || 'Core',
            courseStatus: courseStatus || 'Active',
            courseClass: classId,
            courseTeachers: parseObjectIds(courseTeachers),
        });

        if (classId) {
            await ClassModel.findByIdAndUpdate(classId, {
                $addToSet: { courses: course._id },
            });
        }

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
            courseClass,
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

        let nextClassId = course.courseClass || null;

        if (courseClass !== undefined) {
            if (!courseClass) {
                nextClassId = null;
            } else {
                if (!mongoose.Types.ObjectId.isValid(courseClass)) {
                    return res.status(400).json({ message: 'Invalid class ID' });
                }

                const linkedClass = await ClassModel.findById(courseClass).select('_id');
                if (!linkedClass) {
                    return res.status(404).json({ message: 'Class not found' });
                }

                nextClassId = linkedClass._id;
            }
        }

        const previousClassId = course.courseClass
            ? course.courseClass.toString()
            : null;
        const nextClassIdStr = nextClassId ? nextClassId.toString() : null;

        course.courseName = courseName.trim();
        course.courseCode = normalizedCode;
        course.courseDescription = courseDescription?.trim() || '';
        if (courseType !== undefined) course.courseType = courseType;
        if (courseStatus !== undefined) course.courseStatus = courseStatus;
        if (courseClass !== undefined) course.courseClass = nextClassId;
        if (courseTeachers !== undefined) {
            course.courseTeachers = parseObjectIds(courseTeachers);
        }

        await course.save();

        if (previousClassId !== nextClassIdStr) {
            if (previousClassId) {
                await ClassModel.findByIdAndUpdate(previousClassId, {
                    $pull: { courses: course._id },
                });
            }
            if (nextClassId) {
                await ClassModel.findByIdAndUpdate(nextClassId, {
                    $addToSet: { courses: course._id },
                });
            }
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


module.exports = { addCourse, getCourses, getCourseById, updateCourse };