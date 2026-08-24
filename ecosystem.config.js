module.exports = {
  apps: [
    {
      name: 'asset-backend',
      script: './src/server.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
