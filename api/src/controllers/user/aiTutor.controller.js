const mongoose = require('mongoose');
const StudentModel = require('../../models/student.model.js');
const AiTutorConversationModel = require('../../models/aiTutorConversation.model.js');
const AiTutorActivityModel = require('../../models/aiTutorActivity.model.js');
const ENV = require('../../config/env.js');

const canUseAiTutor = (user) => ['student', 'teacher'].includes(user?.role);
const languages = ['English', 'Kiswahili', 'Sheng'];
const learningStyles = ['Visual', 'Practical', 'Reading/Writing', 'Interactive', 'Story-based'];

const getPreferencesValue = (user) => ({
    language: user.aiTutorPreferences?.language || 'English',
    learningStyle: user.aiTutorPreferences?.learningStyle || 'Interactive',
    favoriteSubject: user.aiTutorPreferences?.favoriteSubject || '',
    weakSubject: user.aiTutorPreferences?.weakSubject || '',
});

const getAiTutorPreferences = async (req, res, next) => {
    try {
        if (!canUseAiTutor(req.user)) {
            return res.status(403).json({ message: 'AI Tutor preferences are available to students and teachers.' });
        }
        return res.json({ preferences: getPreferencesValue(req.user) });
    } catch (error) {
        next(error);
    }
};

const updateAiTutorPreferences = async (req, res, next) => {
    try {
        if (!canUseAiTutor(req.user)) {
            return res.status(403).json({ message: 'AI Tutor preferences are available to students and teachers.' });
        }

        const body = req.body || {};
        if (!languages.includes(body.language) || !learningStyles.includes(body.learningStyle)) {
            return res.status(400).json({ message: 'Choose a supported language and learning style.' });
        }
        const favoriteSubject = typeof body.favoriteSubject === 'string' ? body.favoriteSubject.trim() : '';
        const weakSubject = typeof body.weakSubject === 'string' ? body.weakSubject.trim() : '';
        if (favoriteSubject.length > 80 || weakSubject.length > 80) {
            return res.status(400).json({ message: 'Subject names must be 80 characters or fewer.' });
        }

        req.user.aiTutorPreferences = {
            language: body.language,
            learningStyle: body.learningStyle,
            favoriteSubject,
            weakSubject,
        };
        await req.user.save();
        return res.json({ preferences: getPreferencesValue(req.user) });
    } catch (error) {
        next(error);
    }
};

const getAiTutorActivityHistory = async (req, res, next) => {
    try {
        if (!canUseAiTutor(req.user)) {
            return res.status(403).json({ message: 'AI Tutor activity is available to students and teachers.' });
        }
        const { kind } = req.params;
        if (!['quiz', 'lesson', 'flashcards', 'study-plan'].includes(kind)) {
            return res.status(404).json({ message: 'AI Tutor tool not found.' });
        }
        const activities = await AiTutorActivityModel.find({ user: req.user._id, kind })
            .select('kind topic difficulty score createdAt')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        return res.json({
            activities: activities.map((activity) => ({
                id: String(activity._id),
                kind: activity.kind,
                topic: activity.topic,
                difficulty: activity.difficulty,
                score: activity.score,
                createdAt: activity.createdAt,
            })),
        });
    } catch (error) {
        next(error);
    }
};

const getAiTutorActivity = async (req, res, next) => {
    try {
        if (!canUseAiTutor(req.user)) {
            return res.status(403).json({ message: 'AI Tutor activity is available to students and teachers.' });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid activity ID.' });
        }
        const activity = await AiTutorActivityModel.findOne({
            _id: req.params.id,
            user: req.user._id,
        }).lean();
        if (!activity) return res.status(404).json({ message: 'Saved activity not found.' });
        return res.json({
            activity: {
                id: String(activity._id),
                kind: activity.kind,
                topic: activity.topic,
                difficulty: activity.difficulty,
                result: activity.kind === 'quiz' && !activity.score
                    ? activity.result.map(({ answer, ...question }) => question)
                    : activity.result,
                answers: activity.answers || [],
                score: activity.score || null,
                createdAt: activity.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

const submitAiTutorQuizScore = async (req, res, next) => {
    try {
        if (!canUseAiTutor(req.user)) {
            return res.status(403).json({ message: 'AI Tutor activity is available to students and teachers.' });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid quiz ID.' });
        }
        const activity = await AiTutorActivityModel.findOne({
            _id: req.params.id,
            user: req.user._id,
            kind: 'quiz',
        });
        if (!activity) return res.status(404).json({ message: 'Saved quiz not found.' });

        const questions = Array.isArray(activity.result) ? activity.result : [];
        const answers = req.body?.answers;
        if (
            !questions.length ||
            !Array.isArray(answers) ||
            answers.length !== questions.length ||
            answers.some((answer) => typeof answer !== 'string' || answer.length > 500)
        ) {
            return res.status(400).json({ message: 'Submit one answer for each quiz question.' });
        }

        const correct = questions.reduce(
            (count, question, index) => count + (answers[index] === question.answer ? 1 : 0),
            0,
        );
        const score = {
            correct,
            total: questions.length,
            percentage: Math.round((correct / questions.length) * 100),
            submittedAt: new Date(),
        };
        activity.answers = answers;
        activity.score = score;
        await activity.save();
        return res.json({
            score,
            correctAnswers: questions.map((question) => question.answer),
        });
    } catch (error) {
        next(error);
    }
};

const getAiTutorHistory = async (req, res, next) => {
    try {
        if (!canUseAiTutor(req.user)) {
            return res.status(403).json({ message: 'AI Tutor is available to students and teachers.' });
        }

        const conversation = await AiTutorConversationModel.findOne({ user: req.user._id })
            .select('messages')
            .lean();

        return res.json({
            messages: (conversation?.messages || []).map(({ role, content, createdAt }) => ({
                role,
                content,
                createdAt,
            })),
        });
    } catch (error) {
        next(error);
    }
};

const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
        age -= 1;
    }
    return age >= 0 && age <= 120 ? age : 'N/A';
};

const chatWithAiTutor = async (req, res, next) => {
    try {
        if (!canUseAiTutor(req.user)) {
            return res.status(403).json({ message: 'AI Tutor is available to students and teachers.' });
        }

        const question = typeof req.body?.question === 'string'
            ? req.body.question.trim()
            : '';
        if (!question || question.length > 2000) {
            return res.status(400).json({ message: 'Enter a question of up to 2,000 characters.' });
        }

        if (!ENV.AI_TUTOR_SERVICE_URL || !ENV.AI_TUTOR_SERVICE_TOKEN) {
            return res.status(503).json({ message: 'AI Tutor is not configured yet.' });
        }

        const studentRecord = req.user.role === 'student'
            ? await StudentModel.findOne({ user: req.user._id })
                .select('class')
                .populate('class', 'grade')
                .lean()
            : null;

        const preferences = getPreferencesValue(req.user);
        const language = languages.includes(req.body?.language)
            ? req.body.language
            : preferences.language;
        const conversation = await AiTutorConversationModel.findOne({ user: req.user._id })
            .select('messages')
            .lean();
        const messages = (conversation?.messages || [])
            .slice(-12)
            .map(({ role, content }) => ({ role, content }));

        const response = await fetch(`${ENV.AI_TUTOR_SERVICE_URL.replace(/\/$/, '')}/internal/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ENV.AI_TUTOR_SERVICE_TOKEN}`,
            },
            body: JSON.stringify({
                question,
                messages,
                student: {
                    name: `${req.user.firstName} ${req.user.lastName}`.trim() || 'Student',
                    grade: req.user.role === 'teacher'
                        ? 'General'
                        : String(studentRecord?.class?.grade ?? 'N/A'),
                    age: req.user.role === 'teacher'
                        ? 'N/A'
                        : getAge(req.user.dateOfBirth),
                    language,
                    learning_style: preferences.learningStyle,
                    favorite_subject: preferences.favoriteSubject || 'General',
                    weak_subject: preferences.weakSubject || 'General',
                },
            }),
            signal: AbortSignal.timeout(120000),
        });

        if (!response.ok) {
            console.error(`AI Tutor service returned HTTP ${response.status}`);
            return res.status(502).json({ message: 'AI Tutor is temporarily unavailable. Please try again.' });
        }

        const data = await response.json();
        if (typeof data.reply !== 'string' || !data.reply.trim()) {
            return res.status(502).json({ message: 'AI Tutor could not prepare a reply. Please try again.' });
        }

        await AiTutorConversationModel.findOneAndUpdate(
            { user: req.user._id },
            {
                $push: {
                    messages: {
                        $each: [
                            { role: 'user', content: question },
                            { role: 'assistant', content: data.reply },
                        ],
                        $slice: -100,
                    },
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        return res.json({ reply: data.reply });
    } catch (error) {
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
            return res.status(504).json({ message: 'AI Tutor is taking too long. Please try again.' });
        }
        if (error.name === 'TypeError') {
            console.error('Could not reach the AI Tutor service:', error.message);
            return res.status(502).json({ message: 'AI Tutor is temporarily unavailable. Please try again.' });
        }
        next(error);
    }
};

const generateAiLearningTool = async (req, res, next) => {
    try {
        if (!canUseAiTutor(req.user)) {
            return res.status(403).json({ message: 'AI Tutor is available to students and teachers.' });
        }

        const toolKinds = ['quiz', 'lesson', 'flashcards', 'study-plan'];
        const kind = req.params.kind;
        if (!toolKinds.includes(kind)) {
            return res.status(404).json({ message: 'AI Tutor tool not found.' });
        }

        const topic = typeof req.body?.topic === 'string' ? req.body.topic.trim() : '';
        if (!topic || topic.length > 160) {
            return res.status(400).json({ message: 'Enter a topic of up to 160 characters.' });
        }
        if (!ENV.AI_TUTOR_SERVICE_URL || !ENV.AI_TUTOR_SERVICE_TOKEN) {
            return res.status(503).json({ message: 'AI Tutor is not configured yet.' });
        }

        const studentRecord = req.user.role === 'student'
            ? await StudentModel.findOne({ user: req.user._id })
                .select('class')
                .populate('class', 'grade')
                .lean()
            : null;
        const teacherGrade = typeof req.body?.targetGrade === 'string'
            ? req.body.targetGrade.trim().slice(0, 50)
            : '';
        const preferences = getPreferencesValue(req.user);
        const language = languages.includes(req.body?.language)
            ? req.body.language
            : preferences.language;
        const difficulty = ['Easy', 'Medium', 'Hard'].includes(req.body?.difficulty)
            ? req.body.difficulty
            : 'Medium';

        let stats = { questions: 0, quizzes: 0, average_score: 0 };
        if (kind === 'study-plan') {
            const completedQuizzes = await AiTutorActivityModel.find({
                user: req.user._id,
                kind: 'quiz',
                'score.percentage': { $exists: true },
            }).select('score').lean();
            if (completedQuizzes.length) {
                const totalQuestions = completedQuizzes.reduce(
                    (sum, quiz) => sum + (quiz.score?.total || 0),
                    0,
                );
                const totalPercentage = completedQuizzes.reduce(
                    (sum, quiz) => sum + (quiz.score?.percentage || 0),
                    0,
                );
                stats = {
                    questions: totalQuestions,
                    quizzes: completedQuizzes.length,
                    average_score: Math.round(totalPercentage / completedQuizzes.length),
                };
            }
        }

        const response = await fetch(
            `${ENV.AI_TUTOR_SERVICE_URL.replace(/\/$/, '')}/internal/tools/${kind}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${ENV.AI_TUTOR_SERVICE_TOKEN}`,
                },
                body: JSON.stringify({
                    topic,
                    difficulty,
                    stats,
                    student: {
                        name: `${req.user.firstName} ${req.user.lastName}`.trim() || 'Student',
                        grade: req.user.role === 'teacher'
                            ? teacherGrade || 'General'
                            : String(studentRecord?.class?.grade ?? 'N/A'),
                        age: req.user.role === 'teacher'
                            ? 'N/A'
                            : getAge(req.user.dateOfBirth),
                        language,
                        learning_style: preferences.learningStyle,
                        favorite_subject: preferences.favoriteSubject || 'General',
                        weak_subject: kind === 'study-plan'
                            ? topic
                            : preferences.weakSubject || 'General',
                        subject: topic,
                    },
                }),
                signal: AbortSignal.timeout(120000),
            },
        );

        if (!response.ok) {
            let serviceReason = 'no additional details';
            try {
                const serviceError = await response.json();
                if (typeof serviceError.detail === 'string') {
                    serviceReason = serviceError.detail;
                } else if (Array.isArray(serviceError.detail)) {
                    serviceReason = serviceError.detail
                        .map((item) => `${(item.loc || []).join('.')}:${item.type || 'invalid'}`)
                        .join(', ');
                }
            } catch {
                // Keep the provider response private; log only status and safe validation details.
            }
            console.error(`AI Tutor service returned HTTP ${response.status} for ${kind}: ${serviceReason}`);
            return res.status(502).json({ message: 'AI Tutor could not generate that right now. Please try again.' });
        }

        const data = await response.json();
        if (data.result === undefined || data.result === null || data.result === '') {
            return res.status(502).json({ message: 'AI Tutor returned an empty result. Please try again.' });
        }
        const activity = await AiTutorActivityModel.create({
            user: req.user._id,
            kind,
            topic,
            difficulty,
            result: data.result,
        });
        return res.json({
            result: kind === 'quiz'
                ? activity.result.map(({ answer, ...question }) => question)
                : activity.result,
            activityId: String(activity._id),
            createdAt: activity.createdAt,
        });
    } catch (error) {
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
            return res.status(504).json({ message: 'AI Tutor is taking too long. Please try again.' });
        }
        if (error.name === 'TypeError') {
            console.error('Could not reach the AI Tutor service:', error.message);
            return res.status(502).json({ message: 'AI Tutor is temporarily unavailable. Please try again.' });
        }
        next(error);
    }
};

module.exports = {
    chatWithAiTutor,
    getAiTutorHistory,
    generateAiLearningTool,
    getAiTutorPreferences,
    updateAiTutorPreferences,
    getAiTutorActivityHistory,
    getAiTutorActivity,
    submitAiTutorQuizScore,
};
