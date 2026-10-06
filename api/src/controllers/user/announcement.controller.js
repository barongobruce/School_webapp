const mongoose = require('mongoose');
const AnnouncementModel = require('../../models/announcement.model.js');

const CATEGORIES = ['general', 'academic', 'disciplinary', 'other'];
const SEVERITIES = ['low', 'medium', 'high'];

const audienceForRole = (role) => {
    if (role === 'student') return ['all', 'students'];
    if (role === 'guardian') return ['all', 'guardians'];
    if (role === 'teacher') return ['all', 'teachers'];
    return ['all'];
};

const canViewAnnouncement = (announcement, role) => {
    const audiences = Array.isArray(announcement?.targetAudience)
        ? announcement.targetAudience.map((item) => String(item).toLowerCase())
        : [];
    if (!audiences.length) return true;
    const allowed = audienceForRole(role);
    return audiences.some((item) => allowed.includes(item));
};

const buildListFilter = (req) => {
    const { search, category, severity } = req.query;
    const filter = {
        targetAudience: { $in: audienceForRole(req.user.role) },
    };

    if (category && CATEGORIES.includes(String(category).toLowerCase())) {
        filter.category = String(category).toLowerCase();
    }

    if (severity && SEVERITIES.includes(String(severity).toLowerCase())) {
        filter.severity = String(severity).toLowerCase();
    }

    if (search?.trim()) {
        const term = search.trim();
        const regex = new RegExp(
            term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            'i'
        );
        filter.$or = [{ title: regex }, { description: regex }];
    }

    return filter;
};

const getMyAnnouncements = async (req, res, next) => {
    try {
        const announcements = await AnnouncementModel.find(buildListFilter(req))
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            count: announcements.length,
            announcements,
        });
    } catch (error) {
        next(error);
    }
};

const getMyAnnouncementById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid announcement ID' });
        }

        const announcement = await AnnouncementModel.findById(id).lean();

        if (!announcement || !canViewAnnouncement(announcement, req.user.role)) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.json({ announcement });
    } catch (error) {
        next(error);
    }
};

/** Compact list for dashboard cards (role-scoped). */
const listAnnouncementsForRole = async (role, limit = 5) => {
    const announcements = await AnnouncementModel.find({
        targetAudience: { $in: audienceForRole(role) },
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title description category severity targetAudience createdAt updatedAt')
        .lean();

    return announcements.map((item) => ({
        id: String(item._id),
        _id: item._id,
        title: item.title,
        description: item.description || '',
        category: item.category || [],
        severity: item.severity || [],
        targetAudience: item.targetAudience || [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    }));
};

module.exports = {
    getMyAnnouncements,
    getMyAnnouncementById,
    listAnnouncementsForRole,
    audienceForRole,
};
