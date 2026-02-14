# 🧮 2D Graphing Calculator Web App
#### Description:
An interactive, web-based tool that empowers users to visualize 2D mathematical functions in real-time. The application enables users to input custom mathematical expressions, render precise and responsive graphs, and explore them through intuitive pan and zoom controls — all within a modern and minimalistic frontend interface. The project is backed by a lightweight yet powerful Python backend built with Flask.

Ideal for students, educators, or developers seeking a quick visual interpretation of mathematical expressions.
---

## 🚀 Features

This graphing calculator offers a seamless blend of frontend interactivity and backend logic:

- 🖊️ Expression Input
Enter functions like sin(x), x^2 + 3x - 5, or e^(-x) using standard mathematical notation. Input is handled via a text box in the UI with instant feedback.

- 📊 Graph Rendering
Uses the HTML5 Canvas API along with Math.js to dynamically generate 2D plots. The rendering is accurate, responsive, and efficient, ensuring smooth performance even with complex expressions.

- 🔁 Interactive Controls
Users can zoom in/out and pan across the graph canvas using mouse gestures or touch controls. This makes it easier to explore different sections of a function in detail.

- 📤 Export Graphs
The rendered graph can be exported as a PNG image, allowing users to save or share their plots.
---

## 🛠 Tech Stack
The project is built using a clean, modular architecture with a clear separation of concerns across layers:

| Layer      | Tech Used                     |
|------------|-------------------------------|
| Frontend   | HTML5, CSS3, JavaScript, Math.js, Canvas API |
| Backend    | Python, Flask |
| Features   | Graph computation, interaction, validation |
| Deployment | Flask dev server |

---

## 📂 Project Structure

project\
├── static\
│ ├── app.js\
│ └── styles.css\
├── templates\
│ └── index.html\
├── app.py\
├── requirements.txt\
└── README.md\

## 🧭 How It Works
🔹 Frontend (Static)
- The frontend consists of a basic HTML structure powered by JavaScript for all dynamic interactions.

- The app.js script uses the Canvas API to draw functions based on parsed inputs.

- Math.js is used to safely parse and evaluate expressions like sin(x), x^3 - 2x, or even piecewise functions.

- CSS styles provide a clean user interface, and error handling is integrated to provide feedback on invalid inputs.

🔹 Backend (Optional / Flask)
The Flask backend serves static assets and renders the main index.html template.

- While the core graphing does not require backend processing, the backend can be extended to:

 - Validate expressions using SymPy

 - Compute evaluated arrays using NumPy

 - Support user authentication or saved graphs (future scope)

This structure enables easy integration with more advanced backend features if required later.

## 🧪 Future Improvements
- Add expression history and undo/redo.

- Allow saving graphs locally or to a database.

- Integrate domain/range restrictions.

- Improve UI with light/dark themes.

- Add mobile support for touch devices.
