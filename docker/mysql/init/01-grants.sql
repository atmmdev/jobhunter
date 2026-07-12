-- Grants required for local Prisma Migrate (shadow database).
GRANT CREATE, ALTER, DROP, INDEX, REFERENCES, SELECT, INSERT, UPDATE, DELETE
  ON *.* TO 'jobhunter'@'%';
FLUSH PRIVILEGES;
