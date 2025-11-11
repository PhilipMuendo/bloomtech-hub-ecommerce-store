-- SQL script to update featured status
-- Run this in your MySQL database

-- Set all products to NOT featured
UPDATE Products SET featured = false;

-- Set only ABB Tmax 4P MCCB 250A to featured
UPDATE Products SET featured = true WHERE id = 25;

-- Verify the changes
SELECT id, name, featured FROM Products WHERE featured = true;
