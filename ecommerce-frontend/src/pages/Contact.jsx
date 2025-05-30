import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic (e.g., sending data to API)
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl bg-white border border-beige rounded-2xl shadow-2xl p-8 md:p-12 relative overflow-hidden pt-16">
          {/* Decorative Icon */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-taupe rounded-full p-4 shadow-lg">
            <svg
              className="w-10 h-10 text-white mt-10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 10.5V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h7.5"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 10.5l-9 6.5-9-6.5"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-stone text-center mb-2 font-sans mt-4">
            Contact Us
          </h2>
          <p className="text-taupe text-center mb-8">
            We'd love to hear from you! Fill out the form below and we'll get
            back to you soon.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-base font-semibold text-stone mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-beige rounded-lg bg-parchment text-stone focus:outline-none focus:ring-2 focus:ring-taupe transition"
                placeholder="Your Name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-base font-semibold text-stone mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-beige rounded-lg bg-parchment text-stone focus:outline-none focus:ring-2 focus:ring-taupe transition"
                placeholder="Your Email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-base font-semibold text-stone mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-beige rounded-lg bg-parchment text-stone focus:outline-none focus:ring-2 focus:ring-taupe transition"
                rows="6"
                placeholder="Your Message"
                required
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="px-8 py-3 bg-taupe text-white text-lg font-semibold rounded-lg shadow hover:bg-stone transition focus:outline-none focus:ring-2 focus:ring-taupe"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
