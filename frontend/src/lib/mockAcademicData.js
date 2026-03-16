// // Mock data for Academic management pages

// export const facultiesData = [
//   {
//     id: "FAC-001",
//     name: "Faculty of Engineering",
//     dean: "Dr. Ahmed Hassan",
//     departments: 6,
//     students: 1240,
//     established: "2001",
//     status: "Active",
//   },
//   {
//     id: "FAC-002",
//     name: "Faculty of Science",
//     dean: "Dr. Fatima Al-Zahra",
//     departments: 5,
//     students: 980,
//     established: "1998",
//     status: "Active",
//   },
//   {
//     id: "FAC-003",
//     name: "Faculty of Business Administration",
//     dean: "Prof. Mohamed Salah",
//     departments: 4,
//     students: 1560,
//     established: "2003",
//     status: "Active",
//   },
//   {
//     id: "FAC-004",
//     name: "Faculty of Medicine",
//     dean: "Dr. Sarah Johnson",
//     departments: 8,
//     students: 740,
//     established: "1995",
//     status: "Active",
//   },
//   {
//     id: "FAC-005",
//     name: "Faculty of Arts & Humanities",
//     dean: "Prof. Ali Ibrahim",
//     departments: 7,
//     students: 620,
//     established: "2000",
//     status: "Active",
//   },
//   {
//     id: "FAC-006",
//     name: "Faculty of Law",
//     dean: "Dr. Nadia Karim",
//     departments: 3,
//     students: 430,
//     established: "2008",
//     status: "Inactive",
//   },
//   {
//     id: "FAC-007",
//     name: "Faculty of Education",
//     dean: "Prof. Omar Yusuf",
//     departments: 5,
//     students: 870,
//     established: "2005",
//     status: "Active",
//   },
//   {
//     id: "FAC-008",
//     name: "Faculty of Information Technology",
//     dean: "Dr. Layla Nour",
//     departments: 4,
//     students: 1100,
//     established: "2010",
//     status: "Active",
//   },
// ];

// export const facultiesColumns = [
//   { key: "id", label: "ID", width: "w-28" },
//   { key: "name", label: "Faculty Name", width: "flex-1", bold: true },
//   { key: "dean", label: "Dean", width: "w-44" },
//   { key: "departments", label: "Departments", width: "w-32", align: "center" },
//   { key: "students", label: "Students", width: "w-28", align: "center" },
//   { key: "established", label: "Est.", width: "w-20", align: "center" },
//   { key: "status", label: "Status", width: "w-24", type: "badge" },
// ];

// // ─── Departments ──────────────────────────────────────────────────────────────

// export const departmentsData = [
//   {
//     id: "DEP-001",
//     name: "Computer Science",
//     faculty: "Engineering",
//     head: "Dr. Khalid Al-Rashid",
//     courses: 24,
//     students: 420,
//     status: "Active",
//   },
//   {
//     id: "DEP-002",
//     name: "Electrical Engineering",
//     faculty: "Engineering",
//     head: "Dr. Youssef Benali",
//     courses: 20,
//     students: 310,
//     status: "Active",
//   },
//   {
//     id: "DEP-003",
//     name: "Civil Engineering",
//     faculty: "Engineering",
//     head: "Prof. Reem Nasser",
//     courses: 18,
//     students: 285,
//     status: "Active",
//   },
//   {
//     id: "DEP-004",
//     name: "Mathematics",
//     faculty: "Science",
//     head: "Dr. Hana Ibrahim",
//     courses: 15,
//     students: 198,
//     status: "Active",
//   },
//   {
//     id: "DEP-005",
//     name: "Physics",
//     faculty: "Science",
//     head: "Prof. Samir Rahman",
//     courses: 16,
//     students: 212,
//     status: "Active",
//   },
//   {
//     id: "DEP-006",
//     name: "Marketing",
//     faculty: "Business Administration",
//     head: "Dr. Amira Hassan",
//     courses: 14,
//     students: 390,
//     status: "Active",
//   },
//   {
//     id: "DEP-007",
//     name: "Finance",
//     faculty: "Business Administration",
//     head: "Prof. Tariq Mansour",
//     courses: 16,
//     students: 365,
//     status: "Active",
//   },
//   {
//     id: "DEP-008",
//     name: "Anatomy",
//     faculty: "Medicine",
//     head: "Dr. Nour El-Din",
//     courses: 10,
//     students: 180,
//     status: "Active",
//   },
//   {
//     id: "DEP-009",
//     name: "Arabic Literature",
//     faculty: "Arts & Humanities",
//     head: "Prof. Laila Zamani",
//     courses: 12,
//     students: 145,
//     status: "Inactive",
//   },
//   {
//     id: "DEP-010",
//     name: "Software Engineering",
//     faculty: "Information Technology",
//     head: "Dr. Basel Kareem",
//     courses: 22,
//     students: 530,
//     status: "Active",
//   },
// ];

// export const departmentsColumns = [
//   { key: "id", label: "ID", width: "w-28" },
//   { key: "name", label: "Department", width: "flex-1", bold: true },
//   { key: "faculty", label: "Faculty", width: "w-44" },
//   { key: "head", label: "Head", width: "w-40" },
//   { key: "courses", label: "Courses", width: "w-24", align: "center" },
//   { key: "students", label: "Students", width: "w-24", align: "center" },
//   { key: "status", label: "Status", width: "w-24", type: "badge" },
// ];

// // ─── Courses ──────────────────────────────────────────────────────────────────

// export const coursesData = [
//   {
//     id: "CRS-001",
//     name: "Introduction to Programming",
//     code: "CS101",
//     department: "Computer Science",
//     instructor: "Dr. Khalid Al-Rashid",
//     credits: 3,
//     students: 120,
//     semester: "Fall 2024",
//     status: "Active",
//   },
//   {
//     id: "CRS-002",
//     name: "Data Structures & Algorithms",
//     code: "CS201",
//     department: "Computer Science",
//     instructor: "Dr. Layla Nour",
//     credits: 4,
//     students: 98,
//     semester: "Spring 2025",
//     status: "Active",
//   },
//   {
//     id: "CRS-003",
//     name: "Database Management Systems",
//     code: "CS301",
//     department: "Computer Science",
//     instructor: "Prof. Basel Kareem",
//     credits: 3,
//     students: 85,
//     semester: "Fall 2024",
//     status: "Active",
//   },
//   {
//     id: "CRS-004",
//     name: "Circuit Theory",
//     code: "EE101",
//     department: "Electrical Engineering",
//     instructor: "Dr. Youssef Benali",
//     credits: 4,
//     students: 72,
//     semester: "Fall 2024",
//     status: "Active",
//   },
//   {
//     id: "CRS-005",
//     name: "Calculus I",
//     code: "MATH101",
//     department: "Mathematics",
//     instructor: "Dr. Hana Ibrahim",
//     credits: 3,
//     students: 155,
//     semester: "Spring 2025",
//     status: "Active",
//   },
//   {
//     id: "CRS-006",
//     name: "Marketing Fundamentals",
//     code: "MKT101",
//     department: "Marketing",
//     instructor: "Dr. Amira Hassan",
//     credits: 3,
//     students: 140,
//     semester: "Spring 2025",
//     status: "Active",
//   },
//   {
//     id: "CRS-007",
//     name: "Financial Accounting",
//     code: "FIN101",
//     department: "Finance",
//     instructor: "Prof. Tariq Mansour",
//     credits: 3,
//     students: 130,
//     semester: "Fall 2024",
//     status: "Active",
//   },
//   {
//     id: "CRS-008",
//     name: "Operating Systems",
//     code: "CS401",
//     department: "Computer Science",
//     instructor: "Dr. Omar Yusuf",
//     credits: 3,
//     students: 76,
//     semester: "Fall 2024",
//     status: "Draft",
//   },
//   {
//     id: "CRS-009",
//     name: "Software Engineering",
//     code: "SE301",
//     department: "Software Engineering",
//     instructor: "Dr. Basel Kareem",
//     credits: 4,
//     students: 88,
//     semester: "Spring 2025",
//     status: "Active",
//   },
//   {
//     id: "CRS-010",
//     name: "Quantum Physics",
//     code: "PHY301",
//     department: "Physics",
//     instructor: "Prof. Samir Rahman",
//     credits: 3,
//     students: 45,
//     semester: "Fall 2024",
//     status: "Inactive",
//   },
//   {
//     id: "CRS-011",
//     name: "Web Development",
//     code: "CS501",
//     department: "Computer Science",
//     instructor: "Dr. Layla Nour",
//     credits: 3,
//     students: 110,
//     semester: "Spring 2025",
//     status: "Active",
//   },
//   {
//     id: "CRS-012",
//     name: "Structural Analysis",
//     code: "CE201",
//     department: "Civil Engineering",
//     instructor: "Prof. Reem Nasser",
//     credits: 4,
//     students: 65,
//     semester: "Fall 2024",
//     status: "Active",
//   },
// ];

// export const coursesColumns = [
//   { key: "id", label: "ID", width: "w-24" },
//   { key: "code", label: "Code", width: "w-24" },
//   { key: "name", label: "Course Name", width: "flex-1", bold: true },
//   { key: "department", label: "Department", width: "w-44" },
//   { key: "instructor", label: "Instructor", width: "w-40" },
//   { key: "credits", label: "Credits", width: "w-20", align: "center" },
//   { key: "students", label: "Students", width: "w-24", align: "center" },
//   { key: "semester", label: "Semester", width: "w-32" },
//   { key: "status", label: "Status", width: "w-24", type: "badge" },
// ];

// // ─── Chapters ─────────────────────────────────────────────────────────────────

// export const chaptersData = [
//   {
//     id: "CHP-001",
//     course_id: "CRS-001",
//     title: "Variables and Data Types",
//   },
//   {
//     id: "CHP-002",
//     course_id: "CRS-001",
//     title: "Control Flow",
//   },
//   {
//     id: "CHP-003",
//     course_id: "CRS-002",
//     title: "Arrays and Linked Lists",
//   },
//   {
//     id: "CHP-004",
//     course_id: "CRS-002",
//     title: "Stacks and Queues",
//   },
//   {
//     id: "CHP-005",
//     course_id: "CRS-003",
//     title: "Entity Relationship Modeling",
//   },
//   {
//     id: "CHP-006",
//     course_id: "CRS-008",
//     title: "Processes and Threads",
//   },
//   {
//     id: "CHP-007",
//     course_id: "CRS-011",
//     title: "React Components",
//   },
//   {
//     id: "CHP-008",
//     course_id: "CRS-012",
//     title: "Beam Analysis",
//   },
// ];

// // ─── Materials ────────────────────────────────────────────────────────────────

// export const materialsData = [
//   {
//     id: "MAT-001",
//     title: "Introduction to Python – Lecture Slides",
//     course_id: "CRS-001",
//     chapter_id: "CHP-001",
//     material_type: "slides",
//     uploadedBy: "Dr. Khalid Al-Rashid",
//     file_name: "python-intro-slides.pptx",
//     file_url: "/mock/materials/python-intro-slides.pptx",
//     file_size_mb: 4.2,
//     slide_count: 32,
//     page_count: null,
//     learning_objectives: ["Syntax Basics", "Variables", "Data Types"],
//     description: "Lecture slides for the introduction to Python programming.",
//     is_downloadable: true,
//     is_enabled: true,
//     uploadDate: "2024-09-05",
//     status: "Published",
//   },
//   {
//     id: "MAT-002",
//     title: "Data Structures – Lab Manual",
//     course_id: "CRS-002",
//     chapter_id: "CHP-003",
//     material_type: "pdf",
//     uploadedBy: "Dr. Layla Nour",
//     file_name: "data-structures-lab-manual.pdf",
//     file_url: "/mock/materials/data-structures-lab-manual.pdf",
//     file_size_mb: 8.7,
//     slide_count: null,
//     page_count: 48,
//     learning_objectives: ["Arrays", "Linked Lists", "Complexity Basics"],
//     description: "Lab manual for week one practical exercises.",
//     is_downloadable: true,
//     is_enabled: true,
//     uploadDate: "2024-09-12",
//     status: "Published",
//   },
//   {
//     id: "MAT-003",
//     title: "Database Design Patterns",
//     course_id: "CRS-003",
//     chapter_id: "CHP-005",
//     material_type: "pdf",
//     uploadedBy: "Prof. Basel Kareem",
//     file_name: "database-design-patterns.pdf",
//     file_url: "/mock/materials/database-design-patterns.pdf",
//     file_size_mb: 3.1,
//     slide_count: null,
//     page_count: 22,
//     learning_objectives: ["ER Modeling", "Normalization"],
//     description: "Reference material on common database design patterns.",
//     is_downloadable: true,
//     is_enabled: true,
//     uploadDate: "2024-10-01",
//     status: "Published",
//   },
//   {
//     id: "MAT-004",
//     title: "Circuit Theory – Problem Sets",
//     course_id: "CRS-004",
//     chapter_id: null,
//     material_type: "pdf",
//     uploadedBy: "Dr. Youssef Benali",
//     file_name: "circuit-theory-problem-sets.pdf",
//     file_url: "/mock/materials/circuit-theory-problem-sets.pdf",
//     file_size_mb: 1.9,
//     slide_count: null,
//     page_count: 17,
//     learning_objectives: ["Circuit Laws", "Practice Problems"],
//     description: "Problem sets covering the first circuit theory module.",
//     is_downloadable: true,
//     is_enabled: true,
//     uploadDate: "2024-09-20",
//     status: "Published",
//   },
//   {
//     id: "MAT-005",
//     title: "Calculus – Formula Sheet",
//     course_id: "CRS-005",
//     chapter_id: null,
//     material_type: "slides",
//     uploadedBy: "Dr. Hana Ibrahim",
//     file_name: "calculus-formula-sheet.pptx",
//     file_url: "/mock/materials/calculus-formula-sheet.pptx",
//     file_size_mb: 0.8,
//     slide_count: 14,
//     page_count: null,
//     learning_objectives: ["Key Formulas", "Quick Revision"],
//     description: "Compact revision slides for important formulas.",
//     is_downloadable: true,
//     is_enabled: true,
//     uploadDate: "2024-09-08",
//     status: "Published",
//   },
//   {
//     id: "MAT-006",
//     title: "Marketing Strategy – Case Studies",
//     course_id: "CRS-006",
//     chapter_id: null,
//     material_type: "video",
//     uploadedBy: "Dr. Amira Hassan",
//     file_name: "marketing-strategy-case-studies.mp4",
//     file_url: "/mock/materials/marketing-strategy-case-studies.mp4",
//     file_size_mb: 220,
//     slide_count: null,
//     page_count: null,
//     learning_objectives: ["Case Analysis", "Market Positioning"],
//     description:
//       "Recorded video lesson covering selected marketing case studies.",
//     is_downloadable: false,
//     is_enabled: true,
//     uploadDate: "2024-10-15",
//     status: "Draft",
//   },
//   {
//     id: "MAT-007",
//     title: "Financial Accounting Workbook",
//     course_id: "CRS-007",
//     chapter_id: null,
//     material_type: "pdf",
//     uploadedBy: "Prof. Tariq Mansour",
//     file_name: "financial-accounting-workbook.pdf",
//     file_url: "/mock/materials/financial-accounting-workbook.pdf",
//     file_size_mb: 5.5,
//     slide_count: null,
//     page_count: 36,
//     learning_objectives: ["Journal Entries", "Ledger Practice"],
//     description: "Workbook for accounting practice exercises.",
//     is_downloadable: true,
//     is_enabled: true,
//     uploadDate: "2024-09-30",
//     status: "Published",
//   },
//   {
//     id: "MAT-008",
//     title: "OS Concepts – Chapter 1-5",
//     course_id: "CRS-008",
//     chapter_id: "CHP-006",
//     material_type: "pdf",
//     uploadedBy: "Dr. Omar Yusuf",
//     file_name: "os-concepts-chapter-1-5.pdf",
//     file_url: "/mock/materials/os-concepts-chapter-1-5.pdf",
//     file_size_mb: 12.3,
//     slide_count: null,
//     page_count: 95,
//     learning_objectives: ["Processes", "Threads", "Scheduling"],
//     description: "Main reading material for the first five chapters.",
//     is_downloadable: true,
//     is_enabled: false,
//     uploadDate: "2024-11-02",
//     status: "Draft",
//   },
//   {
//     id: "MAT-009",
//     title: "Web Dev – React Tutorial Video",
//     course_id: "CRS-011",
//     chapter_id: "CHP-007",
//     material_type: "video",
//     uploadedBy: "Dr. Layla Nour",
//     file_name: "react-tutorial-video.mp4",
//     file_url: "/mock/materials/react-tutorial-video.mp4",
//     file_size_mb: 450,
//     slide_count: null,
//     page_count: null,
//     learning_objectives: ["Components", "Props", "State"],
//     description: "Recorded tutorial introducing React fundamentals.",
//     is_downloadable: false,
//     is_enabled: true,
//     uploadDate: "2025-01-18",
//     status: "Published",
//   },
//   {
//     id: "MAT-010",
//     title: "Structural Analysis Diagrams",
//     course_id: "CRS-012",
//     chapter_id: "CHP-008",
//     material_type: "slides",
//     uploadedBy: "Prof. Reem Nasser",
//     file_name: "structural-analysis-diagrams.pptx",
//     file_url: "/mock/materials/structural-analysis-diagrams.pptx",
//     file_size_mb: 6.8,
//     slide_count: 28,
//     page_count: null,
//     learning_objectives: ["Load Paths", "Beam Behavior"],
//     description: "Slides with worked structural analysis diagrams.",
//     is_downloadable: true,
//     is_enabled: true,
//     uploadDate: "2024-09-25",
//     status: "Published",
//   },
// ];

// export const materialsColumns = [
//   { key: "id", label: "ID", width: "w-24" },
//   { key: "title", label: "Title", width: "flex-1", linkRow: true },
//   {
//     key: "course_code",
//     label: "Course",
//     width: "w-24",
//     align: "center",
//   },
//   { key: "material_type", label: "Type", width: "w-24", type: "typeBadge" },
//   { key: "uploadedBy", label: "Uploaded By", width: "w-44" },
//   { key: "file_size_display", label: "Size", width: "w-24", align: "center" },
//   { key: "uploadDate", label: "Date", width: "w-28" },
//   { key: "status", label: "Status", width: "w-24", type: "badge" },
// ];

// // Optional helper list for table-ready display if you want cleaner table usage
// export const materialsTableData = materialsData.map((item) => {
//   const course = coursesData.find((c) => c.id === item.course_id);

//   return {
//     ...item,
//     course_code: course?.code || "—",
//     file_size_display: item.file_size_mb ? `${item.file_size_mb} MB` : "—",
//   };
// });
// Mock Academic Data
// Simplified to match your current API shapes

// ─────────────────────────────────────────────────────────────
// Faculties
// ─────────────────────────────────────────────────────────────

export const facultiesData = [
  {
    id: 2,
    code: "FCS",
    name: "Faculty of Computer Science",
    departments_count: 4,
    is_enabled: true,
  },
  {
    id: 3,
    code: "FENG",
    name: "Faculty of Engineering",
    departments_count: 3,
    is_enabled: true,
  },
  {
    id: 4,
    code: "FBUS",
    name: "Faculty of Business",
    departments_count: 2,
    is_enabled: true,
  },
  {
    id: 5,
    code: "FART",
    name: "Faculty of Arts",
    departments_count: 1,
    is_enabled: false,
  },
  {
    id: 6,
    code: "SSF",
    name: "fs o",
    departments_count: 0,
    is_enabled: true,
  },
];

export const facultiesColumns = [
  { key: "id", label: "ID", width: "w-20" },
  { key: "code", label: "Code", width: "w-24", bold: true },
  { key: "name", label: "Faculty Name", width: "flex-1", bold: true },
  { key: "departments_count", label: "Departments", width: "w-28" },
  { key: "is_enabled_label", label: "Status", width: "w-24", type: "badge" },
];

export const facultiesTableData = facultiesData.map((item) => ({
  ...item,
  is_enabled_label: item.is_enabled ? "Active" : "Inactive",
}));

export const facultyDetailsData = [
  {
    id: 2,
    code: "FCS",
    name: "Faculty of Computer Science",
    is_enabled: true,
    created_at: "2026-03-07T02:36:48.532124+03:00",
    updated_at: "2026-03-07T02:36:48.532124+03:00",
    departments_count: 4,
    departments_preview: [
      { id: 5, code: "CA", name: "Computer Applications", is_enabled: true },
      { id: 6, code: "CN", name: "Computer Networks", is_enabled: true },
      { id: 7, code: "SE", name: "Software Engineering", is_enabled: true },
      { id: 8, code: "IS", name: "Information Systems", is_enabled: true },
    ],
  },
  {
    id: 3,
    code: "FENG",
    name: "Faculty of Engineering",
    is_enabled: true,
    created_at: "2026-03-07T02:36:48.532124+03:00",
    updated_at: "2026-03-07T02:36:48.532124+03:00",
    departments_count: 3,
    departments_preview: [
      { id: 9, code: "CE", name: "Civil Engineering", is_enabled: true },
      { id: 10, code: "EE", name: "Electrical Engineering", is_enabled: true },
      { id: 11, code: "ME", name: "Mechanical Engineering", is_enabled: true },
    ],
  },
  {
    id: 6,
    code: "SSF",
    name: "fs o",
    is_enabled: true,
    created_at: "2026-03-07T02:36:48.532124+03:00",
    updated_at: "2026-03-07T02:36:48.532124+03:00",
    departments_count: 0,
    departments_preview: [],
  },
];

// ─────────────────────────────────────────────────────────────
// Departments
// ─────────────────────────────────────────────────────────────

export const departmentsData = [
  {
    id: 5,
    code: "CA",
    name: "Computer Applications",
    faculty_id: 2,
    faculty_name: "Faculty of Computer Science",
    courses_count: 2,
    is_enabled: true,
  },
  {
    id: 6,
    code: "CN",
    name: "Computer Networks",
    faculty_id: 2,
    faculty_name: "Faculty of Computer Science",
    courses_count: 2,
    is_enabled: true,
  },
  {
    id: 7,
    code: "SE",
    name: "Software Engineering",
    faculty_id: 2,
    faculty_name: "Faculty of Computer Science",
    courses_count: 3,
    is_enabled: true,
  },
  {
    id: 8,
    code: "IS",
    name: "Information Systems",
    faculty_id: 2,
    faculty_name: "Faculty of Computer Science",
    courses_count: 3,
    is_enabled: true,
  },
  {
    id: 9,
    code: "CE",
    name: "Civil Engineering",
    faculty_id: 3,
    faculty_name: "Faculty of Engineering",
    courses_count: 1,
    is_enabled: true,
  },
];

export const departmentsColumns = [
  { key: "id", label: "ID", width: "w-20" },
  { key: "name", label: "Department", width: "flex-1", bold: true },
  { key: "faculty_name", label: "Faculty", width: "w-56" },
  { key: "courses_count", label: "Courses", width: "w-24" },
  { key: "is_enabled_label", label: "Status", width: "w-24", type: "badge" },
];

export const departmentsTableData = departmentsData.map((item) => ({
  ...item,
  is_enabled_label: item.is_enabled ? "Active" : "Inactive",
}));

export const departmentDetailsData = [
  {
    id: 8,
    code: "IS",
    name: "Information Systems",
    is_enabled: true,
    created_at: "2026-03-07T02:36:48.532124+03:00",
    updated_at: "2026-03-07T02:36:48.532124+03:00",
    faculty: {
      id: 2,
      code: "FCS",
      name: "Faculty of Computer Science",
    },
    courses_count: 3,
    courses_preview: [
      {
        id: 10,
        code: "AR101",
        title: "Arabic Language I",
        semester_label: "Semester 1 (2025/2026)",
      },
      {
        id: 11,
        code: "EN101",
        title: "English Language I",
        semester_label: "Semester 1 (2025/2026)",
      },
      {
        id: 14,
        code: "DB102",
        title: "Database Systems",
        semester_label: "Semester 2 (2025/2026)",
      },
    ],
  },
  {
    id: 7,
    code: "SE",
    name: "Software Engineering",
    is_enabled: true,
    created_at: "2026-03-07T02:36:48.532124+03:00",
    updated_at: "2026-03-07T02:36:48.532124+03:00",
    faculty: {
      id: 2,
      code: "FCS",
      name: "Faculty of Computer Science",
    },
    courses_count: 3,
    courses_preview: [
      {
        id: 16,
        code: "OS102",
        title: "Operating Systems Basics",
        semester_label: "Semester 2 (2025/2026)",
      },
      {
        id: 17,
        code: "SE201",
        title: "Software Testing",
        semester_label: "Semester 2 (2025/2026)",
      },
      {
        id: 18,
        code: "SE301",
        title: "Software Architecture",
        semester_label: "Semester 3 (2025/2026)",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Academic Years / Semesters
// ─────────────────────────────────────────────────────────────

export const academicYearsData = [
  { id: 1, name: "2024/2025" },
  { id: 2, name: "2025/2026" },
];

export const semestersData = [
  {
    id: 1,
    name: "Semester 1",
    number: 1,
    academic_year_id: 2,
    academic_year_name: "2025/2026",
  },
  {
    id: 4,
    name: "Semester 2",
    number: 2,
    academic_year_id: 2,
    academic_year_name: "2025/2026",
  },
  {
    id: 5,
    name: "Semester 3",
    number: 3,
    academic_year_id: 2,
    academic_year_name: "2025/2026",
  },
];

// ─────────────────────────────────────────────────────────────
// Courses
// ─────────────────────────────────────────────────────────────

export const coursesData = [
  {
    id: 10,
    code: "AR101",
    title: "Arabic Language I",
    department_id: 8,
    department_name: "Information Systems",
    chapters_count: 2,
    is_enabled: true,
    description: "Foundations of Arabic language learning.",
    faculty_id: 2,
    faculty_name: "Faculty of Computer Science",
    semester_id: 1,
    semester_name: "Semester 1",
    semester_number: 1,
    academic_year_id: 2,
    academic_year_name: "2025/2026",
  },
  {
    id: 11,
    code: "EN101",
    title: "English Language I",
    department_id: 8,
    department_name: "Information Systems",
    chapters_count: 2,
    is_enabled: true,
    description: "English communication and grammar basics.",
    faculty_id: 2,
    faculty_name: "Faculty of Computer Science",
    semester_id: 1,
    semester_name: "Semester 1",
    semester_number: 1,
    academic_year_id: 2,
    academic_year_name: "2025/2026",
  },
  {
    id: 14,
    code: "DB102",
    title: "Database Systems",
    department_id: 8,
    department_name: "Information Systems",
    chapters_count: 3,
    is_enabled: true,
    description: "Relational databases and SQL fundamentals.",
    faculty_id: 2,
    faculty_name: "Faculty of Computer Science",
    semester_id: 4,
    semester_name: "Semester 2",
    semester_number: 2,
    academic_year_id: 2,
    academic_year_name: "2025/2026",
  },
  {
    id: 16,
    code: "OS102",
    title: "Operating Systems Basics",
    department_id: 7,
    department_name: "Software Engineering",
    chapters_count: 3,
    is_enabled: true,
    description: "Processes, memory, scheduling, files, and OS fundamentals.",
    faculty_id: 2,
    faculty_name: "Faculty of Computer Science",
    semester_id: 4,
    semester_name: "Semester 2",
    semester_number: 2,
    academic_year_id: 2,
    academic_year_name: "2025/2026",
  },
];

export const coursesColumns = [
  { key: "id", label: "ID", width: "w-20" },
  { key: "code", label: "Code", width: "w-24", bold: true },
  { key: "title", label: "Course Title", width: "flex-1", bold: true },
  { key: "department_name", label: "Department", width: "w-56" },
  { key: "chapters_count", label: "Chapters", width: "w-24" },
  { key: "is_enabled_label", label: "Status", width: "w-24", type: "badge" },
];

export const coursesTableData = coursesData.map((item) => ({
  ...item,
  is_enabled_label: item.is_enabled ? "Active" : "Inactive",
}));

export const courseDetailsData = [
  {
    id: 16,
    code: "OS102",
    title: "Operating Systems Basics",
    description: "Processes, memory, scheduling, files, and OS fundamentals.",
    is_enabled: true,
    created_at: "2026-03-07T02:36:48.532124+03:00",
    updated_at: "2026-03-07T02:36:48.532124+03:00",
    chapters_count: 3,
    academic_year: {
      id: 2,
      name: "2025/2026",
    },
    semester: {
      id: 4,
      name: "Semester 2",
      number: 2,
    },
    faculty: {
      id: 2,
      name: "Faculty of Computer Science",
    },
    department: {
      id: 7,
      name: "Software Engineering",
    },
    chapters: [
      { id: 46, number: 1, title: "Introduction", is_enabled: true },
      { id: 47, number: 2, title: "Core Concepts", is_enabled: true },
      { id: 48, number: 3, title: "Practice & Exercises", is_enabled: true },
    ],
  },
  {
    id: 14,
    code: "DB102",
    title: "Database Systems",
    description: "Relational databases, normalization, and SQL queries.",
    is_enabled: true,
    created_at: "2026-03-07T02:36:48.532124+03:00",
    updated_at: "2026-03-07T02:36:48.532124+03:00",
    chapters_count: 3,
    academic_year: {
      id: 2,
      name: "2025/2026",
    },
    semester: {
      id: 4,
      name: "Semester 2",
      number: 2,
    },
    faculty: {
      id: 2,
      name: "Faculty of Computer Science",
    },
    department: {
      id: 8,
      name: "Information Systems",
    },
    chapters: [
      { id: 51, number: 1, title: "Database Basics", is_enabled: true },
      { id: 52, number: 2, title: "SQL Queries", is_enabled: true },
      { id: 53, number: 3, title: "Normalization", is_enabled: true },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Chapters (for materials dropdown etc.)
// ─────────────────────────────────────────────────────────────

export const chaptersData = [
  { id: 46, course_id: 16, title: "Introduction" },
  { id: 47, course_id: 16, title: "Core Concepts" },
  { id: 48, course_id: 16, title: "Practice & Exercises" },
  { id: 51, course_id: 14, title: "Database Basics" },
  { id: 52, course_id: 14, title: "SQL Queries" },
  { id: 53, course_id: 14, title: "Normalization" },
];

// ─────────────────────────────────────────────────────────────
// Materials
// ─────────────────────────────────────────────────────────────

export const materialsData = [
  {
    id: "MAT-001",
    title: "Introduction to Python – Lecture Slides",
    course_id: 10,
    chapter_id: 46,
    material_type: "slides",
    uploadedBy: "Dr. Khalid Al-Rashid",
    file_name: "python-intro-slides.pptx",
    file_url: "/mock/materials/python-intro-slides.pptx",
    file_size_mb: 4.2,
    slide_count: 32,
    page_count: null,
    learning_objectives: ["Syntax Basics", "Variables", "Data Types"],
    description: "Lecture slides for the introduction to Python programming.",
    is_downloadable: true,
    is_enabled: true,
    uploadDate: "2024-09-05",
    status: "Published",
  },
];

export const materialsColumns = [
  { key: "id", label: "ID", width: "w-24" },
  { key: "title", label: "Title", width: "flex-1", linkRow: true },
  { key: "course_code", label: "Course", width: "w-24", align: "center" },
  { key: "material_type", label: "Type", width: "w-24", type: "typeBadge" },
  { key: "uploadedBy", label: "Uploaded By", width: "w-44" },
  { key: "file_size_display", label: "Size", width: "w-24", align: "center" },
  { key: "uploadDate", label: "Date", width: "w-28" },
  { key: "status", label: "Status", width: "w-24", type: "badge" },
];

export const materialsTableData = materialsData.map((item) => {
  const course = coursesData.find((c) => c.id === item.course_id);

  return {
    ...item,
    course_code: course?.code || "—",
    file_size_display: item.file_size_mb ? `${item.file_size_mb} MB` : "—",
  };
});
