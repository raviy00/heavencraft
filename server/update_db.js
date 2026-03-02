import dns from 'node:dns';
import mongoose from 'mongoose';

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

mongoose.connect('mongodb+srv://admin:1214Kasun@soc.vmokpln.mongodb.net/heavencraft?retryWrites=true&w=majority')
    .then(() => mongoose.connection.db.collection('serverconfigs').updateOne({ _id: 'main' }, { $set: { ip: 'heavencraft_tm.aternos.me', port: 39013 } }))
    .then(() => {
        console.log('Database updated successfully.');
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
