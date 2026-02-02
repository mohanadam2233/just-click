import React from "react";

const LessonQuizSingle = ({ quiz: quizSingle, totalQuiz, idx }) => {
  const { id, attemptTimes, time, quiz, options } = quizSingle;
  return (
    <div>
      <ul className="flex flex-wrap items-center gap-x-1">
        <li className="text-bodyColor dark:text-bodyColor-dark leading-1.8">
          Question : {`${idx + 1}/${totalQuiz}`} |
        </li>
        <li className="text-bodyColor dark:text-bodyColor-dark leading-1.8">
          Attempts allowed : {attemptTimes} |
        </li>
        <li className="text-bodyColor dark:text-bodyColor-dark leading-1.8">
          Time: {time}
        </li>
      </ul>
      <hr className="border-borderColor2 dark:opacity-30 my-4" />
      <h4 className="text-2xl sm:text-size-28 font-bold leading-1.2 text-blackColor dark:text-blackColor-dark mb-15px">
        {`${idx + 1}. ${quiz}`}
      </h4>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-0.5 gap-x-30px">
        {options?.map(({ checked, name }, idx) => {
          const idAttr =
            name
              .slice(0, Math.floor(Math.random(1) * name?.length))
              .split(" ")
              .join("") + Math.floor(Math.random() * 10000);

          return (
            <li key={idx} className="flex items-center gap-x-2">
              <input
                className="relative w-4 h-4 z-0 rounded after:absolute after:w-4 after:h-4 after:left-0 after:top-0 block after:-z-1 after:rounded after:focus:shadow-select box-content"
                type="checkbox"
                id={idAttr}
                defaultChecked={checked}
              />

              <label
                htmlFor={idAttr}
                className="text-bodyColor dark:text-bodyColor-dark leading-1.8"
              >
                {name}
              </label>
            </li>
          );
        })}
      </ul>
      {idx === totalQuiz - 1 ? (
        <>
          <br />
          <br />
        </>
      ) : (
        <>
          <br />
          <br />
          <br />
        </>
      )}
    </div>
  );
};

export default LessonQuizSingle;
