-- Users table schema
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    major VARCHAR(100),
    graduation_year INTEGER,
    top_artists TEXT[],
    profile_picture TEXT
);

-- Sample data with random information
INSERT INTO users (first_name, last_name, email, bio, major, graduation_year, top_artists, profile_picture) VALUES
    ('Angelina', 'Xu', 'angelinaxu2029@u.northwestern.edu', 'Music lover and coffee addict ☕', 'Computer Science', 2025, ARRAY['Taylor Swift', 'Olivia Rodrigo', 'Sabrina Carpenter'], 'https://i.postimg.cc/vBp7jJC6/Image-from-Pinterest.jpg'),
    ('Maggie', 'Yuan', 'maggieyuan2029@u.northwestern.edu', 'Always got my headphones on 🎧', 'Business Administration', 2024, ARRAY['Drake', 'Travis Scott', '21 Savage'], 'https://i.postimg.cc/vBp7jJC6/Image-from-Pinterest.jpg'),
    ('Sophia', 'Wang', 'sophiawang8590@gmail.com', 'Indie vibes only ✨', 'Psychology', 2026, ARRAY['Arctic Monkeys', 'The Neighbourhood', 'Hozier'], 'https://i.postimg.cc/vBp7jJC6/Image-from-Pinterest.jpg');