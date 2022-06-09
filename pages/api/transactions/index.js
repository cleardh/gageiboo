import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
const collection = process.env.DB_ENV === 'staging' ? 'transactions-staging' : 'transactions';

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db('gageiboo');
    switch (req.method) {
        case 'POST':
            try {
                const transaction = await db.collection(collection).insertOne(req.body);
                delete req.body._id;
                backup({ _id: transaction.insertedId.toString(), ...req.body });
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
                backup(req.body);
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
                backup(req.body);
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

function backup(body) {
    const backupPath = path.join(__dirname, '../../../../gageiboo_backup.xlsx');
    const wb = XLSX.utils.book_new();
    wb.Props = {
        Title: '가계부_백업',
        Subject: '가계부_백업',
        CreatedDate: new Date()
    };
    const sheetName = '가계부_백업';
    let data = [body];
    if (fs.existsSync(backupPath)) {
        const existingData = getDataFromBackup(backupPath, sheetName).filter(row => row._id !== body._id);
        data = [...existingData, body];
        if (!body.날짜) data = existingData;
    }
    data.sort((a, b) => new Date(b['날짜']) - new Date(a['날짜']));
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, backupPath);
}
function getDataFromBackup(backupPath, sheetName) {
    const workbook = XLSX.readFile(backupPath, {
        type: 'binary'
    });
    const XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    return XL_row_object;
}