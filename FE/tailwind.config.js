export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}", // Nếu bạn đang dùng React/Next.js
  "./pages/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
     colors: {
        primary: {
          300: '#7DCAEB',
          400: '#4FB8E5',
          500: '#22A6DF',
          600: '#1E90C2', 
        },
      },
  },
};
export const plugins = [];
