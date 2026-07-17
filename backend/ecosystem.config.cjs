module.exports = {
    apps: [
        {
            name: "backend",
            script: "./server.js",
            node_args: "-r dotenv/config",
            watch: false,
            instances: 1,
            autorestart: true,
            max_memory_restart: "1G",
            env: {
                NODE_ENV: "production",
                LOADED_BY_PM2: "true"
            },
            env_production: {
                NODE_ENV: "production",
                LOADED_BY_PM2: "true"
            },
            env_development: {
                NODE_ENV: "development",
                LOADED_BY_PM2: "true"
            },
            error_file: "./logs/backend-error.log",
            out_file: "./logs/backend-out.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            merge_logs: true,
            time: true
        }
    ]
};
