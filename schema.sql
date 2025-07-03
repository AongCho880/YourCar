-- Create the 'cars' table
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    mileage NUMERIC NOT NULL,
    condition TEXT NOT NULL,
    features TEXT[],
    description TEXT,
    images TEXT[],
    isSold BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the 'reviews' table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    email TEXT,
    occupation TEXT,
    is_testimonial BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Create the 'complaints' table
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT,
    details TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Create the 'admin_settings' table for contact details
CREATE TABLE admin_settings (
    id INTEGER PRIMARY KEY,
    whatsapp_number TEXT,
    messenger_link TEXT,
    facebook_page_link TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert a default row for admin_settings
INSERT INTO admin_settings (id, whatsapp_number, messenger_link) VALUES (1, 'your_whatsapp_number', 'your_messenger_link');

-- Create a storage bucket for car images
INSERT INTO storage.buckets (id, name, public) VALUES ('car-images', 'car-images', true);

-- Set up Row Level Security (RLS)

-- Enable RLS for all tables
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policies for 'cars' table
CREATE POLICY "Allow public read access on cars" ON cars FOR SELECT USING (true);
CREATE POLICY "Allow admin write access on cars" ON cars FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Policies for 'reviews' table
CREATE POLICY "Allow public read access on reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow insert for anyone on reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update/delete on reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Policies for 'complaints' table
CREATE POLICY "Allow insert for anyone on complaints" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read/update/delete on complaints" ON complaints FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Policies for 'admin_settings' table
CREATE POLICY "Allow public read access on admin_settings" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin write access on admin_settings" ON admin_settings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Policies for 'car-images' storage bucket
CREATE POLICY "Allow public read access on car-images" ON storage.objects FOR SELECT USING (bucket_id = 'car-images');
CREATE POLICY "Allow admin write access on car-images" ON storage.objects FOR ALL USING (bucket_id = 'car-images' AND auth.role() = 'authenticated');

-- Car Brand Table
CREATE TABLE car_brand (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Seed with some initial brands
INSERT INTO car_brand (name) VALUES
('Toyota'), ('Honda'), ('Ford'), ('BMW'), ('Mercedes-Benz'), ('Audi'), ('Nissan'), ('Volkswagen'), ('Hyundai'), ('Kia'), ('Subaru'), ('Mazda'), ('Lexus'), ('Chevrolet'), ('Jeep'), ('Volvo'), ('Porsche'), ('Land Rover'), ('Jaguar'), ('Tesla');

-- Insert example reviews
INSERT INTO reviews (name, rating, comment, email, occupation, is_testimonial, submitted_at)
VALUES
('Alice Johnson', 5, 'Fantastic experience! The process was smooth and the team was very helpful.', 'alice.johnson@example.com', 'Student', true, NOW()),
('Bob Smith', 4, 'Great selection of cars and excellent customer service.', 'bob.smith@company.com', 'Co-founder', true, NOW()),
('Cynthia Lee', 5, 'I found my dream car here. Highly recommended!', 'cynthia.lee@gmail.com', 'Chairman', true, NOW()),
('David Kim', 3, 'The platform is good, but I wish there were more filter options.', 'david.kim@startup.io', 'Entrepreneur', false, NOW()),
('Emily Brown', 5, 'Super easy to use and I got a great deal. Will use again!', 'emily.brown@edu.org', 'Graduate Student', true, NOW());
