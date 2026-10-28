const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const StudentModel = require('../../models/student.model.js');
const GuardianModel = require('../../models/guardian.model.js');
const ClassModel = require('../../models/class.model.js');
const { UserModel } = require('../../models/user.model.js');
const ENV = require('../../config/env.js');
const { uploadFiles, deleteFromCloudinaryMany } = require('../../middleware/multer.middleware.js');
const generatePassword = require('../../utils/generatePassword.js');
const mailer = require('../../utils/Mailer.js');
const {
    studentCredentialsEmail,
    guardianCredentialsEmail,
} = require('../../utils/emailTemplates.js');
const {
    parseJson,
    isTrue,
    normalizeAddress,
    hasCompleteAddress,
    normalizeContactInfo,
    normalizeGender,
    emailTaken,
    findUserIds,
    populateUser,
} = require('../../utils/userHelpers.js');

const {
    ID_TYPES,
    isValidIdType,
    needsIdBack,
} = require('../../utils/idTypes.js');

const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value).trim());

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

const splitFullName = (fullName = '') => {
    const trimmed = String(fullName).trim();
    if (!trimmed) return { firstName: '', lastName: '' };

    const spaceIndex = trimmed.indexOf(' ');
    if (spaceIndex === -1) return { firstName: trimmed, lastName: trimmed };

    return {
        firstName: trimmed.slice(0, spaceIndex),
        lastName: trimmed.slice(spaceIndex + 1).trim() || trimmed,
    };
};

const resolveGuardianInput = (body) => {
    const guardianPayload = parseJson(body.guardian, null);

    if (guardianPayload) {
        return {
            firstName: guardianPayload.firstName?.trim() || '',
            lastName: guardianPayload.lastName?.trim() || '',
            email: guardianPayload.email?.trim() || '',
            idType: guardianPayload.idType?.trim() || '',
            contactInfo: normalizeContactInfo(guardianPayload.contactInfo || {}),
            address: normalizeAddress(guardianPayload.address || {}),
        };
    }

    const fromParentName = splitFullName(body.parentName || '');

    return {
        firstName: (body.guardianFirstName || fromParentName.firstName).trim(),
        lastName: (body.guardianLastName || fromParentName.lastName).trim(),
        email: (body.guardianEmail || body.parentEmail || '').trim(),
        idType: (body.guardianIdType || '').trim(),
        contactInfo: normalizeContactInfo(parseJson(body.guardianContactInfo, {})),
        address: normalizeAddress(parseJson(body.guardianAddress, {})),
    };
};

const studentPopulate = [
    populateUser,
    {
        path: 'guardian',
        populate: populateUser,
    },
    {
        path: 'class',
        select: 'className classCode grade academicYear isActive teachers',
        populate: {
            path: 'teachers',
            populate: {
                path: 'user',
                select: 'firstName lastName email photo isActive',
            },
        },
    },
];

const cleanupUsers = async (userIds = []) => {
    const ids = userIds.filter(Boolean);
    if (!ids.length) return;
    await UserModel.deleteMany({ _id: { $in: ids } }).catch(() => {});
};

const rollbackStudentCreation = async ({
    studentId,
    guardianId,
    createdGuardianId,
    createdUserIds,
    classId,
}) => {
    if (studentId) {
        if (classId) {
            await ClassModel.findByIdAndUpdate(classId, {
                $pull: { students: studentId },
            }).catch(() => {});
        }
        if (guardianId) {
            await GuardianModel.findByIdAndUpdate(guardianId, {
                $pull: { students: studentId },
            }).catch(() => {});
        }
        await StudentModel.findByIdAndDelete(studentId).catch(() => {});
    }

    if (createdGuardianId) {
        await GuardianModel.findByIdAndDelete(createdGuardianId).catch(() => {});
    }

    await cleanupUsers(createdUserIds);
};

const ensureGuardianRecord = async ({ userId, idType, identification }) => {
    let guardianDoc = await GuardianModel.findOne({ user: userId });
    if (guardianDoc) {
        return { guardianDoc, created: false };
    }

    guardianDoc = await GuardianModel.create({
        user: userId,
        idType,
        identification: identification || { front: '', back: '' },
        students: [],
    });

    return { guardianDoc, created: true };
};





















const addStudent = async (req, res, next) => {
    const uploadedUrls = [];
    const createdUserIds = [];
    let createdGuardianId = null;
    let createdStudentId = null;
    let linkedGuardianId = null;
    let classId = null;

    try {
        const demoEnrollment = isTrue(req.body.demoEnrollment);
        if (demoEnrollment && !isTrue(ENV.DEMO_ACCOUNT_CREATION_ENABLED)) {
            return res.status(403).json({ message: 'Demo account creation is disabled on this server' });
        }
        if (demoEnrollment && !ENV.DEMO_DEFAULT_PASSWORD) {
            return res.status(503).json({ message: 'DEMO_DEFAULT_PASSWORD is not configured on the API' });
        }

        const {
            firstName,
            lastName,
            email,
            dateOfBirth,
            gender,
            emergencyContact,
            isActive,
            idType,
        } = req.body;

        classId = req.body.class || req.body.classId;
        const contactInfo = normalizeContactInfo(parseJson(req.body.contactInfo, {}));
        const studentAddress = normalizeAddress(
            parseJson(req.body.address || req.body.studentAddress, {})
        );
        const sameAsStudentAddress = isTrue(req.body.sameAsStudentAddress);
        const guardian = resolveGuardianInput(req.body);
        const studentIdType = (idType || '').trim();
        const normalizedGender = normalizeGender(gender);

        if (sameAsStudentAddress) {
            guardian.address = studentAddress;
        }

        if (
            !firstName?.trim() ||
            !lastName?.trim() ||
            !email?.trim() ||
            !dateOfBirth ||
            !normalizedGender ||
            !emergencyContact?.trim()
        ) {
            return res.status(400).json({
                message:
                    'First name, last name, email, date of birth, gender, and emergency contact are required',
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: 'Please provide a valid student email address',
            });
        }

        if (!isValidIdType(studentIdType)) {
            return res.status(400).json({ message: 'Valid student ID type is required' });
        }

        if (!hasCompleteAddress(studentAddress)) {
            return res.status(400).json({ message: 'Complete student address is required' });
        }

        if (classId) {
            if (!mongoose.Types.ObjectId.isValid(classId)) {
                return res.status(400).json({ message: 'Invalid class ID' });
            }

            const classExists = await ClassModel.exists({ _id: classId });
            if (!classExists) {
                return res.status(404).json({ message: 'Class not found' });
            }
        }

        const studentEmail = email.toLowerCase().trim();
        const existingGuardianId = (req.body.existingGuardianId || '').trim();

        let existingGuardianUser = null;
        let linkedGuardianDoc = null;

        if (existingGuardianId) {
            if (!mongoose.Types.ObjectId.isValid(existingGuardianId)) {
                return res.status(400).json({ message: 'Invalid guardian ID' });
            }

            linkedGuardianDoc = await GuardianModel.findById(existingGuardianId);
            if (!linkedGuardianDoc) {
                return res.status(404).json({ message: 'Selected guardian not found' });
            }

            existingGuardianUser = await UserModel.findById(linkedGuardianDoc.user).select(
                '+password'
            );
            if (
                !existingGuardianUser ||
                existingGuardianUser.isDeleted ||
                existingGuardianUser.role !== 'guardian'
            ) {
                return res.status(404).json({ message: 'Selected guardian not found' });
            }
        }

        const guardianEmail = (
            existingGuardianUser?.email || guardian.email || ''
        )
            .toLowerCase()
            .trim();

        if (!guardianEmail || !isValidEmail(guardianEmail)) {
            return res.status(400).json({
                message: 'Please provide a valid guardian email address',
            });
        }

        if (studentEmail === guardianEmail) {
            return res.status(400).json({
                message: 'Student and guardian must have different emails',
            });
        }

        if (await emailTaken(studentEmail)) {
            return res.status(409).json({ message: 'A user with this student email already exists' });
        }

        if (!existingGuardianUser) {
            if (!guardian.firstName || !guardian.lastName) {
                return res.status(400).json({
                    message: 'Guardian first name, last name, and email are required',
                });
            }

            if (!guardian.contactInfo?.phone?.trim()) {
                return res.status(400).json({
                    message: 'Guardian phone number is required',
                });
            }

            if (!isValidIdType(guardian.idType)) {
                return res.status(400).json({ message: 'Valid guardian ID type is required' });
            }

            if (!hasCompleteAddress(guardian.address)) {
                return res.status(400).json({ message: 'Complete guardian address is required' });
            }

            existingGuardianUser = await UserModel.findOne({
                email: guardianEmail,
                isDeleted: { $ne: true },
            }).select('+password');

            if (existingGuardianUser && existingGuardianUser.role !== 'guardian') {
                return res.status(409).json({
                    message: 'A user with this guardian email already exists',
                });
            }
        }

        const linkingExistingGuardian = Boolean(existingGuardianUser);
        const guardianHasPassword = Boolean(existingGuardianUser?.password);
        // if the guardian user does not have a password,then it means this student is his first student so we should email the guardian with his credentials after creating the student and his(guardian) account
        const shouldEmailGuardian = !demoEnrollment && (!existingGuardianUser || !guardianHasPassword);

        const uploaded = await uploadFiles(req.files, 'students');
        uploadedUrls.push(...Object.values(uploaded).filter(Boolean));

        if (!uploaded.photo) {
            await deleteFromCloudinaryMany(uploadedUrls);
            return res.status(400).json({ message: 'Student profile photo is required' });
        }

        if (!linkingExistingGuardian && !uploaded.guardianPhoto) {
            await deleteFromCloudinaryMany(uploadedUrls);
            return res.status(400).json({ message: 'Guardian photo is required' });
        }

        const studentIdDocs = resolveIdentification({
            idType: studentIdType,
            uploadedFront: uploaded.idFront,
            uploadedBack: uploaded.idBack,
            required: true,
        });
        if (studentIdDocs.error) {
            await deleteFromCloudinaryMany(uploadedUrls);
            return res.status(400).json({ message: studentIdDocs.error });
        }

        const guardianIdDocs = resolveIdentification({
            idType: linkingExistingGuardian
                ? linkedGuardianDoc?.idType || guardian.idType || 'National ID'
                : guardian.idType,
            uploadedFront: uploaded.guardianIdFront,
            uploadedBack: uploaded.guardianIdBack,
            existing: {
                ...(linkedGuardianDoc?.identification?.toObject?.() ||
                    linkedGuardianDoc?.identification ||
                    {}),
                idPhoto: linkedGuardianDoc?.idPhoto,
            },
            required: !linkingExistingGuardian,
        });
        if (guardianIdDocs.error) {
            await deleteFromCloudinaryMany(uploadedUrls);
            return res.status(400).json({
                message: `Guardian ${guardianIdDocs.error.charAt(0).toLowerCase()}${guardianIdDocs.error.slice(1)}`,
            });
        }

        const studentPassword = demoEnrollment ? ENV.DEMO_DEFAULT_PASSWORD : generatePassword();
        const studentName = `${firstName.trim()} ${lastName.trim()}`;
        let guardianPassword = null;
        let pendingGuardianPasswordHash = null;
        let guardianUser;
        let guardianDoc;

        if (existingGuardianUser) {
            guardianUser = existingGuardianUser;

            if (!guardianHasPassword && !demoEnrollment) {
                guardianPassword = generatePassword();
                pendingGuardianPasswordHash = await bcrypt.hash(guardianPassword, 10);
            }

            if (linkedGuardianDoc) {
                guardianDoc = linkedGuardianDoc;
            } else {
                const ensured = await ensureGuardianRecord({
                    userId: guardianUser._id,
                    idType: guardian.idType,
                    identification: guardianIdDocs.identification,
                });
                guardianDoc = ensured.guardianDoc;
                if (ensured.created) {
                    createdGuardianId = guardianDoc._id;
                }
            }
        } else {
            guardianPassword = demoEnrollment
                ? ENV.DEMO_DEFAULT_PASSWORD
                : generatePassword();
            const hashedGuardianPassword = await bcrypt.hash(guardianPassword, 10);

            guardianUser = await UserModel.create({
                firstName: guardian.firstName,
                lastName: guardian.lastName,
                email: guardianEmail,
                password: hashedGuardianPassword,
                photo: uploaded.guardianPhoto || '',
                contactInfo: guardian.contactInfo,
                address: guardian.address,
                role: 'guardian',
                isActive: true,
            });
            createdUserIds.push(guardianUser._id);

            guardianDoc = await GuardianModel.create({
                user: guardianUser._id,
                idType: guardian.idType,
                identification: guardianIdDocs.identification,
                students: [],
            });
            createdGuardianId = guardianDoc._id;
        }

        const hashedStudentPassword = await bcrypt.hash(studentPassword, 10);

        const studentUser = await UserModel.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: studentEmail,
            password: hashedStudentPassword,
            photo: uploaded.photo || '',
            contactInfo,
            address: studentAddress,
            gender: normalizedGender,
            dateOfBirth,
            role: 'student',
            isActive: isActive === undefined ? true : isTrue(isActive),
        });
        createdUserIds.push(studentUser._id);

        const student = await StudentModel.create({
            user: studentUser._id,
            idType: studentIdType,
            identification: studentIdDocs.identification,
            class: classId || undefined,
            guardian: guardianDoc._id,
            emergencyContact: emergencyContact.trim(),
        });
        createdStudentId = student._id;
        linkedGuardianId = guardianDoc._id;

        await GuardianModel.findByIdAndUpdate(guardianDoc._id, {
            $addToSet: { students: student._id },
        });

        if (classId) {
            await ClassModel.findByIdAndUpdate(classId, {
                $addToSet: { students: student._id },
            });
        }

        uploadedUrls.length = 0;

        if (!demoEnrollment) {
            const studentMail = studentCredentialsEmail({
                firstName: studentUser.firstName,
                email: studentEmail,
                password: studentPassword,
            });

            const emailJobs = [
                mailer.sendEmail({
                    to: studentEmail,
                    subject: studentMail.subject,
                    text: studentMail.text,
                    html: studentMail.html,
                }),
            ];

            if (shouldEmailGuardian) {
                const guardianMail = guardianCredentialsEmail({
                    firstName: guardianUser.firstName,
                    email: guardianEmail,
                    password: guardianPassword,
                    studentName,
                });
                emailJobs.push(
                    mailer.sendEmail({
                        to: guardianEmail,
                        subject: guardianMail.subject,
                        text: guardianMail.text,
                        html: guardianMail.html,
                    })
                );
            }

            try {
                await Promise.all(emailJobs);
            } catch (emailError) {
                console.error('Credential email failed after account creation:', emailError.message);
                await rollbackStudentCreation({
                    studentId: createdStudentId,
                    guardianId: linkedGuardianId,
                    createdGuardianId,
                    createdUserIds,
                    classId,
                });
                createdStudentId = null;
                createdGuardianId = null;
                createdUserIds.length = 0;
                return res.status(502).json({
                    message:
                        'Could not send credential emails. Student was not created. Please try again.',
                    emailSent: false,
                    detail: emailError.message,
                });
            }
        }

        if (pendingGuardianPasswordHash) {
            guardianUser.password = pendingGuardianPasswordHash;
            await guardianUser.save();
        }

        const studentData = await StudentModel.findById(student._id)
            .select('-assignments -announcements -events -resources -exams -quizzes')
            .populate(studentPopulate)
            .lean();

        res.status(201).json({
            message: demoEnrollment
                ? 'Student and login accounts created in demo mode without sending credential emails'
                : existingGuardianUser
                  ? 'Student created and linked to existing guardian successfully'
                  : 'Student and guardian created successfully',
            student: studentData,
            demoEnrollment,
            emailSent: !demoEnrollment,
            guardianEmailSent: !demoEnrollment && shouldEmailGuardian,
        });
    } catch (error) {
        await rollbackStudentCreation({
            studentId: createdStudentId,
            guardianId: linkedGuardianId,
            createdGuardianId,
            createdUserIds,
            classId,
        });
        await deleteFromCloudinaryMany(uploadedUrls);
        next(error);
    }
};

















const getStudents = async (req, res, next) => {
    try {
        const { search, isActive } = req.query;
        const userIds = await findUserIds({ role: 'student', search, isActive });

        const students = await StudentModel.find({ user: { $in: userIds } })
            .select('-assignments -announcements -events -resources -exams -quizzes')
            .populate(studentPopulate)
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            count: students.length,
            students,
        });
    } catch (error) {
        next(error);
    }
};
















const getStudentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        const student = await StudentModel.findById(id)
            .select('-assignments -announcements -events -resources -exams -quizzes')
            .populate(studentPopulate)
            .lean();

        if (!student || !student.user || student.user.isDeleted) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ student });
    } catch (error) {
        next(error);
    }
};



















const updateStudent = async (req, res, next) => {
    const uploadedUrls = [];

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        const student = await StudentModel.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const studentUser = await UserModel.findById(student.user);
        if (!studentUser || studentUser.isDeleted) {
            return res.status(404).json({ message: 'Student user account not found' });
        }

        const guardianDoc = student.guardian
            ? await GuardianModel.findById(student.guardian)
            : null;

        if (!guardianDoc) {
            return res.status(404).json({ message: 'Guardian not found for this student' });
        }

        const guardianUser = await UserModel.findById(guardianDoc.user);
        if (!guardianUser || guardianUser.isDeleted) {
            return res.status(404).json({ message: 'Guardian user account not found' });
        }

        const {
            firstName,
            lastName,
            email,
            dateOfBirth,
            gender,
            emergencyContact,
            isActive,
            idType,
        } = req.body;

        const classId = req.body.class || req.body.classId || '';
        const contactInfo = parseJson(req.body.contactInfo, null);
        const studentAddress = normalizeAddress(
            parseJson(req.body.address || req.body.studentAddress, {})
        );
        const sameAsStudentAddress = isTrue(req.body.sameAsStudentAddress);
        const guardian = resolveGuardianInput(req.body);
        const studentIdType = (idType || '').trim();
        const normalizedGender = normalizeGender(gender);

        if (sameAsStudentAddress) {
            guardian.address = studentAddress;
        }

        if (
            !firstName?.trim() ||
            !lastName?.trim() ||
            !email?.trim() ||
            !dateOfBirth ||
            !normalizedGender ||
            !emergencyContact?.trim()
        ) {
            return res.status(400).json({
                message:
                    'First name, last name, email, date of birth, gender, and emergency contact are required',
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: 'Please provide a valid student email address',
            });
        }

        if (!isValidIdType(studentIdType)) {
            return res.status(400).json({ message: 'Valid student ID type is required' });
        }

        if (!guardian.firstName || !guardian.lastName || !guardian.email) {
            return res.status(400).json({
                message: 'Guardian first name, last name, and email are required',
            });
        }

        if (!isValidEmail(guardian.email)) {
            return res.status(400).json({
                message: 'Please provide a valid guardian email address',
            });
        }

        if (!guardian.contactInfo?.phone?.trim()) {
            return res.status(400).json({
                message: 'Guardian phone number is required',
            });
        }

        if (!isValidIdType(guardian.idType)) {
            return res.status(400).json({ message: 'Valid guardian ID type is required' });
        }

        if (!hasCompleteAddress(studentAddress)) {
            return res.status(400).json({ message: 'Complete student address is required' });
        }

        if (!hasCompleteAddress(guardian.address)) {
            return res.status(400).json({ message: 'Complete guardian address is required' });
        }

        if (classId) {
            if (!mongoose.Types.ObjectId.isValid(classId)) {
                return res.status(400).json({ message: 'Invalid class ID' });
            }

            const classExists = await ClassModel.exists({ _id: classId });
            if (!classExists) {
                return res.status(404).json({ message: 'Class not found' });
            }
        }

        const studentEmail = email.toLowerCase().trim();
        const guardianEmail = guardian.email.toLowerCase().trim();

        if (studentEmail === guardianEmail) {
            return res.status(400).json({
                message: 'Student and guardian must have different emails',
            });
        }

        const [duplicateStudentEmail, duplicateGuardianEmail] = await Promise.all([
            emailTaken(studentEmail, studentUser._id),
            emailTaken(guardianEmail, guardianUser._id),
        ]);

        if (duplicateStudentEmail) {
            return res.status(409).json({ message: 'A user with this student email already exists' });
        }

        if (duplicateGuardianEmail) {
            return res.status(409).json({ message: 'A user with this guardian email already exists' });
        }

        const uploaded = await uploadFiles(req.files, 'students');
        uploadedUrls.push(...Object.values(uploaded).filter(Boolean));
        const urlsToDelete = [];

        if (!uploaded.guardianPhoto && !guardianUser.photo) {
            await deleteFromCloudinaryMany(uploadedUrls);
            return res.status(400).json({ message: 'Guardian photo is required' });
        }

        const previousClassId = student.class?.toString() || '';
        const nextClassId = classId || '';

        studentUser.firstName = firstName.trim();
        studentUser.lastName = lastName.trim();
        studentUser.email = studentEmail;
        studentUser.dateOfBirth = dateOfBirth;
        studentUser.gender = normalizedGender;
        studentUser.address = studentAddress;

        if (contactInfo) {
            studentUser.contactInfo = normalizeContactInfo(contactInfo);
        }

        if (isActive !== undefined) {
            studentUser.isActive = isTrue(isActive);
        }

        if (uploaded.photo) {
            if (studentUser.photo) urlsToDelete.push(studentUser.photo);
            studentUser.photo = uploaded.photo;
        }

        student.emergencyContact = emergencyContact.trim();
        student.idType = studentIdType;
        student.class = nextClassId || undefined;

        const studentIdDocs = resolveIdentification({
            idType: studentIdType,
            uploadedFront: uploaded.idFront,
            uploadedBack: uploaded.idBack,
            existing: {
                ...(student.identification?.toObject?.() ||
                    student.identification ||
                    {}),
                idPhoto: student.idPhoto,
            },
            required: true,
        });
        if (studentIdDocs.error) {
            await deleteFromCloudinaryMany(uploadedUrls);
            return res.status(400).json({ message: studentIdDocs.error });
        }

        if (uploaded.idFront && (student.identification?.front || student.idPhoto)) {
            urlsToDelete.push(student.identification?.front || student.idPhoto);
        }
        if (
            (uploaded.idBack || studentIdType === 'Passport') &&
            student.identification?.back
        ) {
            urlsToDelete.push(student.identification.back);
        }
        student.identification = studentIdDocs.identification;
        student.idPhoto = '';

        guardianUser.firstName = guardian.firstName;
        guardianUser.lastName = guardian.lastName;
        guardianUser.email = guardianEmail;
        guardianUser.contactInfo = guardian.contactInfo;
        guardianUser.address = guardian.address;

        if (uploaded.guardianPhoto) {
            if (guardianUser.photo) urlsToDelete.push(guardianUser.photo);
            guardianUser.photo = uploaded.guardianPhoto;
        }

        guardianDoc.idType = guardian.idType;

        const guardianIdDocs = resolveIdentification({
            idType: guardian.idType,
            uploadedFront: uploaded.guardianIdFront,
            uploadedBack: uploaded.guardianIdBack,
            existing: {
                ...(guardianDoc.identification?.toObject?.() ||
                    guardianDoc.identification ||
                    {}),
                idPhoto: guardianDoc.idPhoto,
            },
            required: true,
        });
        if (guardianIdDocs.error) {
            await deleteFromCloudinaryMany(uploadedUrls);
            return res.status(400).json({
                message: `Guardian ${guardianIdDocs.error.charAt(0).toLowerCase()}${guardianIdDocs.error.slice(1)}`,
            });
        }

        if (
            uploaded.guardianIdFront &&
            (guardianDoc.identification?.front || guardianDoc.idPhoto)
        ) {
            urlsToDelete.push(
                guardianDoc.identification?.front || guardianDoc.idPhoto
            );
        }
        if (
            (uploaded.guardianIdBack || guardian.idType === 'Passport') &&
            guardianDoc.identification?.back
        ) {
            urlsToDelete.push(guardianDoc.identification.back);
        }
        guardianDoc.identification = guardianIdDocs.identification;
        guardianDoc.idPhoto = '';

        await Promise.all([
            studentUser.save(),
            student.save(),
            guardianUser.save(),
            guardianDoc.save(),
        ]);
        uploadedUrls.length = 0;

        const linkUpdates = [];

        if (previousClassId && previousClassId !== nextClassId) {
            linkUpdates.push(
                ClassModel.findByIdAndUpdate(previousClassId, {
                    $pull: { students: student._id },
                })
            );
        }

        if (nextClassId && previousClassId !== nextClassId) {
            linkUpdates.push(
                ClassModel.findByIdAndUpdate(nextClassId, {
                    $addToSet: { students: student._id },
                })
            );
        }

        if (linkUpdates.length) {
            await Promise.all(linkUpdates);
        }

        await deleteFromCloudinaryMany(urlsToDelete);

        const studentData = await StudentModel.findById(student._id)
            .select('-assignments -announcements -events -resources -exams -quizzes')
            .populate(studentPopulate);

        res.json({
            message: 'Student updated successfully',
            student: studentData,
        });
    } catch (error) {
        await deleteFromCloudinaryMany(uploadedUrls);
        next(error);
    }
};

const setStudentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        if (isActive === undefined) {
            return res.status(400).json({ message: 'isActive is required' });
        }

        const student = await StudentModel.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const user = await UserModel.findById(student.user);
        if (!user || user.isDeleted) {
            return res.status(404).json({ message: 'Student not found' });
        }

        user.isActive = isTrue(isActive);
        await user.save();

        const studentData = await StudentModel.findById(id)
            .select('-assignments -announcements -events -resources -exams -quizzes')
            .populate(studentPopulate);

        res.json({
            message: user.isActive
                ? 'Student unbanned successfully'
                : 'Student banned successfully',
            student: studentData,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addStudent,
    getStudents,
    getStudentById,
    updateStudent,
    setStudentStatus,
};
