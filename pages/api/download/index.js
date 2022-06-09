import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            try {
                const backupPath = path.join(__dirname, '../../../../gageiboo_backup.xlsx');
                if (!fs.existsSync(backupPath)) res.send('Not found');
                const stat = fs.statSync(backupPath);
                res.writeHead(200, {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Length': stat.size,
                    'Content-disposition': 'attachment; filename=gageiboo_backup.xlsx'
                });
                const readStream = fs.createReadStream(backupPath);
                readStream.pipe(res);
            } catch (err) {
                console.log(err);
            }
            break;
        default:
            break;
    }

}