module.exports = {
  apps: [
    {
      name: 'asset-backend',
      script: './src/server.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_HOST: 'localhost',
        DB_USER: 'root',
        DB_PASSWORD: 'bvdktnBD@152',
        DB_NAME: 'asset_management',
        DB_PORT: 3306
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
