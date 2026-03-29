/**
 * Dummy data for testing interview report generation.
 * Used with ai.service.js generateInterviewReport().
 */

// Dummy Resume - Senior Full-Stack Developer
const resume = `John Doe
Senior Full-Stack Developer
Email: john.doe@email.com | Phone: (123) 456-7890 | LinkedIn: linkedin.com/in/johndoe | Location: San Francisco, CA

PROFESSIONAL SUMMARY
Results-driven Senior Full-Stack Developer with 8+ years of experience building scalable web applications using modern JavaScript frameworks, Node.js, and cloud technologies. Expertise in React, Next.js, Express, MongoDB, and AWS. Proven track record of leading teams, optimizing performance, and delivering high-impact solutions. Passionate about clean code, DevOps, and mentoring junior developers.

TECHNICAL SKILLS
Frontend: React, Next.js, Redux, TypeScript, Tailwind CSS, Material-UI
Backend: Node.js, Express, NestJS, GraphQL, REST APIs
Database: MongoDB, PostgreSQL, Redis, DynamoDB
DevOps: Docker, Kubernetes, AWS (EC2, Lambda, S3), CI/CD (GitHub Actions)
Tools: Git, Jira, Figma, Postman

PROFESSIONAL EXPERIENCE
Senior Full-Stack Developer | TechCorp Inc. | San Francisco, CA | 2020 - Present
- Led development of microservices architecture serving 1M+ users, reducing latency by 40%.
- Implemented authentication system using JWT and OAuth2, improving security compliance.
- Optimized database queries resulting in 60% faster response times.
- Mentored 5 junior developers, conducting code reviews and pair programming sessions.

Full-Stack Developer | InnovateLabs | Remote | 2018 - 2020
- Built responsive e-commerce platform with React and Node.js, increasing conversion rates by 25%.
- Integrated third-party APIs (Stripe, SendGrid) for payments and notifications.
- Developed real-time chat feature using Socket.io and Redis.

Software Engineer | StartUpX | New York, NY | 2016 - 2018
- Created admin dashboard with data visualizations using D3.js and Chart.js.
- Migrated legacy PHP codebase to Node.js, cutting maintenance costs by 50%.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2016
- GPA: 3.8/4.0 | Relevant Coursework: Algorithms, Distributed Systems, Machine Learning

CERTIFICATIONS
- AWS Certified Solutions Architect - Associate (2023)
- Certified Kubernetes Administrator (CKA) (2022)`;

// Dummy Self Description - 1st person bio
const selfDescription = `I am a passionate Senior Full-Stack Developer with over 8 years of hands-on experience in building scalable, high-performance web applications from concept to production. My journey in software development began during my Computer Science studies at UC Berkeley, where I developed a strong foundation in algorithms, data structures, and software engineering principles.

Throughout my career, I've had the privilege of working on diverse projects across startups and established tech companies. At TechCorp, I led a team in architecting a microservices-based platform that handles millions of daily transactions with sub-second response times. I'm particularly proud of optimizing our search functionality, which involved complex Elasticsearch queries and caching strategies that reduced infrastructure costs by 35%.

What excites me most about software development is solving real-world problems through elegant, maintainable code. I thrive in collaborative environments and enjoy mentoring junior developers—I've conducted numerous code reviews and workshops that have helped teams adopt TypeScript and modern testing practices.

Technically, I'm proficient across the full stack: React/Next.js for dynamic UIs, Node.js/Express/NestJS for robust APIs, MongoDB/PostgreSQL for data persistence, and AWS/Docker/Kubernetes for deployment. I follow Test-Driven Development (TDD) and am committed to clean architecture patterns like Domain-Driven Design.

Outside of coding, I contribute to open-source projects, particularly in the React ecosystem, and enjoy hiking in the Bay Area. I'm always eager to learn emerging technologies like AI/ML integration and WebAssembly, and I'm excited about opportunities where I can make a meaningful impact on innovative products.`;

// Dummy Job Description
const jobDescription = `Senior Full-Stack Developer

About Us:
TechCorp is a fast-growing SaaS company revolutionizing project management for remote teams. Our platform powers 500K+ users worldwide with real-time collaboration, AI-driven insights, and seamless integrations.

Position Overview:
We are seeking an experienced Senior Full-Stack Developer to join our core engineering team. You will own end-to-end feature development, from designing scalable APIs to crafting intuitive React interfaces. This is a hands-on leadership role where you'll collaborate with product managers, designers, and fellow engineers to deliver exceptional user experiences.

Key Responsibilities:
- Design, build, and maintain RESTful/GraphQL APIs using Node.js (Express/NestJS preferred)
- Develop responsive, accessible UIs with React/Next.js, TypeScript, and modern state management (Redux/Zustand)
- Optimize application performance and scalability (caching, database indexing, CDN)
- Implement secure authentication/authorization (JWT, OAuth, RBAC)
- Write comprehensive unit/integration tests (Jest, React Testing Library)
- Deploy and manage applications on AWS (EC2, Lambda, RDS, S3) with Docker/Kubernetes
- Participate in code reviews, architecture discussions, and mentoring junior developers
- Collaborate on technical roadmaps and contribute to open-source initiatives

Required Qualifications:
- 5+ years of professional Full-Stack development experience
- Strong proficiency in JavaScript/TypeScript, React, Node.js
- Experience with relational (PostgreSQL) and NoSQL (MongoDB) databases
- Familiarity with cloud platforms (AWS/GCP/Azure) and containerization (Docker)
- Solid understanding of software design patterns, SOLID principles, and Clean Architecture
- Excellent problem-solving skills and attention to detail
- Strong communication skills and team player mindset

Preferred:
- Experience with GraphQL, WebSockets (Socket.io), or microservices
- Knowledge of CI/CD pipelines (GitHub Actions, Jenkins)
- Contributions to open-source projects or technical blogging
- Familiarity with AI/ML integration or serverless architectures

What We Offer:
- Competitive salary ($160K-$200K) + equity + benefits
- Fully remote, flexible hours
- Unlimited PTO and professional development budget
- Latest tech stack and collaborative culture
- Opportunity to impact millions of users

Tech Stack: React, Next.js, TypeScript, Node.js, NestJS, PostgreSQL, MongoDB, Redis, AWS, Docker, Kubernetes, GraphQL

If you're a builder at heart who loves crafting scalable systems and growing with a passionate team, we'd love to hear from you! Apply now.`;

module.exports = {
  resume,
  selfDescription,
  jobDescription,
};
