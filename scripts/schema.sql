CREATE DATABASE IF NOT EXISTS learning_blog
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'learning_blog_user'@'localhost'
  IDENTIFIED BY 'change_me';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX, ALTER
  ON learning_blog.*
  TO 'learning_blog_user'@'localhost';

FLUSH PRIVILEGES;

USE learning_blog;

CREATE TABLE IF NOT EXISTS learning_posts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(220) NOT NULL,
  title VARCHAR(220) NOT NULL,
  summary VARCHAR(500) NOT NULL DEFAULT '',
  tags VARCHAR(500) NOT NULL DEFAULT '',
  content MEDIUMTEXT NOT NULL,
  published_at DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_learning_posts_slug (slug),
  KEY idx_learning_posts_published_at (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
