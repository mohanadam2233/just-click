import Accordion from "@/components/shared/accordion/Accordion";
import AccordionContent from "@/components/shared/accordion/AccordionContent";
import AccordionController from "@/components/shared/accordion/AccordionController";
import AccordionContainer from "@/components/shared/containers/AccordionContainer";

const Faq = () => {
  const accordionItems = [
    "Can I cancel my account at any time?",
    "What happens after the license expires?",
    "Does Harry have any documentations?",
    "How long do I get support & updates?",
  ];
  return (
    <section>
      <div className="container pb-100px">
        <div className="fees faq grid grid-cols-1 lg:grid-cols-12 gap-30px">
          <div className="lg:col-start-1 lg:col-span-3" data-aos="fade-up">
            <div className="lg:-rotate-90 lg:translate-y-3/4 relative">
              <h4 className="text-size-150 lg:text-size-140 2xl:text-size-200 text-lightGrey dark:text-blackColor-dark opacity-50 uppercase font-bold leading-[1]">
                faq
              </h4>
            </div>
          </div>
          {/* accordions */}
          <div className="lg:col-start-4 lg:col-span-9" data-aos="fade-up">
            <AccordionContainer>
              {accordionItems?.map((item, idx) => (
                <Accordion
                  key={idx}
                  idx={idx}
                  isActive={idx === 0 ? true : false}
                  accordion={"secondaryLg"}
                >
                  <AccordionController type={"secondaryLg"}>
                    {item}
                  </AccordionController>
                  <AccordionContent>
                    <div className="content-wrapper py-4 px-5">
                      <p className="leading-7 text-contentColor dark:text-contentColor-dark mb-15px">
                        Non similique culpa in provident quos sit commodi beatae
                        ea laborum suscipit id autem velit aut iusto odio et
                        deleniti quis et doloremque enim vel consequuntur quos.
                      </p>
                    </div>
                  </AccordionContent>
                </Accordion>
              ))}
            </AccordionContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;
