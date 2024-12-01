import { google } from 'googleapis';

const CLIENT_EMAIL = process.env.NEXT_PUBLIC_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY.replace(/\\n/g, '\n');

const jwtClient = new google.auth.JWT(
    CLIENT_EMAIL,
    null,
    PRIVATE_KEY,
    [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents',
    ]
);

const docs = google.docs({ version: 'v1', auth: jwtClient });
const TEMPLATE_DOC_ID = "1ivvl3lI9iajE1B77TfzngDyBeC3yOwoYqjk1oSloDKo"

export const createDocumentFromTemplatePdf = async ({ dataKey, res }) => {
    try {
        const drive = google.drive({ version: 'v3', auth: jwtClient });

        const response = await drive.files.copy({
            fileId: TEMPLATE_DOC_ID,
            requestBody: {
                name: `Documento generado - ${new Date().toISOString()}`,
            },
        });

        const newDocId = response.data.id;

         // Paso 2: Verificar el tipo de archivo
         const fileMetadata = await drive.files.get({
            fileId: newDocId,
            fields: 'mimeType',
            convert: true,
        });

        if (fileMetadata.data.mimeType !== 'application/vnd.google-apps.document') {
            throw new Error(
                'El archivo copiado no es del tipo Google Docs. Asegúrate de que la plantilla sea compatible.'
            );
        }

        await drive.permissions.create({
            fileId: newDocId,
            requestBody: {
                role: 'writer',
                type: 'user',
                emailAddress: "cristian.machado@correounivalle.edu.co",
            },
        });

        const replacements = {};
        if (dataKey?.length > 0) {
            dataKey.forEach(item => {
                if (item.key && item.value !== undefined) {
                    replacements[item.key] = item.value;
                }
            });
            console.log(replacements)
            const requests = Object.keys(replacements).map((key) => ({
                replaceAllText: {
                    containsText: {
                        text: `${key}`,
                        matchCase: true,
                    },
                    replaceText: replacements[key],
                },
            }));

            // Actualizar el documento con los nuevos valores
            await docs.documents.batchUpdate({
                documentId: newDocId,
                requestBody: {
                    requests,
                },
            });
        }

        const pdfResponse = await drive.files.export(
            {
                fileId: newDocId,
                mimeType: 'application/pdf',
            },
            { responseType: 'stream' }
        );

        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

        // // Paso 4: Enviar el PDF al cliente
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="documento-${formattedDate}.pdf"`
        )

        console.log(`Documento creado con ID: ${newDocId}`);
        pdfResponse.data
        .on('error', (err) => {
            console.error('Error en el stream:', err);
            res.status(500).end('Error al enviar el archivo.');
        })
        .pipe(res);
    } catch (error) {
        console.error('Error al crear el documento:', error);
        throw error;
    }
}

export const createDocumentFromTemplate = async ({ dataKey, res, email }) => {
    try {
        const drive = google.drive({ version: 'v3', auth: jwtClient });

        const response = await drive.files.copy({
            fileId: TEMPLATE_DOC_ID,
            requestBody: {
                name: `Documento generado - ${new Date().toISOString()}`,
            },
        });

        const newDocId = response.data.id;

         // Paso 2: Verificar el tipo de archivo
         const fileMetadata = await drive.files.get({
            fileId: newDocId,
            fields: 'mimeType',
            convert: true,
        });

        if (fileMetadata.data.mimeType !== 'application/vnd.google-apps.document') {
            throw new Error(
                'El archivo copiado no es del tipo Google Docs. Asegúrate de que la plantilla sea compatible.'
            );
        }

        await drive.permissions.create({
            fileId: newDocId,
            requestBody: {
                role: 'writer',
                type: 'user',
                emailAddress: email,
            },
        });

        return res.status(200).json({
            status: true,
            urlDocumento: newDocId ?? ""
        }); 

    } catch (error) {
        console.error('Error al crear el documento:', error);
        throw error;
    }
}

export const replaceValuesDoc = async ({ dataKey, newDocId }) => {
    let response = false
    try {
        const replacements = {};
        if (dataKey?.length > 0) {
            dataKey.forEach(item => {
                if (item.key && item.value !== undefined) {
                    replacements[item.key] = item.value;
                }
            });
            const requests = Object.keys(replacements).map((key) => ({
                replaceAllText: {
                    containsText: {
                        text: `${key}`,
                        matchCase: true,
                    },
                    replaceText: replacements[key],
                },
            }));

            
            await docs.documents.batchUpdate({
                documentId: newDocId,
                requestBody: {
                    requests,
                },
            });

            response = true
        }
    } catch(e) {
        console.log(e)
    }

    return response
}