## Suminfinity Product Manager

A Node.js + Express website for uploading and managing products, supporting CSV/XLSX imports, user auth, and more.

### Setup

1. `npm install`
2. `node index.js`
3. Visit `http://localhost:3000`


# SumInfinity Product Listing Platform

A Node.js + Express web application where users can upload, manage, and filter product listings using CSV/XLSX files and images. Features full authentication, user roles, search filters, and a clean interface.

## Features

- ✅ User registration & login with sessions
- ✅ User roles (admin vs regular user)
- ✅ Product CRUD (Create, Read, Update, Delete)
- ✅ Upload products via CSV/XLSX file
- ✅ Upload product images
- ✅ View all products with filters by:
  - Name
  - Type
  - Size
  - Color
  - Price
- ✅ "My Products" view (for logged-in users)
- ✅ Server-rendered views using EJS
- ✅ SQLite database
- ✅ Basic styling with CSS
- ✅ Clean UX: validations, messages, redirects

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm
- Git

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/mutako/suminfinity.git
   cd suminfinity
