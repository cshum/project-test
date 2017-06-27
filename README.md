# Project Test

### Prerequisites

* Node.js installed (v6+ recommended)
* MongoDB installed

### Installation

Copy default config file

```bash
cp config.default.json config.json
```

Override default port number and MongoDB connection. 

Install Gulp and Node modules, start Gulp.

If all goes well navigate to http://localhost:8888 (default port number)

```bash
cd project-test
npm install -g gulp
npm install
gulp start
```

Build assets

```bash
gulp build
node server.js
```

### REST API

```
GET  /api/login               login by email, password
GET  /api/signup              signup by email, password
```

Retrieve access `token` via login or signup.

Below auth required APIs, require header `Authorization: Bearer {token}`

```
GET  /api/projects                list projects
POST /api/projects                create project
GET  /api/projects/:project_id    view project by id
PUT  /api/projects/:project_id    update project by id
GET  /api/me                  view self info
PUT  /api/me                  update self info
POST /api/token               extend auth token
```