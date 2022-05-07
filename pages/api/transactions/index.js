import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db('gageiboo');
    switch (req.method) {
        case 'POST':
            await db.collection('transactions').insertOne(req.body);
            res.send('Done!');
            break;
        case 'GET':
            const transactions = await db.collection('transactions').find({}).toArray();
            res.send(transactions);
            break;
        default:
            break;
    }

}