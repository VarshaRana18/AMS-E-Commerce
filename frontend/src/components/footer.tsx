import { ImageLogo } from "./ImageLogo";

const Footer = () => {
  return (
    <footer className="font-sans tracking-wide bg-gray-50 px-10 pt-12 pb-6">
      <div className="flex flex-wrap justify-between gap-10">
        <div className="max-w-md">
          <ImageLogo
            className="hover:scale-105 transition-transform items-center"
            size={90}
          />
          <div className="mt-6">
            <p className="text-gray-600 leading-relaxed text-sm">
              We provide the following services: Computer Repairing, Individual
              Components Selling and Custom PC Building
            </p>
          </div>
          <ul className="mt-10 flex space-x-5">
            <li>
              <a
                href="https://wa.me/+919974085262"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg
                  className="fill-green-500 w-8 h-8"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                    data-original="#000000"
                  />
                </svg>
              </a>
            </li>
            <li>
              {/* <a href="javascript:void(0)"> */}
              <svg
                className="w-8 h-8"
                viewBox="0 0 112.196 112.196"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="56.098"
                  cy="56.097"
                  data-original="#007ab9"
                  fill="#007ab9"
                  r="56.098"
                />
                <path
                  d="M89.616 60.611v23.128H76.207V62.161c0-5.418-1.936-9.118-6.791-9.118-3.705 0-5.906 2.491-6.878 4.903-.353.862-.444 2.059-.444 3.268v22.524h-13.41s.18-36.546 0-40.329h13.411v5.715c-.027.045-.065.089-.089.132h.089v-.132c1.782-2.742 4.96-6.662 12.085-6.662 8.822 0 15.436 5.764 15.436 18.149zm-54.96-36.642c-4.587 0-7.588 3.011-7.588 6.967 0 3.872 2.914 6.97 7.412 6.97h.087c4.677 0 7.585-3.098 7.585-6.97-.089-3.956-2.908-6.967-7.496-6.967zm-6.791 59.77H41.27v-40.33H27.865v40.33z"
                  data-original="#f1f2f2"
                  fill="#fff"
                />
              </svg>
              {/* </a> */}
            </li>
            <li>
              {/* <a href="javascript:void(0)"> */}
              <svg
                className="w-8 h-8"
                viewBox="0 0 152 152"
                xmlns="http://www.w3.org/2000/svg"
              >
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="a"
                  x1="22.26"
                  x2="129.74"
                  y1="22.26"
                  y2="129.74"
                >
                  <stop offset="0" stopColor="#fae100" />
                  <stop offset=".15" stopColor="#fcb720" />
                  <stop offset=".3" stopColor="#ff7950" />
                  <stop offset=".5" stopColor="#ff1c74" />
                  <stop offset="1" stopColor="#6c1cd1" />
                </linearGradient>
                <g data-name="Layer 2">
                  <g data-name="03.Instagram">
                    <rect
                      data-original="url(#a)"
                      fill="url(#a)"
                      height="152"
                      rx="76"
                      width="152"
                    />
                    <g fill="#fff">
                      <path
                        d="M133.2 26c-11.08 20.34-26.75 41.32-46.33 60.9S46.31 122.12 26 133.2q-1.91-1.66-3.71-3.46A76 76 0 1 1 129.74 22.26q1.8 1.8 3.46 3.74z"
                        data-original="#ffffff10"
                        fill="#ffffff10"
                      />
                      <path
                        d="M94 36H58a22 22 0 0 0-22 22v36a22 22 0 0 0 22 22h36a22 22 0 0 0 22-22V58a22 22 0 0 0-22-22zm15 54.84A18.16 18.16 0 0 1 90.84 109H61.16A18.16 18.16 0 0 1 43 90.84V61.16A18.16 18.16 0 0 1 61.16 43h29.68A18.16 18.16 0 0 1 109 61.16z"
                        data-original="#ffffff"
                      />
                      <path
                        d="m90.59 61.56-.19-.19-.16-.16A20.16 20.16 0 0 0 76 55.33 20.52 20.52 0 0 0 55.62 76a20.75 20.75 0 0 0 6 14.61 20.19 20.19 0 0 0 14.42 6 20.73 20.73 0 0 0 14.55-35.05zM76 89.56A13.56 13.56 0 1 1 89.37 76 13.46 13.46 0 0 1 76 89.56zm26.43-35.18a4.88 4.88 0 0 1-4.85 4.92 4.81 4.81 0 0 1-3.42-1.43 4.93 4.93 0 0 1 3.43-8.39 4.82 4.82 0 0 1 3.09 1.12l.1.1a3.05 3.05 0 0 1 .44.44l.11.12a4.92 4.92 0 0 1 1.1 3.12z"
                        data-original="#ffffff"
                      />
                    </g>
                  </g>
                </g>
              </svg>
              {/* </a> */}
            </li>
            <li>
              {/* <a href="javascript:void(0)"> */}
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
                  fill="#FF0000"
                />
                <path
                  d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  fill="#FFF"
                />
              </svg>
              {/* </a> */}
            </li>
          </ul>
        </div>

        <div className="max-lg:min-w-[140px]">
          <h4 className="text-gray-800 font-semibold text-base relative max-sm:cursor-pointer">
            Services
          </h4>
          <ul className="mt-6 space-y-4">
            <li>
              <a
                className="hover:text-gray-800 text-gray-600 text-sm"
                href="/repairs"
              >
                Computer Repair
              </a>
            </li>
            <li>
              <a
                className="hover:text-gray-800 text-gray-600 text-sm"
                href="/components"
              >
                Component Sales
              </a>
            </li>
            <li>
              <a
                className="hover:text-gray-800 text-gray-600 text-sm"
                href="/custom-pc"
              >
                Custom PC Building
              </a>
            </li>
            <li>
              <a
                className="hover:text-gray-800 text-gray-600 text-sm"
                href="/contactUs"
              >
                Support
              </a>
            </li>
          </ul>
        </div>

        <div className="max-lg:min-w-[240px]">
          <h4 className="text-gray-800 font-semibold text-base relative max-sm:cursor-pointer">
            Our Partners
          </h4>
          <div className="mt-6 flex flex-col items-center gap-4">
            {/* First row with 4 logos - centered */}
            <div className="flex justify-center gap-4 w-full">
              <img
                alt="Dell"
                className="w-14 h-14 object-contain"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Dell_logo.svg/600px-Dell_logo.svg.png"
              />
              <img
                alt="Aorus"
                className="w-14 h-14 object-contain"
                src="https://cdn.worldvectorlogo.com/logos/aorus-1.svg"
              />
              <img
                alt="Gigabyte"
                className="w-14 h-14 object-contain"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Gigabyte_Technology_logo_20080107.svg/470px-Gigabyte_Technology_logo_20080107.svg.png"
              />
              <img
                alt="Intel"
                className="w-14 h-14 object-contain"
                src="https://cdn.worldvectorlogo.com/logos/intel-6.svg"
              />
            </div>

            {/* Second row with 5 logos - centered */}
            <div className="flex justify-center gap-4 w-full">
              <img
                alt="Intex"
                className="w-14 h-14 object-contain"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Intex_Technologies_logo.svg/1280px-Intex_Technologies_logo.svg.png"
              />
              <img
                alt="Logitech"
                className="w-14 h-14 object-contain"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Logitech_logo.svg/1200px-Logitech_logo.svg.png"
              />
              <img
                alt="Nvidia"
                className="w-14 h-14 object-contain"
                src="https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/527px-Nvidia_logo.svg.png?20150924223142"
              />
              <img
                alt="Zebronics"
                className="w-14 h-14 object-contain"
                src="https://cdn.brandfetch.io/id9TIFKqa2/w/500/h/69/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B"
              />
              <img
                alt="Zotac"
                className="w-14 h-14 object-contain"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Logo_of_Zotac_International.svg/267px-Logo_of_Zotac_International.svg.png?20160901231349"
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="mt-10 mb-6 border-gray-300" />

      <div className="flex justify-center w-full mt-6">
        <p className="text-gray-600 text-sm">© AMS. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
