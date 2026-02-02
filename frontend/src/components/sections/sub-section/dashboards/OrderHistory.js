import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";

const OrderHistory = () => {
  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
      {/* heading */}

      <HeadingDashboard>Order History</HeadingDashboard>

      {/* main content */}
      <div className="overflow-auto">
        <table className="w-full text-left">
          <thead className="text-sm md:text-base text-blackColor dark:text-blackColor-dark bg-lightGrey5 dark:bg-whiteColor-dark leading-1.8 md:leading-1.8">
            <tr>
              <th className="px-5px py-10px md:px-5">Order ID</th>
              <th className="px-5px py-10px md:px-5">Course Name</th>
              <th className="px-5px py-10px md:px-5">Date</th>
              <th className="px-5px py-10px md:px-5">Price</th>
              <th className="px-5px py-10px md:px-5">Status</th>
            </tr>
          </thead>
          <tbody className="text-size-13 md:text-base text-contentColor dark:text-contentColor-dark font-normal">
            <tr className="leading-1.8 md:leading-1.8">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #5478
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>App Development</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>January 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$100.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-greencolor2 leading-22px font-bold text-whiteColor rounded-md">
                    Success
                  </span>
                </p>
              </td>
            </tr>
            <tr className="leading-1.8 md:leading-1.8 bg-lightGrey5 dark:bg-whiteColor-dark">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #4585
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>Graphic</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>May 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$200.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-primaryColor leading-22px font-bold text-whiteColor rounded-md">
                    Processing
                  </span>
                </p>
              </td>
            </tr>

            <tr className="leading-1.8 md:leading-1.8">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #9656
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>App Development</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>January 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$100.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-greencolor2 leading-22px font-bold text-whiteColor rounded-md">
                    On Hold
                  </span>
                </p>
              </td>
            </tr>
            <tr className="leading-1.8 md:leading-1.8 bg-lightGrey5 dark:bg-whiteColor-dark">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #4585
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>Graphic</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>May 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$200.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-primaryColor leading-22px font-bold text-whiteColor rounded-md">
                    Canceled
                  </span>
                </p>
              </td>
            </tr>

            <tr className="leading-1.8 md:leading-1.8">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #9656
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>App Development</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>January 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$100.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-greencolor2 leading-22px font-bold text-whiteColor rounded-md">
                    On Hold
                  </span>
                </p>
              </td>
            </tr>
            <tr className="leading-1.8 md:leading-1.8 bg-lightGrey5 dark:bg-whiteColor-dark">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #4585
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>Graphic</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>May 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$200.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-primaryColor leading-22px font-bold text-whiteColor rounded-md">
                    Canceled
                  </span>
                </p>
              </td>
            </tr>

            <tr className="leading-1.8 md:leading-1.8">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #9656
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>App Development</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>January 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$100.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-greencolor2 leading-22px font-bold text-whiteColor rounded-md">
                    On Hold
                  </span>
                </p>
              </td>
            </tr>
            <tr className="leading-1.8 md:leading-1.8 bg-lightGrey5 dark:bg-whiteColor-dark">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #4585
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>Graphic</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>May 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$200.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-primaryColor leading-22px font-bold text-whiteColor rounded-md">
                    Canceled
                  </span>
                </p>
              </td>
            </tr>

            <tr className="leading-1.8 md:leading-1.8">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #5478
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>App Development</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>January 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$100.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-greencolor2 leading-22px font-bold text-whiteColor rounded-md">
                    Success
                  </span>
                </p>
              </td>
            </tr>
            <tr className="leading-1.8 md:leading-1.8 bg-lightGrey5 dark:bg-whiteColor-dark">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #4585
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>Graphic</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>May 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$200.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-primaryColor leading-22px font-bold text-whiteColor rounded-md">
                    Processing
                  </span>
                </p>
              </td>
            </tr>

            <tr className="leading-1.8 md:leading-1.8">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #9656
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>App Development</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>January 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$100.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-greencolor2 leading-22px font-bold text-whiteColor rounded-md">
                    On Hold
                  </span>
                </p>
              </td>
            </tr>
            <tr className="leading-1.8 md:leading-1.8 bg-lightGrey5 dark:bg-whiteColor-dark">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #4585
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>Graphic</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>May 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$200.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-primaryColor leading-22px font-bold text-whiteColor rounded-md">
                    Canceled
                  </span>
                </p>
              </td>
            </tr>

            <tr className="leading-1.8 md:leading-1.8">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #9656
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>App Development</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>January 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$100.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-greencolor2 leading-22px font-bold text-whiteColor rounded-md">
                    On Hold
                  </span>
                </p>
              </td>
            </tr>
            <tr className="leading-1.8 md:leading-1.8 bg-lightGrey5 dark:bg-whiteColor-dark">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #4585
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>Graphic</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>May 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$200.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-primaryColor leading-22px font-bold text-whiteColor rounded-md">
                    Canceled
                  </span>
                </p>
              </td>
            </tr>

            <tr className="leading-1.8 md:leading-1.8">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #9656
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>App Development</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>January 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$100.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-greencolor2 leading-22px font-bold text-whiteColor rounded-md">
                    On Hold
                  </span>
                </p>
              </td>
            </tr>
            <tr className="leading-1.8 md:leading-1.8 bg-lightGrey5 dark:bg-whiteColor-dark">
              <th className="px-5px py-10px md:px-5 font-normal text-wrap">
                <p className="text-blackColor dark:text-blackColor-dark">
                  #4585
                </p>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>Graphic</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>May 27, 2024</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p>$200.99</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <p className="text-xs">
                  <span className="h-22px inline-block px-7px bg-primaryColor leading-22px font-bold text-whiteColor rounded-md">
                    Canceled
                  </span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;
