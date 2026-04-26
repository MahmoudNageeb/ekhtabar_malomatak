module.exports = {
  apps: [
    {
      name: 'ekhtabar',
      script: 'npm',
      args: 'start',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      error_file: './logs/err.log',
      out_file: './logs/out.log'
    }
  ]
};
