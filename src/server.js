const express = require("express");
const cors = require("cors");
const { pool, supabase } = require("./config");

require("dotenv").config();

const app = express();

app.use(cors({
  origin: ['https://disc-app-five.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// POST /auth/signup
app.post("/auth/signup", async (req, res) => {
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    bio, 
    major, 
    graduationYear, 
    topArtists, 
    profilePicture 
  } = req.body;
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // add them to users table
    if (data.user) {
      const { error: insertError } = await supabase
        .from("users")
        .insert([{ 
          first_name: firstName, 
          last_name: lastName, 
          email: email,
          bio: bio,
          major: major,
          graduation_year: graduationYear,
          top_artists: topArtists,
          profile_picture: profilePicture
        }]);
      
      if (insertError) {
        console.error("Error inserting into public users:", insertError.message);
      }
    }

    res.status(201).json({ message: "User created successfully", user: data.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /auth/login - login as an existing user
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json({ message: "Login successful", session: data.session });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// --- User Routes ---
app.get("/users", async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("*");

    if (error) throw error;
    
    const formattedUsers = users.map(user => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      bio: user.bio,
      major: user.major,
      graduationYear: user.graduation_year,
      topArtists: user.top_artists,
      profilePicture: user.profile_picture
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Saved Users Routes ---

// POST /users/save - Save another user
app.post("/users/save", async (req, res) => {
  const { userId, savedUserId } = req.body;
  try {
    const { data, error } = await supabase
      .from("saved_users")
      .insert([{ user_id: userId, saved_user_id: savedUserId }])
      .select();

    if (error) throw error;

    res.status(201).json({ message: "User saved successfully", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /users/:id/saved - Get all users saved by a specific user
app.get("/users/:id/saved", async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("saved_users")
      .select(`
        saved_user_id,
        saved_user:users!saved_user_id (*)
      `)
      .eq("user_id", id);

    if (error) throw error;

    const savedUsers = data.map(item => ({
      id: item.saved_user.id,
      firstName: item.saved_user.first_name,
      lastName: item.saved_user.last_name,
      email: item.saved_user.email,
      bio: item.saved_user.bio,
      major: item.saved_user.major,
      graduationYear: item.saved_user.graduation_year,
      topArtists: item.saved_user.top_artists,
      profilePicture: item.saved_user.profile_picture
    }));

    res.json(savedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /spotify/callback 
app.post("/spotify/callback", async (req, res) => {
  const { code } = req.body;
  
  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://disc-app-five.vercel.app/signup'
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }
    
    // Get user profile (includes profile picture)
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const profileData = await profileResponse.json();
    
    if (profileData.error) {
      throw new Error(profileData.error.message || 'Failed to get user profile');
    }
    
    // Get profile picture (use the first/largest image)
    const profilePicture = profileData.images && profileData.images.length > 0 
      ? profileData.images[0].url 
      : null;
    
    // Get top 3 artists
    const artistsResponse = await fetch('https://api.spotify.com/v1/me/top/artists?limit=3&time_range=medium_term', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const artistsData = await artistsResponse.json();
    
    if (artistsData.error) {
      throw new Error(artistsData.error.message || 'Failed to get top artists');
    }
    
    const topArtists = artistsData.items.map(artist => artist.name);

    res.json({ topArtists, profilePicture });
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
