-- Users table schema
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    major VARCHAR(100),
    graduation_year INTEGER,
    top_artists TEXT[]
);
