
"use client";
import React, { useState } from "react";

const SignUpForm = () => {
  // Sample faculty options (only IT in this case)
  const faculties = [
    { id: 1, name: "Information Technology" }
  ];

  // Department options mapped by faculty ID
  const departmentsByFaculty = {
    1: [
      { id: 101, name: "Computer Applications" },
      { id: 102, name: "Networks" },
      { id: 103, name: "Multimedia" },
    ]
  };

  const [selectedFaculty, setSelectedFaculty] = useState(1); // default IT
  const [departments, setDepartments] = useState(departmentsByFaculty[1]);

  const handleFacultyChange = (e) => {
    const facultyId = parseInt(e.target.value);
    setSelectedFaculty(facultyId);
    setDepartments(departmentsByFaculty[facultyId] || []);
  };

  return (
    <div className="transition-opacity duration-150 ease-linear">
      {/* Heading */}
      <div className="text-center mb-8">
        <h3 className="text-3xl md:text-4xl font-bold text-blackColor dark:text-white mb-2">
          Create Account
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <a
            href="#"
            className="text-primaryColor font-semibold hover:underline transition"
          >
            Log in
          </a>
        </p>
      </div>

      <form className="space-y-5" data-aos="fade-up">
        {/* Row: Student ID + Full Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Student ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., CA2023001"
              className="w-full px-5 py-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor/50 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-5 py-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor/50 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Row: University Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            University Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="student@university.edu"
            className="w-full px-5 py-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor/50 text-gray-900 dark:text-white"
          />
        </div>

        {/* Row: Faculty + Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Faculty <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedFaculty}
              onChange={handleFacultyChange}
              className="w-full px-5 py-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor/50 text-gray-900 dark:text-white appearance-none"
            >
              {faculties.map(f => (
                <option key={f.id} value={f.id} className="dark:bg-gray-800">
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-5 py-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor/50 text-gray-900 dark:text-white appearance-none"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id} className="dark:bg-gray-800">
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row: Class & Room Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Class & Room Number
          </label>
          <input
            type="text"
            placeholder="e.g., CA222 7"
            className="w-full px-5 py-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor/50 text-gray-900 dark:text-white"
          />
        </div>

        {/* Row: Password + Confirm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-5 py-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor/50 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Re-enter Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-5 py-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor/50 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Terms & Privacy */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            className="w-4 h-4 mt-1 mr-3 rounded border-gray-300"
          />
          <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
            I accept the{" "}
            <a href="#" className="text-primaryColor hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-primaryColor hover:underline">Privacy Policy</a>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-primaryColor hover:bg-primaryColor/90 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-[1.02] shadow-md"
        >
          Sign Up
        </button>

        {/* Social Signup Option (optional) */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">or sign up with</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <i className="icofont-facebook text-blue-600"></i>
            <span className="text-sm">Facebook</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <i className="icofont-google-plus text-red-500"></i>
            <span className="text-sm">Google</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;