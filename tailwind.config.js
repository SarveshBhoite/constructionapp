/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#F97316", // Construction Orange
        secondary: "#1E293B", // Dark Blue/Slate
        accent: "#FBBF24", // Safety Yellow
      },
      fontFamily: {
        inter: ["Inter"],
      },
    },
  },
  plugins: [],
};
