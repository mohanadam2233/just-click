import Link from "next/link";
import React from "react";

const MobileSocial = () => {
  return (
    <div>
      <ul className="flex gap-6 items-center mb-5">
        <li>
          <Link className="facebook" href="#">
            <i className="icofont icofont-facebook text-fb-color dark:text-whiteColor dark:hover:text-secondaryColor"></i>
          </Link>
        </li>
        <li>
          <Link className="twitter" href="#">
            <i className="icofont icofont-twitter text-twiter-color dark:text-whiteColor dark:hover:text-secondaryColor"></i>
          </Link>
        </li>
        <li>
          <Link className="pinterest" href="#">
            <i className="icofont icofont-pinterest dark:text-whiteColor dark:hover:text-secondaryColor"></i>
          </Link>
        </li>
        <li>
          <Link className="instagram" href="#">
            <i className="icofont icofont-instagram dark:text-whiteColor dark:hover:text-secondaryColor"></i>
          </Link>
        </li>
        <li>
          <Link className="google" href="#">
            <i className="icofont icofont-youtube-play dark:text-whiteColor dark:hover:text-secondaryColor"></i>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default MobileSocial;
