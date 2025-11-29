# Trophy Fullstack Frontend

A modern React + Vite frontend project with modular architecture, SCSS styling, and extensive icon/font support.

## Features

- ⚡ Fast development with [Vite](https://vitejs.dev/) and [React](https://react.dev/)
- 🎨 Custom SCSS styles and [Tailwind CSS](https://tailwindcss.com/)
- 🧩 Modular components and layouts
- 🗂️ Organized assets: images, icons, fonts, vendor libraries
- 🛠️ ESLint for code quality

## Project Structure

```
src/
  App.jsx, main.jsx, App.css, index.css
  assets/         # Images, icons, fonts, SCSS, vendor libraries
  components/     # Reusable UI components (Navbar, SideBar, etc.)
  context/        # React context providers
  data/           # Static data, API modules, constants
  layout/         # Main layout components
  pages/          # Application pages (Admin, User, Auth, etc.)
public/           # Static files
```

## Getting Started

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Run the development server:**

   ```sh
   npm run dev
   ```

3. **Build for production:**
   ```sh
   npm run build
   ```

## Scripts

- `npm run dev` – Start local dev server
- `npm run build` – Build for production
- `npm run lint` – Run ESLint

## Customization

- **Styling:** Edit SCSS files in [`src/assets/scss`](src/assets/scss/main.scss)
- **Icons:** Use icons from [`src/assets/icons`](src/assets/icons/)
- **Components:** Add or modify UI in [`src/components`](src/components/)

## License

See [LICENSE.md](src/assets/icons/bootstrap-icons/LICENSE.md) and other icon/font licenses in their respective folders.

---

> Built with ❤️ using React, Vite, and modern
