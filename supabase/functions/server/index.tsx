import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-796c8de3/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup Route
app.post("/make-server-796c8de3/signup", async (c) => {
  const { email, password, name } = await c.req.json();
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    return c.json({ error: "Server configuration error" }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true
  });

  if (error) {
    return c.json({ error: error.message }, 400);
  }
  return c.json(data);
});

// Bookmarks Routes
app.get("/make-server-796c8de3/bookmarks", async (c) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseKey) return c.json({ error: "Config error" }, 500);

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user } } = await supabase.auth.getUser(token);
  
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const prefix = `bookmark:${user.id}:`;
  const bookmarks = await kv.getByPrefix(prefix);
  return c.json(bookmarks);
});

app.post("/make-server-796c8de3/bookmarks", async (c) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseKey) return c.json({ error: "Config error" }, 500);

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user } } = await supabase.auth.getUser(token);
  
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { hotelId } = await c.req.json();
  const key = `bookmark:${user.id}:${hotelId}`;
  const value = { hotelId, addedAt: Date.now() };
  
  await kv.set(key, value);
  return c.json({ success: true });
});

app.delete("/make-server-796c8de3/bookmarks", async (c) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseKey) return c.json({ error: "Config error" }, 500);

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user } } = await supabase.auth.getUser(token);
  
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { hotelId } = await c.req.json();
  const key = `bookmark:${user.id}:${hotelId}`;
  
  await kv.del(key);
  return c.json({ success: true });
});

Deno.serve(app.fetch);
