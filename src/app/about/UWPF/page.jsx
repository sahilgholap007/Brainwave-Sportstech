"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AboutUWPF() {
  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });
  }, []);

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-[#f7faff]">
      <main className="w-full relative">
        {/* Hero Section */}
        <div
  className="relative text-white pt-28 pb-20 text-center overflow-hidden"
  data-aos="fade-in"
>
  {/* Background */}
  <div
    className="absolute inset-0 bg-cover bg-center blur-md"
    style={{
      backgroundImage: `url('https://media.istockphoto.com/id/1723896772/photo/low-angle-view-of-a-pickleball-game.jpg?s=2048x2048&w=is&k=20&c=N4QxE2keB24CtJuajDreiiE4I6Z6LdGvdcV-MKGaMAg=')`,
    }}
  ></div>

  {/* Content */}
  <div className="relative z-10">
    <h1 className="text-5xl font-bold" data-aos="fade-down">
      Unified World Pickleball Federation (UWPF)
    </h1>
    <p className="mt-6 text-lg px-8" data-aos="fade-up">
      Pioneering the global growth and recognition of pickleball as a
      competitive sport.
    </p>
    <div className="mt-10 flex justify-center" data-aos="zoom-in">
      <Image
        src="https://media.istockphoto.com/id/1517470401/photo/black-female-pickleball-player-serving-the-ball-during-the-match-on-outdoor-court.jpg?s=2048x2048&w=is&k=20&c=Tkzf7hQ7_Un09F5WxqpVpJzR1LynC6jMAksuDhOgR88="
        alt="UWPF Banner"
        width={800}
        height={400}
        className="rounded-lg shadow-lg"
      />
    </div>
  </div>
</div>


        {/* About UWPF Section */}
        <section className="py-16 px-8 bg-white" data-aos="fade-right">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-semibold text-[#1a73e8]">
                About the UWPF
              </h2>
              <p className="mt-4 text-gray-700 leading-7">
                The <strong>Unified World Pickleball Federation (UWPF)</strong>{" "}
                was established to oversee the global growth and
                development of pickleball. Building on its predecessor, the
                International Federation of Pickleball (IFP) created in 2016,
                the UWPF has expanded to include over 80 member countries, with
                aspirations to have pickleball recognized as an Olympic sport.
              </p>
              <p className="mt-4 text-gray-700 leading-7">
                The UWPF's programs set the global standards for pickleball,
                including the certification of tournament directors, referees,
                and line judges. Through its grant programs, the UWPF also
                ensures the accessibility of pickleball equipment to remote
                regions, fostering inclusivity and community spirit worldwide.
              </p>
            </div>
            <div className="flex justify-center" data-aos="fade-left">
              <Image
                src="https://media.istockphoto.com/id/1723896772/photo/low-angle-view-of-a-pickleball-game.jpg?s=2048x2048&w=is&k=20&c=N4QxE2keB24CtJuajDreiiE4I6Z6LdGvdcV-MKGaMAg="
                alt="UWPF Logo"

                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Global Impact Section */}
        <section className="py-16 px-8 bg-[#e9efff]" data-aos="fade-up">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-semibold text-[#1a73e8]">
              Our Global Impact
            </h2>
            <p className="mt-6 text-gray-700 text-lg">
              With members in over 80 countries, the UWPF is committed to
              unifying the pickleball community across borders.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white shadow-md rounded-md" data-aos="zoom-in">
                <h3 className="text-2xl font-semibold text-[#1a73e8]">
                  80+ Countries
                </h3>
                <p className="mt-4 text-gray-600">
                  Member nations collaborating to grow pickleball worldwide.
                </p>
              </div>
              <div className="p-6 bg-white shadow-md rounded-md" data-aos="zoom-in">
                <h3 className="text-2xl font-semibold text-[#1a73e8]">
                  Olympic Vision
                </h3>
                <p className="mt-4 text-gray-600">
                  Working towards making pickleball an Olympic sport.
                </p>
              </div>
              <div className="p-6 bg-white shadow-md rounded-md" data-aos="zoom-in">
                <h3 className="text-2xl font-semibold text-[#1a73e8]">
                  Inclusive Programs
                </h3>
                <p className="mt-4 text-gray-600">
                  Equipment grants and certification for emerging regions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision and Mission Section */}
        <section className="py-16 px-8 bg-white" data-aos="fade-up">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-semibold text-center text-[#1a73e8]">
              Our Vision and Mission
            </h2>
            <p className="mt-6 text-gray-700 text-lg text-center">
              To create a global pickleball community that thrives on inclusion,
              competitiveness, and sustainability.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <div className="p-6 bg-[#e9efff] rounded-md shadow-md text-center" data-aos="zoom-in">
                <h3 className="text-2xl font-semibold text-[#1a73e8]">
                  Establish Standards
                </h3>
                <p className="mt-4 text-gray-700">
                  Develop universal rules and certifications for tournaments.
                </p>
              </div>
              <div className="p-6 bg-[#e9efff] rounded-md shadow-md text-center" data-aos="zoom-in">
                <h3 className="text-2xl font-semibold text-[#1a73e8]">
                  Support Growth
                </h3>
                <p className="mt-4 text-gray-700">
                  Provide resources to grow pickleball in emerging regions.
                </p>
              </div>
              <div className="p-6 bg-[#e9efff] rounded-md shadow-md text-center" data-aos="zoom-in">
                <h3 className="text-2xl font-semibold text-[#1a73e8]">
                  Unite Communities
                </h3>
                <p className="mt-4 text-gray-700">
                  Bring players together to celebrate and compete in the sport.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Join the UWPF Section */}
        <section className="py-16 px-8 bg-[#f7faff]" data-aos="fade-in">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-semibold text-[#1a73e8]">
              Join the UWPF Movement
            </h2>
            <p className="mt-6 text-gray-700 text-lg">
              Help us elevate pickleball to the global stage. Connect with us
              today to learn how you can contribute.
            </p>
            <div className="mt-8">
              <a
                href="/contact"
                className="px-6 py-3 bg-[#f39c12] text-white rounded-lg shadow-md hover:bg-blue-600 transition transform hover:scale-105"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
