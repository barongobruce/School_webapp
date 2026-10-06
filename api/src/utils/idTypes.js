const ID_TYPES = ['National ID', 'Passport', "Driver's License", 'Other'];

const isValidIdType = (value) => ID_TYPES.includes(value);

const needsIdBack = (idType) => Boolean(idType) && idType !== 'Passport';

const normalizeIdType = (value = '') => {
    const raw = String(value).trim();
    if (!raw) return '';
    if (ID_TYPES.includes(raw)) return raw;

    const legacy = {
        passport: 'Passport',
        drivers_license: "Driver's License",
        "driver's_license": "Driver's License",
        "driver's license": "Driver's License",
        ghana_card: 'National ID',
        national_id: 'National ID',
        'national id': 'National ID',
        other: 'Other',
    };

    const key = raw.toLowerCase().replace(/-/g, '_');
    return legacy[key] || raw;
};

module.exports = {
    ID_TYPES,
    isValidIdType,
    needsIdBack,
    normalizeIdType,
};
