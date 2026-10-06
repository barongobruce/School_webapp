const { UserModel } = require('../models/user.model.js');

const USER_PUBLIC_SELECT =
    'firstName lastName email photo contactInfo role gender dateOfBirth address socialMedia isActive createdAt updatedAt';

const escapeRegex = (value = '') =>
    String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseJson = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

// Returns true when value is the boolean true or the string "true"
// (useful for query/body fields that may arrive as either type).
const isTrue = (value) => value === true || value === 'true';

const normalizeAddress = (address = {}) => ({
    street: address.street?.trim() || '',
    city: address.city?.trim() || '',
    state: (address.state || address.region)?.trim() || '',
    zip: (address.zip || address.postalCode)?.trim() || '',
    country: address.country?.trim() || '',
});

const hasCompleteAddress = (address = {}) =>
    Boolean(
        address.street &&
            address.city &&
            address.state &&
            address.zip &&
            address.country
    );

const normalizeContactInfo = (contactInfo = {}) => ({
    phone: contactInfo.phone?.trim() || '',
    altPhone: contactInfo.altPhone?.trim() || '',
    whatsapp: contactInfo.whatsapp?.trim() || '',
});

const normalizeSocialMedia = (socialMedia = {}) => ({
    facebook: socialMedia.facebook?.trim() || '',
    twitter: socialMedia.twitter?.trim() || '',
    instagram: socialMedia.instagram?.trim() || '',
    linkedin: socialMedia.linkedin?.trim() || '',
    youtube: socialMedia.youtube?.trim() || '',
    website: socialMedia.website?.trim() || '',
});

const normalizeGender = (gender) => {
    if (!gender) return undefined;
    const value = String(gender).trim().toLowerCase();
    return ['male', 'female', 'other'].includes(value) ? value : undefined;
};

// Checks whether a non-deleted user already has this email.
// Pass excludeUserId when updating a user so their own email is ignored.
const emailTaken = async (email, excludeUserId) => {
    const filter = {
        email: email.toLowerCase().trim(),
        isDeleted: { $ne: true },
    };

    if (excludeUserId) {
        filter._id = { $ne: excludeUserId };
    }

    return Boolean(await UserModel.exists(filter));
};

const findUserIds = async ({ role, search, isActive, includePhoneSearch = false }) => {
    const filter = {
        role,
        isDeleted: { $ne: true },
    };

    if (isActive === 'true' || isActive === 'false') {
        filter.isActive = isActive === 'true';
    }

    if (search?.trim()) {
        const regex = new RegExp(escapeRegex(search.trim()), 'i');
        filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];

        if (includePhoneSearch) {
            filter.$or.push(
                { 'contactInfo.phone': regex },
                { 'contactInfo.altPhone': regex },
                { 'contactInfo.whatsapp': regex }
            );
        }
    }

    const users = await UserModel.find(filter).select('_id').lean();
    return users.map((user) => user._id);
};

const populateUser = {
    path: 'user',
    select: USER_PUBLIC_SELECT,
};

module.exports = {
    USER_PUBLIC_SELECT,
    parseJson,
    isTrue,
    normalizeAddress,
    hasCompleteAddress,
    normalizeContactInfo,
    normalizeSocialMedia,
    normalizeGender,
    emailTaken,
    findUserIds,
    populateUser,
};
