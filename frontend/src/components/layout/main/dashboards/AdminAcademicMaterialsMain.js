import React from "react";
import {
  FileText,
  Video,
  Presentation,
  FileCode,
  Link as LinkIcon,
  Plus,
} from "lucide-react";

const materials = [
  {
    id: 1,
    title: "Python Basics Introduction",
    course: "CS101",
    chapter: "Chapter 1",
    type: "PDF",
    icon: FileText,
    color: "text-rose-500",
  },
  {
    id: 2,
    title: "Advanced OOP Concepts",
    course: "CS201",
    chapter: "Chapter 5",
    type: "Video",
    icon: Video,
    color: "text-blue-500",
  },
  {
    id: 3,
    title: "Data Structures Overview",
    course: "CS102",
    chapter: "-",
    type: "Slides",
    icon: Presentation,
    color: "text-amber-500",
  },
  {
    id: 4,
    title: "Introduction to Web Development",
    course: "CS103",
    chapter: "Chapter 2",
    type: "Doc",
    icon: FileCode,
    color: "text-emerald-500",
  },
  {
    id: 5,
    title: "Database Design Principles",
    course: "CS202",
    chapter: "Chapter 3",
    type: "Link",
    icon: LinkIcon,
    color: "text-purple-500",
  },
];

export default function MaterialsTable() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Educational Materials
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage all course materials in one place
          </p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-all font-semibold shadow-lg shadow-slate-200">
          <Plus className="w-5 h-5" />
          Add New Material
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50">
            <tr className="border-b border-slate-100">
              <th className="px-6 py-5 w-12">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 accent-purple-600"
                />
              </th>
              <th className="px-4 py-5 font-semibold text-slate-600 text-sm uppercase tracking-wider">
                Material Title
              </th>
              <th className="px-4 py-5 font-semibold text-slate-600 text-sm uppercase tracking-wider text-center">
                Course
              </th>
              <th className="px-4 py-5 font-semibold text-slate-600 text-sm uppercase tracking-wider">
                Chapter
              </th>
              <th className="px-4 py-5 font-semibold text-slate-600 text-sm uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {materials.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 accent-purple-600"
                  />
                </td>
                <td className="px-4 py-4 text-purple-600 font-medium cursor-pointer group-hover:underline">
                  {item.title}
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full border border-purple-100 uppercase tracking-tight">
                    {item.course}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-500 text-sm">
                  {item.chapter}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    {item.type}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
