import { replaceValuesDoc } from '../../libs/googledocs';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const {
                data,
                newDocId
            } = req.body
            
            const dataUrl = await replaceValuesDoc({ 
                dataKey: data?.data,
                newDocId: newDocId
            });
            console.log(data,"datadatadatadata")
            return res.status(200).json({
                status: true,
                urlDocumento: dataUrl
            }); 
        } catch (error) {
            console.log(error,'errr')
            return res.status(500).json({ a: error, error: 'Error fetching data' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}