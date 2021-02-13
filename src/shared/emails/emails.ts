import { MailDataRequired } from '@sendgrid/mail';

const from = 'pzmarta@wp.pl';

interface ConfirmObject {
    to: string;
    token: string;
}

type ConfirmRegistration = (options: ConfirmObject) => MailDataRequired;

export const confirmRegistration: ConfirmRegistration = ({ to, token }) => ({
    to,
    from,
    subject: 'Potwierdzenie rejestracji w serwisie Marta.pl',
    templateId: 'd-316947fd9aa54702bf07a43ed07c8d6e',
    dynamicTemplateData: {
        token,
    },
});
