// Email Templates - Sistema de Templates HTML para Emails
// Todos os templates seguem design responsivo e profissional

export interface EmailTemplateData {
  // Confirmação de Agendamento
  appointmentConfirmation?: {
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    modalidade: "presencial" | "online";
    consultorioAddress?: string;
    meetingLink?: string;
    psychologistName: string;
    psychologistPhone: string;
  };

  // Lembrete de Consulta
  appointmentReminder?: {
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    modalidade: "presencial" | "online";
    meetingLink?: string;
    psychologistName: string;
    psychologistPhone: string;
  };

  // Novo Contato (para psicólogo)
  newContact?: {
    senderName: string;
    senderEmail: string;
    senderPhone?: string;
    subject: string;
    message: string;
    receivedAt: string;
  };

  // Auto-resposta de Contato
  contactAutoReply?: {
    senderName: string;
    psychologistName: string;
    expectedResponseTime: string;
  };

  // Reset de Senha
  passwordReset?: {
    userName: string;
    resetLink: string;
    expirationTime: string;
  };
}

// Layout base para todos os emails
const emailLayout = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #7c9885 0%, #5f7a68 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #1f2937;
      font-size: 20px;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .content p {
      margin-bottom: 15px;
      color: #4b5563;
    }
    .info-box {
      background-color: #f3f4f6;
      border-left: 4px solid #7c9885;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .info-box strong {
      color: #1f2937;
      display: block;
      margin-bottom: 8px;
    }
    .button {
      display: inline-block;
      background-color: #7c9885;
      color: #ffffff !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      margin: 20px 0;
      font-weight: 600;
      text-align: center;
    }
    .button:hover {
      background-color: #5f7a68;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      color: #6b7280;
      font-size: 14px;
      margin: 5px 0;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>
`;

// Template: Confirmação de Agendamento
export const appointmentConfirmationTemplate = (
  data: EmailTemplateData["appointmentConfirmation"]
): string => {
  if (!data) throw new Error("Missing appointmentConfirmation data");

  const locationInfo =
    data.modalidade === "presencial"
      ? `
    <strong>📍 Local:</strong>
    <p>${data.consultorioAddress}</p>
  `
      : `
    <strong>💻 Link da Sessão Online:</strong>
    <p><a href="${data.meetingLink}" style="color: #7c9885;">${data.meetingLink}</a></p>
    <p style="font-size: 14px; color: #6b7280;">O link será enviado novamente 1 hora antes da sessão.</p>
  `;

  const content = `
    <div class="header">
      <h1>✨ Agendamento Confirmado</h1>
    </div>
    
    <div class="content">
      <h2>Olá, ${data.patientName}!</h2>
      
      <p>Sua consulta foi confirmada com sucesso. Estou muito feliz em poder te acompanhar nessa jornada de autoconhecimento e desenvolvimento.</p>
      
      <div class="info-box">
        <strong>📅 Data e Horário:</strong>
        <p style="font-size: 18px; color: #1f2937; font-weight: 600;">${data.appointmentDate} às ${data.appointmentTime}</p>
        
        <div class="divider"></div>
        
        <strong>🏥 Modalidade:</strong>
        <p>${data.modalidade === "presencial" ? "Atendimento Presencial" : "Atendimento Online"}</p>
        
        <div class="divider"></div>
        
        ${locationInfo}
      </div>
      
      <p><strong>📝 Orientações importantes:</strong></p>
      <ul style="margin-left: 20px; color: #4b5563;">
        <li>Procure chegar com 5-10 minutos de antecedência</li>
        <li>Caso precise remarcar, avise com pelo menos 24h de antecedência</li>
        ${data.modalidade === "online" ? "<li>Teste sua conexão de internet e seu equipamento antes da sessão</li>" : ""}
        <li>Traga suas dúvidas e questões que gostaria de trabalhar</li>
      </ul>
      
      <p>Você receberá um lembrete por email 24 horas antes da consulta.</p>
      
      <p>Se tiver alguma dúvida ou precisar de qualquer informação adicional, não hesite em entrar em contato.</p>
      
      <p style="margin-top: 30px;">Até breve!<br>
      <strong>${data.psychologistName}</strong><br>
      📞 ${data.psychologistPhone}</p>
    </div>
    
    <div class="footer">
      <p>Este é um email automático, mas você pode responder caso tenha dúvidas.</p>
      <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
    </div>
  `;

  return emailLayout(content);
};

// Template: Lembrete de Consulta
export const appointmentReminderTemplate = (
  data: EmailTemplateData["appointmentReminder"]
): string => {
  if (!data) throw new Error("Missing appointmentReminder data");

  const modalityInfo =
    data.modalidade === "online"
      ? `
    <p style="font-size: 16px;"><strong>💻 Link da sessão:</strong><br>
    <a href="${data.meetingLink}" class="button">Entrar na Sessão Online</a></p>
  `
      : `
    <p style="font-size: 16px;"><strong>📍 Lembre-se de vir ao consultório</strong></p>
  `;

  const content = `
    <div class="header">
      <h1>⏰ Lembrete de Consulta</h1>
    </div>
    
    <div class="content">
      <h2>Olá, ${data.patientName}!</h2>
      
      <p>Este é um lembrete gentil de que você tem uma consulta agendada <strong>amanhã</strong>:</p>
      
      <div class="info-box">
        <strong>📅 Data e Horário:</strong>
        <p style="font-size: 20px; color: #1f2937; font-weight: 600; margin-top: 10px;">
          ${data.appointmentDate} às ${data.appointmentTime}
        </p>
        
        <div class="divider"></div>
        
        ${modalityInfo}
      </div>
      
      <p><strong>💡 Dicas para aproveitar melhor a sessão:</strong></p>
      <ul style="margin-left: 20px; color: #4b5563;">
        <li>Reserve um momento antes para refletir sobre o que gostaria de trabalhar</li>
        <li>Anote dúvidas ou questões que surgiram desde a última sessão</li>
        ${data.modalidade === "online" ? "<li>Escolha um ambiente tranquilo e privado</li>" : ""}
        ${data.modalidade === "online" ? "<li>Tenha papel e caneta por perto, se desejar fazer anotações</li>" : ""}
      </ul>
      
      <p style="margin-top: 25px;">Caso precise remarcar, entre em contato o quanto antes.</p>
      
      <p style="margin-top: 30px;">Nos vemos em breve!<br>
      <strong>${data.psychologistName}</strong><br>
      📞 ${data.psychologistPhone}</p>
    </div>
    
    <div class="footer">
      <p>Este é um lembrete automático da sua consulta agendada.</p>
      <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
    </div>
  `;

  return emailLayout(content);
};

// Template: Novo Contato (notificação para o psicólogo)
export const newContactNotificationTemplate = (
  data: EmailTemplateData["newContact"]
): string => {
  if (!data) throw new Error("Missing newContact data");

  const content = `
    <div class="header">
      <h1>📬 Novo Contato Recebido</h1>
    </div>
    
    <div class="content">
      <h2>Você recebeu uma nova mensagem!</h2>
      
      <div class="info-box">
        <strong>👤 Remetente:</strong>
        <p>${data.senderName}</p>
        
        <div class="divider"></div>
        
        <strong>📧 Email:</strong>
        <p><a href="mailto:${data.senderEmail}" style="color: #7c9885;">${data.senderEmail}</a></p>
        
        ${
          data.senderPhone
            ? `
        <div class="divider"></div>
        <strong>📞 Telefone:</strong>
        <p>${data.senderPhone}</p>
        `
            : ""
        }
        
        <div class="divider"></div>
        
        <strong>📋 Assunto:</strong>
        <p>${data.subject}</p>
        
        <div class="divider"></div>
        
        <strong>💬 Mensagem:</strong>
        <p style="white-space: pre-wrap; margin-top: 10px;">${data.message}</p>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        <strong>Recebido em:</strong> ${data.receivedAt}
      </p>
      
      <a href="mailto:${data.senderEmail}" class="button">Responder por Email</a>
      
      <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
        💡 Dica: Tente responder dentro de 24 horas para manter um bom relacionamento com potenciais pacientes.
      </p>
    </div>
    
    <div class="footer">
      <p>Esta é uma notificação automática do formulário de contato do seu site.</p>
      <p>© ${new Date().getFullYear()} - Sistema de Agendamento</p>
    </div>
  `;

  return emailLayout(content);
};

// Template: Auto-resposta de Contato
export const contactAutoReplyTemplate = (
  data: EmailTemplateData["contactAutoReply"]
): string => {
  if (!data) throw new Error("Missing contactAutoReply data");

  const content = `
    <div class="header">
      <h1>✅ Mensagem Recebida</h1>
    </div>
    
    <div class="content">
      <h2>Olá, ${data.senderName}!</h2>
      
      <p>Recebi sua mensagem e agradeço muito pelo contato! 😊</p>
      
      <p>Estou comprometido(a) em oferecer o melhor atendimento possível, e por isso farei questão de ler sua mensagem com atenção e responder o mais breve possível.</p>
      
      <div class="info-box">
        <strong>⏱️ Tempo estimado de resposta:</strong>
        <p style="font-size: 16px; margin-top: 10px;">${data.expectedResponseTime}</p>
      </div>
      
      <p><strong>📱 Precisa de um atendimento mais rápido?</strong></p>
      <p>Se sua questão for urgente ou se preferir um contato direto, você pode me enviar uma mensagem via WhatsApp ou me ligar diretamente nos números disponíveis no site.</p>
      
      <p style="margin-top: 30px;">Até breve!<br>
      <strong>${data.psychologistName}</strong></p>
    </div>
    
    <div class="footer">
      <p>Este é um email automático de confirmação de recebimento.</p>
      <p>Você receberá uma resposta personalizada em breve.</p>
      <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
    </div>
  `;

  return emailLayout(content);
};

// Template: Reset de Senha
export const passwordResetTemplate = (
  data: EmailTemplateData["passwordReset"]
): string => {
  if (!data) throw new Error("Missing passwordReset data");

  const content = `
    <div class="header">
      <h1>🔐 Redefinição de Senha</h1>
    </div>
    
    <div class="content">
      <h2>Olá, ${data.userName}!</h2>
      
      <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
      
      <p>Se você fez essa solicitação, clique no botão abaixo para criar uma nova senha:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.resetLink}" class="button">Redefinir Minha Senha</a>
      </div>
      
      <div class="info-box">
        <strong>⚠️ Informações importantes:</strong>
        <ul style="margin: 10px 0 0 20px; color: #4b5563;">
          <li>Este link expira em <strong>${data.expirationTime}</strong></li>
          <li>Por segurança, você só pode usar este link uma vez</li>
          <li>Se não solicitou esta redefinição, ignore este email</li>
        </ul>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 25px;">
        <strong>O link não está funcionando?</strong><br>
        Copie e cole este endereço no seu navegador:<br>
        <span style="word-break: break-all; color: #7c9885;">${data.resetLink}</span>
      </p>
      
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <strong>🛡️ Dica de segurança:</strong><br>
        Nunca compartilhe sua senha com ninguém. Nós nunca pediremos sua senha por email ou telefone.
      </p>
    </div>
    
    <div class="footer">
      <p>Se você não solicitou esta redefinição, ignore este email com segurança.</p>
      <p>Sua senha permanecerá inalterada.</p>
      <p>© ${new Date().getFullYear()} - Sistema Seguro de Autenticação</p>
    </div>
  `;

  return emailLayout(content);
};

// Helper: Gerar texto plain alternativo
export const generatePlainText = (template: string): string => {
  return template
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
};
