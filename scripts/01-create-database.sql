-- Create database and tables for matrimonial site
CREATE DATABASE IF NOT EXISTS skc_matrimonial_site;
USE skc_matrimonial_site;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  plan_id INT AUTO_INCREMENT PRIMARY KEY,
  plan_name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  photo VARCHAR(255),
  contact VARCHAR(20),
  caste VARCHAR(50),
  location VARCHAR(100),
  state VARCHAR(200),
  gender ENUM('male', 'female') NOT NULL,
  age INT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_profile (user_id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  transaction_id VARCHAR(100) NOT NULL UNIQUE,
  screenshot VARCHAR(255),
  plan_id INT NOT NULL,
  payment_status ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(plan_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  match_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  matched_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (matched_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_match (user_id, matched_user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_caste ON profiles(caste);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_state ON profiles(state);
CREATE INDEX idx_profiles_age ON profiles(age);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_matches_user ON matches(user_id);
