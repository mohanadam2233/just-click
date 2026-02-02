import Link from "next/link";
import React from "react";

const MobileMyAccount = () => {
  return (
    <div>
      <ul className="accordion-container mt-9 mb-30px pb-9 border-b border-borderColor dark:border-borderColor-dark">
        <li className="accordion group">
          {/*  accordion header */}
          <div className="accordion-controller flex items-center justify-between">
            <Link
              className="leading-1 text-darkdeep1 font-medium group-hover:text-secondaryColor dark:text-whiteColor dark:hover:text-secondaryColor"
              href="#"
            >
              My Account
            </Link>
            <button className="px-3 py-1">
              <i className="icofont-thin-down text-size-15 text-darkdeep1 group-hover:text-secondaryColor dark:text-whiteColor dark:hover:text-secondaryColor"></i>
            </button>
          </div>
          {/*  accordion content */}
          <div className="accordion-content h-0 overflow-hidden transition-all duration-500 shadow-standard">
            <div className="content-wrapper">
              <ul>
                <li>
                  {/*  accordion header */}
                  <div className="flex items-center gap-1">
                    <Link
                      href="/login"
                      className="leading-1 text-darkdeep1 text-sm pl-30px pt-7 pb-3 font-medium hover:text-secondaryColor dark:text-whiteColor dark:hover:text-secondaryColor"
                    >
                      Login
                    </Link>

                    <Link
                      href="/login"
                      className="leading-1 text-darkdeep1 text-sm pr-30px pt-7 pb-4 font-medium hover:text-secondaryColor dark:text-whiteColor dark:hover:text-secondaryColor"
                    >
                      <span>/</span> Create Account
                    </Link>
                  </div>
                </li>
                <li>
                  {/*  accordion header */}
                  <div className="flex items-center justify-between">
                    <Link
                      href="/login"
                      className="leading-1 text-darkdeep1 text-sm pl-30px pt-3 pb-7 font-medium hover:text-secondaryColor dark:text-whiteColor dark:hover:text-secondaryColor"
                    >
                      My Account
                    </Link>
                  </div>
                  {/*  accordion content */}
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default MobileMyAccount;
