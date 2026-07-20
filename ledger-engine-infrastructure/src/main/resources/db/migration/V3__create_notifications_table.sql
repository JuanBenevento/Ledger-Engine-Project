-- V3: Create notifications table
CREATE TABLE notifications (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    type varchar(50) NOT NULL,
    title varchar(255) NOT NULL,
    message text NOT NULL,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL,
    version bigint,
    CONSTRAINT pk_notifications PRIMARY KEY (id)
);

-- Index for user inbox queries
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);
