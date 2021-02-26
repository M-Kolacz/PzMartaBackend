import { MailDataRequired } from '@sendgrid/mail';

const from = 'pzmarta@wp.pl';

interface IConfirmObject {
    to: string;
    token: string;
}

type ConfirmRegistration = (options: IConfirmObject) => MailDataRequired;

export const confirmRegistration: ConfirmRegistration = ({ to, token }) => ({
    to,
    from,
    subject: 'Potwierdzenie rejestracji w serwisie Marta.pl',
    templateId: 'd-316947fd9aa54702bf07a43ed07c8d6e',
    dynamicTemplateData: {
        token,
    },
});
