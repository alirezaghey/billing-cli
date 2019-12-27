import * as fs from 'fs'
import chalk from 'chalk'

export function cli(args) {
    // parse arguments
    const operation = parseArguments(args);
    // load from store
    const store = require("./store.json")

    // perform billing
    if (operation.type == 'bill') {
        const currentUser = store.find(item => item.id === Number(operation.userId))
        // check if user exists
        if (!currentUser) {
            throw new Error(`No user with id ${operation.userId}`);
        }
        // check current user can be billed
        if (currentUser.canWithdraw && currentUser.balance >= Number(operation.amount)) {
            // update user balance
            currentUser.balance -= operation.amount;
            currentUser.canWithdraw = !(currentUser.amount === 0);

            // update store with new user data to reflect the current amount
            fs.writeFile(`${__dirname}/store.json`, JSON.stringify(store), function(err) {
                if (err) {
                    throw new Error(err.message)
                }
                console.log(chalk.greenBright(`Successfully billed ${currentUser.name} ${operation.amount}`));
            })
        } else {
            throw new Error(`Unable to bill ${currentUser.name}`)
        }
    }
}

function parseArguments(args) {
    args.splice(0, 2)
    const operation = {
        type: args[0]
    }
    args.forEach(arg => {
        if (arg.includes('--id')) {
            const userId = Number(args[args.indexOf(arg) + 1]);
            if (Number.isNaN(userId)) {
                throw new Error('Item after `id` must be a number');
            }
            operation.userId = userId;
        }
        if (arg.includes('--amount')) {
            const amount = Number(args[args.indexOf(arg) + 1]);
            if (Number.isNaN(amount)) {
                throw new Error('Item after `amount` must be a number');
            }
            operation.amount = amount;
        }
    });
    if (!(operation.hasOwnProperty('userId') && operation.hasOwnProperty('amount'))) {
        throw new Error('Must specify userId and amount via --id `id` and --amount `amount`')
    }
    return operation
}