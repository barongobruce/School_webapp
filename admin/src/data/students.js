import student1 from '../assets/student1.jpg'
import student2 from '../assets/student2.jpg'
import student3 from '../assets/student3.jpg'
import student4 from '../assets/student4.jpg'
import student5 from '../assets/student5.jpg'

const students = [
  {
    id: 'STU-2024-001',
    photo: student1,
    firstName: 'Amina',
    lastName: 'Okello',
    gender: 'Female',
    dateOfBirth: '2012-03-14',
    parentGuardian: {
      name: 'Grace Okello',
      relationship: 'Mother',
      phone: '+256 772 445 210',
      email: 'grace.okello@email.com',
    },
    classGrade: 'Grade 7A',
    phone: '+256 701 223 891',
    email: 'amina.okello@school.edu',
    address: {
      street: '14 Nakasero Road',
      city: 'Kampala',
      district: 'Central',
      country: 'Uganda',
    },
    teacher: 'Mr. Daniel Mutebi',
    dateOfAdmission: '2024-01-15',
    status: 'Active',
    attendanceRate: 96,
    feesBalance: 0,
    feesPaid: 1000000,
    bloodGroup: 'O+',
    emergencyContact: '+256 772 445 210',
    reports: [
      {
        id: 'RPT-2025-001',
        title: 'Repeated bullying of Amina Okello during break',
        category: 'Bullying',
        priority: 'High',
        status: 'Under Review',
        involvement: 'Related',
        summary: 'Guardian report that Amina has been teased and shoved by James Mwangi during break and is now avoiding the playground.',
        createdAt: '2025-03-11'
      },
      {
        id: 'RPT-2025-006',
        title: 'Missing stationery believed stolen from desk',
        category: 'Misconduct',
        priority: 'Medium',
        status: 'Closed',
        involvement: 'Filed',
        summary: 'Amina reported her geometry set and calculator missing from her desk during Mathematics; items were later found in lost-and-found.',
        createdAt: '2025-01-22'
      },
      {
        id: 'RPT-2025-010',
        title: 'Allegation of favouritism in Mathematics stream placement',
        category: 'Discrimination',
        priority: 'Medium',
        status: 'Dismissed',
        involvement: 'Filed',
        summary: 'Amina alleged favouritism by Mr. Daniel Mutebi in seating and attention; investigation found no unfair treatment.',
        createdAt: '2025-01-16'
      }
    ],
  },
  {
    id: 'STU-2024-002',
    photo: student2,
    firstName: 'James',
    lastName: 'Mwangi',
    gender: 'Male',
    dateOfBirth: '2011-09-22',
    parentGuardian: {
      name: 'Peter Mwangi',
      relationship: 'Father',
      phone: '+256 755 118 304',
      email: 'peter.mwangi@email.com',
    },
    classGrade: 'Grade 8B',
    phone: '+256 780 556 442',
    email: 'james.mwangi@school.edu',
    address: {
      street: '8 Kololo Avenue',
      city: 'Kampala',
      district: 'Central',
      country: 'Uganda',
    },
    teacher: 'Ms. Sarah Namukasa',
    dateOfAdmission: '2023-09-04',
    status: 'Active',
    attendanceRate: 91,
    feesBalance: 150000,
    feesPaid: 1000000,
    bloodGroup: 'A+',
    emergencyContact: '+256 755 118 304',
    reports: [
      {
        id: 'RPT-2025-001',
        title: 'Repeated bullying of Amina Okello during break',
        category: 'Bullying',
        priority: 'High',
        status: 'Under Review',
        involvement: 'Against',
        summary: 'Named as the student allegedly bullying Amina Okello during mid-morning break near the Grade 7 corridor.',
        createdAt: '2025-03-11'
      },
      {
        id: 'RPT-2025-003',
        title: 'Concern over unfair grading in English Literature',
        category: 'Academic Concern',
        priority: 'Medium',
        status: 'Open',
        involvement: 'Related',
        summary: 'Guardian concern about James mid-term Literature mark and delayed feedback from Ms. Sarah Namukasa.',
        createdAt: '2025-03-01'
      },
      {
        id: 'RPT-2025-009',
        title: 'Suspected cheating during ICT practical assessment',
        category: 'Academic Concern',
        priority: 'High',
        status: 'Resolved',
        involvement: 'Against',
        summary: 'Observed accessing unauthorized notes during ICT practical; received a zero, warning, and makeup assessment.',
        createdAt: '2025-02-12'
      }
    ],
  },
  {
    id: 'STU-2024-003',
    photo: student3,
    firstName: 'Faith',
    lastName: 'Nabukeera',
    gender: 'Female',
    dateOfBirth: '2013-06-08',
    parentGuardian: {
      name: 'Rebecca Nabukeera',
      relationship: 'Mother',
      phone: '+256 704 882 156',
      email: 'rebecca.nabukeera@email.com',
    },
    classGrade: 'Grade 6A',
    phone: '+256 712 309 774',
    email: 'faith.nabukeera@school.edu',
    address: {
      street: '22 Bugolobi Close',
      city: 'Kampala',
      district: 'Central',
      country: 'Uganda',
    },
    teacher: 'Mrs. Joan Asiimwe',
    dateOfAdmission: '2024-02-12',
    status: 'Active',
    attendanceRate: 98,
    feesBalance: 50000,
    feesPaid: 950000,
    bloodGroup: 'B+',
    emergencyContact: '+256 704 882 156',
    reports: [
      {
        id: 'RPT-2025-004',
        title: 'Excessive detention without prior guardian notice',
        category: 'Communication',
        priority: 'Low',
        status: 'Resolved',
        involvement: 'Filed',
        summary: 'Faith reported after-school detention without guardian notice; resolved with supervised homework catch-up instead.',
        createdAt: '2025-02-19'
      },
      {
        id: 'RPT-2025-008',
        title: 'Safety concern after PE injury on the field',
        category: 'Safety',
        priority: 'Critical',
        status: 'Under Review',
        involvement: 'Related',
        summary: 'Sustained a twisted ankle during PE; guardian filed a safety concern about equipment and supervision.',
        createdAt: '2025-03-07'
      }
    ],
  },
  {
    id: 'STU-2023-004',
    photo: student4,
    firstName: 'Brian',
    lastName: 'Ssekandi',
    gender: 'Male',
    dateOfBirth: '2010-11-30',
    parentGuardian: {
      name: 'Joseph Ssekandi',
      relationship: 'Father',
      phone: '+256 776 441 908',
      email: 'joseph.ssekandi@email.com',
    },
    classGrade: 'Grade 9A',
    phone: '+256 759 220 615',
    email: 'brian.ssekandi@school.edu',
    address: {
      street: '5 Entebbe Road',
      city: 'Entebbe',
      district: 'Wakiso',
      country: 'Uganda',
    },
    teacher: 'Mr. Paul Kigongo',
    dateOfAdmission: '2023-01-16',
    status: 'Active',
    attendanceRate: 87,
    feesBalance: 300000,
    feesPaid: 700000,
    bloodGroup: 'AB+',
    emergencyContact: '+256 776 441 908',
    reports: [
      {
        id: 'RPT-2025-002',
        title: 'Persistent classroom disruption in Grade 9A History',
        category: 'Misconduct',
        priority: 'Medium',
        status: 'Open',
        involvement: 'Against',
        summary: 'Teacher report of interrupting lessons and refusing seating instructions during History periods.',
        createdAt: '2025-03-08'
      },
      {
        id: 'RPT-2025-005',
        title: 'Hostile behaviour during parent-teacher meeting',
        category: 'Harassment',
        priority: 'High',
        status: 'Under Review',
        involvement: 'Related',
        summary: 'Subject of the parent-teacher meeting that led to a harassment report against his guardian.',
        createdAt: '2025-03-05'
      },
      {
        id: 'RPT-2025-006',
        title: 'Missing stationery believed stolen from desk',
        category: 'Misconduct',
        priority: 'Medium',
        status: 'Closed',
        involvement: 'Against',
        summary: 'Named in a missing stationery report; no evidence of theft and case was closed without discipline.',
        createdAt: '2025-01-22'
      }
    ],
  },
  {
    id: 'STU-2025-005',
    photo: student5,
    firstName: 'Linda',
    lastName: 'Achieng',
    gender: 'Female',
    dateOfBirth: '2014-01-19',
    parentGuardian: {
      name: 'Grace Okello',
      relationship: 'Guardian',
      phone: '+256 772 445 210',
      email: 'grace.okello@email.com',
    },
    classGrade: 'Grade 5B',
    phone: '+256 700 918 334',
    email: 'linda.achieng@school.edu',
    address: {
      street: '31 Ntinda Drive',
      city: 'Kampala',
      district: 'Central',
      country: 'Uganda',
    },
    teacher: 'Ms. Esther Nalwoga',
    dateOfAdmission: '2025-01-20',
    status: 'Active',
    attendanceRate: 94,
    feesBalance: 0,
    feesPaid: 1000000,
    bloodGroup: 'O-',
    emergencyContact: '+256 772 445 210',
    reports: [
      {
        id: 'RPT-2025-007',
        title: 'Guardian repeatedly missing scheduled progress meetings',
        category: 'Attendance',
        priority: 'Low',
        status: 'Open',
        involvement: 'Related',
        summary: 'Progress meetings about Linda art portfolio and classroom focus were missed by her guardian.',
        createdAt: '2025-03-04'
      }
    ],
  },
]

export default students
