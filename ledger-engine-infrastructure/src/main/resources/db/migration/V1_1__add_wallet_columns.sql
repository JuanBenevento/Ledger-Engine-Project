-- V1_1: Add wallet columns to accounts table
ALTER TABLE accounts ADD COLUMN user_id varchar(255);
ALTER TABLE accounts ADD COLUMN wallet_type varchar(50);
ALTER TABLE accounts ADD COLUMN name varchar(255);