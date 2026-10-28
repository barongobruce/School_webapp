const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const GuardianModel = require('../../models/guardian.model.js');
const { UserModel } = require('../../models/user.model.js');
const ENV = require('../../config/env.js');
const {
    uploadFiles,
    deleteFromCloudinaryMany,
} = require('../../middleware/multer.middleware.js');
const generatePassword = require('../../utils/generatePassword.js');
const mailer = require('../../utils/Mailer.js');
const { guardianCredentialsEmail } = require('../../utils/emailTemplates.js');
const {
    parseJson,
    isTrue,
    normalizeAddress,
    hasCompleteAddress,
    normalizeContactInfo,
    normalizeSocialMedia,
    emailTaken,
    findUserIds,
    populateUser,
} = require('../../utils/userHelpers.js');
const {
    isValidIdType,
    needsIdBack,
} = require('../../utils/idTypes.js');

const resolveIdentification = ({
    idType,
    uploadedFront,
    uploadedBack,
    existing = {},
    required = false,
}) => {
    const front =
        uploadedFront || existing.front || existing.idPhoto || '';
    const back =
        idType === 'Passport'
            ? ''
            : uploadedBack || existing.back || '';

    if (required && !front) {
        return { error: 'ID front document is required' };
    }

    if (required && needsIdBack(idType) && !back) {
        return { error: 'ID back document is required' };
    }

    return {
        identification: {
            front,
            back: needsIdBack(idType) ? back : '',
        },
    };
};

const guardianPopulate = [
    populateUser,
    {
        path: 'students',
        select: 'class user',
        populate: [
            {
                path: 'user',
                select: 'firstName lastName email photo isActive',
            },
            {
                path: 'class',
                select: 'className classCode grade academicYear isActive',
            },
        ],
    },
];

const getGuardians = async (req, res, next) => {
    try {
        const { search, isActive } = req.query;
        const userIds = await findUserIds({
            role: 'guardian',
            search,
            isActive,
            includePhoneSearch: true,
        });

        const guardians = await GuardianModel.find({ user: { $in: userIds } })
            .populate(guardianPopulate)
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            count: guardians.length,
            guardians,
        });
    } catch (error) {
        next(error);
    }
};

const getGuardianById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid guardian ID' });
        }

        const guardian = await GuardianModel.findById(id).populate(guardianPopulate).lean();

        if (!guardian || !guardian.user || guardian.user.isDeleted) {
            return res.status(404).json({ message: 'Guardian not found' });
        }

        res.json({ guardian });
    } catch (error) {
        next(error);
    }
};

const addGuardian = async (req, res, next) => {
    const uploadedUrls = [];
    let createdUserId = null;

    try {
        const { firstName, lastName, email, isActive, idType } = req.body;
        const demoEnrollment = isTrue(req.body.demoEnrollment);
        if (demoEnrollment && !isTrue(ENV.DEMO_ACCOUNT_CREATION_ENABLED)) {
            return res.status(403).json({ message: 'Demo account creation is disabled on this server' });
        }
        if (demoEnrollment && !ENV.DEMO_DEFAULT_PASSWORD) {
            return res.status(503).json({ message: 'DEMO_DEFAULT_PASSWORD is not configured on the API' });
        }

        const contactInfo = normalizeContactInfo(parseJson(req.body.contactInfo, {}));
        const socialMedia = normalizeSocialMedia(parseJson(req.body.socialMedia, {}));
        const address = normalizeAddress(parseJson(req.body.address, {}));
        const nextIdType = (idType || '').trim();

        if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
            return res.status(400).json({
                message: 'First name, last name, and email are required',
            });
        }

        if (!isValidIdType(nextIdType)) {
            return res.status(400).json({ message: 'Valid guardian ID type is required' });
        }

        if (!hasCompleteAddress(address)) {
            return res.status(400).json({
                message: 'Complete guardian address is required',
            });
        }

        const emailNormalized = email.toLowerCase().trim();

        if (await emailTaken(emailNormalized)) {
            return res.status(409).json({
                message: 'A user with this email already exists',
            });
        }

        const uploaded = await uploadFiles(req.files, 'guardians');
        uploadedUrls.push(...Object.values(uploaded).filter(Boolean));

        const idDocs = resolveIdentification({
            idType: nextIdType,
            uploadedFront: uploaded.idFront,
            uploadedBack: uploaded.idBack,
            required: true,
        });
        if (idDocs.error) {
            await deleteFromCloudinaryMany(uploadedUrls);
            return res.status(400).json({ message: idDocs.error });
        }

        const plainPassword = demoEnrollment ? ENV.DEMO_DEFAULT_PASSWORD : generatePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const user = await UserModel.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: emailNormalized,
            password: hashedPassword,
            photo: uploaded.photo || '',
            contactInfo,
            address,
            socialMedia,
            role: 'guardian',
            isActive: isActive === undefined ? true : isTrue(isActive),
        });
        createdUserId = user._id;

        const guardian = await GuardianModel.create({
            user: user._id,
            idType: nextIdType,
            identification: idDocs.identification,
            students: [],
        });

        uploadedUrls.length = 0;

        if (!demoEnrollment) {
            const mail = guardianCredentialsEmail({
                firstName: user.firstName,
                email: emailNormalized,
                password: plainPassword,
            });

            try {
                await mailer.sendEmail({
                    to: emailNormalized,
                    subject: mail.subject,
                    text: mail.text,
                    html: mail.html,
                });
            } catch (mailError) {
                console.error('Guardian credentials email failed:', mailError.message);
            }
        }

        const guardianData = await GuardianModel.findById(guardian._id).populate(populateUser);

        res.status(201).json({
            message: demoEnrollment
                ? 'Guardian created in demo mode without sending a credential email'
                : 'Guardian created successfully',
            demoEnrollment,
            guardian: guardianData,
        });
    } catch (error) {
        if (createdUserId) {
            await UserModel.findByIdAndDelete(createdUserId).catch(() => {});
        }
        await deleteFromCloudinaryMany(uploadedUrls);
        next(error);
    }
};

const updateGuardian = async (req, res, next) => {
    const uploadedUrls = [];

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid guardian ID' });
        }

        const guardian = await GuardianModel.findById(id);
        if (!guardian) {
            return res.status(404).json({ message: 'Guardian not found' });
        }

        const user = await UserModel.findById(guardian.user);
        if (!user || user.isDeleted) {
            return res.status(404).json({ message: 'Guardian user account not found' });
        }

        const { firstName, lastName, email, password, isActive, idType } = req.body;
        const contactInfo = parseJson(req.body.contactInfo, null);
        const socialMedia = parseJson(req.body.socialMedia, null);
        const addressInput = parseJson(req.body.address, null);

        if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
            return res.status(400).json({
                message: 'First name, last name, and email are required',
            });
        }

        const nextIdType = (idType || guardian.idType || '').trim();
        if (!isValidIdType(nextIdType)) {
            return res.status(400).json({ message: 'Valid guardian ID type is required' });
        }

        const emailNormalized = email.toLowerCase().trim();

        if (emailNormalized !== user.email && (await emailTaken(emailNormalized, user._id))) {
            return res.status(409).json({
                message: 'A user with this email already exists',
            });
        }

        if (addressInput) {
            const address = normalizeAddress(addressInput);

            if (!hasCompleteAddress(address)) {
                return res.status(400).json({
                    message: 'Complete guardian address is required',
                });
            }

            user.address = address;
        }

        const uploaded = await uploadFiles(req.files, 'guardians');
        uploadedUrls.push(...Object.values(uploaded).filter(Boolean));
        const urlsToDelete = [];

        user.firstName = firstName.trim();
        user.lastName = lastName.trim();
        user.email = emailNormalized;
        guardian.idType = nextIdType;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        if (isActive !== undefined) {
            user.isActive = isTrue(isActive);
        }

        if (contactInfo) {
            user.contactInfo = normalizeContactInfo(contactInfo);
        }

        if (socialMedia) {
            user.socialMedia = normalizeSocialMedia(socialMedia);
        }

        if (uploaded.photo) {
            if (user.photo) urlsToDelete.push(user.photo);
            user.photo = uploaded.photo;
        }

        const idDocs = resolveIdentification({
            idType: nextIdType,
            uploadedFront: uploaded.idFront,
            uploadedBack: uploaded.idBack,
            existing: {
                ...(guardian.identification?.toObject?.() ||
                    guardian.identification ||
                    {}),
                idPhoto: guardian.idPhoto,
            },
            required: true,
        });
        if (idDocs.error) {
            await deleteFromCloudinaryMany(uploadedUrls);
            return res.status(400).json({ message: idDocs.error });
        }

        if (uploaded.idFront && (guardian.identification?.front || guardian.idPhoto)) {
            urlsToDelete.push(guardian.identification?.front || guardian.idPhoto);
        }
        if (
            (uploaded.idBack || nextIdType === 'Passport') &&
            guardian.identification?.back
        ) {
            urlsToDelete.push(guardian.identification.back);
        }
        guardian.identification = idDocs.identification;
        guardian.idPhoto = '';

        await Promise.all([user.save(), guardian.save()]);
        uploadedUrls.length = 0;
        await deleteFromCloudinaryMany(urlsToDelete);

        const guardianData = await GuardianModel.findById(guardian._id).populate(guardianPopulate);

        res.json({
            message: 'Guardian updated successfully',
            guardian: guardianData,
        });
    } catch (error) {
        await deleteFromCloudinaryMany(uploadedUrls);
        next(error);
    }
};

const setGuardianStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid guardian ID' });
        }

        if (isActive === undefined) {
            return res.status(400).json({ message: 'isActive is required' });
        }

        const guardian = await GuardianModel.findById(id);
        if (!guardian) {
            return res.status(404).json({ message: 'Guardian not found' });
        }

        const user = await UserModel.findById(guardian.user);
        if (!user || user.isDeleted) {
            return res.status(404).json({ message: 'Guardian not found' });
        }

        user.isActive = isTrue(isActive);
        await user.save();

        const guardianData = await GuardianModel.findById(id).populate(guardianPopulate);

        res.json({
            message: user.isActive
                ? 'Guardian unbanned successfully'
                : 'Guardian banned successfully',
            guardian: guardianData,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getGuardians,
    getGuardianById,
    addGuardian,
    updateGuardian,
    setGuardianStatus,
};
