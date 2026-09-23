const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./prisma/dev.db';
}
if (!process.env.TURSO_DATABASE_URL) {
  process.env.TURSO_DATABASE_URL = 'libsql://aurevo-dizibrandmedia-del.aws-ap-south-1.turso.io';
}
if (!process.env.TURSO_AUTH_TOKEN) {
  process.env.TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTAxMDQyMDksImlkIjoiMDFhMGNhODYtMmIwMS03MTJjLWI1YTYtMDMxZjNkOWUzZmQ5Iiwia2lkIjoibXpldXhwVzJ0aDZNUG1KVzRxQlB6LUhCTHlMaWw0VXVOX2dCeUJoQTQzWSIsInJpZCI6IjE5YjVkYjYyLTc0NjQtNDQxOS1hNjRhLWQ5YTZmOTM1ZDkwMiJ9.rNllR5H5zSYS58o_PGw-IgJRS49MGreKioPh-D6L48dOJNKfDNlGkF3EOpOdL0HTmKAnNb5RJ5VY87BJkySeAA';
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
    .once('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> AUREEVO Maison Production Server ready on http://${hostname}:${port}`);
    });
});
