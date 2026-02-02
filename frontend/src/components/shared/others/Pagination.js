"use client";

import ButtonPagination from "../buttons/ButtonPagination";

const Pagination = ({
  pages,
  skip,
  limit,
  totalItems,
  handlePagesnation,
  currentPage,
}) => {
  return (
    <div>
      <ul className="flex items-center justify-center gap-15px mt-60px mb-30px">
        <li>
          <ButtonPagination
            type={"prev"}
            skip={skip}
            limit={limit}
            handlePagesnation={handlePagesnation}
            idx={"prev"}
          />
        </li>
        {pages?.map((page, idx) => (
          <li key={idx}>
            <ButtonPagination
              idx={idx}
              id={idx + 1}
              handlePagesnation={handlePagesnation}
              currentPage={currentPage}
            />
          </li>
        ))}
        <li>
          <ButtonPagination
            type={"next"}
            skip={skip}
            limit={limit}
            totalItems={totalItems}
            handlePagesnation={handlePagesnation}
            idx={"next"}
          />
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
