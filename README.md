# Shastik Fashions Backend

## Project Description

This is the backend for Shastik Fashions, an e-commerce platform. It provides a robust and secure API for managing users, products, categories, shopping carts, wishlists, orders, and payments. Built with Node.js, Express, and TypeScript, it integrates with MongoDB for data storage and Razorpay for payment processing.

## Features

-   **User Authentication & Authorization:** Secure user registration and login using JWT (JSON Web Tokens) and `bcryptjs` for password hashing. Role-based access control for admin functionalities.
-   **Category Management:** CRUD operations for product categories (admin only).
-   **Product Management:** CRUD operations for products, including multiple image uploads using `Multer`. Supports pagination and filtering for product listings.
-   **Shopping Cart:** Add, view, and remove items from a user's shopping cart.
-   **Wishlist:** Add, view, and remove items from a user's wishlist.
-   **Order Management:** Create orders after successful payment, view user-specific orders, and update order statuses (admin only).
-   **Payment Integration:** Seamless integration with Razorpay for creating orders and verifying payments.
-   **Security Enhancements:** Implements `helmet` for setting secure HTTP headers and `express-rate-limit` to prevent brute-force attacks.
-   **Centralized Error Handling:** Standardized JSON error responses for consistent API feedback.
-   **API Logging:** A custom logger middleware to track API requests with timestamps and methods.
-   **Pagination Utility:** Reusable utility for handling paginated data retrieval.
-   **API Response Standardization:** Consistent JSON response format across all API endpoints.
-   **Request Body Validation:** Uses `Joi` for robust validation of incoming request bodies.

## API Routes

All API routes are prefixed with `/api`.

### Authentication

-   `POST /api/auth/register`: Register a new user.
-   `POST /api/auth/login`: Log in a user and receive a JWT token.

### Categories (Admin Only for POST, PUT, DELETE)

-   `POST /api/categories`: Create a new category.
-   `GET /api/categories`: Get all categories.
-   `PUT /api/categories/:id`: Update a category by ID.
-   `DELETE /api/categories/:id`: Delete a category by ID.

### Products (Admin Only for POST, PUT, DELETE)

-   `POST /api/products`: Create a new product (supports `multipart/form-data` for image uploads).
-   `GET /api/products`: Get all products (supports pagination, filtering by category, and search).
    -   Query parameters: `page`, `limit`, `category`, `search`.
-   `GET /api/products/:id`: Get a single product by ID.
-   `PUT /api/products/:id`: Update a product by ID (supports `multipart/form-data` for image uploads).
-   `DELETE /api/products/:id`: Delete a product by ID.

### Cart (Authenticated Users Only)

-   `POST /api/cart`: Add an item to the user's cart.
-   `GET /api/cart`: Get all items in the user's cart.
-   `DELETE /api/cart/:id`: Remove an item from the user's cart by cart item ID.

### Wishlist (Authenticated Users Only)

-   `POST /api/wishlist`: Add an item to the user's wishlist.
-   `GET /api/wishlist`: Get all items in the user's wishlist.
-   `DELETE /api/wishlist/:id`: Remove an item from the user's wishlist by wishlist item ID.

### Orders (Authenticated Users Only; Admin Only for `getAllOrders` and `updateOrderStatus`)

-   `POST /api/orders`: Create a new order (typically after successful payment verification).
-   `GET /api/orders`: Get all orders for the authenticated user.
-   `GET /api/orders/admin`: Get all orders (Admin only).
-   `PUT /api/orders/:id/status`: Update the status of an order by ID (Admin only).

### Payments (Authenticated Users Only)

-   `POST /api/payment/order`: Create a new Razorpay order.
-   `POST /api/payment/verify`: Verify a Razorpay payment signature.

## Environment Setup

### Prerequisites

-   Node.js (v14 or higher)
-   npm (Node Package Manager)
-   MongoDB (local installation or cloud service like MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd shastik-fashion-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create `.env` file:**
    Create a `.env` file in the root directory of the project based on `.env.example`.

    ```
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/shastik_fashion
    JWT_SECRET=your_jwt_secret_key
    JWT_EXPIRE=1h
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    ```

    -   `PORT`: The port on which the server will run.
    -   `MONGO_URI`: Your MongoDB connection string.
    -   `JWT_SECRET`: A strong, secret key for signing JWTs.
    -   `JWT_EXPIRE`: Expiration time for JWTs (e.g., `1h`, `7d`).
    -   `RAZORPAY_KEY_ID`: Your Razorpay Key ID.
    -   `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret.

## Running the Application

### Development Mode (with hot-reloading)

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Technologies Used

-   **Backend:** Node.js, Express.js
-   **Language:** TypeScript
-   **Database:** MongoDB (with Mongoose ODM)
-   **Authentication:** JWT (jsonwebtoken), bcryptjs
-   **Image Uploads:** Multer
-   **Payment Gateway:** Razorpay
-   **Security:** Helmet, express-rate-limit
-   **Validation:** Joi
-   **Utilities:** dotenv

## Future Improvements

-   Implement comprehensive unit and integration tests.
-   Add Swagger/Redoc for interactive API documentation.
-   Implement caching mechanisms (e.g., Redis).
-   Integrate a dedicated logging library (e.g., Winston, Morgan).
-   Add more advanced filtering and sorting options for products and orders.
-   Implement user profile management APIs.
-   Set up CI/CD pipelines for automated deployments.

## AWS Lambda Deployment (Serverless Framework)

This project is compatible with AWS Lambda using the Serverless Framework. The repository already includes `src/lambda.ts`, a `serverless.yml` example, and a small change to reuse the Mongoose connection across invocations.

Notes and important caveats:
- The app uses `src/lambda.ts` as the exported Lambda handler (wraps the Express app with `serverless-http`).
- `src/config/db.ts` now caches the Mongoose connection in `global._mongoose` to reduce cold-start overhead and connection churn.
- For now uploads still use local `./uploads`. Lambda's local storage is ephemeral — files will not persist across invocations and are not recommended for production. You said you don't want S3 right now, so the current behavior remains unchanged; consider moving to S3 later.

Quick deploy steps (Serverless Framework):

1. Install Serverless CLI and optionally `serverless-offline` for local testing:

```bash
npm i -g serverless
npm i --save-dev serverless-offline
```

2. Configure AWS credentials (usual `aws configure` or environment variables).

3. Build and deploy locally or to dev stage:

```bash
npm run build
npx serverless deploy --stage dev
```

4. Local testing with offline plugin:

```bash
npx serverless offline
```

CI/CD (GitHub Actions):

- A workflow is included at `.github/workflows/deploy.yml` that runs on pushes to `main` and `dev`, builds the project, and runs `serverless deploy --stage dev`.
- Required GitHub repository secrets (set these in the repo Settings → Secrets):
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION` (optional, defaults to `us-east-1`)
  - `MONGO_URI`
  - `JWT_SECRET`
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `NPM_TOKEN` (optional, only if installing private npm packages)

If you'd like, I can:
- Run a local test using `serverless offline` in your environment,
- Or help you set up the repository secrets and trigger a test deploy to `dev` from this repo.

