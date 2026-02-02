const DropdownWrapperSecondary = ({ children, isHeaderTop }) => {
  return (
    <div
      className={`absolute top-full right-0 ${
        isHeaderTop ? "lg:-right-3 2xl:right-[-56px]" : " lg:right-8"
      } translate-y-10 z-medium invisible opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 `}
    >
      {children}
    </div>
  );
};

export default DropdownWrapperSecondary;
