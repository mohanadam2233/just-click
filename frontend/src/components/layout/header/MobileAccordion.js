import AccordionController from "@/components/shared/accordion/AccordionController";
import Accordion from "@/components/shared/accordion/Accordion";
import AccordionContainer from "@/components/shared/containers/AccordionContainer";
import MobileLinkPrimary from "./MobileLinkPrimary";
import AccordionContent from "@/components/shared/accordion/AccordionContent";
import MobileLinkSecondary from "./MobileLinkSecondary";

const MobileAccordion = ({ items, children }) => {
  const isAccordion = items[0]?.accordion;
  return isAccordion ? (
    <AccordionContainer>
      {items.map(({ name, path, items }, idx) => (
        <Accordion key={idx}>
          <AccordionController type="primary">
            <MobileLinkPrimary item={{ name, path }} />
          </AccordionController>
          <AccordionContent>
            <ul>
              {items.map((item1, idx1) => (
                <li key={idx1}>
                  <MobileLinkSecondary item={item1} />
                </li>
              ))}
            </ul>
          </AccordionContent>
        </Accordion>
      ))}
      {children && children}
    </AccordionContainer>
  ) : (
    <ul>
      {items.map((item1, idx1) => (
        <li key={idx1}>
          <MobileLinkPrimary item={item1} />
        </li>
      ))}
    </ul>
  );
};

export default MobileAccordion;
