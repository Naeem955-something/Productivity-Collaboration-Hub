-- Productivity Hub Database Setup Script
-- This SQL file will create the complete database schema for the task manager application

-- Drop existing database if it exists (optional - comment out if you want to keep existing data)
-- DROP DATABASE IF EXISTS productivity_hub;

-- Create the database
CREATE DATABASE IF NOT EXISTS productivity_hub;
USE productivity_hub;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  active BIT NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  avatar_url VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  password VARCHAR(255),
  title VARCHAR(255),
  role ENUM('ADMIN', 'MEMBER') DEFAULT 'MEMBER'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  description VARCHAR(255),
  name VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Team Members (Many-to-Many)
CREATE TABLE IF NOT EXISTS team_members (
  team_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  end_date DATE,
  start_date DATE,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  team_id BIGINT,
  description VARCHAR(255),
  name VARCHAR(255),
  status VARCHAR(255),
  FOREIGN KEY (team_id) REFERENCES teams(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  due_date DATE,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  project_id BIGINT,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  description VARCHAR(255),
  title VARCHAR(255),
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  status ENUM('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE') DEFAULT 'TODO',
  FOREIGN KEY (project_id) REFERENCES projects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Task Assignees (Many-to-Many)
CREATE TABLE IF NOT EXISTS task_assignees (
  task_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (task_id, user_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Task Tags
CREATE TABLE IF NOT EXISTS task_tags (
  task_id BIGINT NOT NULL,
  tags VARCHAR(255),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  current_value INT NOT NULL DEFAULT 0,
  target_value INT NOT NULL DEFAULT 100,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  owner_id BIGINT,
  team_id BIGINT,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  description VARCHAR(255),
  title VARCHAR(255),
  status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED') DEFAULT 'NOT_STARTED',
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  project_id BIGINT,
  sender_id BIGINT,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  channel VARCHAR(255),
  content VARCHAR(255),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  read_flag BIT NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  recipient_id BIGINT,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  link VARCHAR(255),
  message VARCHAR(255),
  type ENUM('TASK', 'SYSTEM', 'DEADLINE', 'MESSAGE') DEFAULT 'SYSTEM',
  FOREIGN KEY (recipient_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  archived BIT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  last_edited_by_id BIGINT,
  project_id BIGINT,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  title VARCHAR(255),
  content LONGTEXT,
  FOREIGN KEY (last_edited_by_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  project_id BIGINT,
  size_in_bytes BIGINT NOT NULL DEFAULT 0,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  content_type VARCHAR(255),
  name VARCHAR(255),
  storage_path VARCHAR(255),
  FOREIGN KEY (project_id) REFERENCES projects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- File Versions table
CREATE TABLE IF NOT EXISTS file_versions (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  file_item_id BIGINT,
  size_in_bytes BIGINT NOT NULL DEFAULT 0,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  uploaded_by_id BIGINT,
  storage_path VARCHAR(255),
  version_label VARCHAR(255),
  FOREIGN KEY (file_item_id) REFERENCES files(id),
  FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  action VARCHAR(255),
  details VARCHAR(255),
  severity VARCHAR(255),
  FOREIGN KEY (actor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify database creation
SHOW DATABASES;
USE productivity_hub;
SHOW TABLES;
