# blog

A personal blog built with Go, inspired by the aesthetics and simplicity of the terminal. Share your thoughts and stories in a fast, minimal, and terminal-style environment.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Prerequisites

### Backend & Blog

1. **Go**: Install Go version 1.23.0 or higher and make sure `go` is in your system PATH.
2. **PostgreSQL**: Install PostgreSQL and create a database for your blog.
3. **Configuration File**: Copy the example configuration file and customize as needed:
   ```bash
   cp example.blog.yaml .blog.yaml
   ```
4. **Templ**: Install [templ](https://github.com/a-h/templ) by running:
   ```bash
   go install github.com/a-h/templ/cmd/templ@latest
   ```
5. **Generate Templ Files**: Run the following command in your backend directory to generate templ files:
   ```bash
   make gen
   ```
6. **Tailwind CSS** (for CSS generation):  
   Install [Tailwind CSS CLI](https://tailwindcss.com/blog/standalone-cli).
   To generate CSS, run:
   ```bash
   make gen-css
   ```
   > **If you have a custom favicon:**  
   > After running `make gen` and `make gen-css`, place your `favicon.ico` inside the `cmd/web/assets` directory.

7. **Migrate**: Install [migrate](https://github.com/golang-migrate/migrate)
8. **Apply Database Migrations**: Run:
   ```bash
   migrate -path=./migrations -database="postgres://user:pass@localhost:port/dbName?sslmode=disable" up
   ```
   If you want to roll back (down) the database migrations, simply run:
   ```bash
   migrate -path=./migrations -database="postgres://user:pass@localhost:port/dbName?sslmode=disable" down
   ```
9. **User Registration & Password Management**:  
   The backend provides a CLI tool for user account management, which is required for logging in to the frontend.  
   > There is no sign up or forgot password option in the frontend; you must generate users via the backend CLI.

   **CLI Usage:**
    
    Run: `./blog_cli --help` for usage

   **Register a user:**
   ```bash
   ./blog_cli --name 'Your Name' --email yourmail@gmail.com --pass "Pass"
   ```

   **Reset password:**
   ```bash
   ./blog_cli --email yourmail@gmail.com --pass "newPass"
   ```

   *Password is optional. If not provided, a secure password will be generated automatically.*


### Admin Dashboard

1. **Node.js and npm**: Make sure both Node.js and npm are installed.
2. Navigate to the `dashboard` directory:
   ```bash
   cd dashboard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy and configure the example config file:
   ```bash
   cp src/example.config.js src/config.js
   # Then edit src/config.js and update the URL values as needed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

> **Note:**  
> To log in to the frontend, you must first create a user via the backend CLI as described above.  
> The frontend only supports login; there are no sign up or forgot password options.  
> **You need to run the React dashboard separately from the Go application.** The Go backend and the React dashboard are separate services and must be started and managed independently.

## Makefile Usage

This project includes a `Makefile` for managing common Go project tasks.

### Build and Test All

Run build and tests:
```bash
make all
```

### Build the API & Blog 

Build the main API application:
```bash
make build
```

### Run the API & Blog 

Run the server:
```bash
./blog
```
or you can also pass the config file from a custom location:
```bash
./blog --conf .blog.yaml
```

### Build the CLI

Build the CLI tool:
```bash
make build-cli
```

### Run the CLI

Run the CLI tool (shows help):
```bash
./blog_cli --help
```

### Generate Code (e.g., Templates)

Generate Go code from templates or other files:
```bash
make gen
```

### Lint the Codebase

Run the linter:
```bash
make lint
```

### Run Tests

Run all tests:
```bash
make test
```

### Clean Up Binaries

Remove compiled binaries:
```bash
make clean
```

### Build the Docker Image

Build the Docker image for your project:
```bash
make build-docker
```

After building the Docker image, you can run the container with:
```bash
docker run -p 8080:8080 -v $(pwd)/.blog.yaml:/app/.blog.yaml myblog --conf /app/.blog.yaml
```
- Adjust the ports and config path as needed for your setup.
- Make sure `.blog.yaml` is available in your working directory and is mounted into the container.


### Help

Show all available make targets:
```bash
make help
```

---

**Note:**  
- Replace `./blog_cli` and `./blog` with the actual output binary names if you change the `BINARY_NAME` or `CLI_BINARY_NAME` variables in the `Makefile`.

---

## Contributing 🤝

Contributions are welcome! Feel free to open issues or submit pull requests.

## License 📜

This project is licensed under the MIT License.
