import React from 'react';
import { Link } from 'react-router-dom';
import img1 from '../assets/1.jpg';
import img2 from '../assets/2.jpg';
import img3 from '../assets/3.jpg';
import img4 from '../assets/4.jpg';
import img5 from '../assets/5.jpg';
import img6 from '../assets/6.jpg';
import img7 from '../assets/7.jpg';
import img8 from '../assets/8.jpg';
import img9 from '../assets/9.jpg';
import img10 from '../assets/10.jpg';

const instagramLinks = [
  { img: img1, url: "https://www.instagram.com/yourbrand", id: "@yourbrand" },
  { img: img2, url: "https://www.instagram.com/yourbrand", id: "@yourbrand" },
  { img: img3, url: "https://www.instagram.com/yourbrand", id: "@yourbrand" },
  { img: img4, url: "https://www.instagram.com/yourbrand", id: "@yourbrand" },
  { img: img5, url: "https://www.instagram.com/yourbrand", id: "@yourbrand" },
  { img: img6, url: "https://www.instagram.com/yourbrand", id: "@yourbrand" },
  { img: img7, url: "https://www.instagram.com/yourbrand", id: "@yourbrand" },
  { img: img8, url: "https://www.instagram.com/yourbrand", id: "@yourbrand" },
  { img: img9, url: "https://www.instagram.com/yourbrand", id: "@yourbrand" },
  { img: img10, url: "https://www.instagram.com/yourbrand", id: "@yourbrand" },
];

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-800">
      {/* Instagram Scroller */}
      <div className="relative overflow-hidden py-10 [mask-image:_linear-gradient(to_right,_transparent_0,_white_128px,_white_calc(100%-128px),_transparent_100%)]">
        <div className="flex animate-slide-left w-max">
          {[...instagramLinks, ...instagramLinks].map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-36 h-36 sm:w-40 sm:h-40 flex-shrink-0 relative group"
            >
              <img
                src={link.img}
                alt={`Instagram ${idx}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-[#4B4A44] text-sm font-semibold">{link.id}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="text-[#4B4A44] border-t border-gray-200 py-8 px-4 text-center text-sm">
        <div className="space-y-2">
          <div className="text-[#4B4A44] font-semibold text-lg">Quick Links</div>
          <div className="text-[#4B4A44] flex flex-col sm:flex-row sm:justify-center gap-4">
            <Link to="/dashboard" className="hover:underline">Account</Link>
            <Link to="/myorders" className="hover:underline">Orders</Link>
            <Link to="/#" className="hover:underline">Support</Link>
            <Link to="/#" className="hover:underline">Privacy Policy</Link>
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/yourbrand"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#b9b4a8] transition"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/yourbrand"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#b9b4a8] transition"
            >
              Instagram
            </a>
            <a
              href="https://twitter.com/yourbrand"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#b9b4a8] transition"
            >
              Twitter
            </a>
          </div>
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Your Brand. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
