function exit(text) {
    if (text instanceof Error) {
        log.error(text.stack);
    } else {
        log.error(text);
    }
    throw new Error(text);
    process.exit(1);
}

var knex = require('knex')({
    client: process.env.DB_DRIVER,
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        charset: process.env.DB_CHARSET
    }
});

var config = {directory: process._basePath + process.env.MIGRATIONS, tableName: 'migrations'};

module.exports._init = function (c) {

    c.command('migration:make')
        .description('Create new migration.')
        .arguments('<name>')
        .action(function (name) {

            knex.migrate.make(name, config).then(function () {
                log.info('Migration created successfully.');
                process.exit(0);
            }).catch(exit);

        });

    c.command('migrate')
        .description('Migrate application.')
        .action(function () {

            knex.migrate.latest(config).spread(function (batchNo, msg) {
                if (msg.length === 0) {
                    success('Migrations already up to date.');
                }
                log.info('${log.length} migrations processes under batch ${batchNo}: \n' + msg.join('\n'));
            }).catch(exit);

        });

    c.command('migration:rollback')
        .description('Rollback very last migrated batch.')
        .action(function () {

            knex.migrate.rollback().spread(function (batchNo, log) {
                if (log.length === 0) {
                    log.info('Already at the base migration.');
                    process.exit(0);
                }
                log.info('Batch ${batchNo} rolled back: ${log.length} migrations \n' + log.join('\n'));

            }).catch(exit);
        });


};


/*
 commander
 .command('migrate:currentVersion')
 .description('       View the current version for the migration.')
 .action(function () {
 pending = initKnex(env).migrate.currentVersion().then(function(version) {
 success(chalk.green('Current Version: ') + chalk.blue(version));
 }).catch(exit);
 });
 */