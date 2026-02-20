"use client";

import React, { useMemo, useState } from "react";
import { FiUser, FiMail, FiInfo } from "react-icons/fi";
import { HiOutlineIdentification } from "react-icons/hi";
import { MdOutlineMeetingRoom } from "react-icons/md";
import Link from "next/link";

const SignUpForm = () => {
  const faculties = [{ id: 1, name: "Information Technology" }];

  const departmentsByFaculty = {
    1: [
      { id: 101, name: "Computer Applications" },
      { id: 102, name: "Networks" },
      { id: 103, name: "Multimedia" },
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
    department_id: String(departmentsByFaculty[1][0].id),
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

  const handleFacultyChange = (e) => {
    const facultyId = parseInt(e.target.value, 10);
    setSelectedFaculty(facultyId);

    const firstDept = (departmentsByFaculty[facultyId] || [])[0];
    setForm((p) => ({
      ...p,
      department_id: firstDept ? String(firstDept.id) : "",
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: connect API
    console.log("Signup payload:", {
      ...form,
      faculty_id: selectedFaculty,
      department_id: Number(form.department_id),
    });
  };

  // --- Professional "portal" UI (soft, not too rounded) ---
  const labelCls =
    "block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-2";

  const fieldWrap =
    "relative rounded-xl border border-gray-200 dark:border-gray-700 " +
    "bg-white dark:bg-gray-900/30 " +
    "transition " +
    "focus-within:border-primaryColor/40 focus-within:ring-4 focus-within:ring-primaryColor/10";

  const inputCls =
    "w-full h-11 pl-11 pr-4 text-sm bg-transparent outline-none " +
    "text-gray-900 dark:text-white " +
    "placeholder:text-gray-400 dark:placeholder:text-gray-500";

  const iconCls =
    "absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400 " +
    "transition duration-150";

  const selectCls =
    "w-full h-11 px-4 text-sm rounded-xl border border-gray-200 dark:border-gray-700 " +
    "bg-white dark:bg-gray-900/30 text-gray-900 dark:text-white " +
    "focus:outline-none focus:border-primaryColor/40 focus:ring-4 focus:ring-primaryColor/10 transition appearance-none";

  return (
    <div className="transition-all duration-150 ease-linear">
      {/* Header */}
      <div className="text-center mb-6">
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

      {/* Passwordless info */}
      <div className="mb-6 rounded-xl border border-primaryColor/15 bg-primaryColor/5 px-4 py-3 flex gap-3">
        <FiInfo className="text-primaryColor text-lg mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-700 dark:text-gray-200">
          No password needed – we&apos;ll email you a secure link to activate your
          account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Grid: clean + consistent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Student ID */}
          <div>
            <label className={labelCls}>
              Student ID <span className="text-red-400">*</span>
            </label>
            <div className={fieldWrap}>
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

          {/* Full Name */}
          <div>
            <label className={labelCls}>
              Full name <span className="text-red-400">*</span>
            </label>
            <div className={fieldWrap}>
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

          {/* Email (full width) */}
          <div className="md:col-span-2">
            <label className={labelCls}>
              Student email <span className="text-red-400">*</span>
            </label>
            <div className={fieldWrap}>
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

          {/* Faculty */}
          <div>
            <label className={labelCls}>
              Faculty <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedFaculty}
              onChange={handleFacultyChange}
              className={selectCls}
            >
              {faculties.map((f) => (
                <option key={f.id} value={f.id} className="dark:bg-gray-800">
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className={labelCls}>
              Department <span className="text-red-400">*</span>
            </label>
            <select
              name="department_id"
              value={form.department_id}
              onChange={onChange}
              className={selectCls}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id} className="dark:bg-gray-800">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class & Room (now inside grid, not alone) */}
          <div className="md:col-span-2">
            <label className={labelCls}>
              Class & room number{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className={fieldWrap}>
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
        </div>

        {/* Terms */}
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

        {/* Submit */}
        <button
          type="submit"
          className="w-full h-11 rounded-xl bg-primaryColor hover:bg-primaryColor/90 text-white text-sm font-semibold
                     transition shadow-sm focus:outline-none focus:ring-4 focus:ring-primaryColor/20"
        >
          Create account
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;