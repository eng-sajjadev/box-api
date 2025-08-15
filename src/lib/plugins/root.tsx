import { Elysia } from "elysia";
import { html, Html } from "@elysiajs/html";

export const root = new Elysia().use(html()).get("/", () => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Box API</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-900 text-white flex flex-col items-center justify-center min-h-screen">
      <main class="text-center max-w-lg">
        <h1 class="text-5xl font-bold mb-4">🚀 Box API</h1>
        <p class="text-lg text-gray-300 mb-8">
          A modern, minimal, and blazing-fast API for messaging, rooms, and
          more.
        </p>
        <a
          href="https://github.com/your-repo"
          class="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white font-medium transition"
        >
          View on GitHub
        </a>
      </main>
      <footer class="absolute bottom-4 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Box API. All rights reserved.
      </footer>
    </body>
  </html>
));

export default root;
