# blog

A personal blog built with Go.

---

## Getting Started

Follow these steps to get a copy of the project up and running for development or production.

---

## 1. Database Setup (Required for All Installations)

1. **Install PostgreSQL**  

2. **Create a Database**  

3. **Apply Migrations**  
   Install [migrate](https://github.com/golang-migrate/migrate) and run:
   ```bash
   migrate -path=./migrations -database="postgres://bloguser:yourpassword@localhost:5432/blogdb?sslmode=disable" up
   ```
   *To roll back (down) the database migrations:*
   ```bash
   migrate -path=./migrations -database="postgres://bloguser:yourpassword@localhost:5432/blogdb?sslmode=disable" down
   ```

---

## 2. Installation Methods

You can run this blog either manually or using Docker.

---

### Manual Installation

#### **Backend (Go Application)**

1. **Go**: Install Go version 1.23.0 or higher and ensure `go` is in your PATH.
2. **Configuration File**: Copy and edit the example config:
   ```bash
   cp example.blog.yaml .blog.yaml
   ```
3. **Templ**: Install [templ](https://github.com/a-h/templ):
   ```bash
   go install github.com/a-h/templ/cmd/templ@latest
   ```
4. **Generate Templ Files**:
   ```bash
   make gen
   ```
5. **Tailwind CSS** (for CSS generation):  
   Install [Tailwind CSS CLI](https://tailwindcss.com/blog/standalone-cli). Then generate CSS:
   ```bash
   make gen-css
   ```
   > **If you have a custom favicon:**  
   > After running `make gen` and `make gen-css`, place your `favicon.ico` inside the `cmd/web/assets` directory.
6. **Build the Blog**:
   ```bash
   make build
   ```
7. **Run the Blog**:
   ```bash
   ./blog
   # Or with custom config:
   ./blog --conf .blog.yaml
   ```
8. **Build the CLI Tool**:
   ```bash
   make build-cli
   ```

9. **User Registration**:  
   Use the CLI to manage users (required for logging in to the frontend):
   ```bash
   ./blog_cli --help
   ./blog_cli --name 'Your Name' --email yourmail@gmail.com --pass "Pass"
   ./blog_cli --email yourmail@gmail.com --pass "newPass"
   ```
   *Password is optional. If not provided, a secure password will be generated automatically.*

#### **Admin Dashboard (Frontend)**

1. **Node.js and npm**: Make sure both Node.js and npm are installed.
2. Navigate to the `dashboard` directory:
   ```bash
   cd dashboard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy and configure the `.env` file:
   ```bash
   cp env.example .env
   # Then edit .env and update the URL values as needed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. **Build and Run the Docker Image for the frontend:**
   ```bash
   docker compose up -d
   ```
   or to rebuild the image:
   ```bash
   docker compose up --build -d
   ```
   Visit: [http://localhost:8000](http://localhost:8000) for the frontend dashboard when using Docker.

> **Note:**  
> To log in to the frontend, you must first create a user via the backend CLI as described above.  
> The frontend only supports login; there are no sign up or forgot password options.  
> **You need to run the React dashboard separately from the Go application.** The Go backend and the React dashboard are separate services and must be started and managed independently.

---

### Docker Installation

1. **Build and Run the Docker Image (Backend):**
   ```bash
   make run-docker
   ```
   or
   ```bash
   make up
   ```
2. **Rebuild the Docker Image (Backend):**
   ```bash
   make re-build-docker 
   ```
   or
   ```bash
   make re-up
   ```
   - Adjust the ports and config path as needed for your setup.
   - Make sure `.blog.yaml` is available in your working directory and is mounted into the container.

> **Note:**  
> You still need to have PostgreSQL running and your database migrated before running the Docker container.

---

## Makefile Usage

This project includes a `Makefile` for managing common Go project tasks.  
See all available commands with:
```bash
make help
```

---

**Note:**  
- Replace `./blog_cli` and `./blog` with the actual output binary names if you change the `BINARY_NAME` or `CLI_BINARY_NAME` variables in the `Makefile`.

---

## Contributing 🤝

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## License 📜

This project is licensed under the MIT License.
