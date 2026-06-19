CREATE TABLE posts (
  "id" SERIAL PRIMARY KEY,
  "content" VARCHAR(255) NOT NULL,
  "user_id" INT REFERENCES users(id) ON DELETE CASCADE,
  "created_at" TIMESTAMP DEFAULT (NOW()),
  "updated_at" TIMESTAMP DEFAULT (NOW())
);

CREATE TABLE user_like_posts (
    "user_id" INT REFERENCES users(id) ON DELETE CASCADE,
    "post_id" INT REFERENCES posts(id) ON DELETE CASCADE,
);