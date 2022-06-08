import { ObjectId } from 'mongodb';
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
        case 'PUT':
            try {
                const _id = ObjectId(req.body._id);
                delete req.body._id;
                await db.collection(collection).replaceOne({ _id }, req.body);
                res.send('Done');
            } catch (err) {
                console.log(err);
            }
            break;
        case 'DELETE':
            try {
                const _id = ObjectId(req.body._id);
                await db.collection(collection).deleteOne({ _id });
                res.send('Done');
            } catch (err) {
                console.log(err);
            }
            break;
        default:
            break;
    }

}