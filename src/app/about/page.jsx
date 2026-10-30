import React from "react";
import Image from "next/image";
import Downloads from "@/components/Downloads";

const AboutUs = () => {
  return (
    <section className=" pt-16">
      {/* About Us Heading */}
      <div className="text-center py-8 bg-[#e9efff]">
        <h1 className="text-5xl font-bold text-[#1a1a1a]">About Us</h1>
      </div>

      {/* Brainwave SportsTech Section */}
      <div className="relative bg-[#e9efff] py-16 px-6 lg:px-16">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-8">
          {/* Image */}
          <div className="lg:w-1/2">
            <Image
              src="https://via.placeholder.com/600x400.png?brain"
              alt="Brainwave SportsTech"
              className="rounded-lg shadow-md"
              width={600}
              height={400}
            />
          </div>
          {/* Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-[#1a1a1a] mb-6">
              Brainwave SportsTech
            </h2>
            <p className="text-lg text-[#555555] leading-relaxed mb-4">
              Brainwave SportsTech is at the forefront of revolutionizing sports
              technology. With cutting-edge solutions, a passion for innovation,
              and a commitment to excellence, we empower athletes,
              organizations, and enthusiasts to achieve their full potential.
            </p>
            <p className="text-lg text-[#555555] leading-relaxed">
              From advanced data-driven tools to innovative training solutions,
              we focus on pushing the boundaries of sports performance and
              accessibility for everyone.
            </p>
          </div>
        </div>
      </div>

      {/* Unified World Pickleball Federation Section */}
      <div className="relative bg-[#ffffff] py-16 px-6 lg:px-16">
        <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center gap-8">
          {/* Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-[#1a1a1a] mb-6">
              Unified World Pickleball Federation (UWPF)
            </h2>
            <p className="text-lg text-[#555555] leading-relaxed mb-4">
              The Unified World Pickleball Federation (UWPF) is the global
              authority for the sport of Pickleball. With a mission to unite
              nations through Pickleball, UWPF sets the standards, organizes
              international tournaments, and fosters collaboration among
              countries.
            </p>
            <p className="text-lg text-[#555555] leading-relaxed">
              Whether you're a player, coach, or enthusiast, UWPF ensures the
              game is accessible, fun, and played at its highest level
              worldwide.
            </p>
          </div>
          {/* Image */}
          <div className="lg:w-1/2">
            <Image
              src="https://via.placeholder.com/600x400.png?brain"
              alt="Unified World Pickleball Federation"
              className="rounded-lg shadow-md"
              width={600}
              height={400}
            />
          </div>
        </div>
      </div>
      {/* All India Pickleball Association Section */}
      <div className="relative bg-[#e9efff] py-16 px-6 lg:px-16">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-8">
          {/* Image */}
          <div className="lg:w-1/2">
            <Image
              src="https://via.placeholder.com/600x400.png?brain"
              alt="All India Pickleball Association"
              className="rounded-lg shadow-md"
              width={600}
              height={400}
            />
          </div>
          {/* Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-[#1a1a1a] mb-6">
              All India Pickleball Association (AIPA)
            </h2>
            <p className="text-lg text-[#555555] leading-relaxed mb-4">
              The All India Pickleball Association (AIPA) is committed to
              nurturing Pickleball in India. By organizing tournaments,
              providing training, and promoting inclusivity, AIPA aims to make
              Pickleball a household name in the country.
            </p>
            <p className="text-lg text-[#555555] leading-relaxed">
              From grassroots development to professional leagues, AIPA ensures
              every player gets the opportunity to shine and grow in this
              dynamic sport.
            </p>
          </div>
        </div>
      </div>
      <Downloads />
    </section>
  );
};

export default AboutUs;
