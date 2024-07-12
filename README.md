This is a website for the books published by rourke palmer

## Getting Started

First clone the repository and npm install by running:

```bash
git clone https://github.com/Lwhels/rourke.git
cd rourke
npm install
```

Then run the development server with:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Modify the `pages/` and `components/` directories.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Styling

To change the global styles of different elements, edit the `styles/globals.css` file.

Example of changing the background color of all buttons:

```css
button {
  background-color: #606060;
}
```

## Animation

This project uses framer motion to animate the elements.

To use framer motion first

```javascript
import { motion } from "framer-motion";
```

Then you can use `motion.div` or `motion.anyjsxelement` to animate elements.

ex:

```javascript
<motion.div
  initial={{ x: 300, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: 300, opacity: 0 }}
  transition={{
    type: "spring",
    stiffness: 260,
    damping: 20,
  }}
>
  {children}
</motion.div>
```

By default, all pages wrapped in the NavBar element will take this animation on. This is our page transisition animation

To learn more about framer motion reference: [Framer Motion's Website](https://www.framer.com/motion/)
