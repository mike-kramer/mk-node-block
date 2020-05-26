// src/config/config.service.ts
import {TypeOrmModuleOptions} from '@nestjs/typeorm';
import {join} from "path";

require('dotenv').config();

class ConfigService {

    constructor(private env: { [k: string]: string | undefined }) {
    }

    getValue(key: string, throwOnMissing = true): string {
        const value = this.env[key];
        if (!value && throwOnMissing) {
            throw new Error(`config error - missing env.${key}`);
        }

        return value;
    }

    public ensureValues(keys: string[]) {
        keys.forEach(k => this.getValue(k, true));
        return this;
    }

    public getPort() {
        return this.getValue('PORT', true);
    }

    public isProduction() {
        const mode = this.getValue('MODE', false);
        return mode != 'DEV';
    }

    public getTypeOrmConfig(includeMigrations = false): TypeOrmModuleOptions {
        let config = {
            type: 'mysql',

            host: this.getValue('MYSQL_HOST'),
            port: parseInt(this.getValue('MYSQL_PORT')),
            username: this.getValue('MYSQL_USER'),
            password: this.getValue('MYSQL_PASSWORD'),
            database: this.getValue('MYSQL_DATABASE'),

            entities: [join(__dirname, "..") + '/**/*.entity{.ts,.js}'],

        };
        if (includeMigrations) {
            config = Object.assign(config, {
                migrationsTableName: 'migration',

                migrations: ['src/migration/*.ts'],

                cli: {
                    migrationsDir: 'src/migration',
                }
            });
        }
        return config as TypeOrmModuleOptions;
    }

}

const configService = new ConfigService(process.env)
    .ensureValues([
        'MYSQL_HOST',
        'MYSQL_PORT',
        'MYSQL_USER',
        'MYSQL_PASSWORD',
        'MYSQL_DATABASE',
        "JWT_SECRET",
        "RECAPTCHA_SECRET"
    ]);

export {configService};