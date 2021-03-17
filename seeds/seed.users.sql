BEGIN;
INSERT INTO users (username, name, password, date_created) VALUES
('demo_user', 'Chandler Bing', '$2a$12$hVhw0jpNjfDrquuBQVGnT.Ye64IWHbG9eTtlQWDyQqXFfDEo2dwUK', '2021-03-16T04:34:56.582Z');

COMMIT;