export interface INotification {
  id: number;
  date: string;
  text_ru: string;
  text_ky: string;
  text_en: string;
  user: number;
  is_read: boolean;
  status_en: 'Unread' | 'Read';
  status_ky: 'Окулбаган' | 'Окулган';
  status_ru: 'Не прочитано' | 'Прочитано';
}
