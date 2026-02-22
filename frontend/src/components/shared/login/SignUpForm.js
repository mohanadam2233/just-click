
"use client";

import React, { useMemo, useState } from "react";
import { FiUser, FiMail, FiInfo } from "react-icons/fi";
import { HiOutlineIdentification } from "react-icons/hi";
import { MdOutlineMeetingRoom } from "react-icons/md";
import Link from "next/link";

import AsyncDropdown from "@/components/shared/inputs/AsyncDropdown";
import { useDropdown } from "@/hooks/dropdown/useDropdown";

const SignUpForm = () => {
  // mock faculties (20+)
  const faculties = [
    { id: 1, name: "FCS - Faculty of Computer Science", code: "FCS" },
    { id: 2, name: "FIT - Faculty of Information Technology", code: "FIT" },
    { id: 3, name: "FENG - Faculty of Engineering", code: "FENG" },
    { id: 4, name: "FBA - Faculty of Business Administration", code: "FBA" },
    { id: 5, name: "FEC - Faculty of Economics", code: "FEC" },
    { id: 6, name: "FHS - Faculty of Health Sciences", code: "FHS" },
    { id: 7, name: "FMED - Faculty of Medicine", code: "FMED" },
    { id: 8, name: "FNUR - Faculty of Nursing", code: "FNUR" },
    { id: 9, name: "FPH - Faculty of Public Health", code: "FPH" },
    { id: 10, name: "FDEN - Faculty of Dentistry", code: "FDEN" },
    { id: 11, name: "FPHA - Faculty of Pharmacy", code: "FPHA" },
    { id: 12, name: "FAR - Faculty of Arts", code: "FAR" },
    { id: 13, name: "FEDU - Faculty of Education", code: "FEDU" },
    { id: 14, name: "FLAW - Faculty of Law", code: "FLAW" },
    { id: 15, name: "FSS - Faculty of Social Sciences", code: "FSS" },
    { id: 16, name: "FSC - Faculty of Science", code: "FSC" },
    { id: 17, name: "FAGR - Faculty of Agriculture", code: "FAGR" },
    { id: 18, name: "FENV - Faculty of Environmental Studies", code: "FENV" },
    { id: 19, name: "FIS - Faculty of Islamic Studies", code: "FIS" },
    { id: 20, name: "FMC - Faculty of Media & Communication", code: "FMC" },
    { id: 21, name: "FARCH - Faculty of Architecture", code: "FARCH" },
  ];

  const departmentsByFaculty = {
    1: [
      { id: 101, name: "Computer Applications", desc: "Apps & Systems" },
      { id: 102, name: "Networks", desc: "Routing & Security" },
      { id: 103, name: "Multimedia", desc: "Design & Video" },
      { id: 104, name: "AI & Machine Learning", desc: "Models & Data" },
      { id: 105, name: "Software Engineering", desc: "Build & Maintain" },
    ],
    2: [
      { id: 201, name: "Information Systems", desc: "Business + IT" },
      { id: 202, name: "Cybersecurity", desc: "Defense & Risk" },
      { id: 203, name: "Cloud Computing", desc: "AWS/Azure" },
      { id: 204, name: "Data Engineering", desc: "Pipelines" },
    ],
    3: [
      { id: 301, name: "Civil Engineering", desc: "Structures" },
      { id: 302, name: "Mechanical Engineering", desc: "Machines" },
      { id: 303, name: "Electrical Engineering", desc: "Power" },
      { id: 304, name: "Mechatronics", desc: "Robotics" },
    ],
    4: [
      { id: 401, name: "Accounting", desc: "Finance & Reports" },
      { id: 402, name: "Management", desc: "Operations" },
      { id: 403, name: "Marketing", desc: "Growth" },
      { id: 404, name: "HR Management", desc: "People" },
    ],
    5: [
      { id: 501, name: "Macroeconomics", desc: "National economy" },
      { id: 502, name: "Microeconomics", desc: "Markets" },
      { id: 503, name: "Econometrics", desc: "Stats + Econ" },
    ],
  };

  const [selectedFaculty, setSelectedFaculty] = useState(1);

  const departments = useMemo(() => {
    return departmentsByFaculty[selectedFaculty] || [];
  }, [selectedFaculty]);

  const [form, setForm] = useState({
    student_id: "",
    full_name: "",
    student_email: "",
    department_id: String((departmentsByFaculty[1] || [])[0]?.id || ""),
    class_room: "",
    accept_terms: false,
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Dropdown hooks (mock mode) + SEARCH WORKS now
const facultyDD = useDropdown({
  cacheKey: "faculties",        // ✅ unique
  enabled: true,
  limit: 10,
  mockOptions: faculties.map((f) => ({
    label: f.name,
    value: f.id,
    meta: { code: f.code },
  })),
});


const deptDD = useDropdown({
  cacheKey: `departments-${selectedFaculty}`,  // ✅ unique & changes when faculty changes
  enabled: true,
  limit: 10,
  mockOptions: departments.map((d) => ({
    label: d.name,
    value: d.id,
    meta: { description: d.desc },
  })),
});

  const handleFacultyPick = (val) => {
    const facultyId = Number(val);
    setSelectedFaculty(facultyId);

    const firstDept = (departmentsByFaculty[facultyId] || [])[0];
    setForm((p) => ({
      ...p,
      department_id: firstDept ? String(firstDept.id) : "",
    }));

    // clear department search text
    deptDD.setSearch("");
  };

  const onSubmit = (e) => {
    e.preventDefault();

    console.log("Signup payload:", {
      ...form,
      faculty_id: selectedFaculty,
      department_id: Number(form.department_id),
    });
  };

  // --- UI classes (Material-ish) ---
  const labelCls =
    "block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2";

  const inputWrap =
    "relative group rounded-2xl border border-gray-200 dark:border-gray-700 " +
    "bg-white/70 dark:bg-gray-900/40 " +
    "transition overflow-hidden " +
    "focus-within:border-primaryColor/40 focus-within:ring-4 focus-within:ring-primaryColor/10";

  const inputCls =
    "w-full h-12 pl-12 pr-4 text-sm bg-transparent outline-none " +
    "text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500";

  const iconCls =
    "absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-gray-400 " +
    "transition group-focus-within:text-primaryColor";

  const selectCls =
    "w-full h-12 px-4 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 " +
    "bg-white/70 dark:bg-gray-900/40 text-gray-900 dark:text-white " +
    "focus:outline-none focus:border-primaryColor/40 focus:ring-4 focus:ring-primaryColor/10 transition appearance-none";

  return (
    <div className="transition-all duration-150 ease-linear">
      {/* Header */}
      <div className="text-center mb-7">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Create account
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-primaryColor font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Passwordless info banner */}
      <div className="mb-7 px-4 py-3 rounded-2xl border border-primaryColor/15 bg-primaryColor/5 flex items-start gap-3">
        <FiInfo className="text-primaryColor text-lg mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-700 dark:text-gray-200">
          No password needed – we&apos;ll email you a secure link to activate your
          account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>
              Student ID <span className="text-red-400">*</span>
            </label>
            <div className={inputWrap}>
              <HiOutlineIdentification className={iconCls} />
              <input
                name="student_id"
                value={form.student_id}
                onChange={onChange}
                type="text"
                placeholder="CA2023001"
                className={inputCls}
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className={labelCls}>
              Full name <span className="text-red-400">*</span>
            </label>
            <div className={inputWrap}>
              <FiUser className={iconCls} />
              <input
                name="full_name"
                value={form.full_name}
                onChange={onChange}
                type="text"
                placeholder="John Doe"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>
            Student email <span className="text-red-400">*</span>
          </label>
          <div className={inputWrap}>
            <FiMail className={iconCls} />
            <input
              name="student_email"
              value={form.student_email}
              onChange={onChange}
              type="email"
              placeholder="student@university.edu"
              className={inputCls}
            />
          </div>
        </div>

        {/* Faculty & Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              Faculty <span className="text-red-400">*</span>
            </label>
<AsyncDropdown
  value={selectedFaculty}
  onChange={(val) => handleFacultyPick(val)}
  options={facultyDD.options}
  isLoading={facultyDD.isLoading}
  hasMore={facultyDD.hasMore}
  onLoadMore={facultyDD.loadMore}
  onSearch={facultyDD.setSearch}
  placeholder="Select faculty"
  inputClassName={selectCls}
  getSublabel={(opt) => (opt?.meta?.code ? `Code: ${opt.meta.code}` : "")}
/>
          </div>

          <div>
            <label className={labelCls}>
              Department <span className="text-red-400">*</span>
            </label>

<AsyncDropdown
  value={form.department_id}
  onChange={(val) => setForm((p) => ({ ...p, department_id: String(val) }))}
  options={deptDD.options}
  isLoading={deptDD.isLoading}
  hasMore={deptDD.hasMore}
  onLoadMore={deptDD.loadMore}
  onSearch={deptDD.setSearch}
  placeholder="Select department"
  inputClassName={selectCls}
  getSublabel={(opt) => opt?.meta?.description || ""}
/>
          </div>
        </div>

        <div>
          <label className={labelCls}>
            Class & room number{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className={inputWrap}>
            <MdOutlineMeetingRoom className={iconCls} />
            <input
              name="class_room"
              value={form.class_room}
              onChange={onChange}
              type="text"
              placeholder="CA222 7"
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex items-start gap-3 pt-1">
          <input
            type="checkbox"
            id="terms"
            name="accept_terms"
            checked={form.accept_terms}
            onChange={onChange}
            className="w-5 h-5 mt-0.5 rounded-md border-gray-300 text-primaryColor focus:ring-primaryColor/20"
          />
          <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
            I agree to the{" "}
            <a href="#" className="text-primaryColor font-semibold hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-primaryColor font-semibold hover:underline">
              Privacy Policy
            </a>
            .
          </label>
        </div>

        <button
          type="submit"
          className="w-full h-12 rounded-2xl bg-primaryColor hover:bg-primaryColor/90 text-white text-sm font-semibold
                     transition shadow-sm focus:outline-none focus:ring-4 focus:ring-primaryColor/20"
        >
          Create account
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;