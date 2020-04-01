
module.exports = {
    apps: [
        {
            name: 'currencies-service',
            script: './app.js',
            env: {
                COMMON_VARIABLE: 'true',
                PORT: '8001',
            },
            env_production: {
                NODE_PATH: '.',
                NODE_ENV: 'production',
            },
            env_staging: {
                NODE_ENV: 'staging',
            },
        },
    ],
    deploy: {
        production: {
            user: 'admin',
            host: '157.230.93.18',
            ref: 'origin/master',
            repo: 'git@github.com:Waiviogit/currencies-service.git',
            path: '/home/admin/currencies-service',
            'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js --env production',
        },
        staging: {
            user: 'teamcity',
            host: '35.157.207.192',
            ref: 'origin/staging',
            repo: 'git@github.com:Waiviogit/currencies-service.git',
            path: '/home/teamcity/currencies-service',
            'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js --env staging',
        },
    },
};
