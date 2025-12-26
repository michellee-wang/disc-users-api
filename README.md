# disc users api

backend api for the disc project - a music-based social networking platform for college students.

## endpoints

### authentication
- `POST /auth/signup` - create new account
- `POST /auth/login` - login with existing account

### users
- `GET /users` - get all users
- `POST /users/save` - save a user connection
- `GET /users/:id/saved` - get saved users for a specific user

### spotify
- `POST /spotify/callback` - exchange spotify authorization code for user's top artists

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
PORT=3001
```
