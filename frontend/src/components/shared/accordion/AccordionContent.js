const AccordionContent = ({ children }) => {
  return (
    <div
      className={`accordion-content transition-all duration-500  overflow-hidden h-0`}
    >
      <div className="content-wrapper">{children}</div>
    </div>
  );
};

export default AccordionContent;
