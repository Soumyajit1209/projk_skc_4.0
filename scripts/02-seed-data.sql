-- Insert sample plans
INSERT INTO plans (plan_name, price, description) VALUES
('Basic', 999.00, 'Basic matrimonial plan with limited matches'),
('Premium', 1999.00, 'Premium plan with more matches and features'),
('Gold', 2999.00, 'Gold plan with unlimited matches and priority support'),
('Platinum', 4999.00, 'Platinum plan with all features and personal matchmaker');

-- Insert default admin
INSERT INTO admins (username, password_hash, email) VALUES
('admin', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kOqZ8kHp0rQZ8kHp0rQZ8kHp0rQZ8kHp0r', 'admin@matrimonial.com');
