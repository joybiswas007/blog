# Blog

A personal blog built with Go & React.

---

## Getting Started

Follow these steps to set up the project for development or production.

---

## 1. Database Setup

1. **Install PostgreSQL**

2. **Create a Database**

3. **Run Migrations**  
   Install [migrate](https://github.com/golang-migrate/migrate) and apply migrations:
   ```bash
   migrate -path=./migrations -database="postgres://bloguser:yourpassword@localhost:5432/blogdb?sslmode=disable" up
   ```
   To roll back migrations:
   ```bash
   migrate -path=./migrations -database="postgres://bloguser:yourpassword@localhost:5432/blogdb?sslmode=disable" down
   ```

## Redis
Make sure redis is already installed and setuped as we're using redis for cacheing.
__Note__: Redis is **automatically configured** when using Docker Compose - no manual setup required:

---

## 2. Installation

You can run the blog with Docker or manually.

### Docker

1. **Prepare Environment Variables:**  
   - Copy `example.blog.yaml` to `.blog.yaml`
   - Copy `example.redis.conf` to `redis.conf`
   ```bash
    cp example.blog.yaml .blog.yaml
    cp example.redis.conf redis.conf
    # Edit .blog.yaml, redis.conf as you need
   ```
2. **Build and Start:**
   ```bash
   make build-docker
   ```
3. **Rebuild (if needed):**
   ```bash
   make re-build-docker 
   ```
4. **Stop:**
   ```bash
   make down-docker
   ```
- Ensure `.blog.yaml` is in your working directory and mounted into the container.
- Access the blog at [http://localhost:8080](http://localhost:8080).
- Login to access the dashboard at [http://localhost:8080/login](http://localhost:8080/login).

---

### Manual

#### Frontend

1. Install Node.js and npm.
2. In the `web` directory:
   ```bash
   cd web
   npm install
3. Start development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
- Access the frontend at [http://localhost:3001](http://localhost:3001).
- Login requires a user created via the backend CLI.
- Login to access the dashboard at [http://localhost:3001/login](http://localhost:3001/login).


#### Backend

1. Install Go 1.24+ and ensure it is in your PATH.
2. Copy and edit config:
   ```bash
   cp example.blog.yaml .blog.yaml
   cp example.redis.conf redis.conf
   ```
3. Build:
   ```bash
   make build
   ```
4. Run:
   ```bash
   ./blog --conf .blog.yaml
   ```
5. Build CLI tool:
   ```bash
   make build-cli
   ```
6. Manage users:
   ```bash
   ./blog_cli --help
   ./blog_cli --name 'Your Name' --email you@example.com --pass "Pass"
   ./blog_cli --email you@example.com --pass "newPass"
   ```
   - If no password is provided, a secure password is generated.

---

## Makefile

View available commands:
```bash
make help
```
- If you change `BINARY_NAME` or `CLI_BINARY_NAME` in the Makefile, update the binary names accordingly.

---

## Notes

- PostgreSQL and migrations must be set up before running the backend or Docker container.
- The frontend only supports login; registration must be done via the CLI.

---

## Contributing

Contributions are welcome. Open issues or submit pull requests.

---

## License

MIT License.
