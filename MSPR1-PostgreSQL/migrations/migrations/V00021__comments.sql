CREATE TABLE comments (
  "id" SERIAL PRIMARY KEY,
  "content" VARCHAR(255) NOT NULL,
  "user_id" INT REFERENCES users(id) ON DELETE CASCADE,
  "post_id" INT REFERENCES posts(id) ON DELETE CASCADE,
  "created_at" TIMESTAMP DEFAULT (NOW()),
  "updated_at" TIMESTAMP DEFAULT (NOW())
);

CREATE TABLE user_like_comments (
    "user_id" INT REFERENCES users(id) ON DELETE CASCADE,
    "comment_id" INT REFERENCES comments(id) ON DELETE CASCADE,
);