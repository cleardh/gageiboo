import clientPromise from '../../../lib/mongodb';
const collection = process.env.DB_ENV === 'staging' ? 'transactions-staging' : 'transactions';

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db('gageiboo');
    switch (req.method) {
        case 'POST':
            try {
                await db.collection(collection).insertOne(req.body);
                res.send('Done');
            } catch (err) {
                console.log(err);
            }
            break;
        case 'GET':
            try {
                const transactions = await db.collection(collection).find({}).toArray();
                res.send(transactions);
            } catch (err) {
                console.log(err);
            }
            break;
        default:
            break;
    }

}