import { updateCheckbox } from '../../libs/googlesheet';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const {
                data, sheetId, gid, row_
            } = req.body
            const tableResponse = await updateCheckbox({ 
                sheetId: sheetId,
                gid: gid,
                data: data,
                row_: row_
            });
            return res.status(200).json({ data: tableResponse });
        } catch (error) {
            console.log(error,'errr')
            return res.status(500).json({ a: error, error: 'Error fetching data' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}