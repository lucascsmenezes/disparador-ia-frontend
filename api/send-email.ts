import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({ message: `Method ${request.method} Not Allowed` });
  }

  try {
    const { status, userEmail, details } = request.body;

    // Em uma aplicação real, você integraria com um provedor de serviço de e-mail
    // como SendGrid, Resend, ou Nodemailer.
    // Para esta demonstração, nós simplesmente registramos a informação no console
    // para simular o processo de envio de e-mail. Isso será visível nos logs da Vercel.
    console.log('--- SIMULANDO NOTIFICAÇÃO POR E-MAIL ---');
    console.log(`Para: ${userEmail}`);
    console.log(`Status: ${status}`);
    console.log(`Detalhes: ${JSON.stringify(details, null, 2)}`);
    console.log('------------------------------------');

    // Responde ao frontend que a requisição foi aceita.
    return response.status(200).json({ message: 'Requisição de e-mail processada com sucesso pela API de simulação.' });

  } catch (error) {
    console.error('Erro ao processar requisição de e-mail:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
    return response.status(500).json({ message: 'Erro Interno do Servidor', error: errorMessage });
  }
}