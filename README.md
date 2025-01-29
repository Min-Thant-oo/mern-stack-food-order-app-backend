# MERN Stack Backend

A Node.js/Express backend application with MongoDB database integration, featuring Auth0 authentication and Cloudinary for image handling.

## Prerequisites

- Node.js (22.10.5)
- npm or yarn
- MongoDB Atlas account
- Auth0 account and API setup
- Cloudinary account

## Environment Setup

1. Create a `.env` file in the root directory
2. Add the following environment variables:

```env
MONGODB_CONNECTION_STRING=your_mongodb_connection_string
AUTH0_AUDIENCE=your_auth0_audience
AUTH0_ISSUER_BASE_URL=your_auth0_issuer_url
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Min-Thant-oo/mern-stack-food-order-app-backend.git [folder-name]
cd [folder-name]
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The server will start running at `http://localhost:7000`

## Configuration

### MongoDB Setup
1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Click "Connect" and select "Connect your application"
4. Copy the connection string and replace `<password>` with your database user password
5. Add the connection string to your `.env` file as `MONGODB_CONNECTION_STRING`

### Auth0 Setup
1. Go to Auth0 dashboard
2. Navigate to "APIs" section
3. Create a new API or select existing one
4. Copy the "API Identifier" (this is your `AUTH0_AUDIENCE`)
5. The `AUTH0_ISSUER_BASE_URL` will be in the format: `https://your-auth0-domain.region.auth0.com`
6. You can check frontend installation steps [here](https://github.com/Min-Thant-oo/mern-stack-food-order-app-frontend)

### Cloudinary Setup
1. Create a Cloudinary account at https://cloudinary.com
2. Go to your Cloudinary dashboard
3. Find your account details:
   - Copy your Cloud Name as `CLOUDINARY_CLOUD_NAME`
   - Copy your API Key as `CLOUDINARY_API_KEY`
   - Copy your API Secret as `CLOUDINARY_API_SECRET`

## Tech Stack

- Node.js + Express
- MongoDB
- Auth0 Authentication
- Cloudinary Image Storage
- TypeScript

Check out live demo [here](https://solareats.minthantoo.com).

Check out backend health demo [here](https://solareatsbackend.minthantoo.com/health)

Sign in using the following credentials:

email - test@test.com

password - Password@1