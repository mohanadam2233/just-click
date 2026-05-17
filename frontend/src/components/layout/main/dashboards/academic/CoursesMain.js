"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import Preloader from "@/components/shared/others/Preloader";
import {
  useCoursesList,
  useDepartmentsDropdown,
} from "@/features/academic/hooks";
import { useBulkDeleteCourses } from "@/features/course/hooks";
import useNotify from "@/hooks/useNotify";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const coursesColumns = [
  {
    key: "title",
    label: "Course Name",
    width: "flex-1",
    bold: true,
    filterKey: "search",
    filterType: "text",
  },
  {
    key: "code",
    label: "Code",
    width: "w-28",
  },
  // {
  //   key: "department_name",
  //   label: "Department",
  //   width: "w-44",
  //   filterKey: "department_id",
  //   filterType: "dropdown",
  // },
  // {
  //   key: "semester_name",
  //   label: "Semester",
  //   width: "w-36",
  // },
  {
    key: "offerings_count_label",
    label: "Offerings",
    width: "w-28",
  },
  {
    key: "is_enabled_label",
    label: "Status",
    width: "w-24",
    type: "badge",
    filterKey: "is_enabled",
    filterType: "dropdown",
  },
];

function extractRows(res) {
  return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
}

function extractDropdownRows(res) {
  return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
}

function mapDepartmentOptions(items = []) {
  return items
    .filter(Boolean)
    .map((item) => ({
      label:
        item?.label ||
        item?.name ||
        item?.title ||
        `Department #${item?.value ?? item?.id}`,
      value: String(item?.value ?? item?.id ?? ""),
      meta: {
        code: item?.code || item?.meta?.code || "",
      },
    }))
    .filter((item) => item.value);
}

function normalizeCourseRows(rows = []) {
  return rows.map((item) => {
    const offeringsCount = Number(item?.offerings_count || 0);

    return {
      ...item,
      id: item.id,
      title: item.title || item.name || "—",
      code: item.code || "—",
      department_name: item.department_name || "—",
      semester_name: item.semester_name || "—",
      offerings_count_label:
        offeringsCount === 1 ? "1 offering" : `${offeringsCount} offerings`,
      is_enabled_label: item.is_enabled ? "Active" : "Inactive",
    };
  });
}

const CoursesMain = () => {
  const router = useRouter();
  const notify = useNotify();

  const [tableFilters, setTableFilters] = useState({
    search: "",
    department_id: "",
    is_enabled: "true",
  });

  const { data: deptsRes, isLoading: isLoadingDepts } = useDepartmentsDropdown({
    limit: 50,
    active_only: true,
  });

  const departmentsRows = useMemo(() => {
    const rows = extractDropdownRows(deptsRes);
    return Array.isArray(rows) ? rows : [];
  }, [deptsRes]);

  const departmentsOptions = useMemo(() => {
    return mapDepartmentOptions(departmentsRows);
  }, [departmentsRows]);

  const queryParams = useMemo(() => {
    return {
      mode: "cursor",
      limit: 50,
      is_enabled: tableFilters.is_enabled || "true",
      search: tableFilters.search || undefined,
      department_id: tableFilters.department_id || undefined,
    };
  }, [tableFilters]);

  const { data, isLoading, isFetching, isError, refetch } =
    useCoursesList(queryParams);

  const bulkDeleteMutation = useBulkDeleteCourses();

  const rawData = useMemo(() => {
    const rows = extractRows(data);
    return Array.isArray(rows) ? rows : [];
  }, [data]);

  const coursesData = useMemo(() => {
    return normalizeCourseRows(rawData);
  }, [rawData]);

  const enrichedColumns = useMemo(() => {
    return coursesColumns.map((col) => {
      if (col.filterKey === "department_id") {
        return {
          ...col,
          filterDropdown: {
            options: departmentsOptions,
            isLoading: isLoadingDepts,
            hasMore: false,
          },
        };
      }

      if (col.filterKey === "is_enabled") {
        return {
          ...col,
          filterDropdown: {
            options: [
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
              { label: "All", value: "all" },
            ],
            isLoading: false,
            hasMore: false,
          },
        };
      }

      return col;
    });
  }, [departmentsOptions, isLoadingDepts]);

  const handleFiltersChange = (nextFilters) => {
    setTableFilters((prev) => ({
      ...prev,
      ...nextFilters,
    }));
  };

  const handleBulkDelete = (selectedIds) => {
    if (!selectedIds?.length) {
      notify.warning("Please select at least one course");
      return;
    }

    const count = selectedIds.length;

    if (
      !confirm(
        `Are you sure you want to delete ${count} course${
          count > 1 ? "s" : ""
        }?`,
      )
    ) {
      return;
    }

    bulkDeleteMutation.mutate(
      {
        ids: selectedIds,
        permanent: false,
      },
      {
        onSuccess: () => {
          notify.success("Courses deleted successfully");
          refetch();
        },
        onError: (err) => {
          notify.error(err?.message || "Failed to delete courses");
        },
      },
    );
  };

  const actions = [
    {
      label: bulkDeleteMutation.isPending ? "Deleting..." : "Delete",
      action: "delete",
      onClick: handleBulkDelete,
      disabled: bulkDeleteMutation.isPending,
    },
  ];

  if (isLoading) {
    return <Preloader />;
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load courses.
      </div>
    );
  }

  return (
    <AcademicTable
      title="Courses"
      columns={enrichedColumns}
      data={coursesData}
      addNewLabel="Add Course"
      onAddNew={() =>
        router.push("/admin/dashboards/admin-academic/courses/create")
      }
      onRowClick={(row) =>
        router.push(`/admin/dashboards/admin-academic/courses/${row.id}`)
      }
      actions={actions}
      filters={tableFilters}
      onFiltersChange={handleFiltersChange}
      onRefresh={refetch}
      isRefreshing={isFetching}
      clientFilter={false}
    />
  );
};

export default CoursesMain;
