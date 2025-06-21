import { Link } from "wouter";
import { Rocket } from "lucide-react";
import {
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import logoImage from "@assets/Cosmo - 1_1750298158776.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const footerLinks = {
    explore: [
      { label: "APOD Gallery", href: "/gallery" },
      { label: "ISS Tracker", href: "/iss-tracker" },
      { label: "Solar System", href: "/solar-system" },
      { label: "Aurora Forecast", href: "/aurora" },
      { label: "Asteroid Watch", href: "/asteroids" },
      { label: "Space Missions", href: "/missions" },
      { label: "Space News", href: "/news" },
      { label: "Space Sounds", href: "/sounds" },
    ],
    discover: [
      { label: "Space Weather", href: "/space-weather" },
      { label: "Cosmic Events", href: "/events" },
      { label: "Constellation Guide", href: "/constellations" },
      { label: "Satellite Tracker", href: "/satellite-tracker" },
      { label: "Hindu Panchang", href: "/panchang" },
    ],
    resources: [
      { label: "NASA APIs", href: "https://api.nasa.gov/", external: true },
      {
        label: "Space News API",
        href: "https://www.space.com/",
        external: true,
      },
      {
        label: "Educational Content",
        href: "https://www.nasa.gov/audience/forstudents/",
        external: true,
      },
      {
        label: "Developer Docs",
        href: "https://github.com/nasa",
        external: true,
      },
    ],
  };

  const socialLinks = [
    {
      icon: FaLinkedin,
      href: "https://twitter.com/cosmofy",
      label: "Twitter",
      color: "text-[hsl(158,76%,36%)]",
    },
    {
      icon: FaInstagram,
      href: "https://instagram.com/cosmofy",
      label: "Instagram",
      color: "text-[hsl(330,81%,60%)]",
    },
    {
      icon: FaGithub,
      href: "https://github.com/cosmofy",
      label: "GitHub",
      color: "text-white",
    },
  ];

  return (
    <footer className="py-20 bg-[hsl(222,47%,8%)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[hsl(158,76%,36%)] blur-3xl animate-pulse" />
        <div
          className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[hsl(330,81%,60%)] blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-[hsl(43,96%,56%)] blur-2xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <img
                src={logoImage}
                alt="Space Explorer Logo"
                className="h-15 w-auto"
              />
            </div>
            <p className="text-sm opacity-70 mb-6 leading-relaxed">
              Exploring the cosmos through cutting-edge NASA data and real-time
              space tracking. Join us on humanity's greatest adventure.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.color} hover:scale-110 transform transition-all duration-300 text-xl`}
                    aria-label={social.label}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Explore Section */}
          <div>
            <h4 className="font-orbitron font-bold mb-4 text-[hsl(158,76%,36%)]">
              Explore
            </h4>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <a className="text-sm opacity-70 hover:text-[hsl(158,76%,36%)] hover:opacity-100 transition-all duration-300">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover Section */}
          <div>
            <h4 className="font-orbitron font-bold mb-4 text-[hsl(330,81%,60%)]">
              Discover
            </h4>
            <ul className="space-y-2">
              {footerLinks.discover.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <a className="text-sm opacity-70 hover:text-[hsl(330,81%,60%)] hover:opacity-100 transition-all duration-300">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h4 className="font-orbitron font-bold mb-4 text-[hsl(43,96%,56%)]">
              Resources
            </h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : "_self"}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm opacity-70 hover:text-[hsl(43,96%,56%)] hover:opacity-100 transition-all duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[hsl(215,28%,25%)] pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm opacity-70 mb-4 md:mb-0">
              © {currentYear} Cosmofy. Made with ❤️ for space enthusiasts
              worldwide.
            </p>
            <div className="flex items-center space-x-6 text-sm opacity-70">
              <span>Powered by NASA APIs</span>
              <span>•</span>
              <span>Real-time Space Data</span>
              <span>•</span>
              <span>Open Source</span>
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div className="mt-8 text-center">
          <p className="text-xs opacity-50">
            This project is not affiliated with NASA. All space data is provided
            via public NASA APIs.
            <br />
            Built with React, TypeScript, and GSAP for an award-winning cosmic
            experience.
          </p>
        </div>
      </div>
    </footer>
  );
}
