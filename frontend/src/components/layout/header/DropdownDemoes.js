"use client";
import React from "react";
import TabButtonPrimary from "@/components/shared/buttons/TabButtonPrimary";
import useTab from "@/hooks/useTab";
import TabContentDemoes from "./TabContentDemoes";
import TabContentWrapper from "@/components/shared/wrappers/TabContentWrapper";
import DropdownContainer from "@/components/shared/containers/DropdownContainer";

const DropdownDemoes = () => {
  const { currentIdx, handleTabClick } = useTab();
  const tabButtons = ["Light", "Dark"];

  return (
    <DropdownContainer>
      {/* light and dark demoes tab */}
      <div className="tab-links grid grid-cols-2 gap-22px text-blackColor text-lg font-semibold ">
        {tabButtons?.map((tabButton, idx) => (
          <TabButtonPrimary
            key={idx}
            idx={idx}
            name={tabButton}
            handleTabClick={handleTabClick}
            currentIdx={currentIdx}
          />
        ))}
      </div>
      <div className="tab-contents">
        {tabButtons?.map((tabButton, idx) => (
          <TabContentWrapper
            key={idx}
            isShow={idx === currentIdx ? true : false}
          >
            <TabContentDemoes isDark={idx === 0 ? false : true} />
          </TabContentWrapper>
        ))}
      </div>
    </DropdownContainer>
  );
};

export default DropdownDemoes;
