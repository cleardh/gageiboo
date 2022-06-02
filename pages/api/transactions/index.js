import clientPromise from '../../../lib/mongodb';
const collection = process.env.DB_ENV === 'staging' ? 'transactions-staging' : 'transactions';

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db('gageiboo');
    switch (req.method) {
        case 'POST':
            const promises = [];
            promises.push(new Promise(async (resolve, reject) => {
                try {
                    await db.collection(collection).deleteMany({});
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }));
            setTimeout(() => {
                req.body.forEach(row => {
                    promises.push(new Promise(async (resolve, reject) => {
                        try {
                            await db.collection(collection).insertOne(row);
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    }));
                });
            }, 1000);
            Promise.all(promises).catch(err => {
                console.log(err);
            });
            res.send('Done');
            break;
        case 'GET':
            const transactions = await db.collection(collection).find({}).toArray();
            res.send(transactions);
            break;
        default:
            break;
    }

}