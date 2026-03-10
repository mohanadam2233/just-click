import MaterialCard from "./MaterialCard";

const CoursesGrid = ({ materials, isNotSidebar }) => {
  return (
    <div
      className={`grid grid-cols-1 ${
        isNotSidebar
          ? "sm:grid-cols-2 xl:grid-cols-3"
          : "sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
      } gap-30px`}
    >
      {materials?.length ? (
        materials.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            type="primaryMd"
          />
        ))
      ) : (
        <span>No materials found.</span>
      )}
    </div>
  );
};

export default CoursesGrid;
