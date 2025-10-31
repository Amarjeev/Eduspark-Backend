# 🧠 **EduSpark Backend – School Management Platform**

## 👨‍💻 **Author**
**Amarjeev**

---

## 🏫 **Project Overview**
The **EduSpark Backend** powers the **School Management Platform**, handling secure authentication, data processing, and communication between the database and frontend dashboard.
It’s built with **Node.js, Express.js, and MongoDB**, ensuring performance, scalability, and security.

This backend manages all operations for **Admins, Teachers, and Students**, providing a seamless API layer for the EduSpark client dashboard.

---

## 🚀 **About This Project**
This is my **first backend project** — a major step in my learning journey.
I know there are still **bugs and performance improvements** to be made, but every step taught me something new.
My goal is to make the **next version faster, cleaner, and smarter.**
> 💡 *Every error I fix takes me one step closer to mastery.*

---

## ⚙️ **Core Features**
- 🔐 **JWT Authentication** (Secure login for users)
- 🧑‍🏫 **Role-based Access Control** (Admin, Student, Superadmin)
- 📧 **Email Notifications** via **Brevo API**
- ☁️ **File & Image Storage** using **AWS S3**
- 🗄️ **MongoDB Atlas Integration** for scalable database management
- 🧰 **API Architecture** built with RESTful design principles
- 🔒 **Environment Variables** for security and configuration
- 🌍 **Deployed** on **Render (Backend)** with **Cloudflare SSL & Domain**

---

## 🧩 **Tech Stack**

**Backend:**
- Node.js
- Express.js
- MongoDB Atlas
- Brevo (Email Service)
- AWS SDK (for S3 storage)

**Deployment & Tools:**
- Render (Backend Hosting)
- Cloudflare (DNS & SSL)
- Postman (API Testing)

---

## 🔁 **API Flow**
1. **Frontend (React)** sends secure requests using Axios.
2. **Backend (Express)** validates requests with JWT.
3. **MongoDB Atlas** stores and retrieves data.
4. **AWS S3** manages image uploads.
5. **Brevo** sends email notifications.

---

## ⚙️ **Environment Variables – EduSpark Backend**

Create a `.env` file in the root directory of your **backend** project and configure the following:

```env
# 🌍 Environment
NODE_ENV=development

# 🍃 MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# 🔐 JWT Authentication
JWT_KEY=your_jwt_secret_key

# ☁️ AWS Configuration (Shared for S3 and SES)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1
SES_SENDER_EMAIL=no-reply@eduspark.space

# 🗂️ AWS S3 Bucket
S3_BUCKET=eduspark-image-storage

# ⚡ Upstash Redis (for caching & sessions)
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# 📧 Brevo (Email Notifications)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@eduspark.space
```

---

### 🧾 **Notes & Best Practices**
- 🚫 **Never commit your `.env` file** — always include it in your `.gitignore`.
- 🔒 Keep all API keys and secrets private.
- 🌱 For production environments (like Render or AWS EC2), store these as **environment variables** in your platform dashboard.
- 🧠 Keep different `.env` files for **development**, **staging**, and **production**.
- 🛠️ If you change any keys (e.g., Brevo or AWS), redeploy the backend to load updated configs.

---

## 🧠 **Learning & Motivation**
This project was not just code — it was **learning in action**.
Every error, deployment failure, and bug fix helped me understand real-world backend development.

> 🗣️ *“Great things take time — and every step forward is a victory.”*
>
> I’ll continue improving EduSpark in the next version — optimizing APIs, improving performance, and building cleaner architecture.

---

## 🌐 **Deployment Info**
- **Backend:** Hosted on **Render**
- **Database:** **MongoDB Atlas**
- **File Storage:** **AWS S3**
- **SSL & Domain:** Managed by **Cloudflare**
- **Frontend Integration:** Connected with EduSpark Frontend via REST API

---

## 💬 **Final Words**
EduSpark is my **first complete MERN project**, a symbol of growth and dedication.
It’s not perfect — but it’s **real, functional, and full of lessons.**

> 🌟 *From zero to deployment — this is just the beginning.*
