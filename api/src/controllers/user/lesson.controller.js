const LessonModel = require('../../models/lesson.model.js');
const {
    assertValidObjectId,
    resolveAccessContext,
    serializeLesson,
    lessonPopulate,
    buildLessonVisibilityQuery,
    canAccessLesson,
    getAccessibleCourses,
} = require('../../utils/lessonAccess.js');

const getMyCourses = async (req, res, next) => {
    try {
        const context = await resolveAccessContext(req.user);
        const courses = await getAccessibleCourses(context);

        res.json({
            count: courses.length,
            courses,
        });
    } catch (error) {
        next(error);
    }
};

const getMyLessons = async (req, res, next) => {
    try {
        const context = await resolveAccessContext(req.user);
        const query = buildLessonVisibilityQuery(context);

        if (query._id === null) {
            return res.json({ count: 0, lessons: [] });
        }

        const lessons = await LessonModel.find(query)
            .populate(lessonPopulate)
            .sort({ scheduledAt: 1 })
            .lean();

        const serialized = lessons.map(serializeLesson);

        res.json({
            count: serialized.length,
            lessons: serialized,
        });
    } catch (error) {
        next(error);
    }
};

const getMyLessonById = async (req, res, next) => {
    try {
        const { id } = req.params;
        assertValidObjectId(id, 'lesson ID');

        const context = await resolveAccessContext(req.user);
        const lesson = await LessonModel.findOne({
            _id: id,
            isActive: true,
        })
            .populate(lessonPopulate)
            .lean();

        if (!lesson || !canAccessLesson(lesson, context)) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        res.json({ lesson: serializeLesson(lesson) });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

module.exports = {
    getMyCourses,
    getMyLessons,
    getMyLessonById,
};
