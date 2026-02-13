
// // components/shared/courses/CoursesList.jsx
// import MaterialListItem from "./MaterialListItem";

// const CoursesList = ({ materials, card, isList, isNotSidebar }) => {
//   return (
//     <div className="flex flex-col gap-30px">
//       {materials?.length ? (
//         materials?.map((material, idx) => (
//           <MaterialListItem
//             key={idx}
//             material={material}
//             isList={isList}
//             card={card}
//             isNotSidebar={isNotSidebar}
//           />
//         ))
//       ) : (
//         <span></span>
//       )}
//     </div>
//   );
// };

// export default CoursesList;
// components/shared/courses/CoursesList.jsx
import MaterialListItem from "./MaterialListItem";

const CoursesList = ({ materials }) => {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.15em] font-bold text-contentColor/60">
              <th className="pb-4 pl-2 pr-2">Document Name</th>
              <th className="pb-4 px-2">File Info</th>
              <th className="pb-4 px-2">Stats</th>
              <th className="pb-4 pr-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials?.length ? (
              materials?.map((material, idx) => (
                <MaterialListItem key={idx} material={material} />
              ))
            ) : (
              <tr><td colSpan="4" className="text-center py-20 text-contentColor">No materials available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoursesList;